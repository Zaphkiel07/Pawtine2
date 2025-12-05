import { addDays, format, formatISO, parseISO, startOfWeek } from "date-fns";
import { fetchCurrentUserAndDog, fetchWeeklySummary } from "@/lib/routines";
import { assertProfileComplete } from "@/lib/profile";

type WeeklyRow = {
  day?: string;
  status?: string;
  type?: string;
};

export default async function DashboardPage() {
  await assertProfileComplete();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStart = formatISO(start, { representation: "date" });

  const [{ dog }, weekly] = await Promise.all([
    fetchCurrentUserAndDog(),
    fetchWeeklySummary(weekStart),
  ]);

  if (!dog) {
    return (
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">No pup on file yet</h1>
        <p className="mt-4 text-base text-slate-600">
          Complete onboarding to unlock streak tracking and weekly stats.
        </p>
      </section>
    );
  }

  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(start, index));

  const summaryByDay = weekDates.map((date) => {
    const prefix = formatISO(date, { representation: "date" });
    const dayRows = weekly.filter((row: WeeklyRow) => row.day?.startsWith(prefix));
    const completed = dayRows.filter((row: WeeklyRow) => row.status === "done").length;
    const total = dayRows.length;

    return {
      label: format(date, "EEE"),
      completed,
      total,
    };
  });

  const totalDone = summaryByDay.reduce((acc, item) => acc + item.completed, 0);
  const totalHabits = summaryByDay.reduce((acc, item) => acc + item.total, 0);
  const completionRate = totalHabits
    ? Math.round((totalDone / totalHabits) * 100)
    : 0;

  const streak = calculateStreak(weekly);

  return (
    <div className="space-y-8">
      <header className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="paw-badge">Weekly overview</p>
          <h1 className="text-3xl font-semibold">{dog.name}&apos;s tail wag report</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Track consistency for feeds, water refreshes, and walk habits. Stay on
            top of streaks to unlock future AI coaching.
          </p>
        </div>
        <div className="rounded-3xl bg-white px-6 py-4 text-center shadow">
          <p className="text-xs uppercase text-slate-400">Week of</p>
          <p className="text-lg font-semibold">{format(start, "MMM d")}</p>
        </div>
      </header>

      <section className="card space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Progress paws</h2>
            <p className="text-sm text-slate-600">
              {completionRate}% of this week&apos;s routines logged.
            </p>
          </div>
          <div className="rounded-full bg-paw-secondary/20 px-4 py-2 text-sm font-semibold text-paw-primary">
            Current streak: {streak} check ins
          </div>
        </header>
        <div className="grid gap-3 md:grid-cols-7">
          {summaryByDay.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">
                {day.label}
              </span>
              <div className="flex h-24 w-14 flex-col justify-end gap-1 rounded-3xl border border-paw-primary/20 bg-white p-2 shadow">
                <div
                  className="w-full rounded-2xl bg-paw-primary"
                  style={{ height: `${day.total ? (day.completed / day.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {day.completed}/{day.total || 0}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="card space-y-3">
          <h2 className="text-xl font-semibold">Wins to bark about</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>{totalDone} routines logged this week</li>
            <li>Keep feed times within 30 minutes to maintain streaks</li>
            <li>Water refresh has {waterHitRate(weekly)} completion</li>
          </ul>
        </article>
        <article className="card space-y-3 bg-paw-primary/5">
          <h2 className="text-xl font-semibold">Next best actions</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Add push notifications via Supabase Edge Functions</li>
            <li>Enable multi-caregiver sharing</li>
            <li>Prepare for AI personal coach beta</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function calculateStreak(rows: WeeklyRow[]) {
  if (!rows.length) return 0;
  const doneRows = rows
    .filter((row) => row.status === "done" && row.day)
    .sort((a, b) => (a.day ?? "").localeCompare(b.day ?? ""));

  if (!doneRows.length) return 0;

  let streak = 1;
  let best = 1;

  for (let index = 1; index < doneRows.length; index += 1) {
    const prev = doneRows[index - 1].day;
    const current = doneRows[index].day;
    if (!prev || !current) {
      continue;
    }

    const diffDays = Math.round(
      (parseISO(current).getTime() - parseISO(prev).getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 1) {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return best;
}

function waterHitRate(rows: WeeklyRow[]) {
  const waterRows = rows.filter((row) => row.type === "water");
  if (!waterRows.length) return "no data";
  const done = waterRows.filter((row) => row.status === "done").length;
  return `${Math.round((done / waterRows.length) * 100)}%`;
}
