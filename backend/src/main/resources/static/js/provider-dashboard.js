/* ═══════════════════════════════════════════
   NESAMANI — provider-dashboard.js
   Work doer dashboard.
   Sections: Overview · My Services · Browse Jobs ·
             My Responses · My Bookings · Earnings ·
             Messages · Notifications · Profile
   ═══════════════════════════════════════════ */

const MOCK = {
  name: getSession('name') || 'Provider',
  services: [
    {id:1,icon:'🔧',title:'Pipe Fitting & Leak Repair',category:'Plumbing',price:'₹500',priceType:'PER_HOUR',location:'Trichy',isAvailable:true},
    {id:2,icon:'🔧',title:'Bathroom Renovation Plumbing',category:'Plumbing',price:'₹4,000',priceType:'FIXED',location:'Trichy',isAvailable:true},
  ],
  openJobs: [
    {id:1,icon:'🔧',title:'Fix bathroom tap leak',category:'Plumbing',location:'Chennai',budget:'₹600–₹900',duration:'One-time',neederName:'Priya Nair',date:'12 Mar 2026',responseCount:1},
    {id:2,icon:'⚡',title:'Rewire living room switches',category:'Electrical',location:'Madurai',budget:'₹1,200',duration:'One-time',neederName:'Arjun Menon',date:'10 Mar 2026',responseCount:0},
    {id:3,icon:'🎨',title:'Interior painting 2BHK',category:'Painting',location:'Coimbatore',budget:'₹8,000',duration:'3 days',neederName:'Ravi Kumar',date:'08 Mar 2026',responseCount:2},
    {id:4,icon:'🚗',title:'Daily commute driver',category:'Driving',location:'Chennai',budget:'₹700/day',duration:'Long term',neederName:'Priya Nair',date:'05 Mar 2026',responseCount:0},
    {id:5,icon:'🏠',title:'Part-time maid 4 hrs/day',category:'Cleaning',location:'Trichy',budget:'₹5,000/month',duration:'1 month',neederName:'Meena Sundaram',date:'01 Mar 2026',responseCount:1},
  ],
  responses: [
    {id:1,jobId:1,jobTitle:'Fix bathroom tap leak',neederName:'Priya Nair',quotedPrice:'₹750',message:'I can fix it tomorrow morning.',status:'accepted',date:'11 Mar 2026'},
    {id:2,jobId:3,jobTitle:'Interior painting 2BHK',neederName:'Ravi Kumar',quotedPrice:'₹8,000',message:'I can complete in 3 days.',status:'pending',date:'08 Mar 2026'},
  ],
  bookings: [
    {id:1,icon:'🔧',title:'Tap repair',neederName:'Priya Nair',date:'12 Mar 2026',status:'completed',amount:'₹750'},
    {id:2,icon:'🔧',title:'Pipe fitting',neederName:'Meena Sundaram',date:'01 Mar 2026',status:'accepted',amount:'₹500'},
  ],
  notifications: [
    {id:1,icon:'✅',msg:'<strong>Priya Nair</strong> accepted your response for the tap repair job!',time:'5 mins ago',read:false},
    {id:2,icon:'📋',msg:'New job posted near you: <strong>Interior Painting 2BHK</strong> in Coimbatore.',time:'2 hrs ago',read:false},
    {id:3,icon:'📅',msg:'<strong>Meena Sundaram</strong> booked your pipe fitting service.',time:'Yesterday',read:false},
    {id:4,icon:'💰',msg:'Payment of ₹750 received for tap repair job.',time:'2 days ago',read:true},
    {id:5,icon:'⭐',msg:'You received a 5-star review from Priya Nair.',time:'3 days ago',read:true},
  ],
  messages: [
    {id:201,avatar:'👩',name:'Priya Nair',role:'Needer · Chennai',preview:'See you tomorrow at 10 AM!',unread:true,
      chat:[{from:'them',text:'Hi! I accepted your response for the tap repair.',time:'9:00 AM'},{from:'me',text:'Thank you! I will bring all tools.',time:'9:05 AM'},{from:'them',text:'See you tomorrow at 10 AM!',time:'9:08 AM'}]},
    {id:202,avatar:'👨',name:'Arjun Menon',role:'Needer · Madurai',preview:'Can you start this Saturday?',unread:false,
      chat:[{from:'them',text:'Hi, I need my living room rewired.',time:'Yesterday'},{from:'me',text:'I can come Saturday and assess.',time:'Yesterday'},{from:'them',text:'Can you start this Saturday?',time:'Yesterday'}]},
  ],
  earningsData:[{month:'Oct',val:2800},{month:'Nov',val:1900},{month:'Dec',val:3400},{month:'Jan',val:2600},{month:'Feb',val:3100},{month:'Mar',val:3200}],
  skills:['Pipe Fitting','Drainage','Solar Water','Bathroom Fix','Leak Repair']
};

let activeThread = 0;
let currentJobFilter   = 'all';
let currentRespFilter  = 'all';
let currentBookFilter  = 'all';

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('provider')) return;

  const name = getSession('name') || 'there';
  setGreeting(name);
  setTxt('sidebarName', name);
  setTxt('profileName', name);
  setVal('pName', name);
  setVal('pEmail', getSession('email'));
  setVal('pPhone', getSession('phone'));
  setTxt('profileAvatar', nameInitial(name));
  setTxt('sidebarAvatar', nameInitial(name));

  await loadAll();
});

async function loadAll() {
  try {
    const res = await API.provider.getDashboard();
    if (res.success) {
      const d = res.data;
      if (d.services)      MOCK.services      = d.services;
      if (d.openJobs)      MOCK.openJobs      = d.openJobs;
      if (d.responses)     MOCK.responses     = d.responses;
      if (d.bookings)      MOCK.bookings      = d.bookings;
      if (d.notifications) MOCK.notifications = d.notifications;
    }
  } catch (_) {}

  renderOverview();
  renderMyServices();
  renderOpenJobs();
  renderMyResponses();
  renderMyBookings();
  renderEarningsChart();
  renderMsgThreads();
  renderChat(0);
  renderNotifications();
  renderProfileSkills();
  renderProfileStats();
}

/* ════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════ */
const TITLES = {overview:'Overview',services:'My Services','browse-jobs':'Browse Jobs',responses:'My Responses',bookings:'My Bookings',earnings:'Earnings',messages:'Messages',notifications:'Notifications',profile:'Profile'};

function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const sec=document.getElementById('sec-'+page);
  const nav=document.getElementById('nav-'+page);
  if(sec) sec.classList.add('active');
  if(nav) nav.classList.add('active');
  setTxt('pageTitle', TITLES[page]||'');
  document.getElementById('sidebar')?.classList.remove('mobile-open');
}

function toggleSidebar(){ document.getElementById('sidebar')?.classList.toggle('mobile-open'); }

/* ════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════ */
function renderOverview() {
  const accepted  = MOCK.responses.filter(r=>r.status==='accepted').length;
  const completed = MOCK.bookings.filter(b=>b.status==='completed').length;
  const pending   = MOCK.bookings.filter(b=>b.status==='pending'||b.status==='accepted').length;

  setHTML('overviewStats',`
    <div class="stat-card"><div class="stat-icon si-gold">🛠️</div><div class="stat-val">${MOCK.services.length}</div><div class="stat-key">Services Listed</div><div class="stat-delta delta-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>Visible to all</div></div>
    <div class="stat-card"><div class="stat-icon si-sage">✅</div><div class="stat-val">${accepted}</div><div class="stat-key">Responses Accepted</div><div class="stat-delta delta-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>Jobs won</div></div>
    <div class="stat-card"><div class="stat-icon si-accent">📅</div><div class="stat-val">${pending}</div><div class="stat-key">Active Bookings</div><div class="stat-delta delta-warn">Needs attention</div></div>
    <div class="stat-card"><div class="stat-icon si-clay">💰</div><div class="stat-val">₹18,400</div><div class="stat-key">Total Earned</div><div class="stat-delta delta-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>+₹3,200 this month</div></div>
  `);
  setBadge('bookingBadge', pending);
  setBadge('respBadge', MOCK.responses.filter(r=>r.status==='pending').length);

  /* Recent bookings */
  setHTML('overviewBookings', MOCK.bookings.slice(0,3).map(b=>bookingRowHTML(b,false)).join('') || `<div class="empty-state"><div class="empty-icon">📅</div><h4>No bookings yet</h4><p>Respond to jobs or add your services.</p></div>`);

  /* Quick actions */
  setHTML('quickActions',`
    <button class="qa-item" onclick="navigate('services')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg><span>Add Service</span></button>
    <button class="qa-item" onclick="navigate('browse-jobs')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span>Browse Jobs</span></button>
    <button class="qa-item" onclick="navigate('bookings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>My Bookings</span></button>
    <button class="qa-item" onclick="navigate('messages')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Messages</span></button>
  `);

  setHTML('miniNotifs', MOCK.notifications.slice(0,3).map(n=>notifRowHTML(n)).join(''));
}

/* ════════════════════════════════════════
   MY SERVICES (Flow B upload)
════════════════════════════════════════ */
function renderMyServices() {
  setHTML('myServicesList', MOCK.services.length ? MOCK.services.map(s=>`
    <div class="item-row">
      <div class="item-icon">${s.icon||'🛠️'}</div>
      <div class="item-info">
        <div class="item-title">${s.title}</div>
        <div class="item-meta">${s.category} &nbsp;·&nbsp; ${s.location} &nbsp;·&nbsp; <strong>${s.price}</strong> ${priceLabel(s.priceType)}</div>
      </div>
      <span class="item-badge ${s.isAvailable?'badge-accepted':'badge-cancelled'}">${s.isAvailable?'Active':'Paused'}</span>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn-sm" onclick="toggleService(${s.id})">${s.isAvailable?'Pause':'Resume'}</button>
        <button class="btn-sm danger" onclick="deleteService(${s.id})">Delete</button>
      </div>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">🛠️</div><h4>No services yet</h4><p>Add your first service below.</p></div>`);
}

async function addService() {
  const title    = getVal('svcTitle');
  const category = getVal('svcCategory');
  const price    = getVal('svcPrice');
  const priceType= getVal('svcPriceType');
  const location = getVal('svcLocation');
  const desc     = getVal('svcDesc');

  if (!title)    { showToast('Service title is required.', true); return; }
  if (!category) { showToast('Please select a category.', true); return; }

  const btn = document.getElementById('addServiceBtn');
  setLoadingBtn(btn, 'Adding…', true);

  try {
    const res = await API.provider.addService({ title, category, price, priceType, location, description:desc });
    if (!res.success) throw new Error(res.error);
    MOCK.services.push({id:res.data.id||Date.now(),icon:categoryIcon(category),title,category,price,priceType,location,isAvailable:true});
  } catch (_) {
    MOCK.services.push({id:Date.now(),icon:categoryIcon(category),title,category,price,priceType,location,isAvailable:true});
  }

  ['svcTitle','svcPrice','svcLocation','svcDesc'].forEach(id=>setVal(id,''));
  setVal('svcCategory',''); setVal('svcPriceType','');
  setLoadingBtn(btn, 'Add Service →', false);
  renderMyServices(); renderOverview();
  showToast('Service added! Needers can now find and book you.');
}

async function toggleService(id) {
  const s = MOCK.services.find(x=>x.id===id);
  if (!s) return;
  try { await API.provider.updateService(id, {isAvailable:!s.isAvailable}); } catch (_) {}
  s.isAvailable = !s.isAvailable;
  renderMyServices();
  showToast(s.isAvailable ? 'Service is now active.' : 'Service paused.');
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  try { await API.provider.deleteService(id); } catch (_) {}
  MOCK.services = MOCK.services.filter(s=>s.id!==id);
  renderMyServices(); renderOverview();
  showToast('Service deleted.');
}

function priceLabel(t){return {FIXED:'(fixed)',PER_HOUR:'/hr',PER_DAY:'/day',PER_MONTH:'/month',NEGOTIABLE:'(negotiable)'}[t]||'';}

/* ════════════════════════════════════════
   BROWSE JOBS (Flow A)
   Provider sees open jobs → responds
════════════════════════════════════════ */
function renderOpenJobs(query='') {
  const data = query
    ? MOCK.openJobs.filter(j=>j.title.toLowerCase().includes(query)||j.category.toLowerCase().includes(query)||j.location.toLowerCase().includes(query))
    : MOCK.openJobs;

  setHTML('openJobsList', data.length ? data.map(j=>`
    <div class="item-row">
      <div class="item-icon">${j.icon||'📋'}</div>
      <div class="item-info">
        <div class="item-title">${j.title}</div>
        <div class="item-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${j.location} &nbsp;·&nbsp; ${j.neederName} &nbsp;·&nbsp; Budget: <strong>${j.budget}</strong>
          ${j.responseCount?`&nbsp;·&nbsp; ${j.responseCount} response${j.responseCount>1?'s':''}`:''}
        </div>
      </div>
      <span class="item-badge badge-open">${j.duration||'One-time'}</span>
      <button class="btn-sm" onclick="showRespondModal(${j.id})">Respond →</button>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">🔍</div><h4>No jobs found</h4><p>Try a different search.</p></div>`);
}

function filterOpenJobs(){ renderOpenJobs(document.getElementById('jobSearch')?.value.trim().toLowerCase()||''); }

function showRespondModal(jobId) {
  const j = MOCK.openJobs.find(x=>x.id===jobId);
  if (!j) return;
  const msg = prompt(`Respond to "${j.title}" by ${j.neederName}\n\nYour message:`, 'I am available and experienced for this job.');
  if (msg === null) return;
  const price = prompt('Your quoted price:', j.budget||'');
  if (price === null) return;
  respondToJob(jobId, msg, price);
}

async function respondToJob(jobId, message, quotedPrice) {
  const j = MOCK.openJobs.find(x=>x.id===jobId);
  if (!j) return;
  try {
    const res = await API.provider.respondToJob(jobId, { message, quotedPrice });
    if (!res.success) throw new Error(res.error);
  } catch (_) {}
  MOCK.responses.unshift({id:Date.now(),jobId,jobTitle:j.title,neederName:j.neederName,quotedPrice,message,status:'pending',date:today()});
  j.responseCount = (j.responseCount||0)+1;
  renderOpenJobs(); renderMyResponses(); renderOverview();
  showToast(`Response sent to ${j.neederName}!`);
  navigate('responses');
}

/* ════════════════════════════════════════
   MY RESPONSES
════════════════════════════════════════ */
function renderMyResponses(filter = currentRespFilter) {
  currentRespFilter = filter;
  const data = filter==='all' ? MOCK.responses : MOCK.responses.filter(r=>r.status===filter);
  setHTML('myResponsesList', data.length ? data.map(r=>`
    <div class="item-row">
      <div class="item-icon">📋</div>
      <div class="item-info">
        <div class="item-title">${r.jobTitle}</div>
        <div class="item-meta">Needer: ${r.neederName} &nbsp;·&nbsp; Quoted: <strong>${r.quotedPrice}</strong> &nbsp;·&nbsp; ${r.date}</div>
        <div class="item-meta" style="font-style:italic;color:var(--muted);margin-top:2px">"${r.message}"</div>
      </div>
      <span class="item-badge badge-${r.status}">${r.status}</span>
      ${r.status==='pending'?`<button class="btn-sm danger" onclick="withdrawResponse(${r.id})">Withdraw</button>`:''}
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">💬</div><h4>No responses yet</h4><p>Browse jobs and respond to start working.</p></div>`);
}

function filterResponses(btn) {
  document.querySelectorAll('#respFilterTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderMyResponses(btn.dataset.f);
}

async function withdrawResponse(id) {
  if (!confirm('Withdraw this response?')) return;
  try { await API.provider.withdrawResponse(id); } catch (_) {}
  const r = MOCK.responses.find(x=>x.id===id);
  if (r) r.status = 'withdrawn';
  renderMyResponses(); renderOverview();
  showToast('Response withdrawn.');
}

/* ════════════════════════════════════════
   MY BOOKINGS
════════════════════════════════════════ */
function renderMyBookings(filter = currentBookFilter) {
  currentBookFilter = filter;
  const data = filter==='all' ? MOCK.bookings : MOCK.bookings.filter(b=>b.status===filter);
  setHTML('myBookingsList', data.length ? data.map(b=>bookingRowHTML(b,true)).join('') : `<div class="empty-state"><div class="empty-icon">📅</div><h4>No bookings yet</h4><p>Your accepted responses become bookings.</p></div>`);
}

function filterBookings(btn) {
  document.querySelectorAll('#bookFilterTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderMyBookings(btn.dataset.f);
}

function bookingRowHTML(b, withActions=false) {
  return `<div class="item-row">
    <div class="item-icon">${b.icon||'📅'}</div>
    <div class="item-info">
      <div class="item-title">${b.title}</div>
      <div class="item-meta">${b.neederName||b.providerName||'—'} &nbsp;·&nbsp; ${b.date}</div>
    </div>
    <span class="item-badge badge-${b.status?.toLowerCase()}">${(b.status||'').replace('_',' ')}</span>
    <span class="item-amount">${b.amount||'—'}</span>
    ${withActions && b.status==='accepted' ? `<button class="btn-sm success" onclick="completeBooking(${b.id})">Mark Done</button>` : ''}
  </div>`;
}

async function completeBooking(id) {
  try { await API.provider.completeBooking(id); } catch (_) {}
  const b = MOCK.bookings.find(x=>x.id===id);
  if (b) b.status = 'completed';
  renderMyBookings(); renderOverview();
  showToast('Booking marked as completed! 🎉');
}

/* ════════════════════════════════════════
   EARNINGS CHART
════════════════════════════════════════ */
function renderEarningsChart() {
  const d = MOCK.earningsData;
  const max = Math.max(...d.map(x=>x.val));
  setHTML('earningsChart', d.map(x=>`<div class="bar-col" style="flex:1"><div class="bar" style="height:${Math.round(x.val/max*100)}px" data-val="₹${x.val.toLocaleString('en-IN')}"></div><div class="bar-label">${x.month}</div></div>`).join(''));
}

/* ════════════════════════════════════════
   MESSAGES
════════════════════════════════════════ */
function renderMsgThreads() {
  setHTML('msgThreadList', MOCK.messages.map((m,i)=>`
    <div class="msg-thread ${i===activeThread?'active':''}" onclick="renderChat(${i})">
      <div class="msg-avatar">${m.avatar}</div>
      <div style="flex:1;min-width:0"><div class="msg-t-name">${m.name}</div><div class="msg-t-preview">${m.chat[m.chat.length-1]?.text||''}</div></div>
      ${m.unread?'<div class="msg-unread-dot"></div>':''}
    </div>`).join(''));
  setBadge('msgBadge', MOCK.messages.filter(m=>m.unread).length);
}

function renderChat(idx) {
  if (idx<0||idx>=MOCK.messages.length) return;
  activeThread = idx;
  const m = MOCK.messages[idx];
  setTxt('chatName',m.name); setTxt('chatRole',m.role);
  const av=document.getElementById('chatAvatar'); if(av) av.textContent=m.avatar;
  setHTML('chatBubbles', m.chat.map(c=>`<div class="bubble ${c.from==='me'?'sent':'recv'}"><div class="bubble-text">${c.text}</div><div class="bubble-time">${c.time}</div></div>`).join(''));
  const b=document.getElementById('chatBubbles'); if(b) b.scrollTop=99999;
  m.unread=false; renderMsgThreads();
}

function sendMsg() {
  const input=document.getElementById('msgInput');
  if (!input) return;
  const text=input.value.trim();
  if (!text||activeThread<0) return;
  const now=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  MOCK.messages[activeThread].chat.push({from:'me',text,time:now});
  input.value=''; renderChat(activeThread);
  API.messages.send(MOCK.messages[activeThread].id,text).catch(()=>{});
}

/* ════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════ */
function renderNotifications() {
  setHTML('allNotifsList', MOCK.notifications.map(n=>notifRowHTML(n,true)).join(''));
  setHTML('miniNotifs',    MOCK.notifications.slice(0,3).map(n=>notifRowHTML(n)).join(''));
  setBadge('notifBadge', MOCK.notifications.filter(n=>!n.read).length);
}

function notifRowHTML(n,clickable=false){
  return `<div class="notif-row ${n.read?'':'unread'}" ${clickable?`onclick="markRead(${n.id})"`:''}>
    ${!n.read?'<div class="notif-unread-dot"></div>':'<div style="width:7px"></div>'}
    <div class="notif-icon-wrap">${n.icon}</div>
    <div style="flex:1;min-width:0"><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div>
  </div>`;
}

function markRead(id){ const n=MOCK.notifications.find(x=>x.id===id); if(n) n.read=true; renderNotifications(); }
function markAllRead(){ MOCK.notifications.forEach(n=>n.read=true); renderNotifications(); showToast('All notifications marked as read'); }

/* ════════════════════════════════════════
   PROFILE
════════════════════════════════════════ */
function renderProfileSkills() {
  setHTML('skillsBox', MOCK.skills.map((s,i)=>`
    <div class="skill-chip">${s}<button onclick="removeSkill(${i})">×</button></div>`).join(''));
}

function addSkill() {
  const input=document.getElementById('skillInput');
  const val=input?.value.trim();
  if (!val||MOCK.skills.includes(val)){ if(input) input.value=''; return; }
  MOCK.skills.push(val); if(input) input.value='';
  renderProfileSkills(); showToast(`"${val}" added`);
}

function removeSkill(idx){ MOCK.skills.splice(idx,1); renderProfileSkills(); }

function renderProfileStats() {
  setHTML('profileStats', [
    {label:'Member Since',val:'2025'},
    {label:'Services Listed',val:`${MOCK.services.length}`},
    {label:'Jobs Completed',val:`${MOCK.bookings.filter(b=>b.status==='completed').length}`},
    {label:'Total Earnings',val:'₹18,400'},
    {label:'Avg Rating',val:'4.9 ★'},
  ].map(s=>`<div class="acc-stat-row"><span class="acc-stat-label">${s.label}</span><span class="acc-stat-val">${s.val}</span></div>`).join(''));
}

async function saveProfile() {
  const name=getVal('pName').trim();
  if(name){try{localStorage.setItem('nesaName',name);}catch(_){} setTxt('sidebarName',name); setTxt('profileName',name); setGreeting(name);}
  try{ await API.provider.updateProfile({name,email:getVal('pEmail'),phone:getVal('pPhone'),location:getVal('pLocation'),bio:getVal('pBio')}); }catch(_){}
  showToast('Profile saved!');
}

function doLogout(){ showToast('Logging out…'); setTimeout(()=>logout(),1000); }

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function setTxt(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function setHTML(id,h){const e=document.getElementById(id);if(e)e.innerHTML=h;}
function setVal(id,v){const e=document.getElementById(id);if(e)e.value=v||'';}
function getVal(id){return(document.getElementById(id)?.value||'').trim();}
function setBadge(id,n){const e=document.getElementById(id);if(e)e.textContent=n>0?n:'';}
function setLoadingBtn(btn,txt,on){if(!btn)return;btn.disabled=on;btn.textContent=txt;}
function nameInitial(n){return n?n.charAt(0).toUpperCase():'P';}
function today(){return new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function setGreeting(name){const h=new Date().getHours();const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';setTxt('greetText',`${g}, ${name.split(' ')[0]} 👋`);}
function categoryIcon(c){const m={Plumbing:'🔧',Electrical:'⚡',Painting:'🎨',Driving:'🚗','Maid / Cleaning':'🏠','Cleaning':'🏠',Carpentry:'🪵',Gardening:'🌿',Cooking:'🍳'};return m[c]||'🛠️';}

function showToast(msg,isError=false){
  const t=document.getElementById('toast');
  const icon=t?.querySelector('svg');
  const span=document.getElementById('toastMsg');
  if(!t||!span)return;
  span.textContent=msg;
  if(icon){icon.style.color=isError?'#c0392b':'#6b8f6e';icon.innerHTML=isError?'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>':'<polyline points="20 6 9 17 4 12"/>';}
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}
