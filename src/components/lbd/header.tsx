"use client";

import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Heart,
  LogOut,
  UserRound,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { PrayingHands } from "./praying-hands";
import { useSession } from "./session-provider";

const NOTIFICATIONS = [
  {
    icon: PrayingHands,
    title: "Daily Prayer starts in 30 minutes",
    body: "Bethel Morning Glory · Zoom room opens at 5:30 AM.",
    time: "Just now",
  },
  {
    icon: Heart,
    title: "New testimony shared",
    body: "\u201cHealed after 12 months of prayer\u201d — read and rejoice together.",
    time: "2 h ago",
  },
  {
    icon: CalendarDays,
    title: "Hub leaders meeting on Friday",
    body: "All colony and hub leaders, confirm attendance today.",
    time: "Yesterday",
  },
];

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function roleLabel(role: string, leaderLevel: string | null): string {
  if (role !== "leader") return "Member";
  const level = leaderLevel
    ? leaderLevel.charAt(0).toUpperCase() + leaderLevel.slice(1)
    : "";
  return level ? `${level} Leader` : "Leader";
}

export function AppHeader() {
  const [unread, setUnread] = useState(3);
  const { user, loading, openAuth, signOut } = useSession();

  async function handleSignOut() {
    await signOut();
    toast({
      title: "Signed out",
      description: "Locked modules are hidden again until you sign in.",
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#d0610f] via-brand-deep to-[#b4510c] shadow-[0_2px_12px_rgba(120,50,0,0.35)]">
      <div className="relative flex h-16 items-center justify-between px-2.5">
        {/* Left — sign in (guests) / account chip (signed in) */}
        <div className="flex min-w-0 items-center">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex max-w-[190px] items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-2.5 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label={`Account — ${user.fullName}`}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[11px] font-extrabold text-brand-deep">
                    {initials(user.fullName)}
                  </span>
                  <span className="truncate text-[12.5px] font-bold leading-none">
                    {user.fullName.trim().split(/\s+/)[0]}
                  </span>
                  <ChevronDown className="size-3 shrink-0 opacity-80" strokeWidth={2.6} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 rounded-2xl border-black/5 p-1.5">
                <DropdownMenuLabel className="px-2.5 py-2">
                  <p className="truncate text-[13px] font-bold text-neutral-900">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                      {roleLabel(user.role, user.leaderLevel)}
                    </span>
                    <span className="truncate">{user.phone}</span>
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 rounded-xl px-2.5 py-2.5 text-[12.5px] font-semibold text-[#a12c2c] focus:bg-[#d24242]/10 focus:text-[#a12c2c]"
                >
                  <LogOut className="size-4" strokeWidth={2.2} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => openAuth()}
              className="h-10 gap-1.5 rounded-xl px-2.5 text-white hover:bg-white/15 hover:text-white"
              aria-label="Leader sign in"
            >
              <UserRound className="size-5" strokeWidth={2.3} />
              <span className="text-[12.5px] font-bold">Sign In</span>
            </Button>
          )}
        </div>

        {/* Center — brand lockup */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="whitespace-nowrap leading-none text-white">
            <span className="font-display text-[19px] tracking-[0.02em]">LBD NATION</span>{" "}
            <span className="-ml-0.5 inline-block -translate-y-[1px] font-script text-[22px]">
              Connect
            </span>
          </p>
          <p className="mt-[3px] whitespace-nowrap text-[7.5px] font-bold tracking-[0.34em] text-white/85">
            LIVING BY GOD&apos;S DESIGN
          </p>
        </div>

        {/* Right — notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative ml-auto size-11 rounded-xl text-white hover:bg-white/15 hover:text-white"
              aria-label={`Notifications (${unread} unread)`}
            >
              <Bell className="size-[22px]" strokeWidth={2.2} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid size-[17px] place-items-center rounded-full bg-[#d24242] text-[9.5px] font-bold leading-none text-white ring-2 ring-brand-deep">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            className="w-[320px] rounded-2xl border-black/5 p-0 shadow-xl"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
              <p className="text-[13px] font-bold text-neutral-900">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={() => setUnread(0)}
                  className="text-[11px] font-semibold text-brand-deep transition hover:text-brand"
                >
                  Mark all read
                </button>
              )}
            </div>
            <Separator />
            <ul className="max-h-72 overflow-y-auto">
              {NOTIFICATIONS.map((n) => (
                <li
                  key={n.title}
                  className="flex gap-3 px-4 py-3 transition hover:bg-neutral-50"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-deep">
                    <n.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-semibold text-neutral-900">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-neutral-500">
                      {n.body}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      {n.time}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
