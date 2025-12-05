import Link from "next/link";

export default function ChatPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-paw-primary">Pawtine Assistant</h1>
        <p className="text-sm text-slate-600">
          Chat with the Pawtine assistant using the floating button on any page. Here you can review
          tips on how to ask for schedules or quick care questions.
        </p>
      </header>
      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">Tips</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Ask “Schedule a walk at 10 AM tomorrow” to add a calendar event automatically.</li>
          <li>• Try “Remind me to refresh water every evening” for routine guidance.</li>
          <li>• Need help? Ask “How do I edit my profile?” or “What’s on today’s calendar?”</li>
        </ul>
      </div>
      <p className="text-center text-sm text-slate-500">
        Ready to try it out? Use the chat bubble at the bottom-right or head back to the {" "}
        <Link href="/" className="text-paw-primary underline">
          Home
        </Link>{" "}
        page.
      </p>
    </section>
  );
}
