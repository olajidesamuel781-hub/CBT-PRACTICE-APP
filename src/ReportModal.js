import { useState } from "react";
import "./ReportModal.css";

export default function ReportModal({ open, onClose, userEmail }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  if (!open) return null;

  const sendReport = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!subject.trim() || !message.trim()) {
      setStatus("Please fill subject and message.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail: userEmail || "princepsalm30@gmail.com",
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to send");

      setStatus("✅ Sent successfully");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("❌ " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-card" onClick={(e) => e.stopPropagation()}>
        <div className="report-head">
          <h3>Report an issue</h3>
          <button className="report-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={sendReport} className="report-form">
          <label>Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Payment issue / Question error"
          />

          <label>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
          />

          {status ? <p className="report-status">{status}</p> : null}

          <button className="report-send" disabled={sending}>
            {sending ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}