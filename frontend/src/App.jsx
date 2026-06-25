import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("explain");
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0); 
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const speak = (t) => {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(t);
    ut.lang = 'hi-IN'; ut.rate = 0.9;
    window.speechSynthesis.speak(ut);
  };

  const handleAction = async (type, val) => {
    if (!val && type === 'text') return;
    setLoading(true); setShowAnswer(false); setQuizIndex(0); 
    try {
      const url = `https://ai-teaching-assistant-1snv.onrender.com/process-${type === 'audio' ? 'audio' : 'text'}${type === 'audio' ? '?mode=' + mode : ''}`;
      let res;
      if (type === 'audio') {
        const fd = new FormData(); fd.append('file', val);
        res = await axios.post(url, fd);
      } else {
        res = await axios.post(url, { text: val, mode });
      }
      
      const data = res.data;
      if (data.mode === "quiz") {
        // Robust Parsing: अगर SEP न हो तो भी क्रैश न हो
        const qList = data.content.split("[SEP]").map(q => q.trim()).filter(q => q.length > 5);
        data.questions = qList.length > 0 ? qList : [data.content];
        
        const aList = data.answer.split("[SEP]").map(a => a.trim()).filter(a => a.length > 0);
        data.answers = aList.length > 0 ? aList : [data.answer || "Answer not generated"];
      }
      setResult(data);
      speak(data.mode === "quiz" ? data.questions[0] : data.content);
    } catch (e) { 
      console.error(e);
      alert("AI Processing failed! Please try again."); 
    }
    setLoading(false); setInputText("");
  };

  const startRec = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(s); audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, {type:'audio/wav'});
        handleAction('audio', blob);
        s.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start(); setIsRecording(true);
    } catch (err) { alert("Mic Access Denied!"); }
  };

  return (
    <div style={styles.dashboard}>
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}><h1 style={styles.logo}>शिक्षा सहायक 🎓</h1></div>
        <div style={styles.modeToggle}>
            <button onClick={()=>setMode("explain")} style={mode === "explain" ? styles.activeMode : styles.inactiveMode}>📖 Teaching Mode</button>
            <button onClick={()=>setMode("quiz")} style={mode === "quiz" ? styles.activeMode : styles.inactiveMode}>⚡ Quiz Mode</button>
        </div>
      </aside>

      <main style={styles.content}>
        <header style={styles.header}>
            <div style={styles.badge}>{mode.toUpperCase()} MODE</div>
            <h1 style={styles.title}>AI Classroom <span style={{color: '#0369a1'}}>Assistant</span></h1>
        </header>

        <div style={styles.mainCard}>
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
             <button onClick={() => isRecording ? mediaRecorder.current.stop() + setIsRecording(false) : startRec()} 
                     style={isRecording ? styles.stopBtn : styles.micBtn}>
               {isRecording ? "🛑" : "🎙️"}
             </button>
          </div>
          <div style={styles.searchRow}>
             <input value={inputText} onChange={(e)=>setInputText(e.target.value)} placeholder="Type a concept..." style={styles.input} onKeyPress={(e)=>e.key==='Enter' && handleAction('text', inputText)} />
             <button onClick={()=>handleAction('text', inputText)} style={styles.sendBtn}>Go</button>
          </div>
        </div>

        {loading && <h2 style={styles.loader}>🧠 AI is working... ✨</h2>}

        {result && !loading && (
          <div style={styles.resultGrid}>
            <div style={styles.resCard}><img src={result.image || `https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000`} style={styles.img} alt="Visual" /></div>

            <div style={mode === "quiz" ? styles.quizCard : styles.resCard}>
              <div style={styles.resType}>{mode === "quiz" ? `Question ${quizIndex + 1} of ${result.questions?.length || 1}` : "Detailed Lesson"}</div>
              
              <h2 style={styles.explanationText}>
                {mode === "quiz" ? (result.questions ? result.questions[quizIndex] : result.content) : result.content}
              </h2>

              {mode === "quiz" && (
                <div style={{marginTop: '30px'}}>
                    {/* Answer Display */}
                    {showAnswer && (
                        <div style={styles.answerBox}>
                            ✅ {result.answers ? result.answers[quizIndex] : "Loading answer..."}
                        </div>
                    )}

                    {/* Controls Row */}
                    <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                        {!showAnswer && (
                            <button onClick={()=>{
                                setShowAnswer(true); 
                                speak(result.answers ? result.answers[quizIndex] : "The answer is on screen");
                            }} style={styles.ansBtn}>Show Answer 🔑</button>
                        )}
                        
                        {result.questions && quizIndex < result.questions.length - 1 && (
                            <button onClick={() => {
                                const nextIdx = quizIndex + 1;
                                setQuizIndex(nextIdx);
                                setShowAnswer(false);
                                speak(result.questions[nextIdx]);
                            }} style={styles.nextBtn}>Next Question ➡️</button>
                        )}
                    </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  dashboard: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', display: 'flex', fontFamily: 'sans-serif' },
  sidebar: { width: '280px', padding: '40px 20px', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderRight: '1px solid #e2e8f0' },
  logoBox: { marginBottom: '40px' },
  logo: { fontSize: '1.8rem', fontWeight: 'bold', color: '#0369a1', margin: 0 },
  modeToggle: { display: 'flex', flexDirection: 'column', gap: '12px' },
  activeMode: { padding: '15px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  inactiveMode: { padding: '15px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '15px', border: 'none', cursor: 'pointer' },
  content: { flex: 1, padding: '50px 80px', overflowY: 'auto' },
  header: { marginBottom: '30px' },
  badge: { backgroundColor: '#bae6fd', color: '#0369a1', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '800', display: 'inline-block' },
  title: { fontSize: '3.5rem', fontWeight: '800', color: '#1e293b' },
  mainCard: { backgroundColor: 'white', padding: '50px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', marginBottom: '50px' },
  micBtn: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '2.5rem', cursor: 'pointer' },
  stopBtn: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '2.5rem', cursor: 'pointer' },
  searchRow: { display: 'flex', gap: '15px', marginTop: '30px' },
  input: { flex: 1, padding: '20px 30px', borderRadius: '50px', border: '1px solid #e2e8f0', fontSize: '1.2rem' },
  sendBtn: { backgroundColor: '#6366f1', color: 'white', padding: '0 40px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' },
  resCard: { backgroundColor: 'white', padding: '45px', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' },
  quizCard: { backgroundColor: '#fffbeb', padding: '45px', borderRadius: '40px', border: '3px dashed #fbbf24' },
  img: { width: '100%', borderRadius: '25px', height: '450px', objectFit: 'cover' },
  explanationText: { fontSize: '2rem', lineHeight: '1.5', color: '#0f172a', margin: 0, whiteSpace: 'pre-wrap' },
  ansBtn: { padding: '15px 30px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },
  nextBtn: { padding: '15px 30px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },
  answerBox: { padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '20px', fontSize: '1.4rem', color: '#166534', fontWeight: 'bold', marginBottom: '15px', whiteSpace: 'pre-wrap' },
  loader: { textAlign: 'center', fontSize: '1.5rem', color: '#0ea5e9', fontWeight: 'bold' },
  resType: { backgroundColor: '#f0fdf4', color: '#166534', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', display: 'inline-block', marginBottom: '20px' }
};

export default App;