export default function ReportButtons() {
  return (
    <div className="report-fab">
      <a
        className="report-btn email"
        href="mailto:olajidesamuel781@gmail.com?subject=CBT%20App%20Issue&body=Hello%2C%20I%20am%20experiencing%20this%20issue%3A%0A%0A"
      >
        📧 Report
      </a>

      <a
        className="report-btn whatsapp"
        href="https://wa.me/2349126352640"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬 WhatsApp
      </a>
    </div>
  );
}