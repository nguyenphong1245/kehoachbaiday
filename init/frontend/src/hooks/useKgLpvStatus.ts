/**
 * Hook trạng thái hiệu dụng module KG-LPV — gọi /status một lần.
 * UI toàn bộ nút/panel KG-LPV render có điều kiện theo `enabled && availability === "ok"`.
 */
import { useEffect, useState } from "react";
import { getStatus } from "@/services/kgLpvApi";
import type { KgLpvAvailability } from "@/types/kgLpv";

export interface UseKgLpvStatusResult {
  enabled: boolean;
  availability: KgLpvAvailability;
  loading: boolean;
}

export function useKgLpvStatus(): UseKgLpvStatusResult {
  const [enabled, setEnabled] = useState(false);
  const [availability, setAvailability] = useState<KgLpvAvailability>("disabled");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const status = await getStatus();
        if (cancelled) return;
        setEnabled(status.enabled);
        setAvailability(status.availability);
      } catch {
        if (cancelled) return;
        setEnabled(false);
        setAvailability("disabled");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return { enabled, availability, loading };
}
