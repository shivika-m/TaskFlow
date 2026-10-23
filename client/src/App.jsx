import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlarmClock, ArrowDownRight, ArrowRight, Check, CheckCheck, CheckCircle2,
  ChevronDown, Circle, ClipboardList, Clock3, Flame, LayoutDashboard, LogOut,
  Menu, Plus, Search, Settings2, Sparkles, Target, Trash2, X, CalendarDays,
  Pencil, ListTodo, UserRound, Coffee
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (date) => {
  if (!date) return "No due date";
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

async function request(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong. Try again.");
  return data;
}


function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Connect Google's sign-in button to our backend.
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const buttonContainer = document.getElementById(
      "google-signin-button"
    );

    if (!clientId || !buttonContainer) return;

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (response) => {
          if (!response.credential) {
            setError("Google sign-in failed. Please try again.");
            return;
          }

          setError("");
          setBusy(true);

          try {
            const data = await request("/auth/google", null, {
              method: "POST",
              body: JSON.stringify({
                credential: response.credential
              })
            });

            onAuth(data);
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }
      });

      window.google.accounts.id.renderButton(
        buttonContainer,
        {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: 320
        }
      );
    };

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (script) {
      script.addEventListener("load", initializeGoogle);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [onAuth]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = await request(`/auth/${mode}`, null, {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-left">
        <a className="brand brand-light" href="#">
          <span className="brand-mark">
            <CheckCheck size={19} />
          </span>
          taskflow
        </a>

        <div className="auth-copy">
          <span className="eyebrow light-eyebrow">
            <Sparkles size={14} /> A LITTLE MORE CLARITY
          </span>
          <h1>
            Make room for<br />
            <em>what matters.</em>
          </h1>
          <p>
            Your plans, your pace. A calmer space to keep track
            of the things you want to get done.
          </p>
          <div className="quote-card">
            <span className="quote-icon">“</span>
            <p>
              You don’t have to do it all. You just have to
              decide what matters next.
            </p>
            <span className="quote-by">
              A NOTE TO YOUR FUTURE SELF
            </span>
          </div>
        </div>

        <div className="auth-foot">
          A softer approach to getting things done.
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-mobile-brand">
          <span className="brand-mark">
            <CheckCheck size={19} />
          </span>
          taskflow
        </div>

        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">YOUR SPACE TO BEGIN</span>

          <h2>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="muted">
            {mode === "login"
              ? "Pick up where you left off."
              : "A fresh start, one task at a time."}
          </p>

          <div
            id="google-signin-button"
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: "40px"
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#969184",
              fontSize: "11px"
            }}
          >
            <span style={{ flex: 1, height: "1px", background: "#eae6dc" }} />
            or continue with email
            <span style={{ flex: 1, height: "1px", background: "#eae6dc" }} />
          </div>

          {mode === "register" && (
            <label>
              Your name
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                minLength="2"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "login"
                  ? "Enter your password"
                  : "At least 8 characters"
              }
              minLength={mode === "register" ? 8 : 1}
              required
            />
          </label>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            className="button button-dark auth-submit"
            disabled={busy}
          >
            {busy
              ? "One moment…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
            <ArrowRight size={17} />
          </button>

          <p className="switch-auth">
            {mode === "login"
              ? "New around here?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? "Create an account"
                : "Log in"}
            </button>
          </p>

          <p className="auth-privacy">
            Your tasks belong to you. Each account has its own
            private task list.
          </p>
        </form>
      </section>
    </main>
  );
}


function TaskModal({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    title: task?.title || "", description: task?.description || "",
    category: task?.category || "Personal", priority: task?.priority || "Medium",
    dueDate: task?.dueDate || ""
  });
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  function submit(e) { e.preventDefault(); if (form.title.trim()) onSave({ ...form, title: form.title.trim() }); }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <form className="task-modal" onSubmit={submit}>
      <div className="modal-top"><div><span className="eyebrow">{task ? "MAKE IT FIT" : "ONE THING AT A TIME"}</span><h2>{task ? "Edit task" : "Add a task"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
      <label>What needs doing?<input autoFocus value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Finish the project draft" maxLength="180" required /></label>
      <label>A little context <span className="optional">OPTIONAL</span><textarea value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Add a note to your future self…" rows="3" maxLength="1200"/></label>
      <div className="form-grid">
        <label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}>{["Work","Study","Personal","Health","Errands","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Priority<select value={form.priority} onChange={e=>update("priority",e.target.value)}>{["Low","Medium","High"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <label>Due date <span className="optional">OPTIONAL</span><input type="date" min="2000-01-01" value={form.dueDate} onChange={e=>update("dueDate",e.target.value)}/></label>
      <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-dark" disabled={saving}>{saving?"Saving…":task?"Save changes":"Add to my list"} <ArrowRight size={16}/></button></div>
    </form>
  </div>;
}

function App() {
  const [auth, setAuth] = useState(() => {
    try { return { token: localStorage.getItem("taskflow_token"), user: JSON.parse(localStorage.getItem("taskflow_user") || "null") }; }
    catch { return { token: null, user: null }; }
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(auth.token));
  const [loadError, setLoadError] = useState("");
  const [active, setActive] = useState("Today");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notify = useCallback((message) => { setToast(message); window.setTimeout(()=>setToast(""), 2600); }, []);
  const logout = useCallback(() => {
    localStorage.removeItem("taskflow_token"); localStorage.removeItem("taskflow_user");
    setAuth({token:null,user:null}); setTasks([]); setModal(null);
  }, []);
  const loadTasks = useCallback(async (token) => {
    setLoading(true); setLoadError("");
    try { const data = await request("/tasks", token); setTasks(data.tasks); }
    catch (e) { setLoadError(e.message); if (e.message.toLowerCase().includes("session") || e.message.toLowerCase().includes("log in")) logout(); }
    finally { setLoading(false); }
  }, [logout]);

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    request("/auth/me", auth.token).then(({user}) => {
      setAuth(old => ({...old,user}));
      localStorage.setItem("taskflow_user", JSON.stringify(user));
      return loadTasks(auth.token);
    }).catch(() => logout());
  }, [auth.token, loadTasks, logout]);

  function onAuth(data) {
    localStorage.setItem("taskflow_token", data.token);
    localStorage.setItem("taskflow_user", JSON.stringify(data.user));
    setAuth(data); notify("You're in. Let's make today count.");
  }
  async function saveTask(data) {
    setSaving(true);
    try {
      if (modal?._id) {
        const result = await request(`/tasks/${modal._id}`, auth.token, {method:"PATCH",body:JSON.stringify(data)});
        setTasks(old=>old.map(t=>t._id===modal._id?result.task:t)); notify("Task updated.");
      } else {
        const result = await request("/tasks", auth.token, {method:"POST",body:JSON.stringify(data)});
        setTasks(old=>[result.task,...old]); notify("Added to your list.");
      }
      setModal(null);
    } catch(e) { notify(e.message); }
    finally { setSaving(false); }
  }
  async function toggleTask(task) {
    try {
      const result = await request(`/tasks/${task._id}`, auth.token, {method:"PATCH",body:JSON.stringify({completed:!task.completed})});
      setTasks(old=>old.map(t=>t._id===task._id?result.task:t));
    } catch(e) { notify(e.message); }
  }
  async function deleteTask(task) {
    try {
      await request(`/tasks/${task._id}`, auth.token, {method:"DELETE"});
      setTasks(old=>old.filter(t=>t._id!==task._id)); notify("Task removed.");
    } catch(e) { notify(e.message); }
  }

  const stats = useMemo(() => {
    const done = tasks.filter(t=>t.completed).length;
    const open = tasks.filter(t=>!t.completed);
    const todayTasks = open.filter(t=>!t.dueDate || t.dueDate===today());
    const overdue = open.filter(t=>t.dueDate && t.dueDate<today());
    return {done,open:open.length,today:todayTasks.length,overdue};
  }, [tasks]);
  const visibleTasks = useMemo(() => {
    let list = [...tasks];
    if (active==="Today") list=list.filter(t=>!t.completed && (!t.dueDate || t.dueDate===today()));
    if (active==="Upcoming") list=list.filter(t=>!t.completed && t.dueDate && t.dueDate>today()).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
    if (active==="Completed") list=list.filter(t=>t.completed);
    if (active==="All tasks") list=list.sort((a,b)=>Number(a.completed)-Number(b.completed));
    if (filter!=="All") list=list.filter(t=>t.priority===filter);
    const q=search.trim().toLowerCase();
    if(q) list=list.filter(t=>`${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q));
    return list;
  }, [tasks,active,filter,search]);

  if (!auth.token) return <AuthScreen onAuth={onAuth}/>;

  const navItems = [
    {name:"Today",icon:LayoutDashboard,count:stats.today},
    {name:"Upcoming",icon:CalendarDays},
    {name:"All tasks",icon:ClipboardList,count:stats.open},
    {name:"Completed",icon:CheckCircle2,count:stats.done}
  ];
  const pageTitle = active==="Today"?"Your day, your way":active==="Upcoming"?"A little further ahead":active==="Completed"?"Look how far you’ve come":"Everything in one place";
  const subtitle = active==="Today"?"Small steps still move you forward.":active==="Upcoming"?"Give future-you a head start.":active==="Completed"?"Every checked box counts.": "All your plans, gathered here.";

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <a className="brand" href="#" onClick={e=>e.preventDefault()}><span className="brand-mark"><CheckCheck size={19}/></span> taskflow<span className="brand-dot">.</span></a>
      <button className="workspace-pill" onClick={()=>setProfileOpen(v=>!v)}><span className="avatar">{(auth.user?.name||"Y").slice(0,1).toUpperCase()}</span><span className="workspace-text"><b>{auth.user?.name || "My workspace"}</b><small>Personal workspace</small></span><ChevronDown size={15}/></button>
      {profileOpen&&<div className="profile-menu"><div className="profile-email">{auth.user?.email}</div><button onClick={logout}><LogOut size={15}/> Log out</button></div>}
      <span className="nav-caption">YOUR SPACE</span>
      <nav className="main-nav">{navItems.map(item=><button key={item.name} className={`nav-item ${active===item.name?"nav-active":""}`} onClick={()=>{setActive(item.name);setMobileNav(false);}}><item.icon size={18} strokeWidth={1.8}/><span>{item.name}</span>{item.count!==undefined&&<span className="nav-count">{item.count}</span>}</button>)}</nav>
      <div className="sidebar-note"><div className="note-sun"><Sparkles size={18}/></div><b>Make it manageable.</b><p>One thing at a time is still progress.</p><div className="note-line"><span/></div></div>
      <div className="sidebar-bottom"><div className="mini-avatar">{(auth.user?.name||"Y").slice(0,1).toUpperCase()}</div><div className="user-meta"><b>{auth.user?.name}</b><span>{auth.user?.email}</span></div><button className="icon-button logout-btn" title="Log out" aria-label="Log out" onClick={logout}><LogOut size={17}/></button></div>
    </aside>
    {mobileNav&&<button className="mobile-scrim" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}
    <main className="main-panel">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open menu" onClick={()=>setMobileNav(true)}><Menu size={21}/></button>
        <div className="breadcrumb"><span>My workspace</span><span className="crumb-slash">/</span><b>{active}</b></div>
        <div className="topbar-right"><span className="today-chip"><span className="live-dot"/>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><button className="avatar top-avatar" onClick={()=>setProfileOpen(v=>!v)} title="Account">{(auth.user?.name||"Y").slice(0,1).toUpperCase()}</button></div>
      </header>
      <div className="content-scroll">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> {greeting().toUpperCase()}, {auth.user?.name?.split(" ")[0]?.toUpperCase() || "THERE"}</div><h1>{pageTitle}</h1><p className="page-subtitle">{subtitle}</p></div><button className="button button-dark add-main" onClick={()=>setModal({})}><Plus size={18}/> New task</button></section>
        <section className="stats-grid">
          <article className="stat-card stat-highlight"><div className="stat-top"><span>Still to do</span><span className="stat-icon"><ListTodo size={17}/></span></div><div className="stat-number">{stats.open}<span> tasks</span></div><div className="stat-foot"><span className="stat-dot orange-dot"/> A fresh chance to make progress</div></article>
          <article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green-icon"><Check size={17}/></span></div><div className="stat-number">{stats.done}<span> tasks</span></div><div className="stat-foot"><span className="stat-dot green-dot"/> Every little win adds up</div></article>
          <article className="stat-card"><div className="stat-top"><span>Past due</span><span className="stat-icon rose-icon"><AlarmClock size={17}/></span></div><div className="stat-number">{stats.overdue.length}<span> tasks</span></div><div className="stat-foot">{stats.overdue.length?"Worth a quick look today":"You’re all caught up"}</div></article>
        </section>
        <section className="task-section">
          <div className="section-heading"><div><h2>{active==="Today"?"Your task list":active}</h2><p>{visibleTasks.length===0?"A little breathing room never hurts.":`${visibleTasks.length} ${visibleTasks.length===1?"task":"tasks"} on your list`}</p></div><div className="task-controls"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a task…" aria-label="Search tasks"/></div><select aria-label="Filter by priority" className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>
          {loadError&&<div className="error-banner">{loadError}<button onClick={()=>loadTasks(auth.token)}>Try again</button></div>}
          {loading?<div className="loading-state"><span className="spinner"/> Bringing your list together…</div>:visibleTasks.length===0?<div className="empty-state"><div className="empty-art"><ClipboardList size={29}/><Sparkles className="empty-spark" size={16}/></div><h3>{search?"No matches just yet":active==="Completed"?"Your wins will show up here":"Nothing on your plate here."}</h3><p>{search?"Try another word or clear your search.":"Add a task when you’re ready. You’ve got this."}</p>{!search&&<button className="button button-outline" onClick={()=>setModal({})}><Plus size={16}/> Add your first task</button>}</div>:<div className="task-list">{visibleTasks.map(task=><article className={`task-row ${task.completed?"task-completed":""}`} key={task._id}>
            <button className={`task-check ${task.completed?"checked":""}`} onClick={()=>toggleTask(task)} aria-label={task.completed?"Mark incomplete":"Mark complete"}>{task.completed&&<Check size={14}/>}</button>
            <div className="task-copy"><div className="task-title-line"><h3>{task.title}</h3><span className={`priority priority-${task.priority.toLowerCase()}`}><span/>{task.priority}</span></div>{task.description&&<p className="task-description">{task.description}</p>}<div className="task-meta"><span className="category-tag">{task.category}</span><span className={`due-date ${task.dueDate&&task.dueDate<today()&&!task.completed?"overdue-date":""}`}><CalendarDays size={13}/>{task.dueDate&&task.dueDate<today()&&!task.completed?"Overdue · ": ""}{dateLabel(task.dueDate)}</span></div></div>
            <div className="task-actions"><button className="icon-button" aria-label="Edit task" title="Edit task" onClick={()=>setModal(task)}><Pencil size={15}/></button><button className="icon-button delete-action" aria-label="Delete task" title="Delete task" onClick={()=>deleteTask(task)}><Trash2 size={15}/></button></div>
          </article>)}</div>}
          {visibleTasks.length>0&&<button className="add-inline" onClick={()=>setModal({})}><Plus size={16}/> Add another task</button>}
        </section>
        <footer className="page-footer"><span>Made for real life, not perfect productivity.</span><span><span className="footer-heart">✳</span> Take it one thing at a time.</span></footer>
      </div>
    </main>
    {modal&&<TaskModal task={modal._id?modal:null} onClose={()=>setModal(null)} onSave={saveTask} saving={saving}/>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

export default App;
