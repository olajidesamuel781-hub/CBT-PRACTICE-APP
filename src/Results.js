// Results.js
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Landing.css"; // reuse your styling

export default function Results({ studentEmail, onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("quiz_results")
          .select("id, subject, score, total_questions, created_at")
          .eq("user_email", studentEmail)
          .order("created_at", { ascending: false })
          .limit(200);

        if (error) throw error;
        setRows(data || []);
      } catch (e) {
        console.error("Load results error:", e);
        alert("Could not load results. Check console.");
      } finally {
        setLoading(false);
      }
    };

    if (studentEmail) load();
  }, [studentEmail]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ textAlign: "center", marginBottom: 6 }}>Your Results</h2>
        <p style={{ textAlign: "center", marginTop: 0, opacity: 0.8 }}>
          {studentEmail}
        </p>

        <button className="primary-btn" onClick={onBack} style={{ marginTop: 10 }}>
          Back to Subjects
        </button>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: 14 }}>Loading...</p>
        ) : rows.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 14 }}>
            No results yet. Finish one quiz and come back here.
          </p>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>{r.subject}</b>
                  <b>
                    {r.score} / {r.total_questions}
                  </b>
                </div>
                <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}