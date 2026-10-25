"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-cream"
      aria-label="Welcome to Bethel"
    >
      {/* Sunset prayer backdrop (right side) */}
      <img
        src="/images/hero-bg.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[88%_32%]"
      />
      {/* Light wash on the left so text stays readable, like the original */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-cream from-30% via-cream/75 via-62% to-cream/5"
        aria-hidden="true"
      />
      {/* Soft cream glow anchoring the logo, echoing the original's bright corner */}
      <div
        className="absolute left-0 top-0 h-[62%] w-[78%] bg-[radial-gradient(120%_115%_at_18%_12%,rgba(253,248,240,0.95)_0%,rgba(253,248,240,0.55)_45%,transparent_72%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#fefdfb] to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 px-5 pb-9 pt-7">
        {/* Logo + wordmark lockup */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex items-center justify-center gap-4"
        >
          <img
            src="/images/logo.png"
            alt="LBD Nation Connect logo — globe held by a stylised figure"
            className="h-[108px] w-auto drop-shadow-sm"
          />
          <div className="h-[86px] w-px bg-neutral-900/15" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-display text-[26px] leading-none tracking-[0.01em] text-neutral-900">
              LBD NATION
            </p>
            <p className="ml-1 mt-0.5 font-script text-[34px] leading-[1.05] text-brand">
              Connect
            </p>
            <p className="mt-1.5 whitespace-nowrap text-[8px] font-bold tracking-[0.3em] text-neutral-700">
              LIVING BY GOD&apos;S DESIGN
            </p>
          </div>
        </motion.div>

        {/* Welcome block */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="mt-5 text-center"
        >
          <p className="font-script text-[27px] leading-none text-neutral-900">
            Welcome to
          </p>
          <h1 className="mt-1 font-display text-[46px] leading-[1.02] tracking-[0.03em] text-neutral-900">
            BETHEL
          </h1>
          <p className="mt-3 inline-block rounded-full bg-gradient-to-b from-[#ff8a2a] to-brand px-6 py-[9px] font-sans text-[13.5px] font-extrabold tracking-[0.04em] text-white shadow-lg shadow-brand/35">
            THE ONLINE PRAYER HOUSE
          </p>
          <p className="mt-3.5 font-fancy text-[15.5px] font-semibold italic text-neutral-800">
            Pray <span className="mx-1.5 not-italic text-brand">·</span> Grow
            <span className="mx-1.5 not-italic text-brand">·</span> Connect
            <span className="mx-1.5 not-italic text-brand">·</span> Fulfil
          </p>
        </motion.div>
      </div>
    </section>
  );
}
