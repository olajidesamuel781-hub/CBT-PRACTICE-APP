import { useEffect, useState, useCallback } from "react";
import "./Quiz.css";
import { allQuestions } from "./questions";
import { supabase } from "./supabaseClient";

export default function Quiz({ selectedSubject, student, onBack }) {

const [quizStarted, setQuizStarted] = useState(false);
const [quizTime, setQuizTime] = useState(null);
const [numQuestions, setNumQuestions] = useState(0);

const [questions, setQuestions] = useState([]);
const [current, setCurrent] = useState(0);
const [answers, setAnswers] = useState([]);
const [finished, setFinished] = useState(false);
const [timeLeft, setTimeLeft] = useState(0);
const [showNav, setShowNav] = useState(false);
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);


const buildQuiz = useCallback(() => {

const picked = shuffleArray(allQuestions[selectedSubject]).slice(0, numQuestions);

const final = picked.map((q) => ({
...q,
options: shuffleArray(q.options).slice(0, 4),
}));

setQuestions(final);
setAnswers(Array(numQuestions).fill(null));
setCurrent(0);
setFinished(false);
setTimeLeft(quizTime);

}, [selectedSubject, numQuestions, quizTime]);


const restartQuiz = () => {

setQuizStarted(false);
setQuizTime(null);
setNumQuestions(0);
setQuestions([]);
setCurrent(0);
setAnswers([]);
setFinished(false);
setTimeLeft(0);

};


const quitQuiz = () => {

const ok = window.confirm("Quit now? Your result will be submitted.");
if (ok) setFinished(true);

};



// BUILD QUIZ
useEffect(() => {

if (selectedSubject && quizTime && numQuestions > 0) {
buildQuiz();
}

}, [buildQuiz, selectedSubject, quizTime, numQuestions]);



// TIMER
useEffect(() => {

if (!quizStarted || finished || questions.length === 0) return;

if (timeLeft <= 0) {
setFinished(true);
return;
}

const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);

return () => clearTimeout(t);

}, [quizStarted, finished, questions.length, timeLeft]);




// SAVE STUDENT ACTIVITY
useEffect(() => {

const saveActivity = async () => {

if (!student || !selectedSubject) return;

await supabase.from("student_activity").upsert([
{
user_email: student,
subject: selectedSubject,
current_question: current + 1,
total_questions: numQuestions,
},
]);

};

saveActivity();

}, [current, student, selectedSubject, numQuestions]);



const score = answers.filter((a, i) => a === questions[i]?.answer).length;
useEffect(() => {

const saveResult = async () => {

if (!finished) return;

await supabase.from("quiz_results").insert([
{
user_email: student,
subject: selectedSubject,
score: score,
total_questions: numQuestions
}
]);

};

saveResult();

}, [finished, score, numQuestions, selectedSubject, student]);


// SCREEN 1
if (!quizStarted) {

return (

<div className="quiz-container">

<button onClick={onBack}>Back to Subjects</button>

<h2>CBT PRACTICE APP</h2>

<p>
Student: <b>{student || "Student"}</b>
</p>

<p>
Subject: <b>{selectedSubject}</b>
</p>

<button onClick={() => setQuizStarted(true)}>
Start Quiz
</button>

</div>

);

}



// SCREEN 2
if (!quizTime) {

const timeOptions = [

{ label: "10 minutes", seconds: 600 },
{ label: "20 minutes", seconds: 1200 },
{ label: "30 minutes", seconds: 1800 },
{ label: "1 hour", seconds: 3600 },

];

return (

<div className="quiz-container">

<button onClick={onBack}>Back to Subjects</button>

<h3>Select Quiz Time</h3>

{timeOptions.map((t) => (

<button key={t.seconds} onClick={() => setQuizTime(t.seconds)}>
{t.label}
</button>

))}

</div>

);

}



// SCREEN 3
if (numQuestions === 0) {

const numberOptions = [20, 50, 100, 200];

return (

<div className="quiz-container">

<button onClick={onBack}>Back to Subjects</button>

<h3>Select Number of Questions</h3>

{numberOptions.map((n) => (

<button key={n} onClick={() => setNumQuestions(n)}>
{n}
</button>

))}

</div>

);

}


if (questions.length === 0) return <p>Loading...</p>;



// MAIN QUIZ
return (

<div className="quiz-container">

<div className="top-buttons">

<button onClick={onBack}>Back to Subjects</button>

<button className="quit-btn" onClick={quitQuiz}>
Quit
</button>

</div>


<p>
Student: <b>{student || "Student"}</b> | Subject: <b>{selectedSubject}</b>
</p>


<div className="timer-bar-container">

<div
className="timer-bar"
style={{
width: `${(timeLeft / quizTime) * 100}%`,
backgroundColor:
timeLeft / quizTime > 0.5
? "#2ecc71"
: timeLeft / quizTime > 0.2
? "#f1c40f"
: "#e74c3c",
}}
></div>

</div>


<p>
Time Left: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
</p>



{finished ? (

<>

<h3>
Your Score: {score} / {questions.length}
</h3>


{questions.map((q, i) => {

const ok = answers[i] === q.answer;

return (

<div key={i} className="review-question">

<p>
<strong>Q{i + 1}:</strong> {q.question}
</p>

<p className={ok ? "correct" : "incorrect"}>
Your Answer: {answers[i] || "None"} {ok ? "✓" : "✗"}
</p>

{!ok && <p>Correct: {q.answer}</p>}

</div>

);

})}



<div className="finished-buttons">

<button onClick={restartQuiz}>
Restart Quiz
</button>

<button onClick={onBack}>
Back to Subjects
</button>

</div>

</>

) : (

<>
<button
onClick={() => setShowNav(!showNav)}
style={{
marginBottom: "12px",
padding: "8px 12px",
background: "#444",
color: "white",
border: "none",
borderRadius: "6px",
cursor: "pointer"
}}
>
☰ Question Navigator
</button>

{showNav && (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(5, 1fr)",
gap: "8px",
marginBottom: "15px"
}}
>
{questions.map((_, index) => (
<button
key={index}
onClick={() => setCurrent(index)}
style={{
padding: "10px",
background:
current === index
? "#facc15"
: answers[index] !== null
? "#22c55e"
: "#333",
color: "white",
border: "none",
borderRadius: "6px",
cursor: "pointer"
}}
>
{index + 1}
</button>
))}
</div>
)}
<h3>
Q{current + 1}: {questions[current].question}
</h3>


{questions[current].options.map((o, i) => (

<button
key={i}
className={answers[current] === o ? "selected-option" : ""}
onClick={() => {

const copy = [...answers];
copy[current] = o;
setAnswers(copy);

}}
>

{["A", "B", "C", "D"][i]}. {o}

</button>

))}



<div className="nav-buttons">

<button
disabled={current === 0}
onClick={() => setCurrent((c) => c - 1)}
>
Previous
</button>


<button
onClick={() =>
current + 1 < questions.length
? setCurrent((c) => c + 1)
: setFinished(true)
}
>

{current + 1 === questions.length ? "Finish" : "Next"}

</button>

</div>

</>

)}

</div>

);

}