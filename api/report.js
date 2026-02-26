// quiz-app/api/report.js

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fromEmail, subject, message } = req.body || {};

    if (!subject || !message) {
      return res.status(400).json({ error: "Missing subject/message" });
    }

    // For now, just confirm it works (later you can send email with Resend/SendGrid/etc.)
    console.log("REPORT:", { fromEmail, subject, message });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}