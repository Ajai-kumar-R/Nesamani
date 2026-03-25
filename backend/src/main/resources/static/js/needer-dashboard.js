/* ═══════════════════════════════════════════
   NESAMANI — needer-dashboard.js
   Work giver dashboard.
   Sections: Overview · Post Job · My Jobs ·
             Responses · Browse Services · Bookings ·
             Messages · Notifications · Profile
   ═══════════════════════════════════════════ */

/* ── mock data fallback (used when backend is offline) ── */
const MOCK = {
  name: getSession('name') || 'Needer',
  jobs: [
    {id:1,icon:'🔧',title:'Fix bathroom tap leak',description:'Main bathroom tap leaking badly.',category:'Plumbing',location:'Chennai',budget:'₹600–₹900',status:'open',date:'12 Mar 2026',responseCount:2},
    {id:2,icon:'⚡',title:'Rewire living room',description:'Two switchboards need rewiring.',category:'Electrical',location:'Chennai',budget:'₹1,200',status:'in_progress',date:'10 Mar 2026',responseCount:1},
    {id:3,icon:'🎨',title:'Interior painting 2BHK',description:'Full interior painting.',category:'Painting',location:'Chennai',budget:'₹8,000',status:'open',date:'08 Mar 2026',responseCount:3},
    {id:4,icon:'🚗',title:'Daily commute driver',description:'Need driver 6–9 AM and 6–9 PM.',category:'Driving',location:'Chennai',budget:'₹700/day',status:'completed',date:'01 Mar 2026',responseCount:2},
  ],
  responses: [
    {id:1,jobId:1,jobTitle:'Fix bathroom tap leak',providerName:'Murugan Selvam',providerIcon:'🔧',quotedPrice:'₹750',message:'I can fix the tap tomorrow morning.',status:'pending'},
    {id:2,jobId:1,jobTitle:'Fix bathroom tap leak',providerName:'Babu Krishnan',providerIcon:'⚡',quotedPrice:'₹800',message:'Available today after 4 PM.',status:'pending'},
    {id:3,jobId:2,jobTitle:'Rewire living room',providerName:'Lakshmi Rajan',providerIcon:'⚡',quotedPrice:'₹1,200',message:'I will assess and rewire safely.',status:'accepted'},
  ],
  services: [
    {id:1,icon:'🔧',title:'Pipe Fitting & Leak Repair',category:'Plumbing',price:'₹500',priceType:'PER_HOUR',location:'Trichy',providerName:'Murugan Selvam',providerRating:4.9},
    {id:2,icon:'⚡',title:'Home Electrical Wiring',category:'Electrical',price:'₹1,200',priceType:'FIXED',location:'Madurai',providerName:'Lakshmi Rajan',providerRating:4.8},
    {id:3,icon:'🎨',title:'Interior Wall Painting',category:'Painting',price:'₹12/sq.ft',priceType:'NEGOTIABLE',location:'Coimbatore',providerName:'Rajan Annamalai',providerRating:4.7},
    {id:4,icon:'🚗',title:'City & Outstation Driving',category:'Driving',price:'₹700',priceType:'PER_DAY',location:'Chennai',providerName:'Senthil Kumar',providerRating:4.9},
    {id:5,icon:'🏠',title:'Full Home Cleaning',category:'Cleaning',price:'₹5,000',priceType:'PER_MONTH',location:'Trichy',providerName:'Geetha Devi',providerRating:4.8},
    {id:6,icon:'🪵',title:'Custom Furniture Build',category:'Carpentry',price:'₹500',priceType:'PER_HOUR',location:'Salem',providerName:'Pandi Raj',providerRating:4.6},
    {id:7,icon:'🍳',title:'Home Cooking Service',category:'Cooking',price:'₹2,400',priceType:'PER_MONTH',location:'Madurai',providerName:'Chitra Priya',providerRating:4.9},
  ],
  bookings: [
    {id:1,icon:'🔧',title:'Tap repair',providerName:'Murugan Selvam',date:'12 Mar 2026',status:'completed',amount:'₹750'},
    {id:2,icon:'⚡',title:'Rewire switches',providerName:'Lakshmi Rajan',date:'10 Mar 2026',status:'in_progress',amount:'₹1,200'},
    {id:3,icon:'🍳',title:'Daily cooking',providerName:'Chitra Priya',date:'01 Mar 2026',status:'accepted',amount:'₹2,400'},
  ],
  notifications: [
    {id:1,icon:'💬',title:'New Response',msg:'<strong>Murugan Selvam</strong> responded to your tap repair job.',time:'5 mins ago',read:false},
    {id:2,icon:'💬',title:'New Response',msg:'<strong>Babu Krishnan</strong> also responded to your tap repair job.',time:'1 hr ago',read:false},
    {id:3,icon:'✅',title:'Booking Accepted',msg:'<strong>Lakshmi Rajan</strong> accepted your rewiring booking.',time:'2 hrs ago',read:false},
    {id:4,icon:'🎉',title:'Job Completed',msg:'Tap repair booking marked as completed.',time:'Yesterday',read:true},
    {id:5,icon:'⭐',title:'Leave a Review',msg:'Please rate your experience with Murugan Selvam.',time:'2 days ago',read:true},
  ],
  messages: [
    {id:101,avatar:'🔧',name:'Murugan Selvam',role:'Plumber · Trichy',preview:'I can come tomorrow at 10 AM',unread:true,
      chat:[{from:'them',text:'Hi! I saw your tap repair job. I can help.',time:'9:00 AM'},{from:'me',text:'How soon can you come?',time:'9:05 AM'},{from:'them',text:'I can come tomorrow at 10 AM. Approx cost ₹700–₹800.',time:'9:08 AM'}]},
    {id:102,avatar:'⚡',name:'Lakshmi Rajan',role:'Electrician · Madurai',preview:'Rewiring is done!',unread:false,
      chat:[{from:'me',text:'Lakshmi, living room needs rewiring.',time:'Yesterday'},{from:'them',text:'I will come Saturday.',time:'Yesterday'},{from:'them',text:'Rewiring is done! All tested and safe.',time:'Today'}]},
  ],
  spendingData:[{month:'Oct',val:1200},{month:'Nov',val:800},{month:'Dec',val:2200},{month:'Jan',val:1500},{month:'Feb',val:1800},{month:'Mar',val:2400}]
};

let activeThread = 0;
let currentJobFilter = 'all';
let currentResponseFilter = 'all';
let currentBookingFilter = 'all';

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('needer')) return;   /* auth.js — redirect if wrong role */

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
    const res = await API.needer.getDashboard();
    if (res.success) {
      const d = res.data;
      MOCK.jobs      = d.jobs          || MOCK.jobs;
      MOCK.responses = d.responses     || MOCK.responses;
      MOCK.bookings  = d.bookings      || MOCK.bookings;
      MOCK.notifications = d.notifications || MOCK.notifications;
    }
  } catch (_) { /* use mock */ }

  renderOverview();
  renderMyJobs();
  renderResponses();
  renderServices();
  renderBookings();
  renderMsgThreads();
  renderChat(0);
  renderNotifications();
  renderProfileStats();
  renderSpendingChart();
}

/* ════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════ */
const TITLES = {overview:'Overview','post-job':'Post a Job','my-jobs':'My Jobs',responses:'Responses','browse-services':'Browse Services',bookings:'Bookings',messages:'Messages',notifications:'Notifications',profile:'Profile'};

function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + page);
  const nav = document.getElementById('nav-' + page);
  if (sec) sec.classList.add('active');
  if (nav) nav.classList.add('active');
  setTxt('pageTitle', TITLES[page] || '');
  document.getElementById('sidebar')?.classList.remove('mobile-open');
}

function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('mobile-open'); }

/* ════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════ */
function renderOverview() {
  const active    = MOCK.jobs.filter(j=>j.status==='open'||j.status==='in_progress').length;
  const completed = MOCK.jobs.filter(j=>j.status==='completed').length;
  const pending   = MOCK.responses.filter(r=>r.status==='pending').length;

  setHTML('overviewStats', `
    <div class="stat-card"><div class="stat-icon si-gold">📋</div><div class="stat-val">${MOCK.jobs.length}</div><div class="stat-key">Jobs Posted</div><div class="stat-delta delta-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>All time</div></div>
    <div class="stat-card"><div class="stat-icon si-accent">⚡</div><div class="stat-val">${active}</div><div class="stat-key">Active</div><div class="stat-delta delta-warn">In progress</div></div>
    <div class="stat-card"><div class="stat-icon si-sage">✅</div><div class="stat-val">${completed}</div><div class="stat-key">Completed</div><div class="stat-delta delta-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>Great track record</div></div>
    <div class="stat-card"><div class="stat-icon si-clay">💬</div><div class="stat-val">${pending}</div><div class="stat-key">Pending Responses</div><div class="stat-delta delta-warn">Awaiting your action</div></div>
  `);
  setBadge('activeJobsBadge', active);
  setBadge('responseBadge', pending);

  /* Recent jobs */
  setHTML('overviewJobs', MOCK.jobs.slice(0,3).map(j=>jobRowHTML(j,true)).join('') || emptyState('No jobs yet','Post your first job to get started.'));

  /* Quick actions */
  setHTML('quickActions', `
    <button class="qa-item" onclick="navigate('post-job')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg><span>Post a Job</span></button>
    <button class="qa-item" onclick="navigate('browse-services')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><span>Browse Services</span></button>
    <button class="qa-item" onclick="navigate('responses')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>View Responses</span></button>
    <button class="qa-item" onclick="navigate('bookings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>My Bookings</span></button>
  `);

  /* Mini notifications */
  setHTML('miniNotifs', MOCK.notifications.slice(0,3).map(n=>notifRowHTML(n)).join(''));
}

/* ════════════════════════════════════════
   POST A JOB
════════════════════════════════════════ */
async function postJob() {
  const title    = getVal('jobTitle');
  const category = getVal('jobCategory');
  const location = getVal('jobLocation');
  const budget   = getVal('jobBudget');
  const duration = getVal('jobDuration');
  const desc     = getVal('jobDesc');
  const date     = getVal('jobDate');

  if (!title)    { showToast('Job title is required.', true); return; }
  if (!category) { showToast('Please select a category.', true); return; }
  if (!location) { showToast('Location is required.', true); return; }

  const btn = document.getElementById('postBtn');
  setLoading(btn, true);

  try {
    const res = await API.needer.postJob({ title, category, location, budget, duration, description:desc, date });
    if (!res.success) throw new Error(res.error);
    const newJob = res.data;
    MOCK.jobs.unshift({ id:newJob.id||Date.now(), icon:categoryIcon(category), title, category, location, budget, status:'open', date:today(), responseCount:0 });
  } catch (_) {
    MOCK.jobs.unshift({ id:Date.now(), icon:categoryIcon(category), title, category, location, budget, status:'open', date:today(), responseCount:0 });
  }

  ['jobTitle','jobLocation','jobBudget','jobDesc','jobDate'].forEach(id=>setVal(id,''));
  setVal('jobCategory',''); setVal('jobDuration','');
  setLoading(btn, false);
  renderOverview(); renderMyJobs();
  showToast('Job posted! Providers will be notified.');
  navigate('my-jobs');
}

/* ════════════════════════════════════════
   MY JOBS
════════════════════════════════════════ */
function renderMyJobs(filter = currentJobFilter) {
  currentJobFilter = filter;
  const data = filter === 'all' ? MOCK.jobs : MOCK.jobs.filter(j => j.status === filter);
  setHTML('myJobsList', data.length ? data.map(j=>jobRowHTML(j,true)).join('') : `<div class="empty-state"><div class="empty-icon">📋</div><h4>No jobs here</h4><p>Post your first job above.</p></div>`);
}

function filterJobs(btn) {
  document.querySelectorAll('#jobFilterTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderMyJobs(btn.dataset.f);
}

function jobRowHTML(j, showResponses=false) {
  return `
  <div class="item-row" onclick="navigate('responses')">
    <div class="item-icon">${j.icon||'🛠️'}</div>
    <div class="item-info">
      <div class="item-title">${j.title}</div>
      <div class="item-meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${j.location||'—'} &nbsp;·&nbsp; ${j.date||''}
        ${showResponses && j.responseCount ? `&nbsp;·&nbsp; <strong>${j.responseCount} response${j.responseCount>1?'s':''}</strong>` : ''}
      </div>
    </div>
    <span class="item-badge badge-${j.status?.toLowerCase()}">${(j.status||'').replace('_',' ')}</span>
    <span class="item-amount">${j.budget||'—'}</span>
  </div>`;
}

/* ════════════════════════════════════════
   RESPONSES (Flow A)
   Needer sees who responded → accepts/rejects
════════════════════════════════════════ */
function renderResponses(filter = currentResponseFilter) {
  currentResponseFilter = filter;
  const data = filter === 'all' ? MOCK.responses : MOCK.responses.filter(r=>r.status===filter);
  setHTML('responsesList', data.length ? data.map(r => `
    <div class="item-row">
      <div class="item-icon">${r.providerIcon||'👷'}</div>
      <div class="item-info">
        <div class="item-title">${r.providerName}</div>
        <div class="item-meta">For: <strong>${r.jobTitle}</strong> &nbsp;·&nbsp; Quoted: <strong>${r.quotedPrice||'—'}</strong></div>
        <div class="item-meta" style="margin-top:3px;font-style:italic;color:var(--muted)">"${r.message||''}"</div>
      </div>
      <span class="item-badge badge-${r.status}">${r.status}</span>
      ${r.status==='pending' ? `
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn-sm success" onclick="acceptResponse(${r.id})">Accept</button>
          <button class="btn-sm danger"  onclick="rejectResponse(${r.id})">Reject</button>
        </div>` : ''}
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">💬</div><h4>No responses yet</h4><p>Post a job and providers will respond.</p></div>`);
}

function filterResponses(btn) {
  document.querySelectorAll('#responseFilterTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderResponses(btn.dataset.f);
}

async function acceptResponse(id) {
  const r = MOCK.responses.find(x=>x.id===id);
  if (!r) return;
  try {
    const res = await API.needer.acceptResponse(id);
    if (!res.success) throw new Error(res.error);
  } catch (_) { /* offline */ }
  r.status = 'accepted';
  /* Also update job status */
  const job = MOCK.jobs.find(j=>j.id===r.jobId);
  if (job) job.status = 'in_progress';
  /* Create a booking in mock */
  MOCK.bookings.unshift({id:Date.now(),icon:r.providerIcon,title:r.jobTitle,providerName:r.providerName,date:today(),status:'accepted',amount:r.quotedPrice});
  renderResponses(); renderMyJobs(); renderOverview(); renderBookings();
  showToast(`${r.providerName} accepted! Booking created.`);
}

async function rejectResponse(id) {
  try { await API.needer.rejectResponse(id); } catch (_) {}
  const r = MOCK.responses.find(x=>x.id===id);
  if (r) r.status = 'rejected';
  renderResponses(); renderOverview();
  showToast('Response rejected.');
}

/* ════════════════════════════════════════
   BROWSE SERVICES (Flow B)
   Needer sees provider services → books directly
════════════════════════════════════════ */
async function renderServices(query='') {
  let data = MOCK.services;
  try {
    const res = await API.public.getServices(query ? {query} : {});
    if (res.success && res.data?.length) data = res.data;
  } catch (_) {}
  const filtered = query ? data.filter(s=>s.title.toLowerCase().includes(query)||s.category.toLowerCase().includes(query)||s.providerName?.toLowerCase().includes(query)) : data;
  setHTML('serviceGrid', filtered.length ? filtered.map(s=>`
    <div class="service-card" onclick="showBookModal(${s.id})">
      <div class="sc-icon">${s.icon||'🛠️'}</div>
      <div class="sc-title">${s.title}</div>
      <div class="sc-category">${s.category}</div>
      <div class="sc-price">${s.price} <span style="font-size:11px;font-weight:400;color:var(--muted)">${priceTypeLabel(s.priceType)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="sc-provider">👤 ${s.providerName||'—'} <span class="sc-rating" style="margin-left:6px">★ ${s.providerRating||'—'}</span></div>
        <button class="btn-sm" onclick="event.stopPropagation();showBookModal(${s.id})">Book →</button>
      </div>
    </div>`).join('') : `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h4>No services found</h4><p>Try a different search.</p></div>`);
}

function filterServices() { renderServices(document.getElementById('serviceSearch')?.value.trim().toLowerCase()||''); }

function priceTypeLabel(t) { return {FIXED:'fixed',PER_HOUR:'/hr',PER_DAY:'/day',PER_MONTH:'/month',NEGOTIABLE:'negotiable'}[t]||''; }

function showBookModal(serviceId) {
  const s = MOCK.services.find(x=>x.id===serviceId);
  if (!s) return;
  const note = prompt(`Book "${s.title}" from ${s.providerName}?\n\nAny notes or instructions? (optional)`, '');
  if (note === null) return;  /* cancelled */
  bookService(serviceId, note);
}

async function bookService(serviceId, notes='') {
  const s = MOCK.services.find(x=>x.id===serviceId);
  if (!s) return;
  try {
    const res = await API.needer.bookProvider({ providerId: s.providerId||0, serviceId, notes });
    if (!res.success) throw new Error(res.error);
  } catch (_) { /* offline */ }
  MOCK.bookings.unshift({id:Date.now(),icon:s.icon,title:s.title,providerName:s.providerName,date:today(),status:'pending',amount:s.price});
  renderBookings(); renderOverview();
  showToast(`Booking request sent to ${s.providerName}!`);
  navigate('bookings');
}

/* ════════════════════════════════════════
   BOOKINGS
════════════════════════════════════════ */
function renderBookings(filter = currentBookingFilter) {
  currentBookingFilter = filter;
  const data = filter === 'all' ? MOCK.bookings : MOCK.bookings.filter(b=>b.status===filter);
  setHTML('bookingsList', data.length ? data.map(b=>`
    <div class="item-row">
      <div class="item-icon">${b.icon||'📅'}</div>
      <div class="item-info">
        <div class="item-title">${b.title}</div>
        <div class="item-meta">👤 ${b.providerName} &nbsp;·&nbsp; ${b.date}</div>
      </div>
      <span class="item-badge badge-${b.status?.toLowerCase()}">${(b.status||'').replace('_',' ')}</span>
      <span class="item-amount">${b.amount||'—'}</span>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">📅</div><h4>No bookings yet</h4><p>Accept a response or book a service to get started.</p></div>`);
}

function filterBookings(btn) {
  document.querySelectorAll('#bookingFilterTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderBookings(btn.dataset.f);
}

/* ════════════════════════════════════════
   SPENDING CHART
════════════════════════════════════════ */
function renderSpendingChart() {
  const d = MOCK.spendingData;
  const max = Math.max(...d.map(x=>x.val));
  setHTML('spendingChart', d.map(x=>`<div class="bar-col" style="flex:1"><div class="bar" style="height:${Math.round(x.val/max*100)}px" data-val="₹${x.val.toLocaleString('en-IN')}"></div><div class="bar-label">${x.month}</div></div>`).join(''));
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
  setTxt('chatName', m.name); setTxt('chatRole', m.role);
  const av = document.getElementById('chatAvatar'); if(av) av.textContent = m.avatar;
  setHTML('chatBubbles', m.chat.map(c=>`<div class="bubble ${c.from==='me'?'sent':'recv'}"><div class="bubble-text">${c.text}</div><div class="bubble-time">${c.time}</div></div>`).join(''));
  const b = document.getElementById('chatBubbles'); if(b) b.scrollTop=99999;
  m.unread = false; renderMsgThreads();
}

function sendMsg() {
  const input = document.getElementById('msgInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text||activeThread<0) return;
  const now = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  MOCK.messages[activeThread].chat.push({from:'me',text,time:now});
  input.value=''; renderChat(activeThread);
  API.messages.send(MOCK.messages[activeThread].id, text).catch(()=>{});
}

/* ════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════ */
function renderNotifications() {
  setHTML('allNotifsList', MOCK.notifications.map(n=>notifRowHTML(n,true)).join(''));
  setHTML('miniNotifs', MOCK.notifications.slice(0,3).map(n=>notifRowHTML(n)).join(''));
  setBadge('notifBadge', MOCK.notifications.filter(n=>!n.read).length);
}

function notifRowHTML(n, clickable=false) {
  return `<div class="notif-row ${n.read?'':'unread'}" ${clickable?`onclick="markRead(${n.id})"`:''}>
    ${!n.read?'<div class="notif-unread-dot"></div>':'<div style="width:7px"></div>'}
    <div class="notif-icon-wrap">${n.icon}</div>
    <div style="flex:1;min-width:0"><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div>
  </div>`;
}

function markRead(id) { const n=MOCK.notifications.find(x=>x.id===id); if(n) n.read=true; renderNotifications(); }

function markAllRead() { MOCK.notifications.forEach(n=>n.read=true); renderNotifications(); showToast('All notifications marked as read'); }

/* ════════════════════════════════════════
   PROFILE
════════════════════════════════════════ */
function renderProfileStats() {
  setHTML('profileStats', [
    {label:'Member Since',val:'2025'},
    {label:'Jobs Posted',val:`${MOCK.jobs.length}`},
    {label:'Bookings Made',val:`${MOCK.bookings.length}`},
    {label:'Reviews Given',val:'3'},
  ].map(s=>`<div class="acc-stat-row"><span class="acc-stat-label">${s.label}</span><span class="acc-stat-val">${s.val}</span></div>`).join(''));
}

async function saveProfile() {
  const name = getVal('pName').trim();
  if (name) { try{localStorage.setItem('nesaName',name);}catch(_){} setTxt('sidebarName',name); setTxt('profileName',name); setGreeting(name); }
  try { await API.needer.updateProfile({ name, email:getVal('pEmail'), phone:getVal('pPhone'), location:getVal('pLocation'), bio:getVal('pBio') }); } catch(_){}
  showToast('Profile saved!');
}

function doLogout() { showToast('Logging out…'); setTimeout(()=>logout(), 1000); }

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function setTxt(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function setHTML(id,h){const e=document.getElementById(id);if(e)e.innerHTML=h;}
function setVal(id,v){const e=document.getElementById(id);if(e)e.value=v||'';}
function getVal(id){return(document.getElementById(id)?.value||'').trim();}
function setBadge(id,n){const e=document.getElementById(id);if(e)e.textContent=n>0?n:'';}
function setLoading(btn,on){if(!btn)return;btn.disabled=on;btn.textContent=on?'Posting…':'Post Job →';}
function nameInitial(n){return n?n.charAt(0).toUpperCase():'N';}
function today(){return new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function emptyState(h,p){return`<div class="empty-state"><div class="empty-icon">📋</div><h4>${h}</h4><p>${p}</p></div>`;}
function setGreeting(name){const h=new Date().getHours();const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';setTxt('greetText',`${g}, ${name.split(' ')[0]} 👋`);}
function categoryIcon(c){const m={Plumbing:'🔧',Electrical:'⚡',Painting:'🎨',Driving:'🚗','Maid / Cleaning':'🏠',Carpentry:'🪵',Gardening:'🌿',Cooking:'🍳'};return m[c]||'🛠️';}

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
