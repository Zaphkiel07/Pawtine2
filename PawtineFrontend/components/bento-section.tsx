const BentoCard = ({ title, description, icon }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <span className="text-2xl">{icon}</span>
        <p className="self-stretch text-foreground text-lg font-semibold leading-7">{title}</p>
        <p className="self-stretch text-muted-foreground text-base font-normal leading-7">{description}</p>
      </div>
    </div>
    <div className="self-stretch h-32 relative -mt-0.5 z-10 bg-gradient-to-br from-primary-light/20 via-transparent to-primary-light/0" />
  </div>
)

export function BentoSection() {
  const cards = [
    {
      icon: "🕒",
      title: "AI Reminders",
      description: "Get smart alerts for meals, water breaks, and walks so every routine stays on time.",
    },
    {
      icon: "🐶",
      title: "Personalized for Your Pup",
      description: "Tailor routines to your dog’s breed, age, and activity level with adaptive insights.",
    },
    {
      icon: "📅",
      title: "Smart Calendar Sync",
      description: "See every task in one clear timeline that updates across the devices you already use.",
    },
    {
      icon: "💬",
      title: "Chat with Pawtine AI",
      description: "Talk naturally to set new habits, log wins, or adjust routines whenever life changes.",
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Keep Every Routine on Track
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Pawtine helps you manage your pet’s schedule with ease — reminding, logging, and syncing daily activities
              across devices.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
