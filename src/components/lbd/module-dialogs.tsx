"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Heart,
  Link2,
  Loader2,
  MapPin,
  TriangleAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = "loading" | "ready" | "error";

type Programme = {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
};
type Teaching = {
  id: string;
  title: string;
  speaker: string;
  date: string;
  scripture: string;
  link: string;
};
type Testimony = {
  id: string;
  name: string;
  testimony: string;
  date: string;
};

function Shell({
  open,
  onOpenChange,
  title,
  subtitle,
  status,
  configured,
  emptyText,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle: string;
  status: Status;
  configured: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]"
      >
        <div className="bg-gradient-to-b from-[#d0610f] via-brand-deep to-[#b4510c] px-5 pb-4 pt-5 text-white">
          <DialogTitle className="font-display text-[19px] leading-tight tracking-[0.02em]">
            {title}
          </DialogTitle>
          <p className="mt-1 text-[11.5px] leading-snug text-white/85">{subtitle}</p>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-4 py-4">
          {!configured ? (
            <Notice>
              The Google Sheet backend is not connected yet. Once your admin
              connects the church sheet, updates made there will appear here
              automatically.
            </Notice>
          ) : status === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[12.5px] font-medium text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : status === "error" ? (
            <Notice>
              Could not reach the Google Sheet. Please check your connection
              and try again later.
            </Notice>
          ) : (
            children
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2.5 text-[12px] font-medium leading-snug text-brand-deep">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.4} />
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="py-8 text-center text-[12.5px] text-neutral-500">{text}</p>
  );
}

function useModule<T>(open: boolean, url: string) {
  const [status, setStatus] = useState<Status>("loading");
  const [configured, setConfigured] = useState(true);
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        setItems(Array.isArray(data.items) ? data.items : []);
        setStatus(res.ok && !data.error ? "ready" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return { status, configured, items };
}

export function ProgrammesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { status, configured, items } = useModule<Programme>(
    open,
    "/api/programmes",
  );
  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title="PROGRAMMES"
      subtitle="Conventions, hub gatherings and special services — updated by your leaders."
      status={status}
      configured={configured}
      emptyText="No programmes posted yet. Check back soon."
    >
      {status === "ready" && items.length === 0 ? (
        <Empty text="No programmes posted yet. Check back soon." />
      ) : (
        <ul className="space-y-2.5">
          {items.map((p) => (
            <li
              key={p.id || p.title}
              className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] font-bold leading-snug text-neutral-900">
                  {p.title}
                </p>
                {p.date && (
                  <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">
                    {p.date}
                  </span>
                )}
              </div>
              {p.venue && (
                <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-neutral-500">
                  <MapPin className="size-3" strokeWidth={2.4} />
                  {p.venue}
                </p>
              )}
              {p.description && (
                <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">
                  {p.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

export function TeachingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { status, configured, items } = useModule<Teaching>(
    open,
    "/api/teachings",
  );
  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title="WORD & TEACHINGS"
      subtitle="Sermons, Bible studies and devotionals from your leaders."
      status={status}
      configured={configured}
      emptyText="No teachings posted yet. Check back soon."
    >
      {status === "ready" && items.length === 0 ? (
        <Empty text="No teachings posted yet. Check back soon." />
      ) : (
        <ul className="space-y-2.5">
          {items.map((t) => (
            <li
              key={t.id || t.title}
              className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-deep">
                  <BookOpen className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold leading-snug text-neutral-900">
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-neutral-500">
                    {[t.speaker, t.date].filter(Boolean).join(" · ")}
                  </p>
                  {t.scripture && (
                    <p className="mt-1 text-[12px] italic leading-snug text-neutral-600">
                      {t.scripture}
                    </p>
                  )}
                  {t.link && (
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-brand-deep transition hover:text-brand"
                    >
                      <Link2 className="size-3" strokeWidth={2.6} />
                      Open teaching
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

export function TestimoniesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { status, configured, items } = useModule<Testimony>(
    open,
    "/api/testimonies",
  );
  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title="TESTIMONIES"
      subtitle="Share His goodness — what the Lord has done among us."
      status={status}
      configured={configured}
      emptyText="No testimonies shared yet. Be the first to testify."
    >
      {status === "ready" && items.length === 0 ? (
        <Empty text="No testimonies shared yet. Be the first to testify." />
      ) : (
        <ul className="space-y-2.5">
          {items.map((t) => (
            <li
              key={t.id || t.name + t.date}
              className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-deep">
                  <Heart className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-neutral-900">
                    {t.name || "A member"}
                    {t.date && (
                      <span className="ml-1.5 text-[10.5px] font-medium uppercase tracking-wide text-neutral-400">
                        {t.date}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-snug text-neutral-600">
                    &ldquo;{t.testimony}&rdquo;
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
