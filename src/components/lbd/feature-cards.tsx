"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSession } from "./session-provider";
import {
  ProgrammesDialog,
  TeachingsDialog,
  TestimoniesDialog,
} from "./module-dialogs";
import { RegisterMemberDialog } from "./register-member-dialog";
import { CreateAccountDialog } from "./create-account-dialog";

type Gate = "public" | "signed-in" | "leader";
type OpenDialog =
  | null
  | "programmes"
  | "teachings"
  | "testimonies"
  | "register"
  | "create";

const FEATURES = [
  {
    img: "/images/card-prayers.jpg",
    title: "Join Daily Prayers",
    sub: "Connect on Zoom",
    note: "",
    gate: "public" as const,
    action: "prayers" as const, // live link-out: WhatsApp (guests) / Zoom (leaders)
  },
  {
    img: "/images/card-programmes.jpg",
    title: "Programmes",
    sub: "View upcoming events",
    note: "",
    gate: "public" as const,
    action: "programmes" as const,
  },
  {
    img: "/images/card-word.jpg",
    title: "Word & Teachings",
    sub: "Grow in God's Word",
    note: "",
    gate: "signed-in" as const, // unlocks for any signed-in account
    action: "teachings" as const,
  },
  {
    img: "/images/card-testimonies.jpg",
    title: "Testimonies",
    sub: "Share His goodness",
    note: "",
    gate: "public" as const,
    action: "testimonies" as const,
  },
  {
    img: "/images/card-register.jpg",
    title: "Register a Member",
    sub: "For authorised leaders",
    note: "",
    gate: "leader" as const,
    action: "register" as const,
  },
  {
    img: "/images/card-leader.jpg",
    title: "Leader Login",
    sub: "Create & manage accounts",
    note: "",
    gate: "leader" as const,
    action: "create" as const, // Leader Admin — create front-end accounts
  },
];

type PrayerLinkState = {
  mode: "zoom" | "whatsapp";
  label: string;
  url: string;
} | null;

export function FeatureCards() {
  const { user, loading, openAuth } = useSession();
  const [prayerLink, setPrayerLink] = useState<PrayerLinkState>(null);
  const [openDlg, setOpenDlg] = useState<OpenDialog>(null);

  // Prefetch the meeting link so taps open instantly.
  // The server decides: Zoom link for signed-in leaders, WhatsApp orientation for everyone else.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/prayers/link", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.url) setPrayerLink(data);
      } catch {
        /* tap handler will retry */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const isLocked = (gate: Gate) => {
    if (gate === "public") return false;
    if (loading || !user) return true;
    if (gate === "signed-in") return false;
    return user.role !== "leader"; // gate === "leader"
  };

  async function openPrayerLink() {
    // The server decides the destination by session state — leaders get the
    // Zoom link, everyone else the WhatsApp orientation platform. If the
    // cached link doesn't match the current session state (e.g. it was
    // prefetched before sign-in/out), refetch before opening.
    const expectedMode = user?.role === "leader" ? "zoom" : "whatsapp";
    let link = prayerLink;
    if (!link?.url || link.mode !== expectedMode) {
      try {
        const res = await fetch("/api/prayers/link", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data?.url) {
          setPrayerLink(data);
          link = data;
        }
      } catch {
        /* handled below */
      }
    }
    if (!link?.url) {
      toast({
        title: "Link unavailable",
        description:
          "The prayer meeting link could not be loaded. Please try again shortly.",
      });
      return;
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
  }

  function handleTap(f: (typeof FEATURES)[number], locked: boolean) {
    if (f.action === "prayers") {
      void openPrayerLink();
      return;
    }

    if (!locked) {
      setOpenDlg(f.action as OpenDialog);
      return;
    }

    // Locked paths
    if (!user) {
      // Guest — open the sign-in dialog
      openAuth();
      return;
    }
    // Signed-in member hitting a leaders-only area
    toast({
      title: "For authorised leaders",
      description:
        "This area is reserved for leaders. Sign in with a leader account to access it.",
    });
  }

  return (
    <>
      <section
        className="bg-[#fefdfb] px-3.5 pb-1 pt-4"
        aria-label="Explore LBD Nation Connect"
      >
        <h2 className="sr-only">Explore LBD Nation Connect</h2>
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f, i) => {
            const locked = isLocked(f.gate);
            const chipText = !user ? "SIGN IN" : "LEADERS ONLY";
            const sub =
              f.action === "prayers"
                ? user?.role === "leader"
                  ? "Join on Zoom"
                  : "WhatsApp orientation"
                : f.action === "create"
                  ? user?.role === "leader"
                    ? "Create & manage accounts"
                    : f.sub
                  : f.sub;
            return (
              <motion.button
                key={f.title}
                type="button"
                onClick={() => handleTap(f, locked)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                whileTap={locked ? undefined : { scale: 0.97 }}
                className={`group overflow-hidden rounded-[13px] bg-carddark text-left shadow-[0_2px_10px_rgba(40,18,4,0.16)] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                  locked ? "cursor-default" : "hover:shadow-[0_6px_18px_rgba(180,80,10,0.28)]"
                }`}
                aria-label={
                  f.action === "prayers"
                    ? `${f.title} — ${sub} (opens in a new tab)`
                    : `${f.title} — ${sub}${
                        locked ? (user ? " (leaders only)" : " (locked — sign in required)") : ""
                      }`
                }
              >
                <span className="relative block">
                  <img
                    src={f.img}
                    alt=""
                    aria-hidden="true"
                    className={`aspect-[246/129] w-full object-cover transition ${
                      locked ? "opacity-45 grayscale" : ""
                    }`}
                  />
                  {f.action === "prayers" && (
                    <span
                      className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/65 px-1.5 py-[3px] text-white/90"
                      aria-hidden="true"
                    >
                      <span className="size-[6px] rounded-full bg-[#22c55e]" />
                      <span className="text-[7.5px] font-bold tracking-[0.08em]">
                        {user?.role === "leader" ? "ZOOM LIVE" : "WHATSAPP"}
                      </span>
                    </span>
                  )}
                  {locked && (
                    <span
                      className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/65 px-1.5 py-[3px] text-white/90"
                      aria-hidden="true"
                    >
                      <Lock className="size-[9px]" strokeWidth={2.6} />
                      <span className="text-[7.5px] font-bold tracking-[0.08em]">
                        {chipText}
                      </span>
                    </span>
                  )}
                  <span
                    className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-carddark to-transparent"
                    aria-hidden="true"
                  />
                </span>
                <span className="relative block px-2 pb-2 pt-0.5">
                  <span className="flex items-center justify-between gap-1.5">
                    <span
                      className={`block whitespace-nowrap text-[10.5px] font-bold leading-[1.2] tracking-[-0.01em] ${
                        locked ? "text-white/55" : "text-white"
                      }`}
                    >
                      {f.title}
                    </span>
                    <span
                      className={`grid size-[17px] shrink-0 place-items-center rounded-full border-[1.4px] transition ${
                        locked
                          ? "border-white/30 text-white/45"
                          : "border-white/60 text-white group-hover:border-brand group-hover:bg-brand"
                      }`}
                    >
                      {locked ? (
                        <Lock className="size-2.5" strokeWidth={2.8} />
                      ) : (
                        <ChevronRight className="size-2.5" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                  <span
                    className={`mt-[3px] block whitespace-nowrap text-[9.5px] leading-tight ${
                      locked ? "text-white/40" : "text-white/75"
                    }`}
                  >
                    {sub}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Module dialogs — real content from the Google Sheet backend */}
      <ProgrammesDialog
        open={openDlg === "programmes"}
        onOpenChange={(o) => setOpenDlg(o ? "programmes" : null)}
      />
      <TeachingsDialog
        open={openDlg === "teachings"}
        onOpenChange={(o) => setOpenDlg(o ? "teachings" : null)}
      />
      <TestimoniesDialog
        open={openDlg === "testimonies"}
        onOpenChange={(o) => setOpenDlg(o ? "testimonies" : null)}
      />
      <RegisterMemberDialog
        open={openDlg === "register"}
        onOpenChange={(o) => setOpenDlg(o ? "register" : null)}
      />
      <CreateAccountDialog
        open={openDlg === "create"}
        onOpenChange={(o) => setOpenDlg(o ? "create" : null)}
      />
    </>
  );
}
