import Link from "next/link";
import { endOfMonth, format, parseISO } from "date-fns";
import { fetchCurrentUserAndDog, fetchDailyRoutines, fetchMonthlySchedule } from "@/lib/routines";
import { assertProfileComplete } from "@/lib/profile";
import {
  completeRoutineAction,
  snoozeRoutineAction,
} from "@/app/actions/routines";
import { InteractiveCalendar } from "@/components/calendar/interactive-calendar";

export default async function HomePage() {
  const profile = await assertProfileComplete();
  const [{ dog }, routines, calendarTasks] = await Promise.all([
    fetchCurrentUserAndDog(),
    fetchDailyRoutines(),
    fetchMonthlySchedule(),
  ]);

  const userName = profile.user?.name?.trim() || "there";
  const dogName = profile.dog?.name?.trim() || dog?.name?.trim() || "";

  if (!dog) {
    return (
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">
          Welcome to Pawtine - let&apos;s set up your pup!
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Create a profile and we&apos;ll generate smart reminders for feeds, water
          top-ups, and walkies.
        </p>
        <div className="mt-8">
          <Link href="/onboarding" className="btn">
            Start Onboarding
          </Link>
        </div>
      </section>
    );
  }

  const completedToday = routines.filter(
    (routine) => routine.todayStatus?.status === "done",
  ).length;
  const progress = routines.length
    ? Math.round((completedToday / routines.length) * 100)
    : 0;

  const routineLabel = (label: string) => {
    if (!dogName) {
      return label;
    }

    const trimmedDogName = dogName.trim();
    const possessive = trimmedDogName.endsWith("s")
      ? `${trimmedDogName}'`
      : `${trimmedDogName}'s`;

    const escapedName = trimmedDogName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^${escapedName}(?:'s)?\\s*`, "i");

    if (prefixRegex.test(label)) {
      const remainder = label.replace(prefixRegex, "").trim();
      return remainder ? `${possessive} ${remainder}` : possessive;
    }

    return `${possessive} ${label}`;
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="card flex flex-col justify-center gap-4">
          <p className="paw-badge">Daily care routine</p>
          <h1 className="text-3xl font-semibold">Hello {userName}!</h1>
          <p className="max-w-xl text-sm text-slate-600">
            Keep routines on track with quick check-ins and calendar planning. Pawtine has your
            back for feeds, walks, and water breaks.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-paw-secondary/20 px-3 py-1 text-paw-primary">
              {routines.length} task{routines.length === 1 ? "" : "s"} today
            </span>
            <span className="rounded-full bg-paw-primary/10 px-3 py-1 text-paw-primary">
              Calendar synced through {format(endOfMonth(new Date()), "MMM d")}
            </span>
          </div>
        </div>
        <div className="card flex flex-col items-center gap-3 bg-paw-primary/10 text-center">
          <span className="mt-2 text-sm font-medium uppercase tracking-wide text-paw-primary">
            Today&apos;s completion
          </span>
          <span className="text-5xl font-bold text-paw-primary">{progress}%</span>
          <p className="text-sm text-slate-600">
            {completedToday}/{routines.length || 1} habits checked off
          </p>
          <div className="flex w-full items-center gap-2 text-xs">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-paw-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-semibold text-paw-primary">{progress}%</span>
          </div>
          <Link href="/dashboard" className="btn mt-2">
            View weekly stats
          </Link>
        </div>
      </section>

      <InteractiveCalendar tasks={calendarTasks} />

      <section className="grid gap-6 md:grid-cols-2">
        {routines.length === 0 && (
          <div className="card border-dashed border-slate-200 bg-white/60 text-sm text-slate-500">
            No routines scheduled for today yet. Use the calendar or settings to add one.
          </div>
        )}
        {routines.map((routine) => {
          const scheduled = parseISO(
            routine.scheduled_time ?? new Date().toISOString(),
          );
          const isDone = routine.todayStatus?.status === "done";
          const isSnoozed = routine.todayStatus?.status === "snoozed";
          const statusCopy = isDone
            ? "Completed"
            : isSnoozed
              ? "Snoozed"
              : "Pending";

          return (
            <article
              key={routine.id}
              className="card flex h-full flex-col gap-4 border-paw-primary/20"
            >
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {routine.type}
                  </p>
                  <h2 className="text-xl font-semibold">{routineLabel(routine.label)}</h2>
                </div>
                <span className="rounded-full bg-paw-secondary/20 px-3 py-1 text-xs font-medium text-paw-primary">
                  {format(scheduled, "h:mm a")}
                </span>
              </header>

              <p className="text-sm text-slate-600">
                {statusCopy} - last logged
                {routine.last_completed_at
                  ? ` ${format(parseISO(routine.last_completed_at), "MMM d, h:mm a")}`
                  : " never"}
              </p>

              <footer className="mt-auto flex flex-wrap items-center gap-3">
                <form action={completeRoutineAction}>
                  <input type="hidden" name="routineId" value={routine.id} />
                  <button
                    className="btn"
                    aria-label={`Mark ${routineLabel(routine.label)} as done`}
                    disabled={isDone}
                  >
                    {isDone ? "Done" : "Mark done"}
                  </button>
                </form>

                <form action={snoozeRoutineAction} className="flex items-center gap-2">
                  <input type="hidden" name="routineId" value={routine.id} />
                  <input type="hidden" name="hours" value="1" />
                  <button
                    type="submit"
                    className="rounded-full border border-paw-primary/30 px-3 py-2 text-sm font-medium text-paw-primary transition hover:bg-paw-secondary/10"
                  >
                    Snooze 1h
                  </button>
                </form>
              </footer>
            </article>
          );
        })}
      </section>

      <section className="card flex flex-col gap-4 bg-gradient-to-r from-paw-primary/10 to-paw-secondary/10">
        <h2 className="text-xl font-semibold">Keep streaks going</h2>
        <p className="text-sm text-slate-600">
          Visit the dashboard to see weekly wins and streak badges or tweak your
          plan in settings to match real life.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn">
            View dashboard
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-paw-primary/30 px-4 py-2 text-sm font-semibold text-paw-primary transition hover:bg-paw-secondary/10"
          >
            Adjust routines
          </Link>
        </div>
      </section>
    </div>
  );
}
