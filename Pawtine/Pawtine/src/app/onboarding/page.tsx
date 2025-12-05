import { submitOnboarding } from "@/app/actions/onboarding";

const timezones = Intl.supportedValuesOf("timeZone");

export default function OnboardingPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-10">
      <header className="text-center">
        <p className="paw-badge mx-auto w-fit">3 minute setup</p>
        <h1 className="mt-4 text-3xl font-semibold">Tailor Pawtine for your dog</h1>
        <p className="mt-3 text-sm text-slate-600">
          We will preload smart reminders that match your schedule. You can
          adjust anything later in settings.
        </p>
      </header>

      <form action={submitOnboarding} className="card space-y-8">
        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="dogName" className="block text-sm font-medium text-slate-700">
              Dog name
            </label>
            <input
              id="dogName"
              name="dogName"
              required
              placeholder="Luna"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dogBreed" className="block text-sm font-medium text-slate-700">
              Breed (optional)
            </label>
            <input
              id="dogBreed"
              name="dogBreed"
              placeholder="Corgi"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            >
              {timezones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="walksPerDay" className="block text-sm font-medium text-slate-700">
              Walks per day
            </label>
            <input
              id="walksPerDay"
              name="walksPerDay"
              type="number"
              min={1}
              max={5}
              defaultValue={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="morningFeed" className="block text-sm font-medium text-slate-700">
              Morning feed time
            </label>
            <input
              id="morningFeed"
              name="morningFeed"
              type="time"
              defaultValue="07:30"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="eveningFeed" className="block text-sm font-medium text-slate-700">
              Evening feed time
            </label>
            <input
              id="eveningFeed"
              name="eveningFeed"
              type="time"
              defaultValue="18:30"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
            />
          </div>
        </section>

        <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Pawtine will create reminders for feeds, daily water refresh, and
            walk slots. You can add more later.
          </p>
          <button type="submit" className="btn">
            Create my routine
          </button>
        </footer>
      </form>
    </section>
  );
}
