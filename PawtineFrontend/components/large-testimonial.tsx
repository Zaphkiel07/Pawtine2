export function LargeTestimonial() {
  return (
    <section id="vision-section" className="w-full px-5 overflow-hidden flex justify-center items-center">
      <div className="flex-1 flex flex-col justify-start items-center overflow-hidden">
        <div className="self-stretch px-4 py-12 md:px-6 md:py-16 lg:py-28 flex flex-col justify-start items-center gap-8">
          <div className="flex flex-col justify-start items-center gap-6 max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Routine Intelligence</p>
            <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              Stay Consistent. Stay Connected.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Whether you’re home, at work, or on a weekend away, Pawtine keeps your dog’s care on schedule. AI stitches
              together reminders, logs, and insights so you can focus on what matters most — the bond you share.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {[
              {
                title: "Daily rhythm checks",
                description: "See hydration, meals, and walks in one glance with streaks that reward consistency.",
              },
              {
                title: "Smart handoffs",
                description:
                  "Share real-time updates with family, sitters, or walkers so every caregiver stays in sync.",
              },
              {
                title: "Helpful nudges",
                description:
                  "Adaptive notifications learn your schedule and ping you before routines slip through the cracks.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary-light/10 to-transparent p-6 text-left"
              >
                <h3 className="text-foreground text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="w-full max-w-4xl mt-10 text-left bg-[rgba(231,236,235,0.08)] border border-white/10 rounded-2xl p-8 md:p-10">
            <h3 className="text-foreground text-2xl md:text-3xl font-semibold mb-4 text-center md:text-left">Our Vision</h3>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 text-center md:text-left">
              Pawtine was built with one simple goal: to make caring for your dog effortless and consistent. We combine
              AI precision with human warmth — because great technology should make love and routine easier, not harder.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
              <span className="text-muted-foreground text-sm md:text-base text-center md:text-left">
                See the routines, insights, and handoffs that bring calm to every household.
              </span>
              <a
                href="#features-section"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
