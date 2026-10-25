"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

const CHAIN = [
  "International Leadership",
  "Colonies",
  "Hubs",
  "Tribes",
  "Leaders",
  "Members",
];

export function LeadershipBanner() {
  return (
    <section className="bg-[#fefdfb] px-3.5 pb-6 pt-4" aria-label="Our leadership structure">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-ink px-4 py-4 shadow-[0_10px_26px_rgba(10,10,12,0.35)]"
      >
        {/* Subtle dotted world-map texture + warm glow, echoing the original banner */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-3/5 opacity-[0.09]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1.4px)",
            backgroundSize: "8px 8px",
            maskImage: "radial-gradient(ellipse 90% 100% at 75% 40%, black 30%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 100% at 75% 40%, black 30%, transparent 78%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-brand/15 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-wrap items-center gap-3.5">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#ff8a2a] to-[#ef5f0d] shadow-md shadow-brand/30"
            aria-hidden="true"
          >
            <Users className="size-6 text-white" strokeWidth={2.2} />
          </span>

          <div className="min-w-[210px] flex-1">
            <p className="text-[11.5px] font-extrabold tracking-[0.05em] text-brand-warm">
              OUR LEADERSHIP STRUCTURE
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[9px] font-bold tracking-[0.07em] text-white/90">
              {CHAIN.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  {step.toUpperCase()}
                  {i < CHAIN.length - 1 && (
                    <span className="text-brand-warm" aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-px bg-white/15" aria-hidden="true" />
            <div className="text-center sm:text-left">
              <p className="text-[12.5px] font-semibold leading-[1.3] text-white">
                One Family.
                <br />
                One Mission.
              </p>
              <p className="font-script text-[21px] leading-tight text-brand-warm">
                God&apos;s Design.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
