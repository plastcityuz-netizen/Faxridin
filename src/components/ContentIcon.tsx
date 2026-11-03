import { BadgeCheck, Boxes, Factory, Layers3, Package, PackageCheck, Ruler, Scissors, Send, ShieldCheck, Thermometer, Waves } from "lucide-react";
import type { ContentIcon as IconName } from "@/lib/content";

const icons = {
  quality: ShieldCheck, density: Layers3, thickness: Ruler, thermal: Thermometer,
  factory: Factory, order: Send, raw: Boxes, expand: Waves, mold: Package,
  cut: Scissors, check: BadgeCheck, package: PackageCheck,
};
export function ContentIcon({ name, size = 25 }: { name: IconName; size?: number }) {
  const Icon = icons[name];
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}
