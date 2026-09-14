import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowUpRight, BarChart3, BookOpen, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Code2, Database, Download, FastForward, Flame, GraduationCap, LayoutDashboard, ListChecks, Lock, LogIn, LogOut, Mail, Pause, Play, RotateCcw, Settings2, ShieldCheck, SkipBack, SkipForward, Sparkles, Terminal, Trophy, UserRound, Users, X, Zap } from 'lucide-react'
import './styles.css'
import { traceCode } from './trace'
import { tracks } from './courses'

const example = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(4)
print(result)`

const goExample = `package main

import "fmt"

func main() {
	values := []int{1, 2, 3}
	for _, value := range values {
		fmt.Println(value)
	}
}`

const snapshots = [
  { line: 1, label: 'def fibonacci(n):', values: [{ name: 'n', value: '4', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global'] },
  { line: 6, label: 'result = fibonacci(4)', values: [{ name: 'n', value: '4', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global'] },
  { line: 1, label: 'def fibonacci(n):', values: [{ name: 'n', value: '4', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci'] },
  { line: 2, label: 'if n <= 1:', values: [{ name: 'n', value: '4', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci'] },
  { line: 4, label: 'return fibonacci(n - 1) + ...', values: [{ name: 'n', value: '4', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci'] },
  { line: 1, label: 'def fibonacci(n):', values: [{ name: 'n', value: '3', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci'] },
  { line: 2, label: 'if n <= 1:', values: [{ name: 'n', value: '3', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci'] },
  { line: 4, label: 'return fibonacci(n - 1) + ...', values: [{ name: 'n', value: '3', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci'] },
  { line: 1, label: 'def fibonacci(n):', values: [{ name: 'n', value: '2', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci', 'fibonacci'] },
  { line: 2, label: 'if n <= 1:', values: [{ name: 'n', value: '2', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci', 'fibonacci'] },
  { line: 4, label: 'return fibonacci(n - 1) + ...', values: [{ name: 'n', value: '2', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci', 'fibonacci'] },
  { line: 1, label: 'def fibonacci(n):', values: [{ name: 'n', value: '1', type: 'int' }, { name: 'result', value: '—', type: 'not defined' }], stack: ['global', 'fibonacci', 'fibonacci', 'fibonacci', 'fibonacci'] },
]

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

const ANALYTICS_KEY = 'focus-analytics'

function canAccessAdmin(account) {
  return account?.role === 'admin'
}

function readAnalytics() {
  const events = readStorage(ANALYTICS_KEY, [])
  return Array.isArray(events) ? events : []
}

function recordAnalytics(event) {
  const events = readAnalytics().slice(-499)
  const next = [...events, { ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date().toISOString() }]
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('focus-analytics-updated', { detail: next }))
}

function eventDate(event) {
  const date = new Date(event.timestamp)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function csvSafe(value) {
  const text = String(value ?? '')
  return /^[=+\-@]/.test(text) ? `'${text}` : text
}

function AdminDashboard({ onOpenVisualizer, user, progress }) {
  const [range, setRange] = useState('This week')
  const [events, setEvents] = useState(() => readAnalytics())
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const ranges = ['Today', 'This week', 'Last 30 days']
  useEffect(() => {
    const refresh = (event) => { setEvents(Array.isArray(event.detail) ? event.detail : readAnalytics()); setLastUpdated(new Date()) }
    const onStorage = (event) => { if (event.key === ANALYTICS_KEY) refresh({ detail: readAnalytics() }) }
    const poll = window.setInterval(() => refresh({ detail: readAnalytics() }), 5000)
    window.addEventListener('focus-analytics-updated', refresh)
    window.addEventListener('storage', onStorage)
    return () => { window.clearInterval(poll); window.removeEventListener('focus-analytics-updated', refresh); window.removeEventListener('storage', onStorage) }
  }, [])
  const now = Date.now()
  const rangeMs = range === 'Today' ? 86400000 : range === 'This week' ? 7 * 86400000 : 30 * 86400000
  const filtered = events.filter((event) => now - eventDate(event).getTime() < rangeMs)
  const learners = new Map()
  filtered.forEach((event) => learners.set(event.email || event.name || 'Learner', event))
  const activeLearners = [...learners.values()].filter((event) => now - eventDate(event).getTime() < 15 * 60000).length
  const totalSteps = filtered.reduce((total, event) => total + (event.steps || 0), 0)
  const averageCompletion = filtered.length ? Math.round(filtered.reduce((total, event) => total + (event.completion || 0), 0) / filtered.length) : 0
  const chartDays = Array.from({ length: 12 }, (_, index) => {
    const day = new Date(now - (11 - index) * 86400000)
    const key = day.toISOString().slice(0, 10)
    return { label: day.toLocaleDateString(undefined, { weekday: 'narrow' }), value: events.filter((event) => eventDate(event).toISOString().slice(0, 10) === key).length }
  })
  const chartMax = Math.max(...chartDays.map((day) => day.value), 1)
  const recent = [...filtered].sort((a, b) => eventDate(b) - eventDate(a)).slice(0, 5)
  const cycleRange = () => setRange((current) => ranges[(ranges.indexOf(current) + 1) % ranges.length])
  const formatTime = (date) => date.getTime() ? date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No activity yet'
  const displayLearners = recent.length ? recent : [{ name: user?.name || 'No learners yet', email: user?.email, title: 'No visualizations recorded', completion: progress.challenges * 2.5, timestamp: null, steps: 0 }]
  const exportCsv = () => {
    const header = ['Learner', 'Email', 'Session', 'Timestamp', 'Steps', 'Completion', 'Error']
    const rows = filtered.map((event) => [event.name || '', event.email || '', event.title || '', event.timestamp || '', event.steps || 0, `${Math.round(event.completion || 0)}%`, event.error || ''])
    const csv = [header, ...rows].map((row) => row.map((value) => `"${csvSafe(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = `focus-activity-${range.toLowerCase().replaceAll(' ', '-')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return <section className="dashboard-shell">
    <div className="dashboard-heading"><div><p className="eyebrow">LIVE SYSTEM OVERVIEW</p><h1>Keep Focus flowing.</h1><p className="subtitle">This dashboard is connected to recorded visualizer activity on this device.</p><span className="live-status"><i></i> Live · updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div className="dashboard-actions"><button className="range-select" onClick={cycleRange}>{range}<ChevronDown size={15} /></button><button className="text-action export-action" onClick={exportCsv} disabled={!filtered.length}><Download size={14} /> Export CSV</button><button className="run-button" onClick={onOpenVisualizer}><Play size={15} fill="currentColor" /> New visualization</button></div></div>
    <div className="stats-grid">{[{ label: 'Active learners', value: activeLearners.toLocaleString(), change: `${learners.size} in range`, icon: Users }, { label: 'Visualizations run', value: filtered.length.toLocaleString(), change: `${totalSteps.toLocaleString()} steps`, icon: Activity }, { label: 'Avg. completion', value: `${averageCompletion}%`, change: filtered.length ? 'From live sessions' : 'Waiting for activity', icon: BarChart3 }].map(({ label, value, change, icon: Icon }) => <div className="stat-card" key={label}><div className="stat-icon"><Icon size={17} /></div><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-change">{change}</span></div>)}</div>
    <div className="dashboard-grid admin-grid"><div className="dash-card chart-card"><div className="dash-card-heading"><div><span className="card-kicker">ENGAGEMENT · LIVE</span><h2>Learning activity</h2></div><Activity size={18} /></div><div className="chart"><div className="chart-y"><span>{chartMax}</span><span>{Math.round(chartMax / 2)}</span><span>0</span></div><div className="chart-bars">{chartDays.map((day, index) => <div className="chart-column" key={`${day.label}-${index}`}><div style={{ height: `${Math.max(day.value ? 8 : 0, day.value / chartMax * 100)}%` }}></div><span>{day.label}</span></div>)}</div></div></div><div className="dash-card"><div className="dash-card-heading"><div><span className="card-kicker">HEALTH</span><h2>System pulse</h2></div><span className="healthy-pill"><span></span> Live</span></div><div className="health-row"><Database size={18} /><div><strong>Trace activity</strong><span>{events.length ? 'Receiving local events' : 'No events received yet'}</span></div><b>{events.length}</b></div><div className="health-row"><ShieldCheck size={18} /><div><strong>Last update</strong><span>{events.length ? formatTime(eventDate(events.at(-1))) : 'Waiting for first run'}</span></div><b>NOW</b></div><button className="text-action" onClick={() => { setEvents(readAnalytics()); setLastUpdated(new Date()) }}>Refresh live data <RotateCcw size={14} /></button></div><div className="dash-card wide-card"><div className="dash-card-heading"><div><span className="card-kicker">RECENT LEARNERS · LIVE</span><h2>Latest activity</h2></div><span className="card-kicker">{filtered.length} events</span></div><div className="learner-table"><div className="table-head"><span>LEARNER</span><span>LAST SESSION</span><span>PROGRESS</span><span>STATUS</span></div>{displayLearners.map((event, index) => { const name = event.name || event.email || 'Learner'; const completion = Math.round(event.completion || 0); const online = event.timestamp && now - eventDate(event).getTime() < 15 * 60000; return <div className="table-row" key={event.id || `${name}-${index}`}><span className="learner"><i>{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</i>{name}</span><span>{event.title || 'Visualizer session'}<small className="activity-time">{event.timestamp ? formatTime(eventDate(event)) : '—'}</small></span><span><div className="mini-progress"><div style={{ width: `${Math.min(100, completion)}%` }}></div></div>{completion}%</span><span className={online ? 'status-active' : 'status-away'}>{online ? 'Active' : event.timestamp ? 'Away' : 'Waiting'}</span></div> })}</div></div></div>
  </section>
}

function AuthModal({ onClose, onSignIn }) {
  const savedUser = readStorage('focus-user', {})
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState(savedUser.name || '')
  const [email, setEmail] = useState(savedUser.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    if (mode === 'create' && !name.trim()) return setError('Enter your name to create an account.')
    if (mode === 'create' && password !== confirmPassword) return setError('Passwords do not match.')
    try {
      await onSignIn({ name: name.trim(), email: email.trim() }, password, mode === 'create')
    } catch (signInError) {
      setError(signInError.message)
    }
  }
  const isCreating = mode === 'create'
  return <div className="modal-backdrop"><form className="auth-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={onClose}><X size={17} /></button><div className="auth-mark"><Sparkles size={20} /></div><p className="eyebrow">WELCOME TO FOCUS</p><h2>{isCreating ? 'Make your progress count.' : 'Welcome back.'}</h2><p className="auth-copy">{isCreating ? 'Create an account to save your learning journey.' : 'Sign in from any device with the email and password you used for Focus.'}</p><div className="auth-tabs"><button type="button" className={isCreating ? '' : 'active'} onClick={() => { setMode('signin'); setError('') }}>Sign in</button><button type="button" className={isCreating ? 'active' : ''} onClick={() => { setMode('create'); setError('') }}>Create account</button></div>{isCreating && <label>Name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}<label>Email<input autoFocus={!isCreating} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>{isCreating && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" /></label>}{error && <p className="auth-error">{error}</p>}<button type="submit" className="auth-submit"><LogIn size={16} /> {isCreating ? 'Create Focus account' : 'Sign in to Focus'}</button><small>Your password is securely stored by the Focus server.</small></form></div>
}

function Dashboard({ admin, onOpenVisualizer, user, progress }) {
  const [range, setRange] = useState('This week')
  const stats = admin
    ? [{ label: 'Active learners', value: '1,284', change: '+18.4%', icon: Users }, { label: 'Visualizations run', value: '8,492', change: '+24.8%', icon: Activity }, { label: 'Avg. completion', value: '72%', change: '+6.2%', icon: BarChart3 }]
    : [{ label: 'Learning streak', value: `${progress.streak} days`, change: 'Keep it going', icon: Flame }, { label: 'Steps visualized', value: progress.steps.toLocaleString(), change: `${progress.runs} visualizations`, icon: Activity }, { label: 'Challenges solved', value: `${progress.challenges} / 40`, change: `${Math.round(progress.challenges / 40 * 100)}% complete`, icon: ListChecks }]

  if (admin) return <AdminDashboard onOpenVisualizer={onOpenVisualizer} user={user} progress={progress} />

  return <section className="dashboard-shell">
    <div className="dashboard-heading"><div><p className="eyebrow">{admin ? 'SYSTEM OVERVIEW' : 'YOUR LEARNING SPACE'}</p><h1>{admin ? 'Keep Focus flowing.' : `Welcome back, ${user.name.split(' ')[0]}.`}</h1><p className="subtitle">{admin ? 'A quick pulse check on your teaching environment.' : 'You’re building great execution intuition. Keep the streak alive.'}</p></div><div className="dashboard-actions"><button className="range-select">{range}<ChevronDown size={15} /></button><button className="run-button" onClick={onOpenVisualizer}><Play size={15} fill="currentColor" /> New visualization</button></div></div>
    <div className="stats-grid">{stats.map(({ label, value, change, icon: Icon }) => <div className="stat-card" key={label}><div className="stat-icon"><Icon size={17} /></div><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-change">{change}</span></div>)}</div>
    {admin ? <div className="dashboard-grid admin-grid"><div className="dash-card chart-card"><div className="dash-card-heading"><div><span className="card-kicker">ENGAGEMENT</span><h2>Learning activity</h2></div><ArrowUpRight size={18} /></div><div className="chart"><div className="chart-y"><span>2k</span><span>1k</span><span>0</span></div><div className="chart-bars">{[38, 52, 45, 67, 58, 74, 91, 63, 78, 69, 86, 97].map((height, index) => <div className="chart-column" key={index}><div style={{ height: `${height}%` }}></div><span>{['M', '', 'W', '', 'F', '', 'S', '', 'M', '', 'W', ''][index]}</span></div>)}</div></div></div><div className="dash-card"><div className="dash-card-heading"><div><span className="card-kicker">HEALTH</span><h2>System pulse</h2></div><span className="healthy-pill"><span></span> Healthy</span></div><div className="health-row"><Database size={18} /><div><strong>Trace engine</strong><span>All systems operational</span></div><b>99.98%</b></div><div className="health-row"><ShieldCheck size={18} /><div><strong>Sandbox queue</strong><span>12 jobs processing</span></div><b>0.4s</b></div><button className="text-action">View system details <ArrowUpRight size={14} /></button></div><div className="dash-card wide-card"><div className="dash-card-heading"><div><span className="card-kicker">RECENT LEARNERS</span><h2>Latest activity</h2></div><button className="text-action">View all <ArrowUpRight size={14} /></button></div><div className="learner-table"><div className="table-head"><span>LEARNER</span><span>LAST SESSION</span><span>PROGRESS</span><span>STATUS</span></div>{[['Maya Chen', 'Recursion basics', '82%', 'Active'], ['Theo Adams', 'Go loops', '64%', 'Active'], ['Amara Okafor', 'Call stacks', '91%', 'Away']].map(([name, session, progress, state]) => <div className="table-row" key={name}><span className="learner"><i>{name.split(' ').map((part) => part[0]).join('')}</i>{name}</span><span>{session}</span><span><div className="mini-progress"><div style={{ width: progress }}></div></div>{progress}</span><span className={state === 'Active' ? 'status-active' : 'status-away'}>{state}</span></div>)}</div></div></div>
    : <div className="dashboard-grid"><div className="dash-card continue-card"><div className="dash-card-heading"><div><span className="card-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Recursion, one frame at a time</h2></div><span className="continue-icon"><Zap size={17} fill="currentColor" /></span></div><p>Trace how `fibonacci(5)` grows and returns through the call stack.</p><div className="lesson-progress"><div><span>Progress</span><b>68%</b></div><div className="progress-track"><div style={{ width: '68%' }}></div></div></div><button className="text-action" onClick={onOpenVisualizer}>Continue lesson <ArrowUpRight size={14} /></button></div><div className="dash-card streak-card"><div className="streak-orb"><Flame size={25} fill="currentColor" /></div><span className="card-kicker">CURRENT STREAK</span><strong>12</strong><span>days in a row</span><div className="streak-dots">{[1, 1, 1, 1, 1, 1, 0].map((filled, index) => <i className={filled ? 'filled' : ''} key={index}></i>)}</div><small>2 more days to beat your best</small></div><div className="dash-card wide-card"><div className="dash-card-heading"><div><span className="card-kicker">EXPLORE NEXT</span><h2>Challenges for you</h2></div><button className="text-action">Browse library <ArrowUpRight size={14} /></button></div><div className="challenge-grid">{[['01', 'Loops & changing state', 'Python · Beginner', '8 min'], ['02', 'Inside a function call', 'Python · Intermediate', '12 min'], ['03', 'Goroutines at a glance', 'Go · Preview', '15 min']].map(([number, title, meta, time]) => <button className="challenge" key={number} onClick={onOpenVisualizer}><span>{number}</span><strong>{title}</strong><small>{meta} <i>·</i> {time}</small><ArrowUpRight size={15} /></button>)}</div></div><div className="dash-card activity-card"><div className="dash-card-heading"><div><span className="card-kicker">RECENT SESSIONS</span><h2>Your work</h2></div><BookOpen size={17} /></div>{[['Fibonacci recursion', 'Today, 10:42', '12 steps'], ['List traversal', 'Yesterday', '28 steps'], ['If / else branches', 'Sep 11', '9 steps']].map(([title, date, steps]) => <button className="session-row" key={title} onClick={onOpenVisualizer}><span className="session-dot"></span><div><strong>{title}</strong><small>{date}</small></div><em>{steps}</em><ChevronRight size={15} /></button>)}</div></div>}
  </section>
}

function LegacyStudyArea({ onOpenVisualizer, progress }) {
  const [selected, setSelected] = useState('Python')
  const [learning, setLearning] = useState(false)
  const [lessonIndex, setLessonIndex] = useState(0)
  const pythonLessonOutline = [
    ['Values & variables', 'Learn how names point to values and how assignment changes state.', '8 min'],
    ['Types & expressions', 'Work with numbers, text, booleans, and readable expressions.', '10 min'],
    ['Making decisions', 'Trace conditions and understand which branch runs.', '10 min'],
    ['For loops', 'Repeat work over a collection and follow every iteration.', '12 min'],
    ['While loops', 'Control repetition with a condition and avoid infinite loops.', '12 min'],
    ['Functions & scope', 'Build reusable behavior and inspect local call frames.', '14 min'],
    ['Lists & indexing', 'Store ordered data, read positions, and update items.', '12 min'],
    ['Dictionaries', 'Model records with meaningful keys and values.', '12 min'],
    ['Nested data & iteration', 'Combine collections and summarize structured data.', '15 min'],
    ['Errors & exceptions', 'Read runtime failures and handle expected problems.', '14 min'],
    ['Modules & reuse', 'Use the standard library and organize reusable code.', '12 min'],
    ['Classes & objects', 'Bundle state and behavior into objects and methods.', '16 min'],
  ]
  const languages = [
    { name: 'Python', mark: 'Py', color: 'gold', level: '12 guided lessons', lessons: 12, available: true, description: 'Build strong fundamentals with readable code and real execution traces.' },
    { name: 'Go', mark: 'Go', color: 'blue', level: 'In progress', lessons: 12, available: false, description: 'Learn types, loops, functions, and the ideas behind concurrent programs.' },
    { name: 'JavaScript', mark: 'JS', color: 'yellow', level: 'Coming soon', lessons: 0, available: false, description: 'Understand values, functions, and the event loop in the browser.' },
    { name: 'Java', mark: 'J', color: 'red', level: 'Coming soon', lessons: 0, available: false, description: 'Make object-oriented execution visible from the first class to the last return.' },
    { name: 'Rust', mark: 'Rs', color: 'orange', level: 'Coming soon', lessons: 0, available: false, description: 'Explore ownership and memory safety through visual state changes.' },
    { name: 'C++', mark: 'C+', color: 'purple', level: 'Coming soon', lessons: 0, available: false, description: 'See control flow, memory, and data structures unfold step by step.' },
  ]
  const current = languages.find((language) => language.name === selected)
  if (learning && current.available) return <LessonDetail language={current} lessonIndex={lessonIndex} onBack={() => setLearning(false)} onNext={() => setLessonIndex((index) => Math.min(index + 1, 11))} onOpenVisualizer={onOpenVisualizer} progress={progress} />
  return <section className="study-shell"><div className="study-heading"><div><p className="eyebrow">THE FOCUS CURRICULUM</p><h1>Learn by seeing it run.</h1><p className="subtitle">Choose a language, follow a path, and make every line of code part of your intuition.</p></div><div className="study-stats"><div><Trophy size={15} /><strong>{progress.challenges}</strong><span>challenges cleared</span></div><div><Terminal size={15} /><strong>{progress.steps}</strong><span>steps explored</span></div></div></div><div className="language-picker"><div className="picker-heading"><div><span className="card-kicker">CHOOSE YOUR PATH</span><h2>What do you want to learn?</h2></div><span className="language-count">{languages.filter((language) => language.available).length} paths available</span></div><div className="language-grid">{languages.map((language) => <button key={language.name} className={`language-card ${selected === language.name ? 'language-selected' : ''} ${!language.available ? 'language-locked' : ''}`} onClick={() => setSelected(language.name)}><div className={`language-mark ${language.color}`}>{language.mark}</div><div className="language-info"><strong>{language.name}</strong><span>{language.level}</span></div>{language.available ? <ChevronRight size={16} /> : <Lock size={14} />}</button>)}</div></div><div className="path-layout"><div className="path-card"><div className="path-title"><div className={`language-mark ${current.color}`}>{current.mark}</div><div><span className="card-kicker">{current.available ? 'YOUR NEXT PATH' : 'COMING SOON'}</span><h2>{current.name} foundations</h2></div><span className={current.available ? 'available-pill' : 'preview-pill'}>{current.available ? 'Available now' : 'Preview'}</span></div><p>{current.description}</p>{current.available ? <><div className="path-progress"><div><span>Your progress</span><b>{current.name === 'Python' ? Math.min(100, 18 + progress.challenges * 2) : 0}%</b></div><div className="progress-track"><div style={{ width: `${current.name === 'Python' ? Math.min(100, 18 + progress.challenges * 2) : 0}%` }}></div></div></div><div className="lesson-list">{pythonLessonOutline.map(([title, description, duration], index) => <button key={title} onClick={() => { setLessonIndex(index); setLearning(true) }}><span className={index === 0 ? 'lesson-check complete' : 'lesson-check'}>{index === 0 && <CheckCircle2 size={14} />}</span><span><strong>{index + 1}. {title}</strong><small>{index === 0 ? 'Completed · ' : ''}{duration} · {description}</small></span><ChevronRight size={15} /></button>)}</div><button className="run-button path-cta" onClick={() => { setLessonIndex(0); setLearning(true) }}><BookOpen size={15} /> Start the full Python path</button></> : <button className="preview-button"><Lock size={14} /> Join the waitlist</button>}</div><div className="study-tip"><div className="tip-icon"><Sparkles size={17} /></div><span className="card-kicker">HOW FOCUS WORKS</span><h3>Don’t memorize the syntax. Watch the state change.</h3><p>Every lesson ends in the visualizer, where you can pause, rewind, and inspect the exact moment your program makes a decision.</p><button className="text-action" onClick={onOpenVisualizer}>Try a sample trace <ArrowUpRight size={14} /></button></div></div></section>
}

function LegacyCourseLessonDetail({ language, lesson, lessonIndex, lessonCount, onBack, onNext, onOpenVisualizer, progress }) {
  const completion = Math.min(100, Math.round(((lessonIndex + 1) / lessonCount) * 100))
  return <section className="lesson-shell"><button className="back-link" onClick={onBack}><ChevronRight size={15} /> All learning paths</button><div className="lesson-hero"><div><span className="card-kicker">{language.toUpperCase()} · LESSON {lessonIndex + 1} OF {lessonCount}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><div className={`lesson-hero-mark language-mark ${language === 'Python' ? 'gold' : tracks[language].color}`}>{tracks[language].mark}</div></div><div className="lesson-columns"><article className="lesson-content"><div className="lesson-section"><span className="card-kicker">TODAY’S OBJECTIVES</span><h2>By the end of this lesson, you will be able to…</h2>{lesson.objectives.map((objective) => <div className="objective" key={objective}><CheckCircle2 size={17} /><span>{objective}</span></div>)}</div><div className="lesson-section lesson-explanation"><span className="card-kicker">THE IDEA</span><h2>{lesson.title}, explained</h2><p>{lesson.explanation}</p><p>In a real program, this concept matters because it changes how data moves through the program. The important question is not only what the syntax looks like, but what the program knows before the line runs, what it changes, and what another line can observe afterward.</p><div className="lesson-guide"><span className="card-kicker">HOW TO READ THE EXAMPLE</span>{lesson.guide.map((step, index) => <div className="guide-step" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div><div className="concept-code"><span>EXAMPLE</span><code>{lesson.code.split('\n').map((line, index) => <React.Fragment key={`${index}-${line}`}>{index > 0 && <br />}{line}</React.Fragment>)}</code><div className="concept-state"><small>COURSE GUIDE</small><strong>Trace <i>{lessonIndex + 1}</i></strong></div></div><div className="pitfall-note"><strong>Watch for this</strong><span>{lesson.pitfalls}</span></div></div><div className="lesson-section exercise-section"><span className="card-kicker">GUIDED EXERCISE</span><h2>See this lesson in motion</h2><p>Run the example, step through every state change, then edit one value and run it again. Explain what changed before moving on.</p><button className="run-button" onClick={() => onOpenVisualizer(lesson.code)}><Zap size={15} fill="currentColor" /> Visualize this example</button></div><div className="lesson-navigation"><button className="back-link" onClick={onBack}>Exit lesson</button>{lessonIndex === lessonCount - 1 ? <button className="run-button" onClick={onBack}><Trophy size={15} /> Finish course</button> : <button className="run-button" onClick={onNext}>Next lesson <ArrowUpRight size={15} /></button>}</div></article><aside className="lesson-sidebar"><div className="lesson-progress-card"><span className="card-kicker">COURSE PROGRESS</span><strong>{completion}%</strong><div className="progress-track"><div style={{ width: `${completion}%` }}></div></div><span>Lesson {lessonIndex + 1} of {lessonCount}</span></div><div className="lesson-sidebar-card"><span className="card-kicker">UP NEXT</span><h3>{lessonIndex === lessonCount - 1 ? 'Course complete' : tracks[language].lessons[lessonIndex + 1].title}</h3><p>{lessonIndex === lessonCount - 1 ? 'You have reached the end of this course.' : 'Finish the explanation and example, then continue when you are ready.'}</p></div></aside></div></section>
}

function CourseLessonDetail({ language, lesson, lessonIndex, lessonCount, completed, previousAnswers, onComplete, onBack, onNext, onOpenVisualizer }) {
  const [answer, setAnswer] = useState(lesson.exercise.starter)
  const [checking, setChecking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState(completed ? 'Exercise passed. You can continue.' : '')
  const completion = Math.round(((lessonIndex + 1) / lessonCount) * 100)
  const checkExercise = async () => {
    if (answer.trim() === lesson.exercise.starter.trim()) {
      setFeedback('Change the starter example before checking it.')
      return
    }
    const missingTokens = lesson.exercise.requiredTokens.filter((token) => !answer.includes(token))
    if (missingTokens.length) {
      setFeedback(`Not passed yet: your answer must use ${missingTokens.map((token) => `“${token}”`).join(', ')} for this lesson.`)
      return
    }
    const missingCounts = (lesson.exercise.minOccurrences || []).filter(({ token, count }) => {
      return answer.split(token).length - 1 < count
    })
    if (missingCounts.length) {
      setFeedback(`Not passed yet: this exercise needs ${missingCounts.map(({ token, count }) => `${count} ${token} statements`).join(', ')}.`)
      return
    }
    const exceededCounts = (lesson.exercise.maxOccurrences || []).filter(({ token, count }) => {
      return answer.split(token).length - 1 > count
    })
    if (exceededCounts.length) {
      setFeedback(`Not passed yet: use no more than ${exceededCounts.map(({ token, count }) => `${count} ${token} statements`).join(', ')}.`)
      return
    }
    const normalizedAnswer = answer.trim().replace(/\s+/g, ' ')
    if (previousAnswers.includes(normalizedAnswer)) {
      setFeedback('Not passed yet: this answer was already used for another lesson. Solve this lesson’s variation in your own code.')
      return
    }
    setChecking(true)
    try {
      if (language === 'Python') {
        const result = await traceCode(answer)
        if (result.error) throw new Error(result.error)
        const starterIsInteractive = /\binput\s*\(|argparse/.test(lesson.exercise.starter)
        if (!starterIsInteractive && !lesson.exercise.skipOutputCheck) {
          const expected = lesson.exercise.expectedOutput ? { output: lesson.exercise.expectedOutput, error: null } : await traceCode(lesson.exercise.starter)
          if (expected.error) throw new Error('The worked example is not executable yet.')
          const expectedOutput = expected.output.trim().split(/\s+/).join(' ')
          const actualOutput = result.output.trim().split(/\s+/).join(' ')
          if (expectedOutput && actualOutput !== expectedOutput) {
            throw new Error(`Expected output ${JSON.stringify(expectedOutput)}, but your program produced ${JSON.stringify(actualOutput)}.`)
          }
        }
        const outputLines = result.output.trim() ? result.output.trim().split(/\r?\n/).filter(Boolean) : []
        if (outputLines.length > 3) throw new Error('Your program produced more than three outputs. Keep this exercise focused on execution order.')
        if (!result.steps.length && !result.output.trim()) throw new Error('Your answer did not produce an observable result.')
      } else if (answer.trim().length < 12) {
        throw new Error('Add a complete example before checking it.')
      }
      setFeedback('Exercise passed. Your example is ready for the next lesson.')
      onComplete(normalizedAnswer)
    } catch (error) {
      setFeedback(`Not passed yet: ${error.message}`)
    } finally {
      setChecking(false)
    }
  }
  return <section className="lesson-shell"><button className="back-link" onClick={onBack}><ChevronRight size={15} /> All learning paths</button><div className="lesson-hero"><div><span className="card-kicker">{language.toUpperCase()} · LESSON {lessonIndex + 1} OF {lessonCount}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><div className={`lesson-hero-mark language-mark ${tracks[language].color}`}>{tracks[language].mark}</div></div><div className="lesson-columns"><article className="lesson-content"><div className="lesson-section"><span className="card-kicker">LEARNING OBJECTIVES</span><h2>By the end of this lesson, you will be able to…</h2>{lesson.objectives.map((objective) => <div className="objective" key={objective}><CheckCircle2 size={17} /><span>{objective}</span></div>)}</div><div className="lesson-section lesson-explanation"><span className="card-kicker">DETAILED EXPLANATION</span><h2>{lesson.title}, explained</h2><p>{lesson.explanation}</p><p>Read the example as a sequence of state changes. Do not jump straight to the final output: ask what each line receives, what it produces, and whether it mutates existing state or creates a new value. That habit is the transferable skill this lesson is teaching.</p><div className="lesson-guide"><span className="card-kicker">HOW TO STUDY THIS EXAMPLE</span>{lesson.guide.map((step, index) => <div className="guide-step" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div><div className="concept-code"><span>WORKED EXAMPLE</span><code>{lesson.code.split('\n').map((line, index) => <React.Fragment key={`${index}-${line}`}>{index > 0 && <br />}{line}</React.Fragment>)}</code><div className="concept-state"><small>LESSON</small><strong>{lessonIndex + 1} <i>/ {lessonCount}</i></strong></div></div><div className="pitfall-note"><strong>Common pitfall</strong><span>{lesson.pitfalls}</span></div></div><div className="lesson-section exercise-section exercise-gate"><span className="card-kicker">PASS TO CONTINUE · +25 XP</span><h2>Now solve a variation</h2><p>{lesson.exercise.prompt} Your answer must be different from the starter and must pass the checker before the next lesson unlocks.</p><div className="checker-list"><span><CheckCircle2 size={13} /> Required lesson concepts</span><span><CheckCircle2 size={13} /> No runtime errors</span><span><CheckCircle2 size={13} /> Expected behavior/output</span><span><CheckCircle2 size={13} /> No reused answers</span></div><textarea className="exercise-editor" spellCheck="false" value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback('') }} /><div className="exercise-actions"><button className="hint-button" onClick={() => setShowHint((visible) => !visible)}>{showHint ? 'Hide hint' : 'Need a hint?'}</button><button className="run-button" onClick={checkExercise} disabled={checking || completed}><CheckCircle2 size={15} /> {checking ? 'Checking…' : completed ? 'Exercise passed' : 'Check exercise'}</button>{feedback && <span className={`exercise-feedback ${completed ? 'passed' : ''}`}>{feedback}</span>}</div>{showHint && <div className="exercise-hint">Try using: {lesson.exercise.requiredTokens.join(', ')}. The hint names the building blocks, not the solution.</div>}</div><div className="lesson-navigation"><button className="back-link" onClick={onBack}>Exit lesson</button>{lessonIndex === lessonCount - 1 ? <button className="run-button" disabled={!completed} onClick={onBack}><Trophy size={15} /> Finish course</button> : <button className="run-button" disabled={!completed} onClick={onNext}>Next lesson <ArrowUpRight size={15} /></button>}</div></article><aside className="lesson-sidebar"><div className="lesson-progress-card"><span className="card-kicker">COURSE PROGRESS</span><strong>{completion}%</strong><div className="progress-track"><div style={{ width: `${completion}%` }}></div></div><span>Lesson {lessonIndex + 1} of {lessonCount}</span></div><div className="lesson-sidebar-card"><span className="card-kicker">{completed ? 'UNLOCKED' : 'LOCKED'}</span><h3>{completed ? (lessonIndex === lessonCount - 1 ? 'Course complete' : tracks[language].lessons[lessonIndex + 1].title) : 'Pass the exercise'}</h3><p>{completed ? 'Your exercise is complete. Continue when you are ready.' : 'The next lesson unlocks after your answer passes every checker.'}</p></div></aside></div></section>
}

function StudyArea({ onOpenVisualizer, progress }) {
  const [selected, setSelected] = useState('Python')
  const [learning, setLearning] = useState(false)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(() => readStorage('focus-course-completions', {}))
  const [passedAnswers, setPassedAnswers] = useState(() => readStorage('focus-course-answers', {}))
  const course = tracks[selected]
  const lessonKey = `${selected}-${lessonIndex}`
  const openLesson = (index = 0) => { setLessonIndex(index); setLearning(true) }
  if (learning) return <CourseLessonDetail language={selected} lesson={course.lessons[lessonIndex]} lessonIndex={lessonIndex} lessonCount={course.lessons.length} completed={Boolean(completedLessons[lessonKey])} previousAnswers={passedAnswers[selected] || []} onComplete={(answer) => { setCompletedLessons((current) => { const next = { ...current, [lessonKey]: true }; localStorage.setItem('focus-course-completions', JSON.stringify(next)); return next }); setPassedAnswers((current) => { const next = { ...current, [selected]: [...(current[selected] || []), answer] }; localStorage.setItem('focus-course-answers', JSON.stringify(next)); return next }) }} onBack={() => setLearning(false)} onNext={() => setLessonIndex((index) => Math.min(index + 1, course.lessons.length - 1))} onOpenVisualizer={onOpenVisualizer} />
  return <section className="study-shell"><div className="study-heading"><div><p className="eyebrow">THE FOCUS CURRICULUM</p><h1>Learn by seeing it run.</h1><p className="subtitle">Complete courses, guided examples, and execution traces for every language.</p></div><div className="study-stats"><div><Trophy size={15} /><strong>{progress.challenges}</strong><span>challenges cleared</span></div><div><Terminal size={15} /><strong>{progress.steps}</strong><span>steps explored</span></div></div></div><div className="language-picker"><div className="picker-heading"><div><span className="card-kicker">CHOOSE YOUR PATH</span><h2>What do you want to learn?</h2></div><span className="language-count">{Object.keys(tracks).length} complete paths</span></div><div className="language-grid">{Object.entries(tracks).map(([name, item]) => <button key={name} className={`language-card ${selected === name ? 'language-selected' : ''}`} onClick={() => { setSelected(name); setLessonIndex(0) }}><div className={`language-mark ${item.color}`}>{item.mark}</div><div className="language-info"><strong>{name}</strong><span>{item.lessons.length} guided lessons</span></div><ChevronRight size={16} /></button>)}</div></div><div className="path-layout"><div className="path-card"><div className="path-title"><div className={`language-mark ${course.color}`}>{course.mark}</div><div><span className="card-kicker">COMPLETE COURSE</span><h2>{selected} curriculum</h2></div><span className="available-pill">{course.lessons.length} lessons</span></div><p>{course.description}</p><div className="path-progress"><div><span>Course progress</span><b>{Object.keys(completedLessons).filter((key) => key.startsWith(`${selected}-`)).length} / {course.lessons.length}</b></div><div className="progress-track"><div style={{ width: `${Math.min(100, Math.round((Object.keys(completedLessons).filter((key) => key.startsWith(`${selected}-`)).length / Math.max(course.lessons.length, 1)) * 100))}%` }}></div></div></div><div className="lesson-list">{course.lessons.map((lesson, index) => { const completed = Boolean(completedLessons[`${selected}-${index}`]); const unlocked = index === 0 || Boolean(completedLessons[`${selected}-${index - 1}`]); return <button key={lesson.title} disabled={!unlocked} onClick={() => openLesson(index)}><span className={`lesson-check ${completed ? 'complete' : ''}`}>{completed && <CheckCircle2 size={14} />}</span><span><strong>{index + 1}. {lesson.title}</strong><small>{completed ? 'Exercise passed · ' : unlocked ? '' : 'Locked · pass the previous exercise · '}Detailed guide · example · exercise</small></span>{unlocked ? <ChevronRight size={15} /> : <Lock size={14} />}</button> })}</div><button className="run-button path-cta" onClick={() => openLesson(0)}><BookOpen size={15} /> Start {selected} course</button></div><div className="study-tip"><div className="tip-icon"><Sparkles size={17} /></div><span className="card-kicker">HOW FOCUS WORKS</span><h3>Every lesson ends at the moment code becomes understandable.</h3><p>Read the explanation, study the worked example, pass the exercise, then continue to the next concept.</p><button className="text-action" onClick={() => openLesson(0)}>Start the course <ArrowUpRight size={14} /></button></div></div></section>
}

function LessonDetail({ language, lessonIndex, onBack, onNext, onOpenVisualizer, progress }) {
  const lessons = [
    { title: 'Values & variables', kicker: 'PYTHON · LESSON 1 OF 12', description: 'Give your programs a memory. Learn how names point to values and how an assignment changes program state.', explanation: 'A variable is a label attached to a value. Python evaluates the right side first, then stores the result under the name on the left.', objectives: ['Create and update variables.', 'Read an assignment from right to left.', 'Predict a value after several statements.'], code: 'score = 10\nscore = score + 5\nprint(score)' },
    { title: 'Types & expressions', kicker: 'PYTHON · LESSON 2 OF 12', description: 'Combine numbers, text, and booleans to express ideas in code.', explanation: 'Every value has a type. Types determine which operations make sense: numbers can be added, strings can be joined, and booleans represent true or false.', objectives: ['Recognize common Python types.', 'Evaluate arithmetic expressions.', 'Use f-strings to build readable output.'], code: 'name = "Ada"\nyears = 3\nmessage = f"{name} has {years} years"\nprint(message)' },
    { title: 'Making decisions', kicker: 'PYTHON · LESSON 3 OF 12', description: 'Teach your program to choose which path to take.', explanation: 'An if statement evaluates a condition. Only the branch whose condition is true runs, so the state can evolve along different paths.', objectives: ['Compare values with operators.', 'Trace if, elif, and else branches.', 'Explain why a line was skipped.'], code: 'temperature = 24\nif temperature > 20:\n    message = "Warm"\nelse:\n    message = "Cool"\nprint(message)' },
    { title: 'For loops', kicker: 'PYTHON · LESSON 4 OF 12', description: 'Repeat work for every item in a collection.', explanation: 'A for loop binds the next item to a loop variable, runs its body, then moves to the next item. The visualizer makes each pass visible.', objectives: ['Identify the loop variable.', 'Follow one iteration at a time.', 'Accumulate a result safely.'], code: 'total = 0\nfor number in [1, 2, 3]:\n    total += number\nprint(total)' },
    { title: 'While loops', kicker: 'PYTHON · LESSON 5 OF 12', description: 'Repeat while a condition remains true and learn how state controls termination.', explanation: 'A while loop checks its condition before every pass. Something inside the loop must eventually change, or the loop never ends.', objectives: ['Trace a condition before each pass.', 'Update loop state deliberately.', 'Spot an infinite-loop risk.'], code: 'count = 0\nwhile count < 3:\n    print(count)\n    count += 1' },
    { title: 'Functions & scope', kicker: 'PYTHON · LESSON 6 OF 12', description: 'Package behavior into reusable functions and see local variables live inside a frame.', explanation: 'Calling a function creates a new local scope. Parameters receive values, the body runs, and return sends a value back to the caller.', objectives: ['Define and call a function.', 'Follow parameters into a stack frame.', 'Distinguish local and global names.'], code: 'def double(value):\n    result = value * 2\n    return result\nanswer = double(5)\nprint(answer)' },
    { title: 'Lists & indexing', kicker: 'PYTHON · LESSON 7 OF 12', description: 'Store ordered collections and access the individual values inside them.', explanation: 'A list keeps multiple values in one object. Indexing starts at zero, so the first item lives at position 0.', objectives: ['Create and index a list.', 'Change an item at an index.', 'Predict list state after an update.'], code: 'colors = ["red", "green", "blue"]\ncolors[1] = "gold"\nprint(colors)' },
    { title: 'Dictionaries', kicker: 'PYTHON · LESSON 8 OF 12', description: 'Model real-world records with named keys and values.', explanation: 'A dictionary maps keys to values. Instead of remembering a numeric position, you ask for the value by a meaningful name.', objectives: ['Create key-value pairs.', 'Read and update a dictionary.', 'Choose a useful data shape.'], code: 'user = {"name": "Mina", "score": 8}\nuser["score"] += 2\nprint(user)' },
    { title: 'Nested data & iteration', kicker: 'PYTHON · LESSON 9 OF 12', description: 'Combine collections and trace data as it moves through nested loops.', explanation: 'Real programs often contain lists of dictionaries or other nested structures. Step-by-step inspection helps you keep track of which object is active.', objectives: ['Read nested data safely.', 'Trace nested loop variables.', 'Build a summary from records.'], code: 'scores = [{"name": "A", "points": 4}, {"name": "B", "points": 7}]\ntotal = 0\nfor item in scores:\n    total += item["points"]\nprint(total)' },
    { title: 'Errors & exceptions', kicker: 'PYTHON · LESSON 10 OF 12', description: 'Understand what happens when a program cannot continue normally.', explanation: 'Exceptions are runtime events. try and except let a program respond to a known failure instead of stopping without an explanation.', objectives: ['Recognize a runtime error.', 'Trace try and except control flow.', 'Keep error handling specific.'], code: 'try:\n    number = int("not a number")\nexcept ValueError:\n    number = 0\nprint(number)' },
    { title: 'Modules & reuse', kicker: 'PYTHON · LESSON 11 OF 12', description: 'Organize code into reusable modules and use the standard library.', explanation: 'A module is a Python file that can be imported. Imports give your program access to tested functionality without rewriting it.', objectives: ['Import a standard-library module.', 'Trace a function from an import.', 'Separate reusable logic from program setup.'], code: 'import math\nradius = 3\narea = math.pi * radius ** 2\nprint(round(area, 2))' },
    { title: 'Classes & objects', kicker: 'PYTHON · LESSON 12 OF 12', description: 'Bundle data and behavior into objects, then trace methods and instance state.', explanation: 'A class describes a kind of object. Each instance carries its own state, while methods describe actions that can change that state.', objectives: ['Create a class and an instance.', 'Follow self through a method call.', 'Explain how object state changes.'], code: 'class Counter:\n    def __init__(self):\n        self.value = 0\n    def increment(self):\n        self.value += 1\n\ncounter = Counter()\ncounter.increment()\nprint(counter.value)' },
  ]
  const lesson = lessons[lessonIndex]
  const completion = Math.min(100, 25 + progress.challenges)
  return <section className="lesson-shell"><button className="back-link" onClick={onBack}><ChevronRight size={15} /> All learning paths</button><div className="lesson-hero"><div><span className="card-kicker">{lesson.kicker}</span><h1>{lesson.title}</h1><p>{lesson.description}</p></div><div className="lesson-hero-mark language-mark gold">{language.mark}</div></div><div className="lesson-columns"><article className="lesson-content"><div className="lesson-section"><span className="card-kicker">TODAY’S OBJECTIVES</span><h2>By the end of this lesson, you will be able to…</h2>{lesson.objectives.map((objective) => <div className="objective" key={objective}><CheckCircle2 size={17} /><span>{objective}</span></div>)}</div><div className="lesson-section"><span className="card-kicker">THE IDEA</span><h2>{lesson.title}</h2><p>{lesson.explanation}</p><div className="concept-code"><span>CODE</span><code>{lesson.code.split('\n').map((line, index) => <React.Fragment key={`${line}-${index}`}>{index > 0 && <br />}{index === Math.min(1, lesson.code.split('\n').length - 1) ? <b>{line}</b> : line}</React.Fragment>)}</code><div className="concept-state"><small>STATE SNAPSHOT</small><strong>{lessonIndex === 0 ? 'score' : 'step'} <i>{lessonIndex + 1}</i></strong></div></div></div><div className="lesson-section exercise-section"><span className="card-kicker">GUIDED EXERCISE</span><h2>See this lesson in motion</h2><p>Open the visualizer with this lesson’s code already loaded. You can step forward, inspect variables, and edit the example.</p><button className="run-button" onClick={() => onOpenVisualizer(lesson.code)}><Zap size={15} fill="currentColor" /> Visualize this lesson</button></div><div className="lesson-navigation"><button className="back-link" onClick={onBack}>Exit lesson</button>{lessonIndex === lessons.length - 1 ? <button className="run-button" onClick={onBack}><Trophy size={15} /> Finish learning path</button> : <button className="run-button" onClick={onNext}>Next lesson <ArrowUpRight size={15} /></button>}</div></article><aside className="lesson-sidebar"><div className="lesson-progress-card"><span className="card-kicker">YOUR PROGRESS</span><strong>{completion}%</strong><div className="progress-track"><div style={{ width: `${completion}%` }}></div></div><span>Lesson {lessonIndex + 1} of {lessons.length}</span></div><div className="lesson-sidebar-card"><span className="card-kicker">UP NEXT</span><h3>{lessonIndex === lessons.length - 1 ? 'Path complete' : lessons[lessonIndex + 1].title}</h3><p>{lessonIndex === lessons.length - 1 ? 'You have reached the end of the Python foundations path.' : 'Continue when you are ready for the next concept.'}</p></div></aside></div></section>
}

function explainLine(line, snapshot) {
  const source = line.trim()
  const variables = snapshot.values.map((item) => item.name).join(', ') || 'no variables yet'
  if (!source) return { title: 'Blank line', body: 'This line has no executable instruction. Python keeps the program position here while preserving the current state.', state: `Current state: ${variables}.` }
  if (/^def\s+/.test(source) || /^(async\s+)?function\s+/.test(source)) return { title: 'Define reusable behavior', body: 'This line creates a function definition. Python records the function so its body can run later when the function is called; defining it does not execute every indented line yet.', state: `The available names are ${variables}.` }
  if (/^class\s+/.test(source)) return { title: 'Describe a new type', body: 'This line begins a class definition. The class groups data and behavior into a reusable shape; an object is created only when the class is called.', state: `The current frame is ${snapshot.stack.at(-1)}.` }
  if (/^if\s+|^elif\s+|^else\b/.test(source)) return { title: 'Make a decision', body: 'Python evaluates this condition and chooses whether the indented branch should run. If the condition is false, execution jumps to the next matching branch or continues after the decision.', state: `The program is carrying ${variables}.` }
  if (/^for\s+/.test(source)) return { title: 'Start or continue iteration', body: 'This line takes the next item from an iterable and assigns it to the loop variable. The indented body runs once for that item, then the loop comes back here for the next item.', state: `Watch the loop variable change between steps.` }
  if (/^while\s+/.test(source)) return { title: 'Check a repeating condition', body: 'The condition is checked before each pass. If it is true, the indented body runs; something in that body should eventually change the condition so the loop can finish.', state: `Current variables: ${variables}.` }
  if (/^return\b/.test(source)) return { title: 'Send a value back', body: 'This line ends the current function call and sends its expression back to the caller. The current stack frame will disappear after the return is handled.', state: `The call stack currently has ${snapshot.stack.length} frame${snapshot.stack.length === 1 ? '' : 's'}.` }
  if (/^(print|console\.log)\s*\(/.test(source)) return { title: 'Produce output', body: 'This line evaluates the expression inside the output function, then sends the resulting value to the program output. Printing observes a value; it does not automatically change it.', state: 'Check the output panel or program result after this step.' }
  if (/^(import|from)\s+/.test(source)) return { title: 'Load reusable code', body: 'This line imports names from a module so later statements can use functionality defined elsewhere. The imported names become available in the current scope.', state: `The current frame is ${snapshot.stack.at(-1)}.` }
  if (/^[\w.]+\s*(=|\+=|-=|\*=|\/=)/.test(source)) return { title: 'Change program state', body: 'This line evaluates the expression on the right and binds the result to the name on the left. With a compound assignment, the old value participates in calculating the new one.', state: `After this line, inspect: ${variables}.` }
  if (/\w+\s*\(/.test(source)) return { title: 'Call behavior', body: 'This line evaluates its arguments and calls a function or method. A function call may create a new stack frame, change state, and return a value to this line.', state: `The active stack is ${snapshot.stack.join(' → ')}.` }
  return { title: 'Execute this statement', body: 'Python evaluates this line from left to right according to the language rules. Look for values being read, operations being performed, and names or objects that may change.', state: `At this moment the visible variables are ${variables}.` }
}

function normalizeOutput(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).join(' ')
}

function App() {
  const [user, setUser] = useState(() => readStorage('focus-user', null))
  const [authOpen, setAuthOpen] = useState(false)
  const [progress, setProgress] = useState(() => readStorage('focus-progress', { streak: 1, steps: 0, runs: 0, challenges: 0 }))
  const [activeView, setActiveView] = useState('dashboard')
  const [adminMode, setAdminMode] = useState(false)
  const [code, setCode] = useState(() => readStorage('focus-draft-code', example))
  const [language, setLanguage] = useState('python')
  const [step, setStep] = useState(5)
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState(snapshots)
  const [status, setStatus] = useState('Demo trace loaded')
  const [errorHint, setErrorHint] = useState('')
  const [prediction, setPrediction] = useState('')
  const [predictionOpen, setPredictionOpen] = useState(false)
  const [predictionFeedback, setPredictionFeedback] = useState('')
  const [checkingPrediction, setCheckingPrediction] = useState(false)
  const canManagePlatform = canAccessAdmin(user)
  const snapshot = steps[step] || steps[0]
  const lineGuide = explainLine(snapshot.label, snapshot)
  const lines = useMemo(() => code.split('\n'), [code])

  useEffect(() => {
    localStorage.setItem('focus-draft-code', code)
  }, [code])

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((response) => response.json().then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (!response.ok || !result.user) throw new Error('No active server session')
        setUser(result.user)
        localStorage.setItem('focus-user', JSON.stringify(result.user))
      })
      .catch(() => {
        setUser(null)
        setAdminMode(false)
        localStorage.removeItem('focus-user')
      })
  }, [])

  useEffect(() => {
    if (!running) return undefined
    if (step >= steps.length - 1) {
      setRunning(false)
      return undefined
    }
    const timer = window.setTimeout(() => setStep((current) => Math.min(current + 1, steps.length - 1)), 650)
    return () => window.clearTimeout(timer)
  }, [running, step, steps.length])

  const move = (delta) => setStep((current) => Math.min(Math.max(current + delta, 0), steps.length - 1))
  const runTrace = async () => {
    setRunning(true)
    setErrorHint('')
    setStatus('Tracing your code…')
    try {
      const result = await traceCode(code, language)
      if (result.error) {
        setStatus(`Trace stopped · ${result.error.split('\n')[0]}`)
        setErrorHint(result.error_hint || 'Check the reported line and inspect the values it receives.')
        return
      }
      const nextSteps = result.steps
      setSteps(nextSteps.length ? nextSteps : [{ line: 1, label: 'No executable statements', values: [], stack: ['global'] }])
      setStep(0)
      const nextProgress = { ...progress, steps: progress.steps + result.steps.length, runs: progress.runs + 1, challenges: Math.min(40, progress.challenges + 1) }
      setProgress(nextProgress)
      localStorage.setItem('focus-progress', JSON.stringify(nextProgress))
      recordAnalytics({
        name: user?.name || 'Guest learner',
        email: user?.email || 'guest',
        title: code.split('\n').find((line) => line.trim())?.trim().slice(0, 42) || 'Untitled visualization',
        steps: result.steps.length,
        completion: Math.min(100, nextProgress.challenges / 40 * 100),
        error: null,
      })
      setStatus(`Trace complete · ${result.steps.length} steps${result.output ? ` · output: ${result.output.trim()}` : ''}`)
    } catch (error) {
      setStatus(`Trace failed · ${error.message}`)
    } finally { setRunning(false) }
  }
  const checkPrediction = async () => {
    if (!prediction.trim()) {
      setPredictionFeedback('Write your predicted output before checking it.')
      return
    }
    setCheckingPrediction(true)
    setPredictionFeedback('Running the program…')
    try {
      const result = await traceCode(code, language)
      if (result.error) {
        setPredictionFeedback(result.error_hint || 'The program failed before it produced a result.')
        return
      }
      const actual = normalizeOutput(result.output)
      const guess = normalizeOutput(prediction)
      setPredictionFeedback(actual === guess ? 'Correct prediction. Now step through the trace to see why.' : `Not quite. The program produced: ${actual || '(no output)'}`)
      setSteps(result.steps.length ? result.steps : [{ line: 1, label: 'No executable statements', values: [], stack: ['global'] }])
      setStep(0)
      setStatus(`Prediction checked · ${result.steps.length} steps`)
    } catch (error) {
      setPredictionFeedback(`Could not check prediction: ${error.message}`)
    } finally {
      setCheckingPrediction(false)
    }
  }

  const signIn = async (account, password, createAccount = false) => {
    const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...account, password, create_account: createAccount }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result.user) throw new Error(result.error || 'Unable to sign in. Start the Focus API and try again.')
    setUser(result.user)
    setAdminMode(false)
    localStorage.setItem('focus-user', JSON.stringify(result.user))
    setAuthOpen(false)
  }
  const signOut = () => { fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => {}); setUser(null); setAdminMode(false); setActiveView('dashboard'); localStorage.removeItem('focus-user') }
  const resetAccount = () => {
    if (!window.confirm('Reset your local Focus account and all course progress?')) return
    ;['focus-user', 'focus-credential', 'focus-progress', 'focus-course-completions', 'focus-course-answers', 'focus-draft-code', ANALYTICS_KEY].forEach((key) => localStorage.removeItem(key))
    window.dispatchEvent(new CustomEvent('focus-analytics-updated', { detail: [] }))
    setUser(null)
    setProgress({ streak: 1, steps: 0, runs: 0, challenges: 0 })
    setAdminMode(false)
    setActiveView('dashboard')
  }
  const openVisualizer = (visualizerCode = example, visualizerLanguage = 'python') => { const inferredLanguage = visualizerCode.trimStart().startsWith('package main') ? 'go' : visualizerLanguage; setCode(visualizerCode); setLanguage(inferredLanguage); setStep(0); setActiveView('visualizer') }
  useEffect(() => {
    if (activeView === 'admin' && !canManagePlatform) {
      setActiveView('dashboard')
      setAdminMode(false)
    }
  }, [activeView, canManagePlatform])

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles size={16} /></div><span>Focus</span><em>beta</em></div>
      <nav className="main-nav"><button className={activeView === 'dashboard' ? 'nav-active' : ''} onClick={() => setActiveView('dashboard')}><LayoutDashboard size={15} /> Dashboard</button><button className={activeView === 'study' ? 'nav-active' : ''} onClick={() => setActiveView('study')}><GraduationCap size={15} /> Study</button><button className={activeView === 'visualizer' ? 'nav-active' : ''} onClick={() => setActiveView('visualizer')}><Code2 size={15} /> Visualizer</button>{canManagePlatform && adminMode && <button className={activeView === 'admin' ? 'nav-active' : ''} onClick={() => setActiveView('admin')}><ShieldCheck size={15} /> Admin</button>}</nav>
      <div className="top-actions"><button className="icon-button"><CircleHelp size={18} /></button><button className="icon-button" title="Reset local account" onClick={resetAccount}><Settings2 size={18} /></button>{user ? <><button className="avatar" onClick={() => { if (!canManagePlatform) return; setAdminMode(!adminMode); setActiveView(!adminMode ? 'admin' : 'dashboard') }} title={canManagePlatform ? 'Switch admin view' : 'Learner account'}>{adminMode ? 'AD' : user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</button><button className="signout-button" onClick={signOut}><LogOut size={14} /> Sign out</button></> : <button className="signin-button" onClick={() => setAuthOpen(true)}><UserRound size={14} /> Sign in</button>}</div>
    </header>
    {!user && activeView !== 'visualizer' && <section className="signin-banner"><div><span className="card-kicker">PROGRESS IS BETTER TOGETHER</span><h2>Sign in to save your learning journey.</h2><p>Your streak, visualizations, and challenge progress will be saved on this device.</p></div><button className="run-button" onClick={() => setAuthOpen(true)}><LogIn size={15} /> Sign in</button></section>}
    {activeView === 'study' && <StudyArea onOpenVisualizer={openVisualizer} progress={progress} />}
    {activeView !== 'visualizer' && activeView !== 'study' && <Dashboard admin={activeView === 'admin'} onOpenVisualizer={openVisualizer} user={user || { name: 'Learner' }} progress={progress} />}
    {activeView === 'visualizer' && <>
    <section className="workspace-header">
      <div><p className="eyebrow">CODE EXECUTION VISUALIZER</p><h1>See your code think.</h1><p className="subtitle">Trace every decision, variable, and function call as your program runs.</p></div>
      <label className="language-select"><Code2 size={17} /><select aria-label="Programming language" value={language} onChange={(event) => { const next = event.target.value; setLanguage(next); setCode(next === 'go' ? goExample : example); setStep(0); setStatus('Demo trace loaded'); setErrorHint('') }}><option value="python">Python</option><option value="go">Go</option></select><ChevronDown size={16} /></label>
    </section>
    <section className="visualizer">
      <div className="panel editor-panel">
        <div className="panel-heading"><span>EDITOR</span><button className="reset-button" onClick={() => setCode(example)}><RotateCcw size={14} /> Reset</button></div>
        <div className="editor-body"><div className="line-numbers">{lines.map((_, index) => <span className={index + 1 === snapshot.line ? 'active-number' : ''} key={index}>{index + 1}</span>)}</div><textarea spellCheck="false" value={code} onChange={(event) => setCode(event.target.value)} /></div>
        <div className="editor-footer"><button className="run-button" onClick={runTrace} disabled={running}><Play size={15} fill="currentColor" /> {running ? 'Tracing…' : 'Run visualization'}</button><button className="predict-button" onClick={() => { setPredictionOpen((open) => !open); setPredictionFeedback('') }}>Predict output</button><span className="shortcut">{status}</span>{errorHint && <span className="trace-error-hint"><strong>Why:</strong> {errorHint}</span>}</div>
        {predictionOpen && <div className="prediction-card"><div><span className="card-kicker">ACTIVE RECALL</span><strong>What will this program print?</strong><small>Write the output before running the trace. Separate multiple lines with spaces or new lines.</small></div><textarea value={prediction} onChange={(event) => { setPrediction(event.target.value); setPredictionFeedback('') }} placeholder="Your predicted output" rows={2} /><div className="prediction-actions"><button className="run-button" onClick={checkPrediction} disabled={checkingPrediction}>{checkingPrediction ? 'Checking…' : 'Check prediction'}</button>{predictionFeedback && <span className={predictionFeedback.startsWith('Correct') ? 'prediction-correct' : 'prediction-feedback'}>{predictionFeedback}</span>}</div></div>}
      </div>
      <div className="panel state-panel">
        <div className="panel-heading"><span>PROGRAM STATE</span><span className="step-count">STEP {step + 1} <i>/</i> {steps.length}</span></div>
        <div className="current-line"><div className="pulse"></div><div><span className="muted-label">CURRENTLY EXECUTING</span><code>{snapshot.label}</code></div></div>
        <div className="line-guide"><div className="line-guide-heading"><span className="muted-label">LINE GUIDE</span><strong>{lineGuide.title}</strong></div><p>{lineGuide.body}</p><small>{lineGuide.state}</small></div>
        <div className="state-section"><div className="section-title"><span>VARIABLES</span><span className="frame-name">{snapshot.stack.at(-1)}</span></div>{snapshot.values.map((item) => <div className="variable" key={item.name}><span className="variable-name">{item.name}</span><span className="variable-value">{item.value}</span><span className="variable-type">{item.type}</span></div>)}</div>
        <div className="state-section stack-section"><div className="section-title"><span>CALL STACK</span><span className="frame-name">{snapshot.stack.length} frames</span></div>{snapshot.stack.slice().reverse().map((frame, index) => <div className={`stack-frame ${index === 0 ? 'selected' : ''}`} key={`${frame}-${index}`}><ChevronRight size={15} /><span>{frame}</span>{index === 0 && <span className="frame-line">line {snapshot.line}</span>}</div>)}</div>
      </div>
    </section>
    <footer className="transport"><div className="transport-controls"><button onClick={() => { setRunning(false); setStep(0) }}><SkipBack size={17} fill="currentColor" /></button><button className="play-control" onClick={() => { if (step === steps.length - 1) setStep(0); setRunning((current) => !current) }}>{running ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><button onClick={() => { setRunning(false); move(1) }}><SkipForward size={17} fill="currentColor" /></button></div><div className="timeline"><div className="track"><div className="track-fill" style={{ width: `${(step / Math.max(steps.length - 1, 1)) * 100}%` }}></div><div className="track-thumb" style={{ left: `${(step / Math.max(steps.length - 1, 1)) * 100}%` }}></div></div><div className="timeline-labels"><span>START</span><span>END</span></div></div><button className="speed"><FastForward size={14} /> 1×</button></footer>
    </>}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSignIn={signIn} />}
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
