import { useEffect, useMemo, useState } from "react";
import Quiz from "./Quiz";
import Landing from "./Landing";
import SubjectSelect from "./SubjectSelect";
import Results from "./Results";
import { allQuestions } from "./questions";
import { supabase } from "./supabaseClient";
import ReportButtons from "./ReportButtons";

export default function App() {

useEffect(() => {
document.addEventListener("copy", (e) => e.preventDefault());
document.addEventListener("cut", (e) => e.preventDefault());
document.addEventListener("paste", (e) => e.preventDefault());
}, []);

const [session, setSession] = useState(null);
const [subject, setSubject] = useState("");
const [page, setPage] = useState("subjects"); // NEW
const [isPremium, setIsPremium] = useState(false);
const [premiumLoading, setPremiumLoading] = useState(false);

const subjects = useMemo(() => Object.keys(allQuestions), []);

const premiumSubjects = useMemo(
() => [
"GST 102",
"MTH 101",
"GST 111",
"GST 112",
"ENT 201",
"ENT 211",
"GST 222",
"POS 216",
"PHY 102",
"ELS 103",
"PHY 113",
],
[]
);



// AUTH SESSION

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
setPage("subjects");
}
);

return () => {
mounted = false;
authListener.subscription.unsubscribe();
};

}, []);



// CHECK PREMIUM STATUS

useEffect(() => {

const run = async () => {

if (!session?.user?.id) return;

setPremiumLoading(true);

try {

const { data } = await supabase
.from("profiles")
.select("*")
.eq("id", session.user.id)
.single();

if (!data) {
setIsPremium(false);
setPremiumLoading(false);
return;
}

if (data.premium_expires_at) {

const expires = new Date(data.premium_expires_at);

if (expires > new Date()) {
setIsPremium(true);
} else {

setIsPremium(false);

await supabase
.from("profiles")
.update({ is_premium: false })
.eq("id", session.user.id);

}

} else {
setIsPremium(false);
}

} catch (e) {

console.log("Premium check error:", e);
setIsPremium(false);

}

setPremiumLoading(false);

};

run();

}, [session]);



// LOGOUT

const logout = async () => {

await supabase.auth.signOut();

setSession(null);
setSubject("");
setIsPremium(false);
setPage("subjects");

window.location.reload();

};



// FREE TRIAL

const startTrial = async () => {

if (!session?.user?.id) return;

const now = new Date();
const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

await supabase
.from("profiles")
.upsert({
id: session.user.id,
is_premium: true,
trial_started_at: now.toISOString(),
premium_expires_at: expires.toISOString(),
});

setIsPremium(true);

alert("Your 1-day free trial has started!");

};



// PAYMENT SUCCESS

const onPremiumSuccess = async (reference, plan = "weekly") => {

if (!session?.user?.id) return;

const now = new Date();

const expires = new Date(
now.getTime() + (plan === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000
);

await supabase
.from("profiles")
.upsert({
id: session.user.id,
is_premium: true,
premium_expires_at: expires.toISOString(),
});

setIsPremium(true);

};



// START SUBJECT

const startSubject = async (picked) => {

const clean = String(picked || "").trim();

if (premiumSubjects.includes(clean) && !isPremium) {
alert(`Unlock Premium to practice: ${clean}`);
return;
}

setSubject(clean);

// SAVE ANALYTICS

await supabase.from("student_activity").insert({
user_email: session.user.email,
subject: clean,
current_question: 0,
total_questions: allQuestions[clean]?.length || 0
});

};



if (!session) return <Landing />;

const studentEmail = session.user.email || "test@email.com";



// SHOW RESULTS PAGE

if (page === "results") {

return (
<Results
studentEmail={studentEmail}
onBack={() => setPage("subjects")}
/>
);

}



// SUBJECT PAGE

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
startTrial={startTrial}
onViewResults={() => setPage("results")} // NEW
/>

<ReportButtons />

</>

);

}



// QUIZ PAGE

return (

<Quiz
selectedSubject={subject}
student={studentEmail}
onBack={() => setSubject("")}
/>

);

} 