/* ═══════════════════════════════════════════
   NESAMANI — api.js
   Requires: auth.js loaded first.
   ═══════════════════════════════════════════ */

const API_BASE_URL = '';

/* ── Core fetch wrapper ── */
async function apiCall(method, path, body = null, requiresAuth = true) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = getSession('token');
      if (!token) { window.location.href = 'login.html'; return { success:false, error:'Not authenticated.' }; }
      headers['Authorization'] = 'Bearer ' + token;
    }
    const options = { method, headers };
    if (body && ['POST','PUT','PATCH'].includes(method)) options.body = JSON.stringify(body);
    const res = await fetch(API_BASE_URL + path, options);
    if (res.status === 401) { clearSession(); window.location.href = 'login.html'; return { success:false, error:'Session expired.' }; }
    let data = null;
    const ct = res.headers.get('Content-Type') || '';
    data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) return { success:false, error:(data && (data.error || data.message)) || `Error ${res.status}` };
    return { success:true, data };
  } catch (err) {
    console.warn('[api.js]', err.message);
    return { success:false, error:'Cannot reach the server. Please check your connection.' };
  }
}

const GET    = (p, a=true)      => apiCall('GET',    p, null, a);
const POST   = (p, b, a=true)   => apiCall('POST',   p, b,    a);
const PUT    = (p, b, a=true)   => apiCall('PUT',    p, b,    a);
const PATCH  = (p, b, a=true)   => apiCall('PATCH',  p, b,    a);
const DEL    = (p, a=true)      => apiCall('DELETE', p, null, a);
const Q      = o => { const e=Object.entries(o).filter(([,v])=>v!=null&&v!==''); return e.length?'?'+e.map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'):''; };


/* ════ AUTH ════ */
const AuthAPI = {
  register: d => POST('/api/auth/register', d, false),
  login:    d => POST('/api/auth/login',    d, false)
};


/* ════ PUBLIC ════ */
const PublicAPI = {
  getOpenJobs:  (f={}) => GET(`/api/jobs/open${Q(f)}`,     false),
  getServices:  (f={}) => GET(`/api/services${Q(f)}`,      false),
  getProviders: (f={}) => GET(`/api/providers${Q(f)}`,     false)
};


/* ════ NEEDER API ════ */
const NeederAPI = {
  getDashboard:      ()            => GET('/api/needer/dashboard'),
  postJob:           d             => POST('/api/needer/jobs', d),
  getMyJobs:         (s=null)      => GET(`/api/needer/jobs${s?`?status=${s}`:''}`),
  updateJobStatus:   (id, s)       => PUT(`/api/needer/jobs/${id}/status?status=${s}`, null),
  deleteJob:         id            => DEL(`/api/needer/jobs/${id}`),
  getResponsesForJob:id            => GET(`/api/needer/jobs/${id}/responses`),
  acceptResponse:    id            => PUT(`/api/needer/responses/${id}/accept`, null),
  rejectResponse:    id            => PUT(`/api/needer/responses/${id}/reject`, null),
  bookProvider:      d             => POST('/api/needer/bookings', d),
  getMyBookings:     (s=null)      => GET(`/api/needer/bookings${s?`?status=${s}`:''}`),
  updateProfile:     d             => PUT('/api/needer/profile', d)
};


/* ════ PROVIDER API ════ */
const ProviderAPI = {
  getDashboard:    ()         => GET('/api/provider/dashboard'),
  getMyServices:   ()         => GET('/api/provider/services'),
  addService:      d          => POST('/api/provider/services', d),
  updateService:   (id, d)    => PUT(`/api/provider/services/${id}`, d),
  deleteService:   id         => DEL(`/api/provider/services/${id}`),
  browseJobs:      (f={})     => GET(`/api/provider/jobs${Q(f)}`),
  respondToJob:    (id, d)    => POST(`/api/provider/jobs/${id}/respond`, d),
  getMyResponses:  (s=null)   => GET(`/api/provider/responses${s?`?status=${s}`:''}`),
  withdrawResponse:id         => PUT(`/api/provider/responses/${id}/withdraw`, null),
  getMyBookings:   (s=null)   => GET(`/api/provider/bookings${s?`?status=${s}`:''}`),
  acceptBooking:   id         => PUT(`/api/provider/bookings/${id}/accept`, null),
  startBooking:    id         => PUT(`/api/provider/bookings/${id}/start`, null),
  completeBooking: id         => PUT(`/api/provider/bookings/${id}/complete`, null),
  updateProfile:   d          => PUT('/api/provider/profile', d)
};


/* ════ MESSAGES ════ */
const MessagesAPI = {
  getConversations: ()          => GET('/api/messages'),
  getConversation:  userId      => GET(`/api/messages/${userId}`),
  send:             (toId, msg) => POST('/api/messages/send', { toUserId:toId, message:msg }),
  markRead:         userId      => PATCH(`/api/messages/${userId}/read`, null)
};


/* ════ NOTIFICATIONS ════ */
const NotificationsAPI = {
  getAll:      ()  => GET('/api/notifications'),
  markRead:    id  => PATCH(`/api/notifications/${id}/read`, null),
  markAllRead: ()  => PATCH('/api/notifications/read-all', null)
};


/* ════ REVIEWS ════ */
const ReviewsAPI = {
  submit:     d      => POST('/api/reviews', d),
  getForUser: userId => GET(`/api/reviews/user/${userId}`, false)
};


/* ════ EXPORT ════ */
const API = {
  auth:          AuthAPI,
  public:        PublicAPI,
  needer:        NeederAPI,
  provider:      ProviderAPI,
  messages:      MessagesAPI,
  notifications: NotificationsAPI,
  reviews:       ReviewsAPI
};
