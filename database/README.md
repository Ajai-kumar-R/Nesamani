# Nesamani 🌴

### Direct Worker Hiring Platform

Nesamani connects customers directly with skilled workers — no middlemen, no hidden fees, no broker cuts. Built for Tamil Nadu's workforce, it lets customers find verified professionals instantly and lets workers keep 100% of their earnings.

---

## 📁 Project Structure

```
nesamani/
│
├── index.html          # Landing page (hero, search, services, testimonials)
├── login.html          # Login page
├── register.html       # Registration page
└── dashboard.html      # User dashboard (connect your backend)
```

> **Each file is fully self-contained** — all CSS and JavaScript are embedded inline. No build tools, no npm, no server required. Just open any `.html` file directly in your browser.

---

## 🚀 Getting Started

### Option 1 — Open directly in browser

Simply double-click `index.html`. No installation needed.

### Option 2 — Run with a local server (recommended for backend API calls)

**Using Python:**

```bash
python -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

**Using Node.js:**

```bash
npx serve .
```

---

## 🔌 Backend API

The frontend expects a backend running at `http://localhost:8080`. Update the fetch URLs in `login.html` and `register.html` if your backend runs on a different port.

### Endpoints

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| `POST` | `/api/login`    | Authenticate a user |
| `POST` | `/api/register` | Register a new user |

### Login Request Body

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Login Response (expected)

```json
{
  "token": "your_jwt_token_here"
}
```

### Register Request Body

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "phone": "+91 98765 43210",
  "password": "yourpassword",
  "role": "worker"
}
```

> `role` is either `"worker"` or `"provider"`

---

## ✨ Features

### Landing Page (`index.html`)

- Fixed glass-blur navigation bar
- Split hero section with animated floating worker profile cards
- Live search bar — filters by job type and location
- Services grid (Plumbing, Electrical, Painting, Driving, Maid, Carpentry, Gardening, Cooking)
- "Why Nesamani" section with 3-step how-it-works card
- Customer & worker testimonials
- Call-to-action banner and full footer
- Scroll-reveal animations on all sections

### Login Page (`login.html`)

- Email & password validation
- Password show/hide toggle
- Remember me checkbox
- Loading spinner on submit
- Toast notifications (replaces browser alerts)
- Links to Register page

### Register Page (`register.html`)

- Role toggle — Worker vs Service Provider (animated sliding pill)
- Two-column name & phone layout
- Live password strength meter (Weak → Fair → Good → Strong)
- Terms & Conditions checkbox
- Full form validation with inline error messages
- Toast notifications on success/failure
- Links to Login page

---

## 🎨 Design System

| Token     | Value     | Usage                      |
| --------- | --------- | -------------------------- |
| `--soil`  | `#1a1208` | Primary text, backgrounds  |
| `--bark`  | `#2d1f0e` | Brand panel background     |
| `--earth` | `#5c3d1e` | Buttons, labels            |
| `--gold`  | `#c9943a` | Accents, links, highlights |
| `--sand`  | `#d4a96a` | Secondary accents          |
| `--cream` | `#f5eed8` | Card backgrounds           |
| `--ivory` | `#faf7ef` | Page background            |
| `--sage`  | `#6b8f6e` | Success states             |

**Fonts:**

- Display / Headings — `Cormorant Garamond` (Google Fonts)
- Body / UI — `DM Sans` (Google Fonts)

---

## 🛠️ Tech Stack

| Layer              | Technology                                                   |
| ------------------ | ------------------------------------------------------------ |
| Frontend           | Vanilla HTML, CSS, JavaScript                                |
| Fonts              | Google Fonts (Cormorant Garamond, DM Sans)                   |
| Icons              | Inline SVG                                                   |
| Backend (expected) | Any REST API — Java Spring Boot, Node.js, Python Flask, etc. |
| Auth               | JWT token stored in `localStorage`                           |

---

## 📱 Responsive Breakpoints

| Breakpoint | Behaviour                                          |
| ---------- | -------------------------------------------------- |
| `> 900px`  | Full layout — brand panel + auth card side by side |
| `≤ 900px`  | Brand panel hidden, auth card centred              |
| `≤ 640px`  | Padding reduced, single-column register form       |

---

## 🔒 Security Notes

- Passwords are sent over the network — **use HTTPS in production**
- JWT tokens are stored in `localStorage` — consider `httpOnly` cookies for production
- All form inputs are validated client-side; always validate server-side too
- CORS must be configured on your backend to accept requests from the frontend origin

---

## 📌 Roadmap / Suggested Next Steps

- [ ] Dashboard page for workers and customers
- [ ] Worker profile listing page with search & filters
- [ ] Real-time chat between worker and customer
- [ ] Booking / job request flow
- [ ] Payment integration
- [ ] Review and rating system
- [ ] Admin panel for moderation

---

## 🏗️ Recommended Backend Stack (Spring Boot)

```
src/
└── main/java/com/nesamani/
    ├── controller/
    │   ├── AuthController.java      # /api/login, /api/register
    │   └── WorkerController.java    # /api/workers
    ├── model/
    │   ├── User.java
    │   └── Worker.java
    ├── repository/
    │   └── UserRepository.java
    ├── service/
    │   └── AuthService.java
    └── security/
        └── JwtConfig.java
```

---

## 👨‍💻 Author

Built with care for Tamil Nadu's skilled workforce.

**© 2026 Nesamani — Placement Eligibility & Shortlisting System** 🌴
