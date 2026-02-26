// SubjectSelect.js
import { useMemo, useState } from "react";
import { PaystackButton } from "react-paystack";
import "./Landing.css";
import aaulogo from "./assets/image (2).png";
import ReportButtons from "./ReportButtons";

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

  // ✅ Normalize premium list once
  const premiumList = useMemo(() => {
    return (premiumSubjects || []).map((x) => String(x).trim());
  }, [premiumSubjects]);

  // ✅ Normalize subjects list once (this fixes hidden spaces)
  const cleanSubjects = useMemo(() => {
    return (subjects || []).map((x) => String(x).trim());
  }, [subjects]);

  const reference = useMemo(
    () => `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    []
  );

  const paystackConfig = {
    reference,
    email: studentEmail || "test@email.com",
    publicKey,
    amount: 1000 * 100,
  };

  const selectedLocked = premiumList.includes(String(subject).trim()) && !isPremium;

  const pickSubject = (s) => {
    const clean = String(s).trim();
    setSubject(clean);

    const locked = premiumList.includes(clean) && !isPremium;
    setNotice(locked ? `Unlock Premium to practice: ${clean}` : "");
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

      await onPremiumSuccess(ref);
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
      <p className="auth-subtitle"> Psalm CBT Practice App for AAU Students</p>
      <p className="powered-by">@powered by PrincePsalm.</p>

      <div className="auth-card">
        <p style={{ marginBottom: "12px", textAlign: "center" }}>
          Logged in as: <b>{studentEmail || "Student"}</b>
        </p>

        <button
          className="logout-btn"
          onClick={onLogout}
          disabled={premiumLoading || verifying}
        >
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
            onSuccess={(res) => verifyPayment(res?.reference || reference)}
            onClose={() => {}}
          />
        )}

         <ReportButtons userEmail={studentEmail} />
        <h3 style={{ textAlign: "center", marginTop: "16px" }}>Select Subject</h3>

        <div className="subject-grid-modern">
          {cleanSubjects.map((s) => {
            const locked = premiumList.includes(s) && !isPremium;

            return (
              <div
                key={s}
                className={`subject-item ${String(subject).trim() === s ? "active-subject" : ""}`}
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
          onClick={() => onStart(String(subject).trim())}
          style={{ marginTop: "14px" }}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}