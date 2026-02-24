// App.js
import { useEffect, useMemo, useState } from "react";
import Quiz from "./Quiz";
import Landing from "./Landing";
import SubjectSelect from "./SubjectSelect";
import { allQuestions } from "./questions";
import { supabase } from "./supabaseClient";

export default function App() {
  const [session, setSession] = useState(null);
  const [subject, setSubject] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);

  const subjects = useMemo(() => Object.keys(allQuestions), []);

  // EDIT THESE TO MATCH YOUR SUBJECT NAMES
  const premiumSubjects = useMemo(() => ["GST 111", "GST 112", "ENT 211"], []);

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

  // Called after Paystack success + backend verification
  const onPremiumSuccess = async (reference) => {
    if (!session?.user?.id) return;

    setPremiumLoading(true);

    try {
      const userId = session.user.id;
      const email = session.user.email || "test@email.com";

      // Save payment record (optional but recommended)
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
      alert("Payment succeeded but premium update failed. Check console.");
    } finally {
      setPremiumLoading(false);
    }
  };

  const startSubject = (picked) => {
    if (premiumSubjects.includes(picked) && !isPremium) {
      alert(`Unlock Premium to practice: ${picked}`);
      return;
    }
    setSubject(picked);
  };

  if (!session) return <Landing />;

  const studentEmail = session.user.email || "test@email.com";

  if (!subject) {
    return (
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