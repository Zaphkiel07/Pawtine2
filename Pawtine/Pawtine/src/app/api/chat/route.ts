import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { formatISO } from "date-fns";
import { fetchCurrentUserAndDog, createRoutine } from "@/lib/routines";
import { demoCreateRoutine } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/config";
import { Database } from "@/lib/database.types";
import { createCalendarEntry } from "@/app/actions/calendar";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface IncomingMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
}

const SYSTEM_PROMPT = `You are Pawtine, a friendly dog care assistant. Provide concise, encouraging answers that help dog owners stay on top of feeding, hydration, and walk routines. Reference app features when relevant, but avoid making promises about unavailable functionality.

The current time is: {{CURRENT_TIME}}. Use this context to understand relative time references like "tomorrow at 10am" or "in 2 hours".

If the user asks to schedule a session, appointment, or reminder, use the "schedule_dog_session" tool.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4-turbo";

  const body = await request.json().catch(() => null);
  const messages: IncomingMessage[] | null = Array.isArray(body?.messages)
    ? body.messages
    : null;

  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { error: "No messages provided." },
      { status: 400 },
    );
  }

  if (!apiKey) {
    return NextResponse.json({
      message:
        "Hi! Add an OPENAI_API_KEY in your environment to chat with the Pawtine assistant.",
    });
  }

  const currentTime = new Date().toISOString();
  const systemPromptWithTime = SYSTEM_PROMPT.replace("{{CURRENT_TIME}}", currentTime);

  const tools = [
    {
      type: "function",
      function: {
        name: "schedule_dog_session",
        description: "Schedule a dog care session or appointment",
        parameters: {
          type: "object",
          properties: {
            time: {
              type: "string",
              description: "ISO-8601 timestamp for the appointment (e.g. 2025-03-14T10:00:00Z)",
            },
            description: {
              type: "string",
              description: "Description of the session (e.g. 'Dog Walk', 'Vet Appointment')",
            },
          },
          required: ["time", "description"],
        },
      },
    },
  ];

  const payload = {
    model,
    temperature: 0.6,
    max_tokens: 400,
    messages: [
      { role: "system", content: systemPromptWithTime },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content?.slice(0, 1000) ?? "",
        tool_call_id: message.tool_call_id,
      })),
    ],
    tools,
    tool_choice: "auto",
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error", errorText);
      return NextResponse.json(
        {
          message:
            "I ran into an issue contacting OpenAI. Please try again in a bit.",
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;

    // Check if the assistant wants to call a tool
    if (message?.tool_calls?.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "schedule_dog_session") {
        try {
          const args = JSON.parse(toolCall.function.arguments);

          // Call the server action
          await createCalendarEntry(args.time, args.description);

          // Also try to schedule it in the existing routine system for backward compatibility/functionality
          // We can try to map description to type/label
          await handleSchedule({
            scheduled_time: args.time,
            label: args.description,
            type: inferTypeFromDescription(args.description)
          });

          await revalidatePath("/");
          await revalidatePath("/dashboard");

          // We could submit the tool output back to OpenAI to get a final natural language response,
          // but for simplicity (and given the previous pattern), we can just return a confirmation message.
          // Or we can return the assistant's message plus a confirmation.

          // However, standard tool use requires sending the tool output back.
          // Let's try to follow the standard pattern if possible, or just mock a "Done" response.
          // The previous UI just shows the assistant message.
          // If we return just the tool call message, the UI might not know how to display it if it expects text.

          // Let's call OpenAI again with the tool output.

          const toolOutputPayload = {
            ...payload,
            messages: [
              ...payload.messages,
              message,
              {
                role: "tool",
                content: JSON.stringify({ success: true, message: "Scheduled successfully" }),
                tool_call_id: toolCall.id,
              }
            ]
          };

          const secondResponse = await fetch(OPENAI_API_URL, {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${apiKey}`,
             },
             body: JSON.stringify(toolOutputPayload),
           });

           if (secondResponse.ok) {
             const secondData = await secondResponse.json();
             const finalContent = secondData?.choices?.[0]?.message?.content;
             return NextResponse.json({ message: finalContent });
           }

        } catch (err) {
          console.error("Tool execution failed", err);
          return NextResponse.json({ message: "I tried to schedule that, but something went wrong." });
        }
      }
    }

    const content = message?.content || "I'm not sure how to help with that.";
    return NextResponse.json({ message: content });

  } catch (error) {
    console.error("Chat handler failed", error);
    return NextResponse.json(
      { message: "The assistant is offline right now. Please try later." },
      { status: 500 },
    );
  }
}

function inferTypeFromDescription(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("walk")) return "walk";
  if (lower.includes("feed") || lower.includes("food") || lower.includes("meal")) return "feed";
  if (lower.includes("water") || lower.includes("drink")) return "water";
  return "custom";
}

async function handleSchedule(schedule: {
  type?: string;
  label?: string;
  scheduled_time: string;
}) {
  try {
    const { dog } = await fetchCurrentUserAndDog();

    if (!dog) {
      return;
    }

    const scheduleDate = new Date(schedule.scheduled_time);

    if (Number.isNaN(scheduleDate.getTime())) {
      throw new Error("Invalid scheduled time");
    }

    const scheduledISO = formatISO(scheduleDate);
    const allowedTypes = new Set(["feed", "walk", "water", "custom"]);
    const scheduleType = typeof schedule.type === "string" ? schedule.type.toLowerCase() : "custom";
    const type = (allowedTypes.has(scheduleType) ? scheduleType : "custom") as Database["public"]["Tables"]["routines"]["Insert"]["type"];

    const dogName = dog.name?.trim() || "Pup";

    const label = schedule.label ??
      (type === "walk"
        ? `${dogName} walk`
        : type === "feed"
          ? `${dogName} meal`
          : type === "water"
            ? `${dogName} water refresh`
            : "Custom routine");

    const payload: Database["public"]["Tables"]["routines"]["Insert"] = {
      dog_id: dog.id,
      type,
      label,
      scheduled_time: scheduledISO,
      status: "active",
    };

    if (isSupabaseConfigured) {
      await createRoutine(payload);
    } else {
      await demoCreateRoutine(payload);
    }
  } catch (error) {
    console.error("Failed to schedule routine", error);
  }
}
