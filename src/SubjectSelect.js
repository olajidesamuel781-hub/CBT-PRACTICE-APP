// SubjectSelect.js

import { useMemo, useState } from "react";
import { PaystackButton } from "react-paystack";
import "./Landing.css";
import aaulogo from "./assets/image (2).png";

export default function SubjectSelect({
  subjects,
  onStart,
  onLogout,
  studentEmail,
  isPremium,
  premiumLoading,
  onPremiumSuccess,
  premiumSubjects,
}) {
  const [subject, setSubject] = useState("");
  const [notice, setNotice] = useState("");
  const [verifying, setVerifying] = useState(false);

  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || "";

  // Make one reference per click/payment attempt
  const reference = useMemo(() => `${Date.now()}_${Math.random().toString(16).slice(2)}`, []);

  const paystackConfig = {
    reference,
    email: studentEmail || "test@email.com",
    publicKey,
    amount: 1000 * 100, // kobo
  };

  const selectedLocked = premiumSubjects?.includes(subject) && !isPremium;

  const pickSubject = (s) => {
    setSubject(s);
    const locked = premiumSubjects?.includes(s) && !isPremium;
    setNotice(locked ? `Unlock Premium to practice: ${s}` : "");
  };

  const verifyPayment = async (ref) => {
    setVerifying(true);
    try {
      const r = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await r.json();

      if (!data?.ok) {
        alert("Payment not verified. Try again.");
        return;
      }

      // Verified on server ✅
      await onPremiumSuccess();
      alert("Premium unlocked ✅");
    } catch (e) {
      console.error(e);
      alert("Verification error. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="auth-page">
      <img src={aaulogo} alt="Ambrose Alli University Logo" className="auth-logo" />
      <h1 className="auth-title">CBT PRACTICE APP</h1>
      <p className="auth-subtitle">AMBROSE ALLI UNIVERSITY & EXAM PRACTICE SYSTEM</p>

      <div className="auth-card">
        <p style={{ marginBottom: "12px", textAlign: "center" }}>
          Logged in as: <b>{studentEmail || "Student"}</b>
        </p>

        <button className="logout-btn" onClick={onLogout} disabled={premiumLoading || verifying}>
          Logout
        </button>

        {(premiumLoading || verifying) && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            {premiumLoading ? "Checking premium..." : "Verifying payment..."}
          </p>
        )}

        {!isPremium && !premiumLoading && (
          <PaystackButton
            {...paystackConfig}
            text="Unlock Premium ₦1000 / month"
            className="primary-btn"
            onSuccess={(res) => {
              // res.reference is what we verify
              verifyPayment(res?.reference || reference);
            }}
            onClose={() => {}}
          />
        )}

        <h3 style={{ textAlign: "center", marginTop: "16px" }}>Select Subject</h3>

        <div className="subject-grid-modern">
          {subjects.map((s) => {
            const locked = premiumSubjects?.includes(s) && !isPremium;
            return (
              <div
                key={s}
                className={`subject-item ${subject === s ? "active-subject" : ""}`}
                onClick={() => pickSubject(s)}
                style={{ opacity: locked ? 0.6 : 1 }}
              >
                {s} {locked ? "🔒" : ""}
              </div>
            );
          })}
        </div>

        {!!notice && (
          <p style={{ color: "#ffb4b4", marginTop: "12px", textAlign: "center" }}>
            {notice}
          </p>
        )}

        <button
          className="primary-btn"
          disabled={!subject || selectedLocked || premiumLoading || verifying}
          onClick={() => onStart(subject)}
          style={{ marginTop: "14px" }}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}