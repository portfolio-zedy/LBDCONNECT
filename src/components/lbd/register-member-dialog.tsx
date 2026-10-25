"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const inputCls =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 text-[13.5px] placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-brand/30";

const labelCls =
  "text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-500";

type Member = {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  colony: string;
  registeredBy: string;
  createdAt: string;
};

export function RegisterMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [colony, setColony] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listState, setListState] = useState<
    "loading" | "ready" | "error" | "unconfigured"
  >("loading");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (res.status === 403) {
          setListState("error");
          return;
        }
        if (!data.configured) {
          setListState("unconfigured");
          return;
        }
        setMembers(Array.isArray(data.items) ? data.items : []);
        setListState(data.error ? "error" : "ready");
      } catch {
        if (!cancelled) setListState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, gender, colony }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not register the member. Please try again.");
        return;
      }
      setMembers((prev) => [data.member, ...prev]);
      setFullName("");
      setPhone("");
      setGender("");
      setColony("");
      toast({
        title: "Member registered",
        description: `${data.member.fullName} has been added to the church member registry.`,
      });
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]"
      >
        <div className="bg-gradient-to-b from-[#d0610f] via-brand-deep to-[#b4510c] px-5 pb-4 pt-5 text-white">
          <DialogTitle className="font-display text-[19px] leading-tight tracking-[0.02em]">
            REGISTER A MEMBER
          </DialogTitle>
          <p className="mt-1 text-[11.5px] leading-snug text-white/85">
            Add a new member to your colony — saved to the church member
            registry.
          </p>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-5 pb-5 pt-4">
          {listState === "unconfigured" && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2.5 text-[12px] font-medium leading-snug text-brand-deep">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.4} />
              The Google Sheet backend is not connected yet — registrations are
              saved there once your admin connects it.
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="member-name" className={labelCls}>
                Full name
              </Label>
              <Input
                id="member-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chidi Nwosu"
                autoComplete="name"
                className={inputCls}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="member-phone" className={labelCls}>
                  Phone
                </Label>
                <Input
                  id="member-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234…"
                  autoComplete="tel"
                  className={inputCls}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="member-gender" className={labelCls}>
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger
                    id="member-gender"
                    className="h-11 w-full rounded-xl border-neutral-200 bg-neutral-50 text-[13.5px] data-[placeholder]:text-neutral-400"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-colony" className={labelCls}>
                Colony
              </Label>
              <Input
                id="member-colony"
                value={colony}
                onChange={(e) => setColony(e.target.value)}
                placeholder="e.g. Lekki Colony"
                className={inputCls}
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-[#d24242]/25 bg-[#d24242]/10 px-3 py-2.5 text-[12px] font-medium leading-snug text-[#a12c2c]"
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.4} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-xl bg-brand text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(252,117,25,0.4)] transition hover:bg-brand-deep disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserRoundCheck className="size-4" strokeWidth={2.4} />
              )}
              Register member
            </Button>
          </form>

          {listState === "ready" && members.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                Registered members ({members.length})
              </p>
              <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-semibold text-neutral-900">
                        {m.fullName}
                      </span>
                      <span className="block text-[10.5px] text-neutral-500">
                        {[m.colony, m.phone].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-brand-deep">
                      {m.gender || "member"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
