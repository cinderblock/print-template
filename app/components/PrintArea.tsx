import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PaperSize } from "~/templates/types";

const DPI = 96; // CSS pixels per inch

/**
 * Shows its children on a true-to-size "paper" element and prints them at exact
 * physical dimensions. On screen the paper is scaled down to fit the available
 * width; on print, an injected `@page` rule sets the real media size and only
 * the paper is shown.
 */
export function PrintArea({
  paper,
  children,
}: {
  paper: PaperSize;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const paperWidthPx = paper.width * DPI;
  const paperHeightPx = paper.height * DPI;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const avail = stage.clientWidth;
      setScale(avail > 0 ? Math.min(1, avail / paperWidthPx) : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [paperWidthPx]);

  // Only the screen layout needs the computed height; print resets it.
  const stageHeight = paperHeightPx * scale;

  return (
    <div className="print-stage" ref={stageRef} style={{ height: stageHeight }}>
      <style media="print">{`
        @page { size: ${paper.width}in ${paper.height}in; margin: 0; }
        html, body { background: #fff !important; }
        body * { visibility: hidden !important; }
        .print-stage { position: static !important; overflow: visible !important; height: auto !important; }
        .print-paper, .print-paper * { visibility: visible !important; }
        .print-paper {
          position: absolute !important; left: 0 !important; top: 0 !important;
          transform: none !important; box-shadow: none !important; margin: 0 !important;
        }
      `}</style>
      <div
        className="print-paper"
        style={{
          width: `${paper.width}in`,
          height: `${paper.height}in`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
