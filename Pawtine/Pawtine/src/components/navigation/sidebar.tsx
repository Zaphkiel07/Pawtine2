"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

type SidebarProps = {
  profileComplete: boolean;
};

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "🐶" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/chat", label: "Chat", icon: "💬" },
];

export function Sidebar({ profileComplete }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "sticky top-4 hidden h-[calc(100vh-2rem)] rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 ease-out lg:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex w-full flex-col">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="mb-6 flex items-center gap-2 rounded-2xl border border-paw-primary/40 px-3 py-2 text-sm font-semibold text-paw-primary transition hover:bg-paw-secondary/20"
        >
          <span className="text-lg">{collapsed ? "➡️" : "⬅️"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        <nav className="flex flex-1 flex-col gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isProfileLink = item.href === "/profile";
            const disabled = !profileComplete && !isProfileLink;
            const isActive = pathname === item.href;

            const content = (
              <span
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 transition",
                  collapsed ? "justify-center" : "justify-start",
                  isActive
                    ? "bg-paw-primary text-white shadow"
                    : "text-slate-600 hover:bg-paw-secondary/20",
                  disabled && "cursor-not-allowed text-slate-300 hover:bg-transparent",
                )}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </span>
            );

            if (disabled) {
              return (
                <span key={item.href} aria-disabled className="opacity-70">
                  {content}
                </span>
              );
            }

            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
