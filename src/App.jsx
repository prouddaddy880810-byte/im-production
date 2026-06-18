import { useState, useRef } from "react";

const DEPARTMENTS = [
  { id: "weld-down", name: "Welding", location: "Downstairs", supervisor: "Dave Murphy", color: "#f97316", staff: [{ id: "wd-1", name: "", position: "Welder" },{ id: "wd-2", name: "", position: "Welder" },{ id: "wd-3", name: "", position: "Welder" },{ id: "wd-4", name: "", position: "Welder Helper" }] },
  { id: "weld-up", name: "Welding / Robotic", location: "Upstairs", supervisor: "Mitch", color: "#a855f7", staff: [{ id: "wu-1", name: "", position: "Robotic Weld Operator" },{ id: "wu-2", name: "", position: "Welder" },{ id: "wu-3", name: "", position: "Welder" }] },
  { id: "tube-laser", name: "Tube Laser", location: "Tube Laser Bldg", supervisor: "Spencer", color: "#06b6d4", staff: [{ id: "tl-1", name: "", position: "Laser Operator" },{ id: "tl-2", name: "", position: "Laser Operator" },{ id: "tl-3", name: "", position: "Material Handler" }] },
  { id: "cutting", name: "Cutting / Brake Press", location: "New Building", supervisor: "Charley Pipe", color: "#10b981", staff: [{ id: "cb-1", name: "", position: "Laser Operator" },{ id: "cb-2", name: "", position: "Brake Press Operator" },{ id: "cb-3", name: "", position: "Brake Press Operator" },{ id: "cb-4", name: "", position: "Material Handler" }] },
  { id: "shipping", name: "Shipping", location: "—", supervisor: "Jake Stanton", color: "#3b82f6", staff: [{ id: "sh-1", name: "", position: "Shipping Coordinator" },{ id: "sh-2", name: "", position: "Receiver" },{ id: "sh-3", name: "", position: "Forklift Operator" }] },
  { id: "powder", name: "Powder Coat", location: "—", supervisor: "Tom Ebling", color: "#ec4899", staff: [{ id: "pc-1", name: "", position: "Powder Coat Operator" },{ id: "pc-2", name: "", position: "Powder Coat Operator" },{ id: "pc-3", name: "", position: "Masking / Prep" }] },
  { id: "saws", name: "Saws", location: "—", supervisor: "Don", color: "#eab308", staff: [{ id: "sw-1", name: "", position: "Saw Operator" },{ id: "sw-2", name: "", position: "Saw Operator" }] },
  { id: "material", name: "Material Handling", location: "—", supervisor: "TBD", color: "#94a3b8", staff: [{ id: "mh-1", name: "", position: "Material Handler" },{ id: "mh-2", name: "", position: "Material Handler" },{ id: "mh-3", name: "", position: "Forklift Operator" }] },
  { id: "programming", name: "Programming", location: "Office", supervisor: "TBD", color: "#6366f1", staff: [{ id: "pg-1", name: "", position: "CNC Programmer" },{ id: "pg-2", name: "", position: "CNC Programmer" },{ id: "pg-3", name: "", position: "Estimator / CAD" }] },
];

const STATUS_OPTIONS = ["Running","Idle","Down","Maintenance"];
const JOB_STATUS = ["Queued","In Progress","On Hold","Complete"];
const PRIORITY = ["Low","Normal","High","Critical"];
const statusColor = s => ({Running:"#10b981",Idle:"#f59e0b",Down:"#ef4444",Maintenance:"#f97316"}[s]||"#94a3b8");
const priorityColor = p => ({Low:"#94a3b8",Normal:"#3b82f6",High:"#f97316",Critical:"#ef4444"}[p]);
const initDeptStatus = () => Object.fromEntries(DEPARTMENTS.map(d=>[d.id,{status:"Running"}]));
const initStaff = () => Object.fromEntries(DEPARTMENTS.map(d=>[d.id,d.staff.map(s=>({...s}))]));
const initJobs = () => [
  {id:"J-1001",part:"Bracket Assembly",dept:"weld-down",operator:"Welder 1",status:"In Progress",priority:"High",due:"2026-06-20",estHours:8,loggedHours:5,note:""},
  {id:"J-1002",part:"Tube Frame",dept:"tube-laser",operator:"Laser Op 1",status:"Queued",priority:"Normal",due:"2026-06-22",estHours:4,loggedHours:0,note:""},
  {id:"J-1003",part:"Powder Batch #7",dept:"powder",operator:"PC Op 1",status:"In Progress",priority:"Normal",due:"2026-06-18",estHours:6,loggedHours:4,note:""},
  {id:"J-1004",part:"Steel Cut Order",dept:"cutting",operator:"Laser Op 2",status:"Queued",priority:"Critical",due:"2026-06-16",estHours:3,loggedHours:0,note:""},
  {id:"J-1005",part:"Saw Stock Prep",dept:"saws",operator:"Saw Op 1",status:"In Progress",priority:"Low",due:"2026-06-19",estHours:2,loggedHours:1,note:""},
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
  const [newJob, setNewJob] = useState({part:"",dept:DEPARTMENTS[0].id,operator:"",status:"Queued",priority:"Normal",due:"",estHours:"",note:""});
  const [newDowntime, setNewDowntime] = useState({dept:DEPARTMENTS[0].id,machine:"",reason:"",note:""});
  const [newFlag, setNewFlag] = useState({dept:DEPARTMENTS[0].id,message:""});
  const [selectedJob, setSelectedJob] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  // Machine Intel
  const [machineQuery, setMachineQuery] = useState("");
  const [machineImage, setMachineImage] = useState(null);
  const [machineImageB64, setMachineImageB64] = useState(null);
  const [machineResult, setMachineResult] = useState(null);
  const [machineLoading, setMachineLoading] = useState(false);
  const [machineHistory, setMachineHistory] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const mediaRecRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeJobs = jobs.filter(j=>j.status!=="Complete");
  const downDepts = Object.values(deptStatus).filter(d=>d.status==="Down").length;
  const openFlags = flags.filter(f=>!f.resolved).length;
  const completedCount = jobs.filter(j=>j.status==="Complete").length;
  const getDept = id => DEPARTMENTS.find(d=>d.id===id);

  // Jobs
  const addJob = () => {
    if(!newJob.part||!newJob.operator) return;
    setJobs([...jobs,{...newJob,id:"J-"+(1100+jobs.length),estHours:parseFloat(newJob.estHours)||0,loggedHours:0}]);
    setNewJob({part:"",dept:DEPARTMENTS[0].id,operator:"",status:"Queued",priority:"Normal",due:"",estHours:"",note:""});
    setShowJobForm(false);
  };
  const updateJobStatus = (id,status) => setJobs(jobs.map(j=>j.id===id?{...j,status}:j));
  const logHours = (id,h) => setJobs(jobs.map(j=>j.id===id?{...j,loggedHours:Math.max(0,(j.loggedHours||0)+h)}:j));

  // Downtime
  const addDowntime = () => {
    if(!newDowntime.machine||!newDowntime.reason) return;
    setDowntime([{...newDowntime,id:Date.now(),ts:new Date().toLocaleString(),resolved:false},...downtime]);
    setDeptStatus(prev=>({...prev,[newDowntime.dept]:{status:"Down"}}));
    setNewDowntime({dept:DEPARTMENTS[0].id,machine:"",reason:"",note:""});
    setShowDowntimeForm(false);
  };
  const resolveDowntime = id => {
    const dt = downtime.find(d=>d.id===id);
    setDowntime(downtime.map(d=>d.id===id?{...d,resolved:true}:d));
    if(dt) setDeptStatus(prev=>({...prev,[dt.dept]:{status:"Running"}}));
  };

  // Flags
  const addFlag = () => {
    if(!newFlag.message) return;
    setFlags([{...newFlag,id:Date.now(),ts:new Date().toLocaleString(),resolved:false},...flags]);
    setNewFlag({dept:DEPARTMENTS[0].id,message:""});
    setShowFlagForm(false);
  };
  const resolveFlag = id => setFlags(flags.map(f=>f.id===id?{...f,resolved:true}:f));

  // Staff
  const updateStaff = (deptId,staffId,val) => setStaffData(prev=>({...prev,[deptId]:prev[deptId].map(s=>s.id===staffId?{...s,name:val}:s)}));

  // Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      chunksRef.current=[];
      const mr = new MediaRecorder(stream,{mimeType:"audio/webm"});
      mr.ondataavailable = e=>{if(e.data.size>0) chunksRef.current.push(e.data);};
      mr.onstop = ()=>{setAudioBlob(new Blob(chunksRef.current,{type:"audio/webm"}));stream.getTracks().forEach(t=>t.stop());};
      mr.start(1000);
      mediaRecRef.current=mr;
      setRecording(true);setRecSeconds(0);
      timerRef.current=setInterval(()=>setRecSeconds(s=>s+1),1000);
    } catch(e){alert("Mic access denied.");}
  };
  const stopRecording = ()=>{if(mediaRecRef.current) mediaRecRef.current.stop();setRecording(false);clearInterval(timerRef.current);};
  const fmtTime = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const processRecording = async () => {
    if(!audioBlob) return;
    setTranscribing(true);
    const title = meetingTitle||`Meeting ${new Date().toLocaleDateString()}`;
    const toBase64 = blob => new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.readAsDataURL(blob);});
    try {
      const b64 = await toBase64(audioBlob);
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"You are a meeting intelligence AI for I&M Machine & Fabrication Corp. Format response as:\nTRANSCRIPT:\n[text]\n\nSUMMARY:\n• [bullets]\n\nACTION ITEMS:\n• [who — what — deadline]\n\nFLAGS:\n• [critical items]",messages:[{role:"user",content:[{type:"text",text:"Transcribe and analyze this I&M production meeting."},{type:"document",source:{type:"base64",media_type:"audio/webm",data:b64}}]}]})});
      const data = await res.json();
      const text = data.content?.[0]?.text||"";
      const getSection=(label,next)=>{const s=text.indexOf(label+":");if(s===-1)return"";const e=next?text.indexOf(next+":"):text.length;return text.slice(s+label.length+1,e===-1?text.length:e).trim();};
      setMeetings(prev=>[{id:Date.now(),title,ts:new Date().toLocaleString(),duration:fmtTime(recSeconds),transcript:getSection("TRANSCRIPT","SUMMARY"),summary:getSection("SUMMARY","ACTION ITEMS"),actions:getSection("ACTION ITEMS","FLAGS"),flags:getSection("FLAGS",null)},...prev]);
    } catch(e){setMeetings(prev=>[{id:Date.now(),title,ts:new Date().toLocaleString(),duration:fmtTime(recSeconds),transcript:"Processing error.",summary:"",actions:"",flags:""},...prev]);}
    setAudioBlob(null);setMeetingTitle("");setRecSeconds(0);setTranscribing(false);
  };

  // Machine Intel
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    setMachineImage(url);
    const reader = new FileReader();
    reader.onload = () => setMachineImageB64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const runMachineIntel = async () => {
    if(!machineQuery && !machineImageB64) return;
    setMachineLoading(true);
    setMachineResult(null);
    try {
      const content = [];
      if(machineImageB64) {
        content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:machineImageB64}});
        content.push({type:"text",text:`Analyze this machine/serial plate image from I&M Machine & Fabrication Corp, a metal fab shop. ${machineQuery ? "Additional context: "+machineQuery : ""} Provide a complete machine intelligence report.`});
      } else {
        content.push({type:"text",text:`Machine/equipment query for I&M Machine & Fabrication Corp (metal fab shop, St. Joseph MO): "${machineQuery}". Provide a complete machine intelligence report.`});
      }

      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:`You are a machine intelligence AI for a metal fabrication and CNC machining shop. When given a machine name, model, serial number, or photo of equipment, return a structured report.

Format your response EXACTLY as JSON (no markdown, no backticks):
{
  "machine": "Machine name/model identified",
  "overview": "Brief description of what this machine does, typical specs",
  "troubleshooting": ["Step 1: Check X", "Step 2: Inspect Y", "Step 3: ..."],
  "sop": ["1. Power on sequence...", "2. Pre-operation check...", "3. ..."],
  "loto": ["1. Notify supervisor", "2. Identify all energy sources", "3. Shut down equipment", "4. Isolate energy sources", "5. Apply lockout devices", "6. Release stored energy", "7. Verify zero energy state"],
  "photoPrompts": ["Photo of nameplate/serial number", "Photo of control panel", "Photo of wear areas", "Photo of tooling/cutting area"],
  "safetyNotes": ["PPE required: ...", "Hazards: ...", "Emergency stop location: ..."],
  "maintenanceIntervals": ["Daily: ...", "Weekly: ...", "Monthly: ...", "Annual: ..."]
}`,
          messages:[{role:"user",content}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"{}";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setMachineResult(parsed);
      setMachineHistory(prev=>[{query:machineQuery||"Image scan",result:parsed,ts:new Date().toLocaleString()},...prev.slice(0,9)]);
      setExpandedSection("troubleshooting");
    } catch(e){
      setMachineResult({machine:"Error",overview:"Could not parse AI response. Try again.",troubleshooting:[],sop:[],loto:[],photoPrompts:[],safetyNotes:[],maintenanceIntervals:[]});
    }
    setMachineLoading(false);
  };

  // AI Insight
  const getAiInsight = async () => {
    setAiLoading(true);setAiInsight("");
    const summary={departments:DEPARTMENTS.map(d=>({name:d.name,supervisor:d.supervisor,status:deptStatus[d.id]?.status})),activeJobs:activeJobs.map(j=>({id:j.id,part:j.part,dept:getDept(j.dept)?.name,status:j.status,priority:j.priority,due:j.due,progress:j.estHours>0?Math.round((j.loggedHours/j.estHours)*100)+"%":"unknown"})),openDowntime:downtime.filter(d=>!d.resolved).map(d=>({dept:getDept(d.dept)?.name,machine:d.machine,reason:d.reason})),openFlags:flags.filter(f=>!f.resolved).map(f=>({dept:getDept(f.dept)?.name,message:f.message}))};
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"You are a production management AI for I&M Machine & Fabrication Corp, St. Joseph MO. Analyze floor data and give a direct, plain-English insight report. Use bullet points. Cover: bottlenecks, at-risk jobs, department concerns, 2-3 specific action recommendations. Format: STATUS SUMMARY / RISKS / RECOMMENDED ACTIONS.",messages:[{role:"user",content:`Current floor data:\n${JSON.stringify(summary,null,2)}\n\nGive me a production manager report.`}]})});
      const data = await res.json();
      setAiInsight(data.content?.[0]?.text||"No insight returned.");
    } catch{setAiInsight("Error reaching AI.");}
    setAiLoading(false);
  };

  // Forecast
  const getForecastStatus = job => {
    if(job.status==="Complete") return "complete";
    if(!job.due) return "no-date";
    const daysLeft=Math.ceil((new Date(job.due)-new Date())/86400000);
    const pct=job.estHours>0?job.loggedHours/job.estHours:0;
    if(daysLeft<0) return "overdue";
    if(daysLeft<=1&&pct<0.8) return "at-risk";
    if(daysLeft<=3&&pct<0.5) return "watch";
    return "on-track";
  };
  const forecastColor = s=>({complete:"#10b981","on-track":"#3b82f6",watch:"#f59e0b","at-risk":"#f97316",overdue:"#ef4444","no-date":"#94a3b8"}[s]);
  const forecastLabel = s=>({complete:"Complete","on-track":"On Track",watch:"Watch","at-risk":"At Risk",overdue:"Overdue","no-date":"No Date"}[s]);

  const today = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <div style={{minHeight:"100vh",background:"#0d1117",color:"#e2e8f0",fontFamily:"Inter, system-ui, sans-serif",fontSize:15}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0d1117;}
        input,select,button{font-family:inherit;font-size:inherit;}
        input::placeholder{color:#4b5563;}
        select option{background:#1a2030;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#0d1117;}
        ::-webkit-scrollbar-thumb{background:#2d3748;border-radius:3px;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pulse{animation:pulse 1.5s ease-in-out infinite;}
        .navbtn{background:none;border:none;color:#64748b;padding:13px 18px;font-size:14px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
        .navbtn:hover{color:#cbd5e1;}
        .navbtn.active{color:#f97316;border-bottom-color:#f97316;}
        .deptcard{background:#141c2b;border:1px solid #1e2d45;border-radius:10px;padding:18px;cursor:pointer;transition:all .2s;position:relative;}
        .deptcard:hover{border-color:#2d4060;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,0.3);}
        .jobrow:hover td{background:#141c2b;}
        .meetcard{background:#141c2b;border:1px solid #1e2d45;border-radius:10px;padding:18px;margin-bottom:10px;cursor:pointer;transition:all .2s;}
        .meetcard:hover{border-color:#2d4060;}
        .card{background:#141c2b;border:1px solid #1e2d45;border-radius:10px;}
        .stat-card{background:#141c2b;border:1px solid #1e2d45;border-radius:10px;padding:20px 24px;}
        .form-panel{background:#141c2b;border:1px solid #2d4060;border-radius:10px;padding:22px;margin-bottom:20px;}
        .inp{background:#0d1117;border:1px solid #2d3748;color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;outline:none;width:100%;transition:border-color .2s;}
        .inp:focus{border-color:#f97316;}
        .sel{background:#0d1117;border:1px solid #2d3748;color:#e2e8f0;padding:10px 14px;border-radius:8px;font-size:14px;outline:none;cursor:pointer;width:100%;transition:border-color .2s;}
        .sel:focus{border-color:#f97316;}
        .staffinput{background:#0d1117;border:1px solid #1e2d45;color:#e2e8f0;padding:5px 9px;border-radius:6px;font-size:13px;flex:1.5;outline:none;min-width:0;transition:border-color .2s;}
        .staffinput:focus{border-color:#f97316;}
        .btn{border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;padding:9px 18px;border:none;transition:all .2s;}
        .btn-primary{background:#f97316;color:#fff;}
        .btn-primary:hover{background:#ea6c0a;}
        .btn-secondary{background:#1e2d45;color:#94a3b8;border:1px solid #2d4060;}
        .btn-secondary:hover{background:#2d4060;color:#e2e8f0;}
        .btn-danger{background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid #ef4444;}
        .btn-danger:hover{background:rgba(239,68,68,0.25);}
        .btn-success{background:rgba(16,185,129,0.15);color:#10b981;border:1px solid #10b981;}
        .btn-success:hover{background:rgba(16,185,129,0.25);}
        .btn-sm{padding:5px 12px;font-size:13px;}
        .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
        .badge{display:inline-flex;align-items:center;gap:5px;background:#1a2030;border:1px solid #2d3748;border-radius:6px;padding:5px 12px;font-size:13px;color:#94a3b8;}
        .sec-title{font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;}
        .machine-section{border:1px solid #1e2d45;border-radius:8px;overflow:hidden;margin-bottom:10px;}
        .machine-section-header{background:#1a2030;padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background .2s;}
        .machine-section-header:hover{background:#1e2d45;}
        .machine-section-body{padding:16px;background:#0d1117;}
        .progbar{background:#1e2d45;border-radius:3px;height:5px;overflow:hidden;display:inline-block;vertical-align:middle;width:80px;}
        .progfill{height:100%;border-radius:3px;transition:width .5s;}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
        .modal{background:#141c2b;border:1px solid #2d4060;border-radius:12px;padding:28px;min-width:380px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;}
        .status-select-inline{background:#1e2d45;border:1px solid #2d4060;color:#94a3b8;padding:5px 10px;border-radius:6px;font-size:13px;cursor:pointer;outline:none;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#0d1117",borderBottom:"1px solid #1e2d45",padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{background:"#f97316",width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:"#fff",flexShrink:0}}>I&M</div>
          <div>
            <div style={{fontWeight:700,fontSize:17,color:"#f1f5f9"}}>Production Command</div>
            <div style={{fontSize:12,color:"#4b5563",marginTop:1}}>{today}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {openFlags>0&&<span className="badge" style={{borderColor:"#ef4444",color:"#ef4444"}}>⚑ {openFlags} Flag{openFlags>1?"s":""}</span>}
          {downDepts>0&&<span className="badge" style={{borderColor:"#ef4444",color:"#ef4444"}}>▼ {downDepts} Down</span>}
          <span className="badge">● Live</span>
        </div>
      </div>

      {/* NAV */}
      <div style={{display:"flex",background:"#0d1117",borderBottom:"1px solid #1e2d45",padding:"0 20px",overflowX:"auto"}}>
        {[["board","Floor Board"],["jobs","Jobs"],["forecast","Forecast"],["downtime","Downtime"],["flags","Flags"],["meetings","Meetings"],["machine","Machine Intel"],["ai","AI Insight"]].map(([t,l])=>(
          <button key={t} className={`navbtn${tab===t?" active":""}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{padding:"24px 28px",maxWidth:1400}}>

        {/* STATS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[
            {val:activeJobs.length,label:"Active Jobs",color:"#3b82f6"},
            {val:downDepts,label:"Depts Down",color:downDepts>0?"#ef4444":"#10b981"},
            {val:openFlags,label:"Open Flags",color:openFlags>0?"#f97316":"#10b981"},
            {val:completedCount,label:"Completed",color:"#10b981"},
          ].map(({val,label,color})=>(
            <div key={label} className="stat-card">
              <div style={{fontSize:36,fontWeight:700,color,lineHeight:1}}>{val}</div>
              <div style={{fontSize:13,color:"#64748b",marginTop:6,fontWeight:500}}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── FLOOR BOARD ── */}
        {tab==="board"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div className="sec-title">Department Status</div>
              <button className="btn btn-danger btn-sm" onClick={()=>setShowFlagForm(!showFlagForm)}>+ Raise Flag</button>
            </div>
            {showFlagForm&&(
              <div className="form-panel">
                <div style={{fontWeight:600,fontSize:15,color:"#f97316",marginBottom:16}}>Raise Flag</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Department</label>
                    <select className="sel" value={newFlag.dept} onChange={e=>setNewFlag({...newFlag,dept:e.target.value})}>
                      {DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}
                    </select></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Issue</label>
                    <input className="inp" placeholder="Describe the issue..." value={newFlag.message} onChange={e=>setNewFlag({...newFlag,message:e.target.value})} /></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-primary btn-sm" onClick={addFlag}>Submit Flag</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setShowFlagForm(false)}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
              {DEPARTMENTS.map(dept=>{
                const ds=deptStatus[dept.id];
                const deptJobs=activeJobs.filter(j=>j.dept===dept.id);
                const isExp=expandedDept===dept.id;
                const staff=staffData[dept.id]||[];
                return(
                  <div key={dept.id} className="deptcard" style={{borderLeft:`4px solid ${dept.color}`}} onClick={()=>setExpandedDept(isExp?null:dept.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:15,color:"#f1f5f9",marginBottom:3}}>{dept.name}</div>
                        <div style={{fontSize:13,color:"#64748b"}}>{dept.supervisor}</div>
                        <div style={{fontSize:12,color:"#374151",marginTop:2}}>{dept.location}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:statusColor(ds.status),display:"inline-block"}}/>
                          <span style={{fontSize:13,color:statusColor(ds.status),fontWeight:500}}>{ds.status}</span>
                        </div>
                        {deptJobs.length>0&&<div style={{fontSize:12,color:"#64748b",marginTop:4}}>{deptJobs.length} job{deptJobs.length>1?"s":""}</div>}
                      </div>
                    </div>
                    <select className="status-select-inline" style={{width:"100%"}} value={ds.status}
                      onClick={e=>e.stopPropagation()}
                      onChange={e=>{e.stopPropagation();setDeptStatus(prev=>({...prev,[dept.id]:{status:e.target.value}}));}}>
                      {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                    {isExp&&(
                      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #1e2d45"}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:12,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Staff</div>
                        {staff.map(s=>(
                          <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                            <span style={{fontSize:13,color:"#64748b",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.position}</span>
                            <input className="staffinput" placeholder="Name..." value={s.name} onChange={e=>updateStaff(dept.id,s.id,e.target.value)} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{marginTop:8,fontSize:12,color:"#374151",textAlign:"right"}}>{isExp?"▲ collapse":"▼ staff"}</div>
                  </div>
                );
              })}
            </div>
            {flags.filter(f=>!f.resolved).length>0&&(
              <>
                <div style={{fontSize:13,fontWeight:600,color:"#ef4444",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>⚑ Open Flags</div>
                {flags.filter(f=>!f.resolved).slice(0,3).map(f=>(
                  <div key={f.id} className="card" style={{borderLeft:"4px solid #ef4444",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,color:getDept(f.dept)?.color,fontWeight:500,marginBottom:3}}>{getDept(f.dept)?.name} · {getDept(f.dept)?.supervisor}</div>
                      <div style={{fontSize:14}}>{f.message}</div>
                      <div style={{fontSize:12,color:"#4b5563",marginTop:4}}>{f.ts}</div>
                    </div>
                    <button className="btn btn-success btn-sm" style={{flexShrink:0,marginLeft:12}} onClick={()=>resolveFlag(f.id)}>Resolve</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── JOB BOARD ── */}
        {tab==="jobs"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Job Board — {activeJobs.length} Active</div>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowJobForm(!showJobForm)}>+ Add Job</button>
            </div>
            {showJobForm&&(
              <div className="form-panel">
                <div style={{fontWeight:600,fontSize:15,color:"#f97316",marginBottom:16}}>New Job</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Part / Description</label><input className="inp" placeholder="e.g. Bracket Assembly" value={newJob.part} onChange={e=>setNewJob({...newJob,part:e.target.value})} /></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Department</label><select className="sel" value={newJob.dept} onChange={e=>setNewJob({...newJob,dept:e.target.value})}>{DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}</select></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Operator</label><input className="inp" placeholder="Name" value={newJob.operator} onChange={e=>setNewJob({...newJob,operator:e.target.value})} /></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Due Date</label><input className="inp" type="date" value={newJob.due} onChange={e=>setNewJob({...newJob,due:e.target.value})} /></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Priority</label><select className="sel" value={newJob.priority} onChange={e=>setNewJob({...newJob,priority:e.target.value})}>{PRIORITY.map(p=><option key={p}>{p}</option>)}</select></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Est. Hours</label><input className="inp" type="number" placeholder="0" value={newJob.estHours} onChange={e=>setNewJob({...newJob,estHours:e.target.value})} /></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-primary btn-sm" onClick={addJob}>Add Job</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setShowJobForm(false)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="card" style={{overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Job #","Part","Department","Operator","Priority","Progress","Status","Due"].map(h=>(
                  <th key={h} style={{background:"#0f1825",fontSize:12,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",padding:"12px 16px",textAlign:"left",borderBottom:"1px solid #1e2d45"}}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {jobs.map(j=>{
                    const dept=getDept(j.dept);
                    const pct=j.estHours>0?Math.min(1,j.loggedHours/j.estHours):0;
                    return(
                      <tr key={j.id} className="jobrow" onClick={()=>setSelectedJob(j)} style={{cursor:"pointer"}}>
                        <td style={{padding:"12px 16px",fontSize:13,color:"#64748b",borderBottom:"1px solid #0d1117",fontFamily:"monospace"}}>{j.id}</td>
                        <td style={{padding:"12px 16px",fontSize:14,fontWeight:500,borderBottom:"1px solid #0d1117"}}>{j.part}</td>
                        <td style={{padding:"12px 16px",fontSize:13,borderBottom:"1px solid #0d1117"}}><span style={{color:dept?.color,marginRight:6}}>●</span>{dept?.name}</td>
                        <td style={{padding:"12px 16px",fontSize:13,color:"#94a3b8",borderBottom:"1px solid #0d1117"}}>{j.operator}</td>
                        <td style={{padding:"12px 16px",borderBottom:"1px solid #0d1117"}}><span className="pill" style={{background:priorityColor(j.priority)+"25",color:priorityColor(j.priority)}}>{j.priority}</span></td>
                        <td style={{padding:"12px 16px",borderBottom:"1px solid #0d1117"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div className="progbar"><div className="progfill" style={{width:pct*100+"%",background:pct>=1?"#10b981":"#3b82f6"}}/></div>
                            <span style={{fontSize:12,color:"#64748b"}}>{Math.round(pct*100)}%</span>
                          </div>
                        </td>
                        <td style={{padding:"12px 16px",borderBottom:"1px solid #0d1117"}} onClick={e=>e.stopPropagation()}>
                          <select className="status-select-inline" value={j.status} onChange={e=>updateJobStatus(j.id,e.target.value)}>{JOB_STATUS.map(s=><option key={s}>{s}</option>)}</select>
                        </td>
                        <td style={{padding:"12px 16px",fontSize:13,color:"#64748b",borderBottom:"1px solid #0d1117"}}>{j.due||"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── FORECAST ── */}
        {tab==="forecast"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Project Forecast</div>
              <div style={{display:"flex",gap:6}}>{[["on-track","On Track"],["watch","Watch"],["at-risk","At Risk"],["overdue","Overdue"]].map(([s,l])=><span key={s} className="pill" style={{background:forecastColor(s)+"25",color:forecastColor(s)}}>{l}</span>)}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
              {[["overdue","Overdue"],["at-risk","At Risk"],["watch","Watch"],["on-track","On Track"],["complete","Complete"]].map(([s,l])=>{
                const count=jobs.filter(j=>getForecastStatus(j)===s).length;
                return<div key={s} className="stat-card" style={{borderLeft:`3px solid ${forecastColor(s)}`}}><div style={{fontSize:26,fontWeight:700,color:forecastColor(s),lineHeight:1}}>{count}</div><div style={{fontSize:12,color:"#64748b",marginTop:5,fontWeight:500}}>{l}</div></div>;
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {jobs.map(j=>{
                const dept=getDept(j.dept);const fs=getForecastStatus(j);
                const pct=j.estHours>0?Math.min(1,j.loggedHours/j.estHours):0;
                const daysLeft=j.due?Math.ceil((new Date(j.due)-new Date())/86400000):null;
                return(
                  <div key={j.id} className="card" style={{padding:18,borderLeft:`4px solid ${forecastColor(fs)}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div><div style={{fontWeight:600,fontSize:15}}>{j.part}</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{j.id} · <span style={{color:dept?.color}}>{dept?.name}</span></div></div>
                      <span className="pill" style={{background:forecastColor(fs)+"25",color:forecastColor(fs),flexShrink:0}}>{forecastLabel(fs)}</span>
                    </div>
                    <div style={{background:"#1e2d45",borderRadius:4,height:7,marginBottom:8,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,width:pct*100+"%",background:forecastColor(fs),transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#64748b",marginBottom:12}}>
                      <span>{Math.round(pct*100)}% · {j.loggedHours}h / {j.estHours}h est</span>
                      <span style={{color:daysLeft!==null&&daysLeft<0?"#ef4444":"#64748b"}}>{daysLeft===null?"No date":daysLeft<0?`${Math.abs(daysLeft)}d overdue`:daysLeft===0?"Due today":`${daysLeft}d left`}</span>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:13,color:"#64748b"}}>Log:</span>
                      {[1,2,4].map(h=><button key={h} className="btn btn-secondary btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={()=>logHours(j.id,h)}>+{h}h</button>)}
                      <select className="status-select-inline" style={{marginLeft:"auto"}} value={j.status} onChange={e=>updateJobStatus(j.id,e.target.value)}>{JOB_STATUS.map(s=><option key={s}>{s}</option>)}</select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── DOWNTIME ── */}
        {tab==="downtime"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Downtime Log</div>
              <button className="btn btn-danger btn-sm" onClick={()=>setShowDowntimeForm(!showDowntimeForm)}>+ Log Downtime</button>
            </div>
            {showDowntimeForm&&(
              <div className="form-panel">
                <div style={{fontWeight:600,fontSize:15,color:"#ef4444",marginBottom:16}}>Log Downtime Event</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Department</label><select className="sel" value={newDowntime.dept} onChange={e=>setNewDowntime({...newDowntime,dept:e.target.value})}>{DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}</select></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Machine / Asset</label><input className="inp" placeholder="e.g. Fiber Laser #1" value={newDowntime.machine} onChange={e=>setNewDowntime({...newDowntime,machine:e.target.value})} /></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Reason</label><input className="inp" placeholder="e.g. Tooling failure" value={newDowntime.reason} onChange={e=>setNewDowntime({...newDowntime,reason:e.target.value})} /></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Note</label><input className="inp" placeholder="Optional" value={newDowntime.note} onChange={e=>setNewDowntime({...newDowntime,note:e.target.value})} /></div>
                </div>
                <div style={{display:"flex",gap:8}}><button className="btn btn-danger btn-sm" onClick={addDowntime}>Log Event</button><button className="btn btn-secondary btn-sm" onClick={()=>setShowDowntimeForm(false)}>Cancel</button></div>
              </div>
            )}
            {downtime.length===0&&<div style={{color:"#4b5563",fontSize:14,padding:"24px 0"}}>No downtime events logged.</div>}
            {downtime.map(d=>{const dept=getDept(d.dept);return(
              <div key={d.id} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${d.resolved?"#10b981":"#ef4444"}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,opacity:d.resolved?.6:1}}>
                <div>
                  <div style={{fontSize:13,color:dept?.color,fontWeight:500,marginBottom:3}}>{dept?.name} · {dept?.supervisor}</div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:3}}>{d.machine}</div>
                  <div style={{fontSize:14,color:"#94a3b8"}}>{d.reason}</div>
                  {d.note&&<div style={{fontSize:13,color:"#4b5563",marginTop:3}}>{d.note}</div>}
                  <div style={{fontSize:12,color:"#374151",marginTop:6}}>{d.ts}</div>
                </div>
                {!d.resolved?<button className="btn btn-success btn-sm" style={{flexShrink:0,marginLeft:12}} onClick={()=>resolveDowntime(d.id)}>Resolved</button>:<span className="pill" style={{background:"#10b98120",color:"#10b981",flexShrink:0}}>Resolved</span>}
              </div>
            );})}
          </>
        )}

        {/* ── FLAGS ── */}
        {tab==="flags"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Flags — {openFlags} Open</div>
              <button className="btn btn-danger btn-sm" onClick={()=>setShowFlagForm(!showFlagForm)}>+ Raise Flag</button>
            </div>
            {showFlagForm&&(
              <div className="form-panel">
                <div style={{fontWeight:600,fontSize:15,color:"#ef4444",marginBottom:16}}>Raise Flag</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Department</label><select className="sel" value={newFlag.dept} onChange={e=>setNewFlag({...newFlag,dept:e.target.value})}>{DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.name} — {d.supervisor}</option>)}</select></div>
                  <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Issue</label><input className="inp" placeholder="Describe the issue..." value={newFlag.message} onChange={e=>setNewFlag({...newFlag,message:e.target.value})} /></div>
                </div>
                <div style={{display:"flex",gap:8}}><button className="btn btn-primary btn-sm" onClick={addFlag}>Submit</button><button className="btn btn-secondary btn-sm" onClick={()=>setShowFlagForm(false)}>Cancel</button></div>
              </div>
            )}
            {flags.length===0&&<div style={{color:"#4b5563",fontSize:14,padding:"24px 0"}}>No flags raised.</div>}
            {flags.map(f=>{const dept=getDept(f.dept);return(
              <div key={f.id} className="card" style={{padding:"16px 18px",borderLeft:`4px solid ${f.resolved?"#1e2d45":"#ef4444"}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,opacity:f.resolved?.5:1}}>
                <div>
                  <div style={{fontSize:13,color:dept?.color,fontWeight:500,marginBottom:3}}>{dept?.name} · {dept?.supervisor}</div>
                  <div style={{fontSize:14,marginBottom:3}}>{f.message}</div>
                  <div style={{fontSize:12,color:"#4b5563"}}>{f.ts}</div>
                </div>
                {!f.resolved?<button className="btn btn-success btn-sm" style={{flexShrink:0,marginLeft:12}} onClick={()=>resolveFlag(f.id)}>Resolve</button>:<span className="pill" style={{background:"#10b98120",color:"#10b981",flexShrink:0,marginLeft:12}}>Resolved</span>}
              </div>
            );})}
          </>
        )}

        {/* ── MEETINGS ── */}
        {tab==="meetings"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Meeting Recorder</div>
              {meetings.length>0&&<span style={{fontSize:13,color:"#64748b"}}>{meetings.length} recorded</span>}
            </div>
            <div className="card" style={{padding:32,textAlign:"center",marginBottom:20}}>
              <input className="inp" style={{maxWidth:340,textAlign:"center",marginBottom:20}} placeholder="Meeting title (optional)" value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} disabled={recording} />
              <div style={{fontSize:56,fontWeight:700,color:recording?"#ef4444":"#e2e8f0",lineHeight:1,margin:"0 0 12px",letterSpacing:2}}>
                {recording&&<span style={{display:"inline-block",width:12,height:12,borderRadius:"50%",background:"#ef4444",marginRight:10,animation:"pulse 1s ease-in-out infinite"}}/>}
                {fmtTime(recSeconds)}
              </div>
              <div style={{fontSize:14,color:"#4b5563",marginBottom:24}}>{recording?"Recording — capturing room audio":audioBlob?"Ready to process":"Press Record to start"}</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {!recording&&!audioBlob&&<button className="btn btn-danger" style={{padding:"11px 32px",fontSize:15}} onClick={startRecording}>● Record</button>}
                {recording&&<button className="btn" style={{padding:"11px 32px",fontSize:15,background:"#1e2d45",color:"#ef4444",border:"1px solid #ef4444"}} onClick={stopRecording}>■ Stop</button>}
                {audioBlob&&!transcribing&&<><button className="btn btn-primary" style={{padding:"11px 32px",fontSize:15}} onClick={processRecording}>✦ Transcribe + Analyze</button><button className="btn btn-secondary" onClick={()=>{setAudioBlob(null);setRecSeconds(0);}}>Discard</button></>}
                {transcribing&&<button className="btn btn-secondary pulse" style={{padding:"11px 32px",fontSize:15}} disabled>Processing...</button>}
              </div>
            </div>
            {meetings.map(m=>(
              <div key={m.id} className="meetcard" onClick={()=>setSelectedMeeting(m)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{m.title}</div><div style={{fontSize:13,color:"#64748b"}}>{m.ts} · {m.duration}</div></div>
                  <span className="pill" style={{background:"#6366f120",color:"#6366f1"}}>View Notes</span>
                </div>
                {m.summary&&<div style={{fontSize:13,color:"#94a3b8",marginTop:10,lineHeight:1.6}}>{m.summary.split("\n").slice(0,2).join(" ")}...</div>}
              </div>
            ))}
          </>
        )}

        {/* ── MACHINE INTEL ── */}
        {tab==="machine"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">Machine Intelligence</div>
              <span className="badge">AI-Powered · Vision + Text</span>
            </div>

            <div className="card" style={{padding:24,marginBottom:20}}>
              <div style={{fontWeight:600,fontSize:16,color:"#f1f5f9",marginBottom:6}}>Machine Lookup</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Type a machine name, model, or serial number — or snap a photo of the serial plate. AI returns troubleshooting, SOP, and lockout/tagout procedures.</div>

              <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:14,alignItems:"flex-end"}}>
                <div>
                  <label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Machine Name / Model / Serial</label>
                  <input className="inp" placeholder="e.g. Finn-Power F6-25, Fiber Laser, Press Brake..." value={machineQuery} onChange={e=>setMachineQuery(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&runMachineIntel()} />
                </div>
                <button className="btn btn-primary" onClick={runMachineIntel} disabled={machineLoading||(!machineQuery&&!machineImageB64)} style={{height:42,flexShrink:0}}>
                  {machineLoading?"Analyzing...":"Search"}
                </button>
              </div>

              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{height:1,flex:1,background:"#1e2d45"}}/>
                <span style={{fontSize:12,color:"#4b5563"}}>or</span>
                <div style={{height:1,flex:1,background:"#1e2d45"}}/>
              </div>

              <div style={{marginTop:14}}>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImageUpload} />
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="btn btn-secondary" onClick={()=>fileInputRef.current?.click()}>📷 Snap Serial Plate Photo</button>
                  {machineImage&&<button className="btn btn-secondary btn-sm" onClick={()=>{setMachineImage(null);setMachineImageB64(null);}}>✕ Remove Photo</button>}
                </div>
                {machineImage&&(
                  <div style={{marginTop:12,display:"flex",gap:14,alignItems:"flex-start"}}>
                    <img src={machineImage} alt="serial plate" style={{width:120,height:90,objectFit:"cover",borderRadius:8,border:"1px solid #2d4060"}} />
                    <div style={{fontSize:13,color:"#64748b",paddingTop:4}}>Photo attached — AI will read the serial plate and identify the machine.<br/><br/><button className="btn btn-primary btn-sm" onClick={runMachineIntel} disabled={machineLoading}>{machineLoading?"Analyzing...":"Analyze Photo"}</button></div>
                  </div>
                )}
              </div>
            </div>

            {machineLoading&&(
              <div className="card" style={{padding:32,textAlign:"center"}}>
                <div style={{fontSize:14,color:"#64748b"}} className="pulse">Analyzing machine data — generating troubleshooting guide, SOP, and LOTO procedure...</div>
              </div>
            )}

            {machineResult&&!machineLoading&&(
              <div style={{marginBottom:20}}>
                <div className="card" style={{padding:20,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:18,color:"#f1f5f9",marginBottom:4}}>{machineResult.machine}</div>
                      <div style={{fontSize:14,color:"#94a3b8",lineHeight:1.6}}>{machineResult.overview}</div>
                    </div>
                    <span className="pill" style={{background:"#10b98120",color:"#10b981",flexShrink:0,marginLeft:16}}>Identified</span>
                  </div>
                </div>

                {[
                  {key:"troubleshooting",label:"🔧 Troubleshooting Guide",color:"#f97316"},
                  {key:"sop",label:"📋 Standard Operating Procedure",color:"#3b82f6"},
                  {key:"loto",label:"🔒 Lockout / Tagout Procedure",color:"#ef4444"},
                  {key:"safetyNotes",label:"⚠️ Safety Notes",color:"#f59e0b"},
                  {key:"maintenanceIntervals",label:"🗓 Maintenance Intervals",color:"#10b981"},
                  {key:"photoPrompts",label:"📸 Photo Documentation Prompts",color:"#a855f7"},
                ].map(({key,label,color})=>machineResult[key]?.length>0&&(
                  <div key={key} className="machine-section" style={{marginBottom:10}}>
                    <div className="machine-section-header" onClick={()=>setExpandedSection(expandedSection===key?null:key)}>
                      <span style={{fontWeight:600,fontSize:14,color:expandedSection===key?color:"#e2e8f0"}}>{label}</span>
                      <span style={{color:"#64748b",fontSize:13}}>{expandedSection===key?"▲":"▼"} {machineResult[key].length} items</span>
                    </div>
                    {expandedSection===key&&(
                      <div className="machine-section-body">
                        {machineResult[key].map((item,i)=>(
                          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<machineResult[key].length-1?"1px solid #1e2d45":"none"}}>
                            <span style={{color:color,fontWeight:700,fontSize:14,flexShrink:0,minWidth:22}}>{i+1}.</span>
                            <span style={{fontSize:14,color:"#cbd5e1",lineHeight:1.6}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {machineHistory.length>0&&(
              <>
                <div className="sec-title" style={{marginBottom:12}}>Recent Lookups</div>
                {machineHistory.map((h,i)=>(
                  <div key={i} className="card" style={{padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setMachineResult(h.result)}>
                    <div>
                      <div style={{fontWeight:500,fontSize:14}}>{h.result.machine}</div>
                      <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{h.query} · {h.ts}</div>
                    </div>
                    <span style={{fontSize:12,color:"#64748b"}}>Load →</span>
                  </div>
                ))}
              </>
            )}

            <div className="card" style={{padding:16,marginTop:16,borderLeft:"4px solid #6366f1"}}>
              <div style={{fontWeight:600,fontSize:13,color:"#6366f1",marginBottom:4}}>Phase 3 — 3D Machine Mapping</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>LiDAR scanning for 3D machine imagery requires an iPhone Pro / iPad Pro + separate rendering pipeline (RealityKit or Matterport). Flagged for Phase 3 once core system is stable.</div>
            </div>
          </>
        )}

        {/* ── AI INSIGHT ── */}
        {tab==="ai"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div className="sec-title">AI Production Insight</div>
              <button className="btn btn-primary btn-sm" onClick={getAiInsight} disabled={aiLoading}>{aiLoading?"Analyzing...":"Run Analysis"}</button>
            </div>
            <div className="card" style={{padding:24}}>
              <div style={{fontSize:14,color:"#64748b",lineHeight:1.7}}>Pulls live floor data — dept status, active jobs, downtime, flags — and returns a plain-English production summary with risks and recommended actions.</div>
              {aiLoading&&<div style={{fontSize:14,color:"#64748b",lineHeight:1.8,marginTop:20,paddingTop:20,borderTop:"1px solid #1e2d45"}} className="pulse">Analyzing production floor data...</div>}
              {aiInsight&&!aiLoading&&<div style={{fontSize:14,color:"#cbd5e1",lineHeight:1.8,whiteSpace:"pre-wrap",marginTop:20,paddingTop:20,borderTop:"1px solid #1e2d45"}}>{aiInsight}</div>}
              {!aiInsight&&!aiLoading&&<div style={{fontSize:14,color:"#2d3748",lineHeight:1.8,marginTop:20,paddingTop:20,borderTop:"1px solid #1e2d45"}}>Hit "Run Analysis" to get insight on current floor status.</div>}
            </div>
          </>
        )}
      </div>

      {/* JOB MODAL */}
      {selectedJob&&(
        <div className="modal-overlay" onClick={()=>setSelectedJob(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:17,color:"#f97316",marginBottom:4}}>{selectedJob.part}</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20,fontFamily:"monospace"}}>{selectedJob.id}</div>
            {[["Department",getDept(selectedJob.dept)?.name],["Supervisor",getDept(selectedJob.dept)?.supervisor],["Operator",selectedJob.operator],["Priority",selectedJob.priority],["Status",selectedJob.status],["Due",selectedJob.due||"—"],["Est. Hours",selectedJob.estHours||"—"],["Logged Hours",selectedJob.loggedHours||0]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1e2d45",fontSize:14}}>
                <span style={{fontSize:12,color:"#64748b",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.06em"}}>{k}</span>
                <span style={{fontWeight:500}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:20}}>
              <select className="sel" style={{flex:1}} value={selectedJob.status} onChange={e=>{updateJobStatus(selectedJob.id,e.target.value);setSelectedJob({...selectedJob,status:e.target.value});}}>{JOB_STATUS.map(s=><option key={s}>{s}</option>)}</select>
              <button className="btn btn-secondary" onClick={()=>setSelectedJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MEETING MODAL */}
      {selectedMeeting&&(
        <div className="modal-overlay" onClick={()=>setSelectedMeeting(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:17,color:"#f1f5f9",marginBottom:4}}>{selectedMeeting.title}</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>{selectedMeeting.ts} · {selectedMeeting.duration}</div>
            {[["Summary","#f97316",selectedMeeting.summary],["Action Items","#3b82f6",selectedMeeting.actions],["Flags","#ef4444",selectedMeeting.flags],["Transcript","#64748b",selectedMeeting.transcript]].map(([label,color,content])=>content?(
              <div key={label} style={{marginBottom:16}}>
                <div style={{fontSize:12,color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>{label}</div>
                <div style={{fontSize:14,color:"#94a3b8",lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:label==="Transcript"?180:undefined,overflowY:label==="Transcript"?"auto":undefined}}>{content}</div>
              </div>
            ):null)}
            <button className="btn btn-secondary" onClick={()=>setSelectedMeeting(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
