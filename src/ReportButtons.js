import { useState } from "react";
import "./ReportButtons.css";
import ReportModal from "./ReportModal";

export default function ReportButtons({ userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* top-left 3 dots */}
      <div className="report-fab top-left">
        {menuOpen && (
          <div className="report-menu">
            <button
              className="report-item report-email"
              onClick={() => {
                setMenuOpen(false);
                setModalOpen(true);
              }}
            >
              ✉️ Report
            </button>

            <a
              className="report-item report-whatsapp"
              href="https://wa.me/2349126352640"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              💬 WhatsApp
            </a>
          </div>
        )}

        <button
          type="button"
          className="report-toggle"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ⋯
        </button>
      </div>

      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}