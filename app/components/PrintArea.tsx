import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type { PaperSize } from "~/templates/types";

const DPI = 96; // CSS pixels per inch

/**
 * Shows `preview` on a true-to-size "paper" on screen (scaled to fit), and
 * prints `pages` — one paper-sized page each — at exact physical dimensions.
 *
 * The print copies render into a portal at `<body>`; in print, everything
 * except that portal is `display: none` (so the app chrome doesn't spill onto
 * extra pages) and each page gets `break-after: page`.
 */
export function PrintArea({
  paper,
  preview,
  pages,
}: {
  paper: PaperSize;
  preview: ReactNode;
  pages: ReactNode[];
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
        box-shadow: none !important; border: 0 !important; margin: 0 !important;
        break-after: page; page-break-after: always;
      }
      .print-portal .print-paper:last-child {
        break-after: auto; page-break-after: auto;
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
          {preview}
        </div>
      </div>

      {/* Print-only true-size pages, portaled to <body> for clean isolation */}
      {mounted &&
        createPortal(
          <div className="print-portal">
            {pages.map((page, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="print-paper"
                style={{
                  width: `${paper.width}in`,
                  height: `${paper.height}in`,
                }}
              >
                {page}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
