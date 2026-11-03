"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { ProductSelection } from "@/lib/products";
import { OrderModal } from "./OrderModal";

interface OrderContextValue { openOrder: (selection?: ProductSelection) => void }
const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<{ selection?: ProductSelection; key: number } | null>(null);
  const sequence = useRef(0);
  const openOrder = useCallback((selection?: ProductSelection) => {
    sequence.current += 1;
    setDraft({ selection, key: sequence.current });
  }, []);
  const closeOrder = useCallback(() => setDraft(null), []);
  const value = useMemo(() => ({ openOrder }), [openOrder]);
  return (
    <OrderContext.Provider value={value}>
      {children}
      {draft && <OrderModal key={draft.key} initialSelection={draft.selection} onClose={closeOrder} />}
    </OrderContext.Provider>
  );
}
export function useOrder(): OrderContextValue {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used within OrderProvider");
  return context;
}
