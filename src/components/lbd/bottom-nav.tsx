"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, CalendarDays, Users, BookOpen, Ellipsis } from "lucide-react";
import { PrayingHands } from "./praying-hands";
import { useSession } from "./session-provider";

const TABS = [
  { label: "Home", icon: Home },
  { label: "Bethel", icon: PrayingHands },
  { label: "Programmes", icon: CalendarDays },
  { label: "Community", icon: Users },
  { label: "Teachings", icon: BookOpen },
  { label: "More", icon: Ellipsis },
];

export function BottomNav() {
  const { user, loading } = useSession();
  const [active, setActive] = useState("Home");

  // Signed-in chrome — hidden for guests and while loading.
  // Every account is admin-provisioned (Users tab), so the app shell appears
  // for any signed-in user and slides away on sign-out.
  if (loading || !user) return null;

  return (
    <motion.nav
      initial={{ y: 72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="sticky bottom-0 z-40 mt-auto border-t border-black/[0.07] bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="App navigation"
    >
      <div className="grid h-[62px] grid-cols-6">
        {TABS.map((tab) => {
          const isActive = active === tab.label;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => setActive(tab.label)}
              className={`relative flex h-full flex-col items-center justify-center gap-[3px] transition-colors ${
                isActive ? "text-navactive" : "text-neutral-500 hover:text-neutral-800"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-[21px]" strokeWidth={isActive ? 2.3 : 2} />
              <span className="text-[9.5px] font-medium leading-none">{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="nav-active-bar"
                  className="absolute bottom-[7px] h-[2.5px] w-6 rounded-full bg-navactive"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
