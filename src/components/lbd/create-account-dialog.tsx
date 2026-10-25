"use client";

import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
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

const LEADER_LEVELS = [
  { value: "international", label: "International Leader" },
  { value: "colony", label: "Colony Leader" },
  { value: "hub", label: "Hub Leader" },
  { value: "tribe", label: "Tribe Leader" },
];

const inputCls =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 text-[13.5px] placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-brand/30";

const labelCls =
  "text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-500";

/**
 * Leader Admin — create an account that immediately works on the front end.
 * Saved to the Users tab of the Google Sheet (admin-provisioned accounts).
 */
export function CreateAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<"member" | "leader">("leader");
  const [leaderLevel, setLeaderLevel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          password,
          role,
          leaderLevel: role === "leader" ? leaderLevel : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the account. Please try again.");
        return;
      }
      toast({
        title: "Account created",
        description: `${data.user.fullName} can now sign in on the front end with phone + password.`,
      });
      setFullName("");
      setPhone("");
      setPassword("");
      setRole("leader");
      setLeaderLevel("");
      setShowPw(false);
      onOpenChange(false);
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
            LEADER ADMIN
          </DialogTitle>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] leading-snug text-white/85">
            <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2.4} />
            Create a new account — it will work on the front end immediately.
          </p>
        </div>

        <form onSubmit={submit} className="max-h-[62vh] space-y-3 overflow-y-auto px-5 pb-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name" className={labelCls}>
              Full name
            </Label>
            <Input
              id="acc-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Daniel Okafor"
              autoComplete="name"
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-phone" className={labelCls}>
              Phone number
            </Label>
            <Input
              id="acc-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              autoComplete="tel"
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc-password" className={labelCls}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="acc-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className={`${inputCls} pr-10`}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Account type */}
          <div className="grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1" role="tablist" aria-label="Account type">
            {(["member", "leader"] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={role === r}
                onClick={() => {
                  setRole(r);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[12.5px] font-bold transition ${
                  role === r
                    ? "bg-brand text-white shadow-[0_2px_8px_rgba(252,117,25,0.4)]"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {r === "member" ? (
                  <UserRound className="size-3.5" strokeWidth={2.4} />
                ) : (
                  <ShieldCheck className="size-3.5" strokeWidth={2.4} />
                )}
                {r === "member" ? "Member" : "Leader"}
              </button>
            ))}
          </div>

          {role === "leader" && (
            <div className="space-y-1.5">
              <Label htmlFor="acc-level" className={labelCls}>
                Leadership level
              </Label>
              <Select value={leaderLevel} onValueChange={setLeaderLevel} required>
                <SelectTrigger
                  id="acc-level"
                  className="h-11 w-full rounded-xl border-neutral-200 bg-neutral-50 text-[13.5px] data-[placeholder]:text-neutral-400"
                >
                  <SelectValue placeholder="Select their leadership level" />
                </SelectTrigger>
                <SelectContent>
                  {LEADER_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              <UserRoundPlus className="size-4" strokeWidth={2.4} />
            )}
            Create account
          </Button>

          <p className="text-center text-[11.5px] leading-snug text-neutral-500">
            Saved to the Users tab of the church Google Sheet. The person signs
            in with this phone number and password.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
