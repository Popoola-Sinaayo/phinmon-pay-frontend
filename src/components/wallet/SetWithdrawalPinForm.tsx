"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function SetWithdrawalPinForm({
  pinSet,
  onSuccess,
  compact,
}: {
  pinSet?: boolean;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post("/users/withdrawal-pin", {
        pin,
        confirmPin,
        ...(pinSet ? { currentPin } : {}),
      });
    },
    onSuccess: async () => {
      setPin("");
      setConfirmPin("");
      setCurrentPin("");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["withdrawal-pin-status"] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save PIN");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4–6 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    mutation.mutate();
  };

  const pinInputProps = {
    inputMode: "numeric" as const,
    pattern: "[0-9]*",
    maxLength: 6,
    autoComplete: "off",
    className: "input text-center tracking-[0.4em]",
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <p className="text-sm text-gray-600">
          {pinSet
            ? "Change your withdrawal PIN. You will need it every time you withdraw."
            : "Create a 4–6 digit PIN to secure withdrawals from your wallet."}
        </p>
      )}

      {pinSet && (
        <div>
          <label className="label">Current PIN</label>
          <input
            {...pinInputProps}
            type="password"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
        </div>
      )}

      <div>
        <label className="label">{pinSet ? "New PIN" : "PIN"}</label>
        <input
          {...pinInputProps}
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••"
          required
        />
      </div>

      <div>
        <label className="label">Confirm PIN</label>
        <input
          {...pinInputProps}
          type="password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••"
          required
        />
      </div>

      {error && (
        <p className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600">{error}</p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : pinSet ? "Update PIN" : "Set PIN"}
      </button>
    </form>
  );
}
