"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type LivenessStartResponse = {
  sessionId: string;
  sdkSessionToken?: string;
  customerReference?: string;
  idNumber?: string;
};

type ApplicantData = {
  firstname: string;
  lastname: string;
  middlename?: string;
  email?: string;
  dob?: string;
  phone?: string;
};

function splitName(fullName?: string): { firstname: string; lastname: string } {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: parts[0] };
  return { firstname: parts[0], lastname: parts[parts.length - 1] };
}

export function useQoreIdLiveness() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runLivenessCheck = useCallback(
    async (user: Pick<User, "name" | "email">, profile?: { dateOfBirth?: string }) => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.post<LivenessStartResponse>("/verification/liveness/start");
        const { firstname, lastname } = splitName(user.name);
        const applicantData: ApplicantData = {
          firstname,
          lastname,
          email: user.email,
          ...(profile?.dateOfBirth ? { dob: profile.dateOfBirth.split("T")[0] } : {}),
        };

        if (data.sdkSessionToken) {
          const QoreID = (await import("@qore-id/web-sdk")).default;

          await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
              QoreID.off("success", onSuccess);
              QoreID.off("error", onError);
              QoreID.off("close", onClose);
            };

            const onSuccess = async () => {
              cleanup();
              try {
                await api.post("/verification/liveness/complete", { sessionId: data.sessionId });
                resolve();
              } catch (err) {
                reject(err);
              }
            };

            const onError = (sdkError: unknown) => {
              cleanup();
              reject(sdkError);
            };

            const onClose = () => {
              cleanup();
              reject(new Error("Liveness verification was closed"));
            };

            QoreID.on("success", onSuccess);
            QoreID.on("error", onError);
            QoreID.on("close", onClose);

            QoreID.start({
              token: data.sdkSessionToken!,
              customerReference: data.customerReference || data.sessionId,
              applicantData,
              ...(data.idNumber
                ? { identityData: { idType: "nin", idNumber: data.idNumber } }
                : {}),
            }).catch(reject);
          });
        } else {
          await api.post("/verification/liveness/complete", { sessionId: data.sessionId });
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          "Liveness verification failed";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { runLivenessCheck, loading, error };
}
