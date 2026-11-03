"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { ProductSelection } from "@/lib/products";
import { useOrder } from "./OrderProvider";

interface OrderButtonProps {
  selection?: ProductSelection;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "dark" | "outline";
  disabled?: boolean;
}
export function OrderButton({ selection, children = "BUYURTMA BERISH", className = "", variant = "primary", disabled = false }: OrderButtonProps) {
  const { openOrder } = useOrder();
  return (
    <button type="button" className={`button button--${variant} ${className}`} onClick={() => openOrder(selection)} disabled={disabled}>
      <span>{children}</span><ArrowUpRight size={18} aria-hidden="true" />
    </button>
  );
}
