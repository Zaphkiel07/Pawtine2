import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { formatISO } from "date-fns";
import { fetchCurrentUserAndDog, createRoutine } from "@/lib/routines";
import { demoCreateRoutine } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/config";
import { Database } from "@/lib/database.types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `You are Pawtine, a friendly dog care assistant. Provide concise, encouraging answers that help dog owners stay on top of feeding, hydration, and walk routines. Reference app features when relevant, but avoid making promises about unavailable functionality.

The current time is: {{CURRENT_TIME}}. Use this context to understand relative time references like "tomorrow at 10am" or "in 2 hours".

Always respond with a JSON object using this shape:
{
  "message": "what you would normally say",
  "schedule": {
    "type": "feed | walk | water | custom",
    "label": "optional label",
    "scheduled_time": "ISO-8601 timestamp (e.g. 2025-03-14T10:00:00Z)"
  }
}

If no scheduling is required, set "schedule" to null.`;

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

  const payload = {
    model,
    temperature: 0.6,
    max_tokens: 400,
    messages: [
      { role: "system", content: systemPromptWithTime },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content?.slice(0, 1000) ?? "",
      })),
    ],
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
    const rawContent: string =
      data?.choices?.[0]?.message?.content ??
      "{\"message\": \"I could not find a helpful answer, but I am still here to help!\", \"schedule\": null}";

    let assistantMessage = rawContent;

    try {
      const parsed = JSON.parse(rawContent) as {
        message?: string;
        schedule?: {
          type?: string;
          label?: string;
          scheduled_time?: string;
        } | null;
      };

      if (parsed.schedule?.scheduled_time) {
        await handleSchedule({
          ...parsed.schedule,
          scheduled_time: parsed.schedule.scheduled_time
        });
        await revalidatePath("/");
        await revalidatePath("/dashboard");
      }

      assistantMessage = parsed.message ?? assistantMessage;
    } catch (error) {
      console.warn("Assistant response was not valid JSON", error);
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat handler failed", error);
    return NextResponse.json(
      { message: "The assistant is offline right now. Please try later." },
      { status: 500 },
    );
  }
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
