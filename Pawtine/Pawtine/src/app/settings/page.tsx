import { format, parseISO } from "date-fns";
import {
  fetchAllRoutines,
  fetchCurrentUserAndDog,
} from "@/lib/routines";
import {
  createRoutineAction,
  updateRoutineAction,
} from "@/app/actions/routines";
import { assertProfileComplete } from "@/lib/profile";

const ROUTINE_TYPES = [
  { value: "feed", label: "Feed" },
  { value: "walk", label: "Walk" },
  { value: "water", label: "Water" },
  { value: "custom", label: "Custom" },
];

export default async function SettingsPage() {
  await assertProfileComplete();
  const [{ dog }, routines] = await Promise.all([
    fetchCurrentUserAndDog(),
    fetchAllRoutines(),
  ]);

  if (!dog) {
    return (
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">Add your dog first</h1>
        <p className="mt-4 text-base text-slate-600">
          Run onboarding to set up core reminders before customizing routines.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <header className="card space-y-3">
        <p className="paw-badge">Routine controls</p>
        <h1 className="text-3xl font-semibold">Fine tune {dog.name}&apos;s plan</h1>
        <p className="text-sm text-slate-600">
          Pause or rename routines, adjust reminder times, and add custom habits.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Active routines</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {routines.map((routine) => (
            <form
              key={routine.id}
              action={updateRoutineAction}
              className="card space-y-4"
            >
              <input type="hidden" name="routineId" value={routine.id} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Label</label>
                <input
                  name="label"
                  defaultValue={routine.label}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Time</label>
                <input
                  name="scheduled_time"
                  type="time"
                  defaultValue={format(parseISO(routine.scheduled_time), "HH:mm")}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  name="status"
                  defaultValue={routine.status}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <button type="submit" className="btn">
                Save changes
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Add routine</h2>
          <p className="text-sm text-slate-600">
            Create a new habit for {dog.name} such as medicine, training, or custom play time.
          </p>
        </div>
        <form action={createRoutineAction} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              name="type"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            >
              {ROUTINE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-slate-700">Label</label>
            <input
              name="label"
              placeholder="Evening play"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium text-slate-700">Time</label>
            <input
              name="scheduled_time"
              type="time"
              defaultValue="19:00"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="btn w-full md:w-auto">
              Add routine
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
