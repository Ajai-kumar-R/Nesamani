/* ═══════════════════════════════════════════
   NESAMANI — register.js
   Requires: auth.js, api.js (loaded before this)
   Roles: "needer" (work giver) | "provider" (work doer)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* Role toggle */
  const roleToggle = document.getElementById('roleToggle');
  const roleInput  = document.getElementById('role');
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      roleInput.value = btn.dataset.role;
      roleToggle.classList.toggle('provider-active', btn.dataset.role === 'provider');
    });
  });

  /* Password toggle */
  const togglePw = document.getElementById('togglePw');
  const pwInput  = document.getElementById('password');
  if (togglePw && pwInput) {
    togglePw.addEventListener('click', function () {
      const show = pwInput.type === 'password';
      pwInput.type = show ? 'text' : 'password';
      const o = this.querySelector('.eye-open');
      const c = this.querySelector('.eye-closed');
      if (o) o.style.display = show ? 'none'  : 'block';
      if (c) c.style.display = show ? 'block' : 'none';
    });
  }

  /* Password strength */
  if (pwInput) {
    pwInput.addEventListener('input', function () {
      const fill  = document.getElementById('strengthFill');
      const label = document.getElementById('strengthLabel');
      if (!fill || !label) return;
      const v = this.value;
      if (!v) { fill.className = 'strength-fill'; label.textContent = ''; return; }
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      fill.className = `strength-fill s${s}`;
      label.textContent = ['','Weak','Fair','Good','Strong'][s];
      label.style.color = ['','#c0392b','#d4a96a','#c9943a','#6b8f6e'][s];
    });
  }

  /* Live validations */
  document.getElementById('email')?.addEventListener('blur', function () {
    const v = this.value.trim();
    setErr('email','email-error', v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Valid email required.' : '');
  });
  document.getElementById('phone')?.addEventListener('blur', function () {
    const v = this.value.replace(/\s/g,'');
    setErr('phone','phone-error', v && !/^\+?[0-9]{8,15}$/.test(v) ? 'Valid phone required.' : '');
  });

  /* Form submit */
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
});


async function handleRegister(e) {
  e.preventDefault();
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const role     = document.getElementById('role').value;      /* "needer" or "provider" */
  const terms    = document.getElementById('terms')?.checked;

  let valid = true;
  if (!name || name.length < 2)   { setErr('name','name-error','Enter your full name.'); valid=false; } else setErr('name','name-error','');
  if (!/^\+?[\d\s]{8,15}$/.test(phone.replace(/\s/g,''))) { setErr('phone','phone-error','Valid phone required.'); valid=false; } else setErr('phone','phone-error','');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email','email-error','Valid email required.'); valid=false; } else setErr('email','email-error','');
  if (password.length < 8)        { setErr('password','pw-error','Min 8 characters.'); valid=false; } else setErr('password','pw-error','');
  if (!terms) { showToast('Please accept the Terms & Conditions.', true); return; }
  if (!valid) return;

  const btn = document.getElementById('registerBtn');
  if (btn) { btn.classList.add('loading'); btn.disabled = true; }

  try {
    const res = await API.auth.register({ name, email, phone, password, role });
    if (!res.success) throw new Error(res.error);
    showToast('Account created! Redirecting to login…');
    setTimeout(() => { window.location.href = 'login.html'; }, 1600);
  } catch (err) {
    showToast(err.message || 'Registration failed. Please try again.', true);
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
  }
}


function setErr(inputId, errorId, msg) {
  const e = document.getElementById(errorId);
  const i = document.getElementById(inputId);
  if (e) e.textContent = msg;
  if (i) i.classList.toggle('is-error', !!msg);
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const icon  = toast ? toast.querySelector('svg') : null;
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
