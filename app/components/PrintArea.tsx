import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type { PaperSize } from "~/templates/types";

const DPI = 96; // CSS pixels per inch

/**
 * Shows its children on a true-to-size "paper" element and prints them at exact
 * physical dimensions.
 *
 * On screen the paper is scaled down to fit the available width. For printing,
 * a separate true-size copy is rendered into a portal at `<body>` and an
 * injected `@page` rule sets the real media size; in print, everything except
 * that portal is `display: none` so only the one paper-sized page is emitted.
 * (Using `visibility: hidden` instead would leave the app chrome occupying
 * layout space and spill onto extra pages.)
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
  const [mounted, setMounted] = useState(false);
  const paperWidthPx = paper.width * DPI;
  const paperHeightPx = paper.height * DPI;

  useEffect(() => setMounted(true), []);

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

  const printCss = `
    @media screen { .print-portal { display: none; } }
    @media print {
      @page { size: ${paper.width}in ${paper.height}in; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body > *:not(.print-portal) { display: none !important; }
      .print-portal { display: block !important; }
      .print-portal .print-paper {
        position: absolute; left: 0; top: 0;
        box-shadow: none !important; border: 0 !important;
      }
    }
  `;

  return (
    <>
      <style>{printCss}</style>

      {/* On-screen scaled preview */}
      <div
        className="print-stage"
        ref={stageRef}
        style={{ height: paperHeightPx * scale }}
      >
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

      {/* Print-only true-size copy, portaled to <body> for clean isolation */}
      {mounted &&
        createPortal(
          <div className="print-portal">
            <div
              className="print-paper"
              style={{
                width: `${paper.width}in`,
                height: `${paper.height}in`,
              }}
            >
              {children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
