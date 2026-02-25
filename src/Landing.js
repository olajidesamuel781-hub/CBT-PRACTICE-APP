import { useState } from "react";
import "./Landing.css";
import aaulogo from "./assets/image (2).png";
import googleLogo from "./assets/google.png";
import { supabase } from "./supabaseClient";
import ReportButtons from "./ReportButtons";

export default function Landing() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const signUpWithEmail = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Account created! You can now sign in.");
    setMode("signin");
  };

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const forgotPassword = async () => {
    if (!email) return alert("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) alert(error.message);
    else alert("Reset link sent. Check your email.");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="auth-page">
      <img src={aaulogo} alt="Ambrose Alli University Logo" className="auth-logo" />
      <h1 className="auth-title">CBT PRACTICE APP</h1>
      <p className="auth-subtitle"> Psalm CBT Practice App for AAU Students</p>
      <p className="powered-by">@powered by PrincePsalm.</p>

      <div className="auth-card">
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <div className="auth-row">
            <label>Password</label>
            <button type="button" className="link-btn" onClick={forgotPassword}>
              Forgot password?
            </button>
          </div>

          <div className="pwd-wrap">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPwd((v) => !v)}
              aria-label="Toggle password"
            >
              {showPwd ? (
                // open eye
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                // eye off
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.65 21.65 0 015.06-7.94" />
                  <path d="M1 1l22 22" />
                  <path d="M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.8 21.8 0 01-3.3 4.94" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mode === "signin" ? (
          <button className="primary-btn" onClick={signInWithEmail}>
            Sign in
          </button>
        ) : (
          <button className="primary-btn" onClick={signUpWithEmail}>
            Sign up
          </button>
        )}

        <button className="google-btn" onClick={signInWithGoogle}>
          <img src={googleLogo} alt="Google" className="google-icon" />
          Continue with Google
        </button>

        {mode === "signin" ? (
          <p className="auth-footer">
            Don’t have an account?{" "}
            <button className="link-btn" onClick={() => setMode("signup")}>
              Sign up
            </button>
          </p>
        ) : (
          <p className="auth-footer">
            Already have an account?{" "}
            <button className="link-btn" onClick={() => setMode("signin")}>
              Sign in
            </button>
          </p>
        )}
      </div>
      <ReportButtons />
    </div>
  );
}