import { fetchProfile } from "@/lib/profile";
import { updateProfileAction } from "@/app/actions/profile";

const timezones = Intl.supportedValuesOf("timeZone");

export default async function ProfilePage() {
  const { user, dog } = await fetchProfile();

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="card space-y-3">
        <p className="paw-badge">Account & Pup</p>
        <h1 className="text-3xl font-semibold">Profile setup</h1>
        <p className="text-sm text-slate-600">
          Update your details to personalize reminders and keep Pawtine in sync with your schedule.
        </p>
      </header>

      <form action={updateProfileAction} className="card space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your info</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="userName"
                name="userName"
                defaultValue={user?.name ?? ""}
                placeholder="Name"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="text-sm font-medium text-slate-700">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={
                  user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              >
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Dog details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="dogName" className="text-sm font-medium text-slate-700">
                Dog name
              </label>
              <input
                id="dogName"
                name="dogName"
                defaultValue={dog?.name ?? ""}
                placeholder="Dog name"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dogBreed" className="text-sm font-medium text-slate-700">
                Breed
              </label>
              <input
                id="dogBreed"
                name="dogBreed"
                defaultValue={dog?.breed ?? ""}
                placeholder="Breed"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dogAge" className="text-sm font-medium text-slate-700">
                Age (months)
              </label>
              <input
                id="dogAge"
                name="dogAge"
                type="number"
                min={0}
                defaultValue={dog?.age_months ?? ""}
                placeholder="24"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
              />
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Changes apply instantly - revisit onboarding anytime to refresh default routines.
          </p>
          <button type="submit" className="btn">
            Save changes
          </button>
        </footer>
      </form>
    </section>
  );
}
