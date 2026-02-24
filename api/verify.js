// api/verify.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { reference } = req.body || {};

    if (!reference) {
      return res.status(400).json({ ok: false, message: "Missing reference" });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ ok: false, message: "Missing PAYSTACK_SECRET_KEY" });
    }

    const r = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    const data = await r.json();

    if (!data?.status || !data?.data) {
      return res.status(400).json({ ok: false, message: "Verification failed", data });
    }

    // Paystack returns: data.data.status === "success"
    const paid = data.data.status === "success";

    return res.status(200).json({
      ok: paid,
      status: data.data.status,
      amount: data.data.amount, // kobo
      currency: data.data.currency,
      email: data.data.customer?.email,
      reference: data.data.reference,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error", error: String(err) });
  }
}