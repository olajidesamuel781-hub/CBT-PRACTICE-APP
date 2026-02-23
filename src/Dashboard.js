import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Dashboard.css";

export default function Dashboard({ session }) {
  const userEmail = session?.user?.email;

  // Simple “premium lock” demo:
  // premium = false by default. You can later connect payment and set it true.
  const [isPremium, setIsPremium] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // OPTIONAL: keep premium in localStorage so it doesn't reset every refresh
  useEffect(() => {
    const saved = localStorage.getItem("isPremium");
    if (saved === "true") setIsPremium(true);
  }, []);

  const activatePremiumDemo = () => {
    setIsPremium(true);
    localStorage.setItem("isPremium", "true");
  };

  return (
    <div className="dash">
      <div className="dash-card">
        <h2>Welcome 👋</h2>
        <p className="small">Logged in as: <b>{userEmail}</b></p>

        <div className="row">
          <button className="btn" onClick={logout}>Logout</button>
          {!isPremium && (
            <button className="btn premium" onClick={activatePremiumDemo}>
              Activate Premium (Demo)
            </button>
          )}
        </div>

        <hr />

        <h3>Free Content</h3>
        <p className="small">This section is open for everyone.</p>
        <div className="box">
          <p>✅ Free Questions / Free Subjects</p>
        </div>

        <h3>Premium Content</h3>
        {!isPremium ? (
          <div className="lock">
            <p className="lock-title">🔒 Premium Locked</p>
            <p className="small">
              You need Premium to access this section.
            </p>
            <button className="btn premium" onClick={activatePremiumDemo}>
              Unlock Premium (Demo)
            </button>
          </div>
        ) : (
          <div className="box">
            <p>💎 Premium Questions / Premium Subjects</p>
            <p className="small">Now you can show your paid content here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
