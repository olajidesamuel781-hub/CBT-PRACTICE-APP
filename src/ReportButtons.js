import { useState } from "react";
import "./ReportButtons.css";

export default function ReportButtons() {
  const [open, setOpen] = useState(false);

  return (
    <div className="report-fab">
      {open && (
        <div className="report-menu">
          <a
            className="report-item report-email"
            href="mailto:olajidesamuel781@gmail.com?subject=CBT%20App%20Issue&body=Hello%20PrincePsalm,%20I%20want%20to%20report%20an%20issue:%20"
          >
            📩 Report
          </a>

          <a
            className="report-item report-wa"
            href="https://wa.me/2349126352640"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WhatsApp
          </a>
        </div>
      )}

      <button
        type="button"
        className="report-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open report menu"
      >
        ⋮
      </button>
    </div>
  );
}