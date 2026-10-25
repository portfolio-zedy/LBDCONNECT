import { AppHeader } from "@/components/lbd/header";
import { Hero } from "@/components/lbd/hero";
import { FeatureCards } from "@/components/lbd/feature-cards";
import { LeadershipBanner } from "@/components/lbd/leadership-banner";
import { BottomNav } from "@/components/lbd/bottom-nav";
import { SessionProvider } from "@/components/lbd/session-provider";

export default function Home() {
  return (
    <SessionProvider>
      <div className="min-h-dvh bg-[#171009] [background-image:radial-gradient(900px_480px_at_50%_-8%,rgba(252,117,25,0.16),transparent_70%)]">
        {/* The app column — full screen on phones, centred app frame on desktop */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-[#fefdfb] shadow-[0_0_90px_rgba(0,0,0,0.55)] md:my-0 md:ring-1 md:ring-white/10">
          <AppHeader />
          <main className="flex-1">
            <Hero />
            <FeatureCards />
            <LeadershipBanner />
          </main>
          <BottomNav />
        </div>
      </div>
    </SessionProvider>
  );
}
