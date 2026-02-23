import { useState } from "react";
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

  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || "";

  const paystackConfig = {
    reference: `${Date.now()}`,
    email: studentEmail || "test@email.com",
    publicKey,
    amount: 1000 * 100,
  };

  const selectedLocked = premiumSubjects?.includes(subject) && !isPremium;

  const pickSubject = (s) => {
    setSubject(s);

    const locked = premiumSubjects?.includes(s) && !isPremium;
    if (locked) {
      setNotice(`Unlock Premium to practice: ${s}`);
    } else {
      setNotice("");
    }
  };

  return (
    <div className="auth-page">
      <img src={aaulogo} alt="Ambrose Alli University Logo" className="auth-logo" />
      <h1 className="auth-title">CBT PRACTICE APP</h1>
      <p className="auth-subtitle">
        AMBROSE ALLI UNIVERSITY & EXAM PRACTICE SYSTEM
      </p>

      <div className="auth-card">
        <p style={{ marginBottom: "12px", textAlign: "center" }}>
          Logged in as: <b>{studentEmail || "Student"}</b>
        </p>

        <button className="logout-btn" onClick={onLogout} disabled={premiumLoading}>
          Logout
        </button>

        {premiumLoading && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Checking premium...
          </p>
        )}

        {!isPremium && !premiumLoading && (
          <PaystackButton
            {...paystackConfig}
            text="Unlock Premium ₦1000 / month"
            className="primary-btn"
            onSuccess={() => onPremiumSuccess()}
            onClose={() => {}}
          />
        )}

        <h3 style={{ textAlign: "center", marginTop: "16px" }}>
          Select Subject
        </h3>

        <div className="subject-grid-modern">
          {subjects.map((s) => {
            const locked = premiumSubjects?.includes(s) && !isPremium;

            return (
              <div
                key={s}
                className={`subject-item ${
                  subject === s ? "active-subject" : ""
                }`}
                onClick={() => pickSubject(s)}
                style={{ opacity: locked ? 0.6 : 1 }}
              >
                {s} {locked ? "🔒" : ""}
              </div>
            );
          })}
        </div>

        {!!notice && (
          <p
            style={{
              color: "#ffb4b4",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            {notice}
          </p>
        )}

        <button
          className="primary-btn"
          disabled={!subject || selectedLocked || premiumLoading}
          onClick={() => onStart(subject)}
          style={{ marginTop: "14px" }}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}