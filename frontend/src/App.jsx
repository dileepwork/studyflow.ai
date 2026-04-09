// StudyFlow AI - Final Deployment v1.0.3
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, BookOpen, Clock, Calendar, CheckCircle2,
  TrendingUp, Layers, ChevronRight, Download, BrainCircuit,
  Sun, Moon, ShieldCheck, Zap, Sparkles, LogIn, ArrowRight,
  UserPlus, Github, Mail
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const SOUNDS = {
  success: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7314757398.mp3', // Refreshing chime
  click: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a14c44.mp3',  // Soft pop
  analyze: 'https://cdn.pixabay.com/audio/2021/08/09/audio_8245842817.mp3' // Ambient swell
};

const ChatAssistant = ({ topic }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm your AI Study Assistant. Do you have any specific doubts about "${topic}"?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    try {
      const resp = await axios.post('/api/chat', {
        topic: topic,
        message: input
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resp.data.response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a bit of trouble connecting to my knowledge base. Please check if the backend is running!"
      }]);
    }
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--accent)', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><BrainCircuit size={18} color="var(--accent)" /> Doubt Solver</h4>
      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? 'var(--primary)' : 'rgba(128,128,128,0.1)', color: 'var(--text-main)', padding: '0.5rem 0.8rem', borderRadius: '10px', maxWidth: '80%' }}>
            {m.content}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a doubt..."
          className="glass"
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ask</button>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('home'); // home, dashboard
  const [user, setUser] = useState({ name: 'Student' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [config, setConfig] = useState({
    weeks: 4,
    hours: 10,
    level: 'Beginner'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    playSound('click');
  };

  const playSound = (type) => {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.2;
    audio.play().catch(e => console.log("Sound blocked by browser"));
  };

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    playSound('click');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    playSound('analyze');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('weeks', config.weeks);
    formData.append('hours', config.hours);
    formData.append('level', config.level);

    try {
      const resp = await axios.post('/api/analyze', formData);
      setResult(resp.data);
      playSound('success');
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setView('home');
  };

  const getDifficultyColor = (score) => {
    if (score === 1) return '#4ade80';
    if (score === 2) return '#facc15';
    return '#f87171';
  };

  const difficultyData = result ? [
    { name: 'Easy', value: Object.values(result.topic_details).filter(v => v.difficulty === 1).length },
    { name: 'Medium', value: Object.values(result.topic_details).filter(v => v.difficulty === 2).length },
    { name: 'Hard', value: Object.values(result.topic_details).filter(v => v.difficulty === 3).length },
  ] : [];

  const LandingPage = () => (
    <div className="container" style={{ padding: 0 }}>
      <section className="hero">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <BrainCircuit size={64} style={{ color: 'var(--primary)' }} />
            <h1 style={{ background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>StudyFlow AI</h1>
          </div>
          <h1>Conquer Your Syllabus, Effortlessly.</h1>
          <p>Stop drowning in messy PDFs. Our AI decomposes your entire curriculum into a strategic, adaptive roadmap designed exactly for your proficiency.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => setView('dashboard')} style={{ fontSize: '1.2rem', padding: '1.2rem 3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              Get Started <ArrowRight size={24} />
            </button>
          </div>
        </motion.div>
      </section>

      <section className="workflow-section">
        <h2 className="section-title">How It Works</h2>
        <div className="grid">
          {[
            { icon: <Upload size={32} />, title: 'Drop Your Files', desc: 'Upload your syllabus as PDF or Text. AI starts mapping your curriculum immediately.' },
            { icon: <Zap size={32} />, title: 'AI Decomposition', desc: 'Our NLP engine breaks down complex topics and detects hidden prerequisites.' },
            { icon: <Sparkles size={32} />, title: 'Adaptive Strategy', desc: "Pick your level—Topper or Beginner—and get a plan that fits your speed." },
            { icon: <ShieldCheck size={32} />, title: 'Goal Execution', desc: 'Follow your interactive roadmap with real-time AI Mentor coaching.' }
          ].map((step, i) => (
            <motion.div key={i} className="glass workflow-step" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="step-icon-wrapper">{step.icon}</div>
              <h3 style={{ marginBottom: '1rem' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="main-wrapper">
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle Appearance">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {view === 'home' && <LandingPage />}

      {view === 'dashboard' && (
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <BrainCircuit size={48} color="var(--primary)" />
                <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  StudyFlow AI
                </h1>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', letterSpacing: '1px' }}>
                YOUR PERSONAL AI ACADEMIC MENTOR
              </p>
            </motion.div>
          </header>

          {!result ? (
            <motion.div className="glass card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Ready to Flow, {user?.name}? 🚀</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload your syllabus and let's craft an effective roadmap specialized for your level.</p>
              </div>

              <div {...getRootProps()} style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '1.5rem',
                padding: '4rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <input {...getInputProps()} />
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Upload size={32} color="var(--primary)" />
                </div>
                {file ? (
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{file.name}</p>
                ) : (
                  <div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isDragActive ? "Release to drop" : "Drop your syllabus here"}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports PDF and TXT files</p>
                  </div>
                )}
              </div>

              <div className="grid" style={{ marginTop: '2.5rem' }}>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><Clock size={16} /> Strategy Duration (Weeks)</label>
                  <input type="number" value={config.weeks} onChange={e => setConfig({ ...config, weeks: e.target.value })} className="glass" style={{ width: '100%', padding: '0.75rem' }} />
                </div>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><Calendar size={16} /> Daily Study (Hours)</label>
                  <input type="number" value={config.hours} onChange={e => setConfig({ ...config, hours: e.target.value })} className="glass" style={{ width: '100%', padding: '0.75rem' }} />
                </div>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><TrendingUp size={16} /> Current Proficiency</label>
                  <select value={config.level} onChange={e => setConfig({ ...config, level: e.target.value })} className="glass" style={{ width: '100%', padding: '0.75rem' }}>
                    <option value="Beginner">Below Average / Beginner</option>
                    <option value="Intermediate">Average / Intermediate</option>
                    <option value="Advanced">Topper / Advanced</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: '3rem', height: '3.5rem', fontSize: '1.1rem' }} onClick={handleAnalyze} disabled={!file || loading}>
                {loading ? "Mentor is analyzing..." : "Get My Strategic Roadmap"}
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

              <motion.div className="glass card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '1rem' }}><BrainCircuit size={32} color="white" /></div>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>Mentor's Strategy Summary</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{result.mentor_summary}</p>
                  </div>
                </div>
              </motion.div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                <motion.div className="glass card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Layers color="var(--primary)" />
                    <h3>Complexity Breakdown</h3>
                  </div>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                          {difficultyData.map((entry, index) => <Cell key={`cell-${index}`} fill={getDifficultyColor(index + 1)} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--card-bg)', border: 'none', borderRadius: '8px', color: 'var(--text-main)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    {['Easy', 'Medium', 'Hard'].map((label, i) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getDifficultyColor(i + 1) }}></div>
                        {label}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="glass card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <BookOpen color="var(--primary)" />
                    <h3>Study Roadmap</h3>
                  </div>
                  <motion.div
                    className="roadmap-container"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.08 } }
                    }}
                    style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}
                  >
                    {result.topics.map((topic, i) => (
                      <motion.div
                        key={i}
                        className="roadmap-item-container"
                        variants={{
                          hidden: { opacity: 0, x: -30 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <div className="roadmap-dot" />
                        <motion.div
                          className="roadmap-card"
                          whileHover={{ scale: 1.02, x: 10 }}
                          onClick={() => { setSelectedTopic(topic); playSound('click'); }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '35px', height: '35px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0, color: 'white' }}>
                            {i + 1}
                          </div>
                          <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600 }}>{topic}</span>
                          <span className={`badge badge-${result.topic_details[topic].difficulty === 1 ? 'easy' : result.topic_details[topic].difficulty === 2 ? 'medium' : 'hard'}`}>
                            {result.topic_details[topic].difficulty === 1 ? 'Focus' : result.topic_details[topic].difficulty === 2 ? 'Moderate' : 'Elite'}
                          </span>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              <motion.div className="glass card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                  <Calendar color="var(--primary)" />
                  <h3>Personalized Weekly Goals</h3>
                </div>
                <motion.div
                  className="grid"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {result.schedule.map((week, idx) => (
                    <motion.div
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, scale: 0.9, y: 20 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                      }}
                      whileHover={{ translateY: -5 }}
                      style={{ padding: '2rem', borderRadius: '2rem', background: 'var(--badge-bg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>Week {week.week}</h4>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {week.topics.length} TOPICS
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {week.topics.map((t, ti) => (
                          <motion.div
                            key={ti}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + (ti * 0.1) }}
                            style={{ fontSize: '0.9rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.5rem', borderRadius: '8px', cursor: 'help' }}
                            title={result.topic_details[t].advice}
                          >
                            <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontWeight: 500 }}>{t}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {selectedTopic && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setSelectedTopic(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                      className="glass"
                      style={{ maxWidth: '1000px', width: '95%', padding: '2rem', borderRadius: '2rem', border: '1px solid var(--primary)', maxHeight: '90vh', overflowY: 'auto' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        <div className="modal-left-col">
                          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.8rem', lineHeight: '1.2' }}>{selectedTopic}</h2>

                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '1rem' }}><BrainCircuit size={18} color="var(--primary)" /> Mentor's Advice</h4>
                            <p style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1.2rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)', fontStyle: 'italic', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                              "{result.topic_details[selectedTopic].advice}"
                            </p>
                          </div>

                          <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}><Download size={18} color="#ec4899" /> Study Resources</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                              {result.topic_details[selectedTopic].resources.map((res, ri) => (
                                <a key={ri} href={res.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--badge-bg)', borderRadius: '0.8rem', transition: 'all 0.3s', fontSize: '0.85rem' }}
                                  onMouseOver={e => e.currentTarget.style.background = 'rgba(128,128,128,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'var(--badge-bg)'}>
                                  <span style={{ fontWeight: 500 }}>{res.name}</span>
                                  <ChevronRight size={16} />
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="modal-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <ChatAssistant topic={selectedTopic} />
                          <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => setSelectedTopic(null)}>Close Mentor's View</button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="btn-primary" onClick={() => setResult(null)} style={{ alignSelf: 'center', padding: '1rem 3rem' }}>Reset & Analyze New</button>
            </div>
          )}

          <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', paddingBottom: '3rem' }}>
            <p>Built for students, by a student - <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>DILEEP</span>. StudyFlow AI © 2026</p>
            <p style={{ marginTop: '0.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary)', fontSize: '0.75rem' }}>A PRODUCT FROM 6IXMINDSLABS</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', opacity: 0.6 }}>
              <span>Smart Extraction</span> • <span>NLP Logic</span> • <span>Graph Theory</span>
            </div>
            <button className="btn-primary" onClick={handleReset} style={{ marginTop: '2rem', padding: '0.5rem 1rem', fontSize: '0.8rem', opacity: 0.5 }}>Back to Home</button>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
