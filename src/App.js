// App.js
import { useEffect, useMemo, useState } from "react";
import Quiz from "./Quiz";
import Landing from "./Landing";
import SubjectSelect from "./SubjectSelect";
import { allQuestions } from "./questions";
import { supabase } from "./supabaseClient";
import ReportButtons from "./ReportButtons";

export default function App() {

 useEffect(() => {
  // document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("copy", (e) => e.preventDefault());
  document.addEventListener("cut", (e) => e.preventDefault());
  document.addEventListener("paste", (e) => e.preventDefault());
}, []);

  const [session, setSession] = useState(null);
  const [subject, setSubject] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);

  const subjects = useMemo(() => Object.keys(allQuestions), []);

  // ✅ EDIT PREMIUM SUBJECTS HERE (must match your subject names)
  const premiumSubjects = useMemo(
    () => ["GST 102", "MTH 101", "GST 111", "GST 112", "ENT 201", "ENT 211", "GST 222", "POS 216", "PHY 102", "ELS 103",],
    []
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setSubject("");
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!session?.user?.id) return;

      setPremiumLoading(true);

      try {
        const userId = session.user.id;

        // Ensure profile exists
        const { error: upsertErr } = await supabase
          .from("profiles")
          .upsert({ id: userId }, { onConflict: "id" });

        if (upsertErr) throw upsertErr;

        // Read premium flag
        const { data, error } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", userId)
          .single();

        if (error) throw error;

        setIsPremium(!!data?.is_premium);
      } catch (e) {
        console.error("Premium check error:", e);
        setIsPremium(false);
      } finally {
        setPremiumLoading(false);
      }
    };

    run();
  }, [session]);

  const logout = async () => {
    try {
      setPremiumLoading(true);
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setSession(null);
      setSubject("");
      setIsPremium(false);
      setPremiumLoading(false);
    }
  };

  // Called after payment verification succeeds
  const onPremiumSuccess = async (reference) => {
    if (!session?.user?.id) return;

    setPremiumLoading(true);

    try {
      const userId = session.user.id;
      const email = session.user.email || "test@email.com";

      // Save payment record (optional)
      await supabase.from("payments").insert([
        {
          user_id: userId,
          email,
          reference: reference || `${Date.now()}`,
          status: "paid",
        },
      ]);

      // Update premium flag
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, is_premium: true }, { onConflict: "id" });

      if (error) throw error;

      setIsPremium(true);
    } catch (e) {
      console.error("Premium update error:", e);
      alert("Payment verified but premium update failed. Check console.");
    } finally {
      setPremiumLoading(false);
    }
  };

  const startSubject = (picked) => {
    const clean = String(picked || "").trim();

    if (premiumSubjects.includes(clean) && !isPremium) {
      alert(`Unlock Premium to practice: ${clean}`);
      return;
    }

    setSubject(clean);
  };

  if (!session) return <Landing />;

  const studentEmail = session.user.email || "test@email.com";

  if (!subject) {
   return (
  <>
    <SubjectSelect
      subjects={subjects}
      onStart={startSubject}
      onLogout={logout}
      studentEmail={studentEmail}
      isPremium={isPremium}
      premiumLoading={premiumLoading}
      onPremiumSuccess={onPremiumSuccess}
      premiumSubjects={premiumSubjects}
    />

    <ReportButtons />
   </>
  );
  }

  return (
    <Quiz
      selectedSubject={subject}
      student={studentEmail}
      onBack={() => setSubject("")}
    />
  );
}