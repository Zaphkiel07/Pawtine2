import type { Metadata } from "next";
import "./globals.css";
import { Urbanist } from "next/font/google";
import Link from "next/link";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { fetchProfile } from "@/lib/profile";
import { Sidebar } from "@/components/navigation/sidebar";

const font = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" });

export const metadata: Metadata = {
  title: "Pawtine",
  description: "AI-powered routine tracker for dog owners.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, dog } = await fetchProfile();
  const profileComplete = Boolean(user?.name?.trim() && dog?.name?.trim());

  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen bg-paw-background">
        <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-4 py-6">
          <Sidebar profileComplete={profileComplete} />
          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-paw-primary/10 text-lg font-semibold text-paw-primary">
                  PW
                </span>
                <div>
                  <p className="text-lg font-semibold">Pawtine</p>
                  <p className="text-sm text-slate-500">AI Routine Buddy</p>
                </div>
              </Link>
              <div className="hidden gap-3 text-sm font-medium text-slate-600 lg:flex">
                <span className="rounded-full bg-paw-secondary/20 px-3 py-2 text-paw-primary">
                  {profileComplete ? "Profile complete" : "Finish profile to unlock app"}
                </span>
              </div>
              <nav className="flex gap-3 text-sm font-medium text-slate-600 lg:hidden">
                {[
                  { href: "/", label: "Home" },
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/profile", label: "Profile" },
                  { href: "/settings", label: "Settings" },
                ].map((item) => {
                  const isProfileLink = item.href === "/profile";
                  const disabled = !profileComplete && !isProfileLink;

                  if (disabled) {
                    return (
                      <span key={item.href} className="cursor-not-allowed rounded-full px-3 py-2 text-slate-300">
                        {item.label}
                      </span>
                    );
                  }

                  return (
                    <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 hover:bg-paw-secondary/20">
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </header>
            <main className="mt-6 flex-1 overflow-y-auto rounded-3xl bg-white/70 p-6 shadow-sm backdrop-blur-sm">
              {children}
            </main>
            <footer className="mt-6 text-center text-xs text-slate-500">
              Copyright {new Date().getFullYear()} Pawtine. Built for happy tails.
            </footer>
          </div>
        </div>
        <ChatbotWidget />
      </body>
    </html>
  );
}
