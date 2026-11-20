"use client";

import { useEffect, useState } from "react";
import type { PublicCustomer } from "@/lib/customer";

export function useAccount() {
  const [customer, setCustomer] = useState<PublicCustomer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const response = await fetch("/api/account/session");
        const data = (await response.json()) as { customer?: PublicCustomer | null };
        if (!stop) setCustomer(data.customer ?? null);
      } catch {
        if (!stop) setCustomer(null);
      } finally {
        if (!stop) setReady(true);
      }
    }
    void load();
    function refresh() {
      void load();
    }
    window.addEventListener("rs-account", refresh);
    return () => {
      stop = true;
      window.removeEventListener("rs-account", refresh);
    };
  }, []);

  return { customer, ready };
}

export function announceAccount() {
  window.dispatchEvent(new Event("rs-account"));
}
