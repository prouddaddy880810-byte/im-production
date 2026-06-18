import { useState, useRef, useEffect } from "react";

const DEPARTMENTS = [
  {
    id: "weld-down", name: "Welding", location: "Downstairs", supervisor: "Dave Murphy", color: "#f97316",
    staff: [
      { id: "wd-1", name: "", position: "Welder" },
      { id: "wd-2", name: "", position: "Welder" },
      { id: "wd-3", name: "", position: "Welder" },
      { id: "wd-4", name: "", position: "Welder Helper" },
    ]
  },
  {
    id: "weld-up", name: "Welding / Robotic", location: "Upstairs", supervisor: "Mitch", color: "#a855f7",
    staff: [
      { id: "wu-1", name: "", position: "Robotic Weld Operator" },
      { id: "wu-2", name: "", position: "Welder" },
      { id: "wu-3", name: "", position: "Welder" },
    ]
  },
  {
    id: "tube-laser", name: "Tube Laser", location: "Tube Laser Bldg", supervisor: "Spencer", color: "#06b6d4",
    staff: [
      { id: "tl-1", name: "", position: "Laser Operator" },
      { id: "tl-2", name: "", position: "Laser Operator" },
      { id: "tl-3", name: "", position: "Material Handler" },
    ]
  },
  {
    id: "cutting", name: "Cutting / Brake Press", location: "New Building", supervisor: "Charley Pipe", color: "#10b981",
    staff: [
      { id: "cb-1", name: "", position: "Laser Operator" },
      { id: "cb-2", name: "", position: "Brake Press Operator" },
      { id: "cb-3", name: "", position: "Brake Press Operator" },
      { id: "cb-4", name: "", position: "Material Handler" },
    ]
  },
  {
    id: "shipping", name: "Shipping", location: "—", supervisor: "Jake Stanton", color: "#3b82f6",
    staff: [
      { id: "sh-1", name: "", position: "Shipping Coordinator" },
      { id: "sh-2", name: "", position: "Receiver" },
      { id: "sh-3", name: "", position: "Forklift Operator" },
    ]
  },
  {
    id: "powder", name: "Powder Coat", location: "—", supervisor: "Tom Ebling", color: "#ec4899",
    staff: [
      { id: "pc-1", name: "", position: "Powder Coat Operator" },
      { id: "pc-2", name: "", position: "Powder Coat Operator" },
      { id: "pc-3", name: "", position: "Masking / Prep" },
    ]
  },
  {
    id: "saws", name: "Saws", location: "—", supervisor: "Don", color: "#eab308",
    staff: [
      { id: "sw-1", name: "", position: "Saw Operator" },
      { id: "sw-2", name: "", position: "Saw Operator" },
    ]
  },
  {
    id: "material", name: "Material Handling", location: "—", supervisor: "TBD", color: "#64748b",
    staff: [
      { id: "mh-1", name: "", position: "Material Handler" },
      { id: "mh-2", name: "", position: "Material Handler" },
      { id: "mh-3", name: "", position: "Forklift Operator" },
    ]
  },
  {
    id: "programming", name: "Programming", location: "Office", supervisor: "TBD", color: "#6366f1",
    staff: [
      { id: "pg-1", name: "", position: "CNC Programmer" },
      { id: "pg-2", name: "", position: "CNC Programmer" },
      { id: "pg-3", name: "", position: "Estimator / CAD" },
    ]
  },
];

const STATUS_OPTIONS = ["Running", "Idle", "Down", "Maintenance"];
const JOB_STATUS = ["Queued", "In Progress", "On Hold", "Complete"];
const PRIORITY = ["Low", "Normal", "High", "Critical"];

const statusColor = s => ({ Running: "#10b981", Idle: "#eab308", Down: "#ef4444", Maintenance: "#f97316" }[s] || "#64748b");
const priorityColor = p => ({ Low: "#64748b", Normal: "#3b82f6", High: "#f97316", Critical: "#ef4444" }[p]);

const initDeptStatus = () => Object.fromEntries(DEPARTMENTS.map(d => [d.id, { status: "Running", note: "" }]));
const initStaff = () => Object.fromEntries(DEPARTMENTS.map(d => [d.id, d.staff.map(s => ({ ...s }))]));

const initJobs = () => [
  { id: "J-1001", part: "Bracket Assembly", dept: "weld-down", operator: "Welder 1", status: "In Progress", priority: "High", due: "2026-06-13", estHours: 8, loggedHours: 5, note: "" },
  { id: "J-1002", part: "Tube Frame", dept: "tube-laser", operator: "Laser Op 1", status: "Queued", priority: "Normal", due: "2026-06-16", estHours: 4, loggedHours: 0, note: "" },
  { id: "J-1003", part: "Powder Batch #7", dept: "powder", operator: "PC Op 1", status: "In Progress", priority: "Normal", due: "2026-06-12", estHours: 6, loggedHours: 4, note: "" },
  { id: "J-1004", part: "Steel Cut Order", dept: "cutting", operator: "Laser Op 2", status: "Queued", priority: "Critical", due: "2026-06-13", estHours: 3, loggedHours: 0, note: "" },
  { id: "J-1005", part: "Saw Stock Prep", dept: "saws", operator: "Saw Op 1", status: "In Progress", priority: "Low", due: "2026-06-15", estHours: 2, loggedHours: 1, note: "" },
];

export default function App() {
  const [tab, setTab] = useState("board");
  const [deptStatus, setDeptStatus] = useState(initDeptStatus);
  const [staffData, setStaffData] = useState(initStaff);
  const [jobs, setJobs] = useState(initJobs);
  const [downtime, setDowntime] = useState([]);
  const [flags, setFlags] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showDowntimeForm, setShowDowntimeForm] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [newJob, setNewJob] = useState({ part: "", dept: DEPARTMENTS[0].id, operator: "", status: "Queued", priority: "Normal", due: "", estHours: "", loggedHours: 0, note: "" });
  const [newDowntime, setNewDowntime] = useState({ dept: DEPARTMENTS[0].id, machine: "", reason: "", note: "" });
  const [newFlag, setNewFlag] = useState({ dept: DEPARTMENTS[0].id, message: "" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  // Meeting recorder state
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const activeJobs = jobs.filter(j => j.status !== "Complete");
  const downDepts = Object.values(deptStatus).filter(d => d.status === "Down").length;
  const openFlags = flags.filter(f => !f.resolved).length;
  const completedCount = jobs.filter(j => j.status === "Complete").length;
  const getDept = id => DEPARTMENTS.find(d => d.id === id);

  // ── JOBS ──
  const addJob = () => {
    if (!newJob.part || !newJob.operator) return;
    const id = "J-" + (1100 + jobs.length);
    setJobs([...jobs, { ...newJob, id, estHours: parseFloat(newJob.estHours) || 0, loggedHours: 0 }]);
    setNewJob({ part: "", dept: DEPARTMENTS[0].id, operator: "", status: "Queued", priority: "Normal", due: "", estHours: "", loggedHours: 0, note: "" });
    setShowJobForm(false);
  };
  const updateJobStatus = (id, status) => setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  const logHours = (id, h) => setJobs(jobs.map(j => j.id === id ? { ...j, loggedHours: Math.max(0, (j.loggedHours || 0) + h) } : j));

  // ── DOWNTIME ──
  const addDowntime = () => {
    if (!newDowntime.machine || !newDowntime.reason) return;
    setDowntime([{ ...newDowntime, id: Date.now(), ts: new Date().toLocaleString(), resolved: false }, ...downtime]);
    setDeptStatus(prev => ({ ...prev, [newDowntime.dept]: { ...prev[newDowntime.dept], status: "Down" } }));
    setNewDowntime({ dept: DEPARTMENTS[0].id, machine: "", reason: "", note: "" });
    setShowDowntimeForm(false);
  };
  const resolveDowntime = id => {
    const dt = downtime.find(d => d.id === id);
    setDowntime(downtime.map(d => d.id === id ? { ...d, resolved: true } : d));
    if (dt) setDeptStatus(prev => ({ ...prev, [dt.dept]: { ...prev[dt.dept], status: "Running" } }));
  };

  // ── FLAGS ──
  const addFlag = () => {
    if (!newFlag.message) return;
    setFlags([{ ...newFlag, id: Date.now(), ts: new Date().toLocaleString(), resolved: false }, ...flags]);
    setNewFlag({ dept: DEPARTMENTS[0].id, message: "" });
    setShowFlagForm(false);
  };
  const resolveFlag = id => setFlags(flags.map(f => f.id === id ? { ...f, resolved: true } : f));

  // ── STAFF ──
  const updateStaff = (deptId, staffId, field, val) => {
    setStaffData(prev => ({
      ...prev,
      [deptId]: prev[deptId].map(s => s.id === staffId ? { ...s, [field]: val } : s)
    }));
  };

  // ── RECORDER ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(1000);
      mediaRecRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch (e) {
      alert("Microphone access denied. Allow mic in browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current) mediaRecRef.current.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const processRecording = async () => {
    if (!audioBlob) return;
    setTranscribing(true);
    const title = meetingTitle || `Meeting ${new Date().toLocaleDateString()}`;

    // Convert blob to base64 for Claude
    const toBase64 = blob => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.readAsDataURL(blob);
    });

    try {
      const b64 = await toBase64(audioBlob);

      // Send audio to Claude for transcription + analysis
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are a meeting intelligence AI for I&M Machine & Fabrication Corp. 
You receive audio from production/management meetings. Your job is to:
1. Provide a clean transcript (best effort from audio)
2. Write a concise summary (3-5 bullets)
3. Extract action items in format: "WHO — WHAT — BY WHEN (if stated)"
4. Flag any mentions of: equipment issues, job delays, personnel issues, safety concerns

Format your response EXACTLY as:
TRANSCRIPT:
[transcript here]

SUMMARY:
• [bullet]

ACTION ITEMS:
• [person] — [task] — [deadline or "no deadline given"]

FLAGS:
• [any critical mentions]`,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Please transcribe and analyze this meeting recording from I&M Machine & Fabrication." },
              { type: "document", source: { type: "base64", media_type: "audio/webm", data: b64 } }
            ]
          }]
        })
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";

      // Parse sections
      const getSection = (label, next) => {
        const start = text.indexOf(label + ":");
        if (start === -1) return "";
        const end = next ? text.indexOf(next + ":") : text.length;
        return text.slice(start + label.length + 1, end === -1 ? text.length : end).trim();
      };

      const transcript = getSection("TRANSCRIPT", "SUMMARY");
      const summary = getSection("SUMMARY", "ACTION ITEMS");
      const actions = getSection("ACTION ITEMS", "FLAGS");
      const flagsText = getSection("FLAGS", null);

      const meeting = {
        id: Date.now(),
        title,
        ts: new Date().toLocaleString(),
        duration: fmtTime(recSeconds),
        transcript,
        summary,
        actions,
        flags: flagsText,
        raw: text,
      };

      setMeetings(prev => [meeting, ...prev]);
      setSelectedMeeting(meeting);
      setAudioBlob(null);
      setMeetingTitle("");
      setRecSeconds(0);
    } catch (e) {
      // Fallback: save with error note
      const meeting = {
        id: Date.now(),
        title,
        ts: new Date().toLocaleString(),
        duration: fmtTime(recSeconds),
        transcript: "Audio processing error — Claude API may not support audio directly. Try uploading as file.",
        summary: "",
        actions: "",
        flags: "",
        raw: "",
      };
      setMeetings(prev => [meeting, ...prev]);
      setSelectedMeeting(meeting);
      setAudioBlob(null);
      setMeetingTitle("");
    }
    setTranscribing(false);
  };

  // ── AI INSIGHT ──
  const getAiInsight = async () => {
    setAiLoading(true);
    setAiInsight("");
    const summary = {
      departments: DEPARTMENTS.map(d => ({ name: d.name, supervisor: d.supervisor, status: deptStatus[d.id]?.status })),
      activeJobs: activeJobs.map(j => ({ id: j.id, part: j.part, dept: getDept(j.dept)?.name, status: j.status, priority: j.priority, due: j.due, progress: j.estHours > 0 ? Math.round((j.loggedHours / j.estHours) * 100) + "%" : "unknown" })),
      openDowntime: downtime.filter(d => !d.resolved).map(d => ({ dept: getDept(d.dept)?.name, machine: d.machine, reason: d.reason })),
      openFlags: flags.filter(f => !f.resolved).map(f => ({ dept: getDept(f.dept)?.name, message: f.message })),
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "You are a production management AI for I&M Machine & Fabrication Corp, St. Joseph MO — a metal fab and machining shop. Analyze floor data and give a direct insight report. Use bullet points. Cover: bottlenecks, at-risk jobs, department concerns, 2-3 specific action recommendations. Be direct. Format: STATUS SUMMARY / RISKS / RECOMMENDED ACTIONS.",
          messages: [{ role: "user", content: `Current floor data:\n${JSON.stringify(summary, null, 2)}\n\nGive me a production manager report.` }],
        }),
      });
      const data = await res.json();
      setAiInsight(data.content?.[0]?.text || "No insight returned.");
    } catch { setAiInsight("Error reaching AI."); }
    setAiLoading(false);
  };

  // ── FORECAST helpers ──
  const getForecastStatus = job => {
    if (job.status === "Complete") return "complete";
    if (!job.due) return "no-date";
    const daysLeft = Math.ceil((new Date(job.due) - new Date()) / 86400000);
    const pct = job.estHours > 0 ? job.loggedHours / job.estHours : 0;
    if (daysLeft < 0) return "overdue";
    if (daysLeft <= 1 && pct < 0.8) return "at-risk";
    if (daysLeft <= 3 && pct < 0.5) return "watch";
    return "on-track";
  };
  const forecastColor = s => ({ complete: "#10b981", "on-track": "#3b82f6", watch: "#eab308", "at-risk": "#f97316", overdue: "#ef4444", "no-date": "#64748b" }[s]);
  const forecastLabel = s => ({ complete: "Complete", "on-track": "On Track", watch: "Watch", "at-risk": "At Risk", overdue: "Overdue", "no-date": "No Date" }[s]);

  const now = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#0a0c10;}
    .app{min-height:100vh;background:#0a0c10;color:#e2e8f0;font-family:'IBM Plex Sans',sans-serif;}
    .header{background:#0f1319;border-bottom:1px solid #1e2530;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;}
    .logo{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#64748b;letter-spacing:.12em;text-transform:uppercase;}
    .logo span{color:#f97316;font-weight:600;}
    .badge{background:#1e2530;border:1px solid #2d3748;border-radius:4px;padding:4px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#94a3b8;}
    .nav{display:flex;gap:2px;background:#0f1319;border-bottom:1px solid #1e2530;padding:0 24px;overflow-x:auto;}
    .nav-btn{background:none;border:none;color:#64748b;padding:12px 14px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;}
    .nav-btn.active{color:#f97316;border-bottom-color:#f97316;}
    .nav-btn:hover:not(.active){color:#94a3b8;}
    .content{padding:20px 24px;max-width:1400px;}
    .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
    .stat{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:16px 20px;}
    .stat-val{font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:600;line-height:1;}
    .stat-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;margin-top:6px;}
    .sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .sec-title{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;}
    .btn{background:#1e2530;border:1px solid #2d3748;color:#94a3b8;padding:7px 14px;border-radius:4px;font-size:12px;font-family:'IBM Plex Sans',sans-serif;cursor:pointer;transition:all .15s;}
    .btn:hover{background:#2d3748;color:#e2e8f0;}
    .btn-primary{background:#f97316;border-color:#f97316;color:#0a0c10;font-weight:600;}
    .btn-primary:hover{background:#ea6c0a;color:#0a0c10;}
    .btn-sm{padding:4px 10px;font-size:11px;}
    .btn-danger{background:#ef444422;border-color:#ef4444;color:#ef4444;}
    .btn-danger:hover{background:#ef444444;}
    .btn-success{background:#10b98122;border-color:#10b981;color:#10b981;}
    .dept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
    .dept-card{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:14px 16px;position:relative;overflow:hidden;cursor:pointer;transition:border-color .15s;}
    .dept-card:hover{border-color:#2d3748;}
    .dept-card.expanded{border-color:#2d3748;}
    .dept-accent{position:absolute;left:0;top:0;bottom:0;width:3px;}
    .dept-name{font-weight:600;font-size:13px;margin-bottom:2px;padding-left:10px;}
    .dept-sup{font-size:11px;color:#64748b;padding-left:10px;margin-bottom:6px;}
    .dept-loc{font-size:10px;color:#475569;font-family:'IBM Plex Mono',monospace;}
    .status-row{display:flex;align-items:center;gap:8px;padding-left:10px;margin-bottom:8px;}
    .status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
    .status-select{background:#1e2530;border:1px solid #2d3748;color:#94a3b8;padding:4px 8px;border-radius:4px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer;width:calc(100% - 10px);margin-left:10px;}
    .staff-section{margin-top:12px;padding-top:12px;border-top:1px solid #1e2530;padding-left:10px;}
    .staff-title{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;}
    .staff-row{display:flex;align-items:center;gap:6px;margin-bottom:6px;}
    .staff-pos{font-size:11px;color:#64748b;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .staff-input{background:#131820;border:1px solid #1e2530;color:#e2e8f0;padding:3px 7px;border-radius:3px;font-size:11px;font-family:'IBM Plex Sans',sans-serif;flex:1.2;outline:none;min-width:0;}
    .staff-input:focus{border-color:#f97316;}
    .job-table{background:#0f1319;border:1px solid #1e2530;border-radius:6px;overflow:hidden;margin-bottom:20px;}
    .job-table table{width:100%;border-collapse:collapse;}
    .job-table th{background:#131820;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;padding:10px 14px;text-align:left;border-bottom:1px solid #1e2530;}
    .job-table td{padding:10px 14px;font-size:13px;border-bottom:1px solid #131820;vertical-align:middle;}
    .job-table tr:last-child td{border-bottom:none;}
    .job-table tr:hover td{background:#131820;cursor:pointer;}
    .pill{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-family:'IBM Plex Mono',monospace;font-weight:600;letter-spacing:.05em;}
    .mono{font-family:'IBM Plex Mono',monospace;font-size:12px;}
    .progress-bar{background:#1e2530;border-radius:2px;height:4px;width:80px;overflow:hidden;display:inline-block;vertical-align:middle;}
    .progress-fill{height:100%;border-radius:2px;transition:width .3s;}
    .form-panel{background:#0f1319;border:1px solid #2d3748;border-radius:6px;padding:20px;margin-bottom:20px;}
    .form-title{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#f97316;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
    .form-group{display:flex;flex-direction:column;gap:4px;}
    .form-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-family:'IBM Plex Mono',monospace;}
    .form-input{background:#131820;border:1px solid #2d3748;color:#e2e8f0;padding:8px 10px;border-radius:4px;font-size:13px;font-family:'IBM Plex Sans',sans-serif;outline:none;}
    .form-input:focus{border-color:#f97316;}
    .form-select{background:#131820;border:1px solid #2d3748;color:#e2e8f0;padding:8px 10px;border-radius:4px;font-size:13px;font-family:'IBM Plex Sans',sans-serif;outline:none;cursor:pointer;}
    .form-actions{display:flex;gap:8px;margin-top:4px;}
    .flag-list,.dt-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
    .flag-card{background:#0f1319;border:1px solid #2d3748;border-left:3px solid #ef4444;border-radius:6px;padding:12px 16px;display:flex;align-items:flex-start;justify-content:space-between;}
    .flag-card.resolved{border-left-color:#1e2530;opacity:.5;}
    .dt-card{background:#0f1319;border:1px solid #1e2530;border-left:3px solid #ef4444;border-radius:6px;padding:12px 16px;display:flex;justify-content:space-between;align-items:flex-start;}
    .dt-card.resolved{border-left-color:#10b981;opacity:.6;}
    .ai-panel{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:20px;}
    .ai-output{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#94a3b8;line-height:1.8;white-space:pre-wrap;margin-top:16px;border-top:1px solid #1e2530;padding-top:16px;}
    .pulse{animation:pulse 1.5s ease-in-out infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
    .modal{background:#0f1319;border:1px solid #2d3748;border-radius:8px;padding:24px;min-width:380px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;}
    .modal-title{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#f97316;margin-bottom:16px;}
    .modal-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1e2530;font-size:13px;}
    .modal-row:last-of-type{border-bottom:none;}
    .modal-key{color:#64748b;font-size:11px;text-transform:uppercase;font-family:'IBM Plex Mono',monospace;}
    .modal-actions{display:flex;gap:8px;margin-top:16px;}
    .rec-panel{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:24px;margin-bottom:20px;text-align:center;}
    .rec-timer{font-family:'IBM Plex Mono',monospace;font-size:48px;font-weight:600;color:#e2e8f0;line-height:1;margin:16px 0;}
    .rec-timer.active{color:#ef4444;}
    .rec-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;margin-right:8px;animation:pulse 1s ease-in-out infinite;}
    .meeting-card{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border-color .15s;}
    .meeting-card:hover{border-color:#2d3748;}
    .forecast-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;}
    .forecast-card{background:#0f1319;border:1px solid #1e2530;border-radius:6px;padding:16px;}
    .forecast-bar-wrap{background:#1e2530;border-radius:3px;height:6px;margin:8px 0;overflow:hidden;}
    .forecast-bar{height:100%;border-radius:3px;transition:width .5s;}
    .section-divider{height:1px;background:#1e2530;margin:20px 0;}
    select option{background:#131820;}
  `;

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* HEADER */}
        <div className="header">
          <div className="logo"><span>I&M</span> · Production Command</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="badge">{now}</div>
            {openFlags > 0 && <div className="badge" style={{ borderColor: "#ef4444", color: "#ef4444" }}>⚑ {openFlags} FLAG{openFlags > 1 ? "S" : ""}</div>}
            {downDepts > 0 && <div className="badge" style={{ borderColor: "#ef4444", color: "#ef4444" }}>▼ {downDepts} DOWN</div>}
          </div>
        </div>

        {/* NAV */}
        <div className="nav">
          {[["board","Floor Board"],["jobs","Job Board"],["forecast","Forecast"],["downtime","Downtime"],["flags","Flags"],["meetings","Meetings"],["ai","AI Insight"]].map(([t, label]) => (
            <button key={t} className={`nav-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        <div className="content">

          {/* STATS */}
          <div className="stat-row">
            <div className="stat"><div className="stat-val" style={{ color: "#3b82f6" }}>{activeJobs.length}</div><div className="stat-label">Active Jobs</div></div>
            <div className="stat"><div className="stat-val" style={{ color: downDepts > 0 ? "#ef4444" : "#10b981" }}>{downDepts}</div><div className="stat-label">Depts Down</div></div>
            <div className="stat"><div className="stat-val" style={{ color: openFlags > 0 ? "#f97316" : "#10b981" }}>{openFlags}</div><div className="stat-label">Open Flags</div></div>
            <div className="stat"><div className="stat-val" style={{ color: "#10b981" }}>{completedCount}</div><div className="stat-label">Completed</div></div>
          </div>

          {/* ── FLOOR BOARD ── */}
          {tab === "board" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Department Status — click to expand staff</div>
                <button className="btn btn-sm" onClick={() => setShowFlagForm(!showFlagForm)}>+ Raise Flag</button>
              </div>
              {showFlagForm && (
                <div className="form-panel">
                  <div className="form-title">Raise Flag</div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Department</label>
                      <select className="form-select" value={newFlag.dept} onChange={e => setNewFlag({ ...newFlag, dept: e.target.value })}>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label">Issue</label>
                      <input className="form-input" placeholder="Describe the issue..." value={newFlag.message} onChange={e => setNewFlag({ ...newFlag, message: e.target.value })} /></div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary btn-sm" onClick={addFlag}>Submit Flag</button>
                    <button className="btn btn-sm" onClick={() => setShowFlagForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="dept-grid">
                {DEPARTMENTS.map(dept => {
                  const ds = deptStatus[dept.id];
                  const deptJobs = activeJobs.filter(j => j.dept === dept.id);
                  const isExpanded = expandedDept === dept.id;
                  const staff = staffData[dept.id] || [];
                  return (
                    <div key={dept.id} className={`dept-card${isExpanded ? " expanded" : ""}`}
                      onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                      style={{ borderLeftColor: dept.color }}>
                      <div className="dept-accent" style={{ background: dept.color }} />
                      <div className="dept-name">{dept.name}</div>
                      <div className="dept-sup">{dept.supervisor} <span className="dept-loc">· {dept.location}</span></div>
                      <div className="status-row">
                        <span className="status-dot" style={{ background: statusColor(ds.status) }} />
                        <span style={{ fontSize: 12, color: statusColor(ds.status), fontFamily: "'IBM Plex Mono',monospace" }}>{ds.status}</span>
                        {deptJobs.length > 0 && <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{deptJobs.length} job{deptJobs.length > 1 ? "s" : ""}</span>}
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                      <select className="status-select" value={ds.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); setDeptStatus(prev => ({ ...prev, [dept.id]: { ...prev[dept.id], status: e.target.value } })); }}>
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      {isExpanded && (
                        <div className="staff-section" onClick={e => e.stopPropagation()}>
                          <div className="staff-title">Staff / Positions</div>
                          {staff.map(s => (
                            <div key={s.id} className="staff-row">
                              <span className="staff-pos">{s.position}</span>
                              <input className="staff-input" placeholder="Name..." value={s.name}
                                onChange={e => updateStaff(dept.id, s.id, "name", e.target.value)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {flags.filter(f => !f.resolved).length > 0 && (
                <>
                  <div className="sec-hdr"><div className="sec-title" style={{ color: "#ef4444" }}>⚑ Open Flags</div></div>
                  <div className="flag-list">
                    {flags.filter(f => !f.resolved).slice(0, 3).map(f => (
                      <div key={f.id} className="flag-card">
                        <div>
                          <div style={{ fontSize: 12, color: getDept(f.dept)?.color, marginBottom: 4 }}>{getDept(f.dept)?.name} · {getDept(f.dept)?.supervisor}</div>
                          <div style={{ fontSize: 13 }}>{f.message}</div>
                          <div style={{ fontSize: 10, color: "#475569", marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{f.ts}</div>
                        </div>
                        <button className="btn btn-sm btn-success" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => resolveFlag(f.id)}>Resolve</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── JOB BOARD ── */}
          {tab === "jobs" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Active Jobs — {activeJobs.length} Open</div>
                <button className="btn btn-sm btn-primary" onClick={() => setShowJobForm(!showJobForm)}>+ Add Job</button>
              </div>
              {showJobForm && (
                <div className="form-panel">
                  <div className="form-title">New Job</div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Part / Description</label>
                      <input className="form-input" placeholder="e.g. Bracket Assembly" value={newJob.part} onChange={e => setNewJob({ ...newJob, part: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Department</label>
                      <select className="form-select" value={newJob.dept} onChange={e => setNewJob({ ...newJob, dept: e.target.value })}>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}
                      </select></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Operator</label>
                      <input className="form-input" placeholder="Name" value={newJob.operator} onChange={e => setNewJob({ ...newJob, operator: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Due Date</label>
                      <input className="form-input" type="date" value={newJob.due} onChange={e => setNewJob({ ...newJob, due: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Priority</label>
                      <select className="form-select" value={newJob.priority} onChange={e => setNewJob({ ...newJob, priority: e.target.value })}>
                        {PRIORITY.map(p => <option key={p}>{p}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label">Est. Hours</label>
                      <input className="form-input" type="number" placeholder="0" value={newJob.estHours} onChange={e => setNewJob({ ...newJob, estHours: e.target.value })} /></div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary btn-sm" onClick={addJob}>Add Job</button>
                    <button className="btn btn-sm" onClick={() => setShowJobForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="job-table">
                <table>
                  <thead><tr>
                    <th>Job #</th><th>Part</th><th>Department</th><th>Operator</th>
                    <th>Priority</th><th>Progress</th><th>Status</th><th>Due</th>
                  </tr></thead>
                  <tbody>
                    {jobs.map(j => {
                      const dept = getDept(j.dept);
                      const pct = j.estHours > 0 ? Math.min(1, j.loggedHours / j.estHours) : 0;
                      return (
                        <tr key={j.id} onClick={() => setSelectedJob(j)}>
                          <td className="mono" style={{ color: "#64748b" }}>{j.id}</td>
                          <td style={{ fontWeight: 500 }}>{j.part}</td>
                          <td><span style={{ color: dept?.color, fontSize: 12 }}>■</span><span style={{ marginLeft: 6, fontSize: 12 }}>{dept?.name}</span></td>
                          <td style={{ fontSize: 12, color: "#94a3b8" }}>{j.operator}</td>
                          <td><span className="pill" style={{ background: priorityColor(j.priority) + "22", color: priorityColor(j.priority) }}>{j.priority}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div className="progress-bar"><div className="progress-fill" style={{ width: pct * 100 + "%", background: pct >= 1 ? "#10b981" : "#3b82f6" }} /></div>
                              <span className="mono" style={{ fontSize: 10, color: "#64748b" }}>{Math.round(pct * 100)}%</span>
                            </div>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <select className="status-select" style={{ width: "auto" }} value={j.status}
                              onChange={e => updateJobStatus(j.id, e.target.value)}>
                              {JOB_STATUS.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="mono" style={{ fontSize: 11, color: "#64748b" }}>{j.due || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── FORECAST ── */}
          {tab === "forecast" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Project Forecast</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["on-track","On Track"],["watch","Watch"],["at-risk","At Risk"],["overdue","Overdue"]].map(([s, l]) => (
                    <span key={s} className="pill" style={{ background: forecastColor(s) + "22", color: forecastColor(s) }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Summary bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
                {[["overdue","Overdue"],["at-risk","At Risk"],["watch","Watch"],["on-track","On Track"],["complete","Complete"]].map(([s, l]) => {
                  const count = jobs.filter(j => getForecastStatus(j) === s).length;
                  return (
                    <div key={s} className="stat" style={{ borderLeftColor: forecastColor(s), borderLeftWidth: 3 }}>
                      <div className="stat-val" style={{ color: forecastColor(s), fontSize: 22 }}>{count}</div>
                      <div className="stat-label">{l}</div>
                    </div>
                  );
                })}
              </div>

              <div className="forecast-grid">
                {jobs.map(j => {
                  const dept = getDept(j.dept);
                  const fs = getForecastStatus(j);
                  const pct = j.estHours > 0 ? Math.min(1, j.loggedHours / j.estHours) : 0;
                  const daysLeft = j.due ? Math.ceil((new Date(j.due) - new Date()) / 86400000) : null;
                  return (
                    <div key={j.id} className="forecast-card" style={{ borderLeftColor: forecastColor(fs), borderLeftWidth: 3 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{j.part}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{j.id} · <span style={{ color: dept?.color }}>{dept?.name}</span></div>
                        </div>
                        <span className="pill" style={{ background: forecastColor(fs) + "22", color: forecastColor(fs), flexShrink: 0 }}>{forecastLabel(fs)}</span>
                      </div>
                      <div className="forecast-bar-wrap">
                        <div className="forecast-bar" style={{ width: pct * 100 + "%", background: forecastColor(fs) }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        <span>{Math.round(pct * 100)}% complete · {j.loggedHours}h / {j.estHours}h est</span>
                        <span style={{ color: daysLeft !== null && daysLeft < 0 ? "#ef4444" : "#64748b" }}>
                          {daysLeft === null ? "No date" : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Log hours:</span>
                        {[1, 2, 4].map(h => (
                          <button key={h} className="btn btn-sm" style={{ padding: "2px 8px", fontSize: 10 }}
                            onClick={() => logHours(j.id, h)}>+{h}h</button>
                        ))}
                        <select className="status-select" style={{ width: "auto", marginLeft: "auto", fontSize: 11 }} value={j.status}
                          onChange={e => updateJobStatus(j.id, e.target.value)}>
                          {JOB_STATUS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── DOWNTIME ── */}
          {tab === "downtime" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Downtime Log</div>
                <button className="btn btn-sm btn-danger" onClick={() => setShowDowntimeForm(!showDowntimeForm)}>+ Log Downtime</button>
              </div>
              {showDowntimeForm && (
                <div className="form-panel">
                  <div className="form-title">Log Downtime Event</div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Department</label>
                      <select className="form-select" value={newDowntime.dept} onChange={e => setNewDowntime({ ...newDowntime, dept: e.target.value })}>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label">Machine / Asset</label>
                      <input className="form-input" placeholder="e.g. Fiber Laser #1" value={newDowntime.machine} onChange={e => setNewDowntime({ ...newDowntime, machine: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Reason</label>
                      <input className="form-input" placeholder="e.g. Tooling failure" value={newDowntime.reason} onChange={e => setNewDowntime({ ...newDowntime, reason: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Note</label>
                      <input className="form-input" placeholder="Optional" value={newDowntime.note} onChange={e => setNewDowntime({ ...newDowntime, note: e.target.value })} /></div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-sm btn-danger" onClick={addDowntime}>Log Event</button>
                    <button className="btn btn-sm" onClick={() => setShowDowntimeForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="dt-list">
                {downtime.length === 0 && <div style={{ color: "#475569", fontSize: 13, padding: "20px 0" }}>No downtime events logged.</div>}
                {downtime.map(d => {
                  const dept = getDept(d.dept);
                  return (
                    <div key={d.id} className={`dt-card${d.resolved ? " resolved" : ""}`}>
                      <div>
                        <div style={{ fontSize: 12, color: dept?.color, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{dept?.name} · {dept?.supervisor}</div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{d.machine}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{d.reason}</div>
                        {d.note && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{d.note}</div>}
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 6, fontFamily: "'IBM Plex Mono',monospace" }}>{d.ts}</div>
                      </div>
                      {!d.resolved
                        ? <button className="btn btn-sm btn-success" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => resolveDowntime(d.id)}>Resolved</button>
                        : <span className="pill" style={{ background: "#10b98122", color: "#10b981", flexShrink: 0 }}>Resolved</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── FLAGS ── */}
          {tab === "flags" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Flags — {openFlags} Open</div>
                <button className="btn btn-sm btn-danger" onClick={() => setShowFlagForm(!showFlagForm)}>+ Raise Flag</button>
              </div>
              {showFlagForm && (
                <div className="form-panel">
                  <div className="form-title">Raise Flag</div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Department</label>
                      <select className="form-select" value={newFlag.dept} onChange={e => setNewFlag({ ...newFlag, dept: e.target.value })}>
                        {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label">Issue</label>
                      <input className="form-input" placeholder="Describe the issue..." value={newFlag.message} onChange={e => setNewFlag({ ...newFlag, message: e.target.value })} /></div>
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-primary btn-sm" onClick={addFlag}>Submit</button>
                    <button className="btn btn-sm" onClick={() => setShowFlagForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="flag-list">
                {flags.length === 0 && <div style={{ color: "#475569", fontSize: 13, padding: "20px 0" }}>No flags raised.</div>}
                {flags.map(f => {
                  const dept = getDept(f.dept);
                  return (
                    <div key={f.id} className={`flag-card${f.resolved ? " resolved" : ""}`}>
                      <div>
                        <div style={{ fontSize: 12, color: dept?.color, marginBottom: 4 }}>{dept?.name} · {dept?.supervisor}</div>
                        <div style={{ fontSize: 13 }}>{f.message}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{f.ts}</div>
                      </div>
                      {!f.resolved
                        ? <button className="btn btn-sm btn-success" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => resolveFlag(f.id)}>Resolve</button>
                        : <span className="pill" style={{ background: "#10b98122", color: "#10b981", flexShrink: 0, marginLeft: 12 }}>Resolved</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── MEETINGS ── */}
          {tab === "meetings" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">Meeting Recorder</div>
                {meetings.length > 0 && <span style={{ fontSize: 11, color: "#64748b" }}>{meetings.length} meeting{meetings.length > 1 ? "s" : ""} logged</span>}
              </div>

              <div className="rec-panel">
                <div style={{ marginBottom: 16 }}>
                  <input className="form-input" style={{ maxWidth: 320, textAlign: "center" }}
                    placeholder="Meeting title (optional)"
                    value={meetingTitle}
                    onChange={e => setMeetingTitle(e.target.value)}
                    disabled={recording} />
                </div>
                <div className={`rec-timer${recording ? " active" : ""}`}>
                  {recording && <span className="rec-dot" />}
                  {fmtTime(recSeconds)}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
                  {recording ? "Recording in progress — capturing room audio" : audioBlob ? "Recording stopped — ready to process" : "Hit Record to start capturing the meeting"}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {!recording && !audioBlob && (
                    <button className="btn btn-danger" style={{ padding: "10px 28px", fontSize: 14 }} onClick={startRecording}>
                      ● Record
                    </button>
                  )}
                  {recording && (
                    <button className="btn" style={{ padding: "10px 28px", fontSize: 14, borderColor: "#ef4444", color: "#ef4444" }} onClick={stopRecording}>
                      ■ Stop
                    </button>
                  )}
                  {audioBlob && !transcribing && (
                    <>
                      <button className="btn btn-primary" style={{ padding: "10px 28px", fontSize: 14 }} onClick={processRecording}>
                        ✦ Transcribe + Analyze
                      </button>
                      <button className="btn btn-sm" onClick={() => { setAudioBlob(null); setRecSeconds(0); }}>Discard</button>
                    </>
                  )}
                  {transcribing && (
                    <button className="btn pulse" style={{ padding: "10px 28px", fontSize: 14 }} disabled>
                      Processing...
                    </button>
                  )}
                </div>
              </div>

              {meetings.length > 0 && (
                <>
                  <div className="sec-hdr" style={{ marginTop: 8 }}>
                    <div className="sec-title">Meeting Log</div>
                  </div>
                  {meetings.map(m => (
                    <div key={m.id} className="meeting-card" onClick={() => setSelectedMeeting(m)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'IBM Plex Mono',monospace" }}>{m.ts} · {m.duration}</div>
                        </div>
                        <span className="pill" style={{ background: "#6366f122", color: "#6366f1", flexShrink: 0 }}>View</span>
                      </div>
                      {m.summary && (
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
                          {m.summary.split("\n").slice(0, 2).join(" ")}...
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ── AI INSIGHT ── */}
          {tab === "ai" && (
            <>
              <div className="sec-hdr">
                <div className="sec-title">AI Production Insight</div>
                <button className="btn btn-primary btn-sm" onClick={getAiInsight} disabled={aiLoading}>
                  {aiLoading ? "Analyzing..." : "Run Analysis"}
                </button>
              </div>
              <div className="ai-panel">
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                  Pulls live floor data — dept status, jobs, forecast, downtime, flags — and returns a plain-English production summary with risks and recommended actions.
                </div>
                {aiLoading && <div className="ai-output pulse">Analyzing production floor data...</div>}
                {aiInsight && !aiLoading && <div className="ai-output">{aiInsight}</div>}
                {!aiInsight && !aiLoading && <div className="ai-output" style={{ color: "#2d3748" }}>// Hit "Run Analysis" to get insight on current floor status.</div>}
              </div>
            </>
          )}
        </div>

        {/* JOB DETAIL MODAL */}
        {selectedJob && (
          <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">{selectedJob.id} · {selectedJob.part}</div>
              {[
                ["Department", getDept(selectedJob.dept)?.name],
                ["Supervisor", getDept(selectedJob.dept)?.supervisor],
                ["Operator", selectedJob.operator],
                ["Priority", selectedJob.priority],
                ["Status", selectedJob.status],
                ["Due", selectedJob.due || "—"],
                ["Est. Hours", selectedJob.estHours || "—"],
                ["Logged Hours", selectedJob.loggedHours || 0],
                ["Note", selectedJob.note || "—"],
              ].map(([k, v]) => (
                <div key={k} className="modal-row">
                  <span className="modal-key">{k}</span>
                  <span style={{ fontSize: 13 }}>{v}</span>
                </div>
              ))}
              <div className="modal-actions">
                <select className="form-select" style={{ flex: 1 }} value={selectedJob.status}
                  onChange={e => { updateJobStatus(selectedJob.id, e.target.value); setSelectedJob({ ...selectedJob, status: e.target.value }); }}>
                  {JOB_STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="btn" onClick={() => setSelectedJob(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* MEETING DETAIL MODAL */}
        {selectedMeeting && (
          <div className="modal-overlay" onClick={() => setSelectedMeeting(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">{selectedMeeting.title}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'IBM Plex Mono',monospace", marginBottom: 16 }}>
                {selectedMeeting.ts} · {selectedMeeting.duration}
              </div>
              {selectedMeeting.summary && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#f97316", fontFamily: "'IBM Plex Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Summary</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedMeeting.summary}</div>
                </div>
              )}
              {selectedMeeting.actions && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#3b82f6", fontFamily: "'IBM Plex Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Action Items</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedMeeting.actions}</div>
                </div>
              )}
              {selectedMeeting.flags && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "'IBM Plex Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Flags</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedMeeting.flags}</div>
                </div>
              )}
              {selectedMeeting.transcript && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Transcript</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>{selectedMeeting.transcript}</div>
                </div>
              )}
              <div className="modal-actions">
                <button className="btn" onClick={() => setSelectedMeeting(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
