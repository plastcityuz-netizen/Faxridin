import { Layers3 } from "lucide-react";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`brand${inverted ? " brand--inverted" : ""}`}>
      <span className="brand__mark" aria-hidden="true"><Layers3 size={27} strokeWidth={1.8} /></span>
      <span className="brand__type"><strong>IZO <span>PLUS</span></strong><small>PENAPLAST ZAVODI</small></span>
    </span>
  );
}
