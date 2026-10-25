"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSession } from "./session-provider";

const inputCls =
  "h-11 rounded-xl border-neutral-200 bg-neutral-50 text-[13.5px] placeholder:text-neutral-400 focus-visible:border-brand focus-visible:ring-brand/30";

const labelCls =
  "text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-500";

export function AuthDialog() {
  const { authOpen, closeAuth, setUser } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form each time the dialog is opened
  useEffect(() => {
    if (authOpen) {
      setError(null);
      setShowPw(false);
    }
  }, [authOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setUser(data.user);
      closeAuth();
      setPassword("");
      setPhone("");

      const first = String(data.user.fullName).trim().split(/\s+/)[0];
      toast({
        title: `Welcome back, ${first}!`,
        description:
          "Leader access granted — the app menu is now unlocked at the bottom.",
      });
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={authOpen} onOpenChange={(o) => !o && closeAuth()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[400px]"
      >
        {/* Brand header */}
        <div className="relative bg-gradient-to-b from-[#d0610f] via-brand-deep to-[#b4510c] px-5 pb-5 pt-5 text-white">
          <DialogClose
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2.4} />
          </DialogClose>
          <img
            src="/images/logo.png"
            alt=""
            aria-hidden="true"
            className="mb-2.5 h-9 w-auto drop-shadow"
          />
          <DialogTitle className="font-display text-[21px] leading-tight tracking-[0.02em]">
            SIGN IN
          </DialogTitle>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] leading-snug text-white/85">
            <ShieldCheck className="size-3.5 shrink-0" strokeWidth={2.4} />
            Use the account created for you by your admin or leader.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5 px-5 pb-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="auth-phone" className={labelCls}>
              Phone number
            </Label>
            <Input
              id="auth-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 111 2222"
              autoComplete="tel"
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password" className={labelCls}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className={`${inputCls} pr-10`}
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
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>

          <p className="text-center text-[11.5px] leading-snug text-neutral-500">
            Accounts are created by your admin or leader —
            <br />
            there is no self sign-up on this app.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
