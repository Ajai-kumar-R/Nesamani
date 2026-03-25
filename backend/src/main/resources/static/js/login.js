/* ═══════════════════════════════════════════
   NESAMANI — login.js
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* Password toggle */
  const toggleBtn = document.getElementById('togglePw');
  const pwInput   = document.getElementById('password');
  if (toggleBtn && pwInput) {
    toggleBtn.addEventListener('click', function () {
      const show = pwInput.type === 'password';
      pwInput.type = show ? 'text' : 'password';
      const o = this.querySelector('.eye-open');
      const c = this.querySelector('.eye-closed');
      if (o) o.style.display = show ? 'none'  : 'block';
      if (c) c.style.display = show ? 'block' : 'none';
    });
  }

  /* Live email validation */
  const emailEl = document.getElementById('email');
  if (emailEl) {
    emailEl.addEventListener('blur', () => {
      const v = emailEl.value.trim();
      setFieldError('email', 'email-error',
        v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Please enter a valid email.' : '');
    });
  }

  /* Form submit */
  const form = document.getElementById('loginForm');
  if (form) form.addEventListener('submit', handleLogin);
});


async function handleLogin(e) {
  e.preventDefault();

  const emailEl = document.getElementById('email');
  const passEl  = document.getElementById('password');
  const email    = emailEl.value.trim();
  const password = passEl.value;
  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('email', 'email-error', 'Please enter a valid email.'); valid = false;
  } else { setFieldError('email', 'email-error', ''); }

  if (!password || password.length < 6) {
    setFieldError('password', 'pw-error', 'Password must be at least 6 characters.'); valid = false;
  } else { setFieldError('password', 'pw-error', ''); }

  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  if (btn) { btn.classList.add('loading'); btn.disabled = true; }

  try {
    const res = await API.auth.login({ email, password });
    if (!res.success) throw new Error(res.error);

    const data = res.data;
    if (!data.token) throw new Error('No authentication token received.');

    /* Normalise role to lowercase */
    data.role = (data.role || '').toLowerCase();

    if (data.role !== 'needer' && data.role !== 'provider')
      throw new Error(`Unknown role "${data.role}". Please contact support.`);

    saveSession(data);
    showToast('Login successful! Redirecting…');
    setTimeout(() => redirectByRole(data.role), 1200);

  } catch (err) {
    showToast(err.message || 'Login failed. Please try again.', true);
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
  }
}


function setFieldError(inputId, errorId, msg) {
  const errEl = document.getElementById(errorId);
  const inp   = document.getElementById(inputId);
  if (errEl) errEl.textContent = msg;
  if (inp)   inp.classList.toggle('is-error', !!msg);
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toastIcon');
  const span  = document.getElementById('toastMsg');
  if (!toast || !span) return;
  span.textContent = msg;
  if (icon) {
    icon.style.color = isError ? '#c0392b' : '#6b8f6e';
    icon.innerHTML = isError
      ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
      : '<polyline points="20 6 9 17 4 12"/>';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
