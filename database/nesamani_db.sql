-- ═══════════════════════════════════════════════════════════════
--   NESAMANI — Complete MySQL Database Setup
--   Run this file in MySQL Workbench or terminal:
--   mysql -u root -p < nesamani_db.sql
-- ═══════════════════════════════════════════════════════════════

-- ── Step 1: Create & select database ────────────────────────────
DROP DATABASE IF EXISTS nesamani_db;
CREATE DATABASE nesamani_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nesamani_db;

-- ═══════════════════════════════════════════════════════════════
--   TABLE: users
--   Stores both workers (role=WORKER) and providers (role=PROVIDER)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100)  NOT NULL,
    email            VARCHAR(150)  NOT NULL UNIQUE,
    password         VARCHAR(255)  NOT NULL,   -- BCrypt hashed
    phone            VARCHAR(20),
    role             ENUM('WORKER','PROVIDER') NOT NULL,
    location         VARCHAR(150),
    bio              TEXT,
    category         VARCHAR(100),             -- Worker's skill category
    rating           DOUBLE        DEFAULT 0.0,
    jobs_completed   INT           DEFAULT 0,
    availability     ENUM('AVAILABLE','BUSY','OFFLINE') DEFAULT 'AVAILABLE',
    created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_email    (email),
    INDEX idx_role     (role),
    INDEX idx_category (category),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE: jobs
--   Job postings created by PROVIDER users
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE jobs (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    title          VARCHAR(200)  NOT NULL,
    category       VARCHAR(100)  NOT NULL,
    location       VARCHAR(150)  NOT NULL,
    budget         VARCHAR(100),
    duration       VARCHAR(100),
    description    TEXT,
    expected_date  DATE,
    status         ENUM('OPEN','ACTIVE','COMPLETED','CANCELLED') DEFAULT 'OPEN',
    provider_id    BIGINT        NOT NULL,     -- FK → users (PROVIDER)
    worker_id      BIGINT,                     -- FK → users (WORKER) — set when accepted
    created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id)   REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status     (status),
    INDEX idx_category   (category),
    INDEX idx_location   (location),
    INDEX idx_provider   (provider_id),
    INDEX idx_worker     (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE: applications
--   A worker's application to a job posting
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE applications (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    job_id        BIGINT        NOT NULL,
    worker_id     BIGINT        NOT NULL,
    cover_note    TEXT,
    quoted_price  VARCHAR(100),
    status        ENUM('APPLIED','ACCEPTED','REJECTED','COMPLETED','WITHDRAWN') DEFAULT 'APPLIED',
    applied_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_job_worker (job_id, worker_id),   -- one application per worker per job
    FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_worker_app (worker_id),
    INDEX idx_job_app    (job_id),
    INDEX idx_app_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE: messages
--   Direct messages between workers and providers
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE messages (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    sender_id    BIGINT        NOT NULL,
    receiver_id  BIGINT        NOT NULL,
    message      TEXT          NOT NULL,
    is_read      BOOLEAN       DEFAULT FALSE,
    sent_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender   (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_sent_at  (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE: notifications
--   In-app notifications for users
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    user_id    BIGINT        NOT NULL,
    icon       VARCHAR(10)   DEFAULT '🔔',
    message    TEXT          NOT NULL,
    is_read    BOOLEAN       DEFAULT FALSE,
    created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notif  (user_id),
    INDEX idx_notif_read  (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE: reviews
--   Ratings left after a job is completed
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE reviews (
    id           BIGINT   NOT NULL AUTO_INCREMENT,
    job_id       BIGINT   NOT NULL,
    reviewer_id  BIGINT   NOT NULL,   -- person leaving the review
    reviewed_id  BIGINT   NOT NULL,   -- person being reviewed
    rating       TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_job_reviewer (job_id, reviewer_id),
    FOREIGN KEY (job_id)      REFERENCES jobs(id)  ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviewed (reviewed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   SAMPLE DATA
--   Passwords are BCrypt hashes of the plain text shown in comments.
--   All sample user passwords = "password123"
-- ═══════════════════════════════════════════════════════════════

-- ── Sample Workers ──────────────────────────────────────────────
INSERT INTO users (name, email, password, phone, role, location, bio, category, rating, jobs_completed, availability) VALUES
(
  'Murugan Selvam',
  'murugan@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', -- password123
  '+91 98765 43210',
  'WORKER',
  'Trichy',
  'Experienced plumber with 10+ years of hands-on work. Known for punctuality and fair pricing.',
  'Plumbing',
  4.9,
  342,
  'AVAILABLE'
),
(
  'Lakshmi Rajan',
  'lakshmi@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43211',
  'WORKER',
  'Madurai',
  'Certified electrician skilled in residential wiring and solar panel setups.',
  'Electrical',
  4.8,
  218,
  'AVAILABLE'
),
(
  'Rajan Annamalai',
  'rajan@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43212',
  'WORKER',
  'Coimbatore',
  'Artistic painter specialising in interior decoration and texture finishes.',
  'Painting',
  4.7,
  193,
  'BUSY'
),
(
  'Senthil Kumar',
  'senthil@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43213',
  'WORKER',
  'Chennai',
  'Licensed driver with 12 years of safe driving record. Available for outstation trips.',
  'Driving',
  4.9,
  580,
  'AVAILABLE'
),
(
  'Geetha Devi',
  'geetha@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43214',
  'WORKER',
  'Trichy',
  'Dependable maid with 6 years of experience. Excellent references from long-term employers.',
  'Maid / Cleaning',
  4.8,
  430,
  'AVAILABLE'
),
(
  'Pandi Raj',
  'pandi@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43215',
  'WORKER',
  'Salem',
  'Master carpenter with 15 years crafting custom furniture and quality joinery work.',
  'Carpentry',
  4.6,
  164,
  'AVAILABLE'
),
(
  'Malar Vizhi',
  'malar@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43216',
  'WORKER',
  'Erode',
  'Passionate gardener with expertise in ornamental and kitchen gardens.',
  'Gardening',
  4.7,
  89,
  'AVAILABLE'
),
(
  'Chitra Priya',
  'chitra@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43217',
  'WORKER',
  'Madurai',
  'Experienced cook specialising in authentic Tamil home cooking and North Indian cuisine.',
  'Cooking',
  4.9,
  256,
  'AVAILABLE'
),
(
  'Babu Krishnan',
  'babu@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43218',
  'WORKER',
  'Chennai',
  'Young electrician with solid residential electrical work experience.',
  'Electrical',
  4.5,
  121,
  'AVAILABLE'
),
(
  'Kamala Devi',
  'kamala@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 98765 43219',
  'WORKER',
  'Chennai',
  'Multi-skilled domestic worker combining household cleaning with home cooking.',
  'Maid / Cleaning',
  4.8,
  310,
  'AVAILABLE'
);

-- ── Sample Providers (work givers) ──────────────────────────────
INSERT INTO users (name, email, password, phone, role, location, bio, availability) VALUES
(
  'Priya Nair',
  'priya@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 90001 11001',
  'PROVIDER',
  'Chennai',
  'Homeowner looking for reliable domestic help.',
  'AVAILABLE'
),
(
  'Arjun Menon',
  'arjun@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 90001 11002',
  'PROVIDER',
  'Madurai',
  'Small business owner, frequently need maintenance workers.',
  'AVAILABLE'
),
(
  'Meena Sundaram',
  'meena@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 90001 11003',
  'PROVIDER',
  'Trichy',
  'Working professional. Need part-time household help.',
  'AVAILABLE'
),
(
  'Ravi Kumar',
  'ravi@nesamani.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  '+91 90001 11004',
  'PROVIDER',
  'Coimbatore',
  'House owner looking for electrician and plumber services.',
  'AVAILABLE'
);


-- ── Sample Jobs (posted by providers) ───────────────────────────
-- provider_id 11 = Priya Nair, 12 = Arjun, 13 = Meena, 14 = Ravi

INSERT INTO jobs (title, category, location, budget, duration, description, status, provider_id, worker_id) VALUES
(
  'Fix bathroom tap leak',
  'Plumbing',
  'Chennai',
  '₹600–₹900',
  'One-time visit',
  'The tap in the main bathroom is leaking badly. Need urgent repair.',
  'ACTIVE',
  11,
  1   -- Murugan assigned
),
(
  'Rewire living room switches',
  'Electrical',
  'Madurai',
  '₹1,200',
  'One-time visit',
  'Two switchboards need complete replacement and safe rewiring.',
  'ACTIVE',
  12,
  2   -- Lakshmi assigned
),
(
  'Interior wall painting — 2BHK',
  'Painting',
  'Coimbatore',
  '₹8,000',
  '3 days',
  'Full interior painting for a 2-bedroom flat. Walls only.',
  'OPEN',
  14,
  NULL
),
(
  'Daily office commute driver',
  'Driving',
  'Chennai',
  '₹700/day',
  'Long term',
  'Need a driver 6 AM–9 AM and 6 PM–9 PM, Monday to Saturday.',
  'OPEN',
  11,
  NULL
),
(
  'Part-time maid 4 hours/day',
  'Maid / Cleaning',
  'Trichy',
  '₹5,000/month',
  '1 month',
  'Morning cleaning, vessel washing, and basic cooking. 6 days a week.',
  'ACTIVE',
  13,
  5   -- Geetha assigned
),
(
  'Build custom wardrobe',
  'Carpentry',
  'Salem',
  '₹12,000',
  '1 week',
  'Need a full-wall sliding wardrobe for master bedroom. Size 8×7 ft.',
  'COMPLETED',
  12,
  6   -- Pandi assigned
),
(
  'Garden layout and plants',
  'Gardening',
  'Erode',
  '₹1,500',
  'One-time visit',
  'Want to set up a small terrace garden. Need plant recommendations.',
  'CANCELLED',
  13,
  NULL
),
(
  'Daily cooking service',
  'Cooking',
  'Madurai',
  '₹2,400/month',
  '1 month',
  'South Indian breakfast and lunch prep for a family of four.',
  'COMPLETED',
  12,
  8   -- Chitra assigned
),
(
  'Solar panel wiring inspection',
  'Electrical',
  'Coimbatore',
  '₹1,800',
  'One-time visit',
  'Existing solar panels need wiring inspection and minor repairs.',
  'OPEN',
  14,
  NULL
),
(
  'Pipe fitting for new bathroom',
  'Plumbing',
  'Trichy',
  '₹4,500',
  '2 days',
  'New bathroom setup. Need all plumbing connections done from scratch.',
  'OPEN',
  13,
  NULL
);


-- ── Sample Applications ──────────────────────────────────────────
INSERT INTO applications (job_id, worker_id, cover_note, quoted_price, status) VALUES
-- Job 3 (Painting): Rajan applied
(3, 3, 'I specialise in interior texture painting. Can complete in 3 days.', '₹8,000', 'APPLIED'),
-- Job 4 (Driver): Senthil applied
(4, 4, 'Available for the timings. I have 12 years driving experience.', '₹700/day', 'APPLIED'),
-- Job 6 (Carpentry): Pandi completed
(6, 6, 'I can build a custom sliding wardrobe to exact measurements.', '₹11,500', 'COMPLETED'),
-- Job 8 (Cooking): Chitra completed
(8, 8, 'South Indian cooking is my speciality. Available daily.', '₹2,400/month', 'COMPLETED'),
-- Job 9 (Electrical): Lakshmi applied, Babu also applied
(9, 2, 'I have experience with solar systems. Can inspect tomorrow.', '₹1,800', 'APPLIED'),
(9, 9, 'I can do the solar inspection this weekend.', '₹1,500', 'APPLIED'),
-- Job 10 (Plumbing): Murugan applied
(10, 1, 'I can complete the full bathroom plumbing setup in 2 days.', '₹4,200', 'APPLIED');


-- ── Sample Messages ──────────────────────────────────────────────
-- Between Priya (11) and Murugan (1) about job 1
INSERT INTO messages (sender_id, receiver_id, message) VALUES
(11, 1, 'Hi Murugan, the tap in our bathroom is leaking badly.'),
(1, 11, 'I can come and fix it. What time suits you?'),
(11, 1, 'Can you come tomorrow at 10 AM?'),
(1, 11, 'Sure! I will bring all tools. Cost will be around ₹600–₹900.'),
(11, 1, 'Perfect, see you then.');

-- Between Arjun (12) and Lakshmi (2) about job 2
INSERT INTO messages (sender_id, receiver_id, message) VALUES
(12, 2, 'Hi Lakshmi, we need two switchboards rewired in the living room.'),
(2, 12, 'I can assess and give a quote. When are you free?'),
(12, 2, 'This Saturday works.'),
(2, 12, 'The wiring is done. Everything is safe and tested.'),
(12, 2, 'Thank you! Payment sent.');

-- Between Meena (13) and Geetha (5) about job 5
INSERT INTO messages (sender_id, receiver_id, message) VALUES
(13, 5, 'Geetha, can you start Monday? 6 AM to 10 AM shift.'),
(5, 13, 'Yes, I am available. I will be there by 6 AM Monday.'),
(13, 5, 'Great, see you then!');


-- ── Sample Notifications ──────────────────────────────────────────
-- For worker Murugan (id=1)
INSERT INTO notifications (user_id, icon, message, is_read) VALUES
(1, '✅', 'Your application for <strong>Fix bathroom tap leak</strong> was accepted!', FALSE),
(1, '💬', '<strong>Priya Nair</strong> sent you a message about the tap repair.', FALSE),
(1, '⭐', 'You received a 5-star review from Priya Nair.', TRUE),
(1, '💰', 'Payment of ₹850 received for tap repair job.', TRUE);

-- For provider Priya (id=11)
INSERT INTO notifications (user_id, icon, message, is_read) VALUES
(11, '✅', '<strong>Murugan Selvam</strong> accepted your tap repair request.', FALSE),
(11, '💬', '<strong>Murugan Selvam</strong> sent a message about the repair.', FALSE),
(11, '📋', 'Your job <strong>"Daily Driver"</strong> has 1 new application.', FALSE),
(11, '⭐', 'Please rate your experience with Murugan Selvam.', TRUE);

-- For worker Lakshmi (id=2)
INSERT INTO notifications (user_id, icon, message, is_read) VALUES
(2, '✅', 'Your application for <strong>Rewire living room</strong> was accepted!', FALSE),
(2, '💰', 'Payment of ₹1,200 received for wiring job.', TRUE);

-- For provider Arjun (id=12)
INSERT INTO notifications (user_id, icon, message, is_read) VALUES
(12, '✅', '<strong>Lakshmi Rajan</strong> completed the wiring job.', FALSE),
(12, '📋', 'Your job <strong>"Solar panel inspection"</strong> has 2 new applications.', FALSE);


-- ── Sample Reviews ────────────────────────────────────────────────
-- Priya (11) reviews Murugan (1) for job 1
INSERT INTO reviews (job_id, reviewer_id, reviewed_id, rating, comment) VALUES
(1,  11, 1, 5, 'Murugan fixed our tap within an hour. Honest pricing, no hidden charges. Highly recommend!'),
-- Arjun (12) reviews Lakshmi (2) for job 2
(2,  12, 2, 5, 'Excellent work on our switchboards. Professional and clean.'),
-- Arjun (12) reviews Pandi (6) for job 6
(6,  12, 6, 5, 'Beautiful custom wardrobe. Perfect finish and great value for money.'),
-- Arjun (12) reviews Chitra (8) for job 8
(8,  12, 8, 5, 'Chitra cooked for us for a full month. Delicious food every day!');


-- ═══════════════════════════════════════════════════════════════
--   VIEWS  (optional — useful for reports and dashboards)
-- ═══════════════════════════════════════════════════════════════

-- Worker profile view with average rating
CREATE OR REPLACE VIEW worker_profiles AS
SELECT
    u.id,
    u.name,
    u.email,
    u.phone,
    u.location,
    u.bio,
    u.category,
    u.jobs_completed,
    u.availability,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id)                AS review_count
FROM users u
LEFT JOIN reviews r ON r.reviewed_id = u.id
WHERE u.role = 'WORKER'
GROUP BY u.id;

-- Open jobs with provider name
CREATE OR REPLACE VIEW open_jobs_view AS
SELECT
    j.id,
    j.title,
    j.category,
    j.location,
    j.budget,
    j.duration,
    j.description,
    j.expected_date,
    j.created_at,
    u.name  AS provider_name,
    u.id    AS provider_id
FROM jobs j
JOIN users u ON u.id = j.provider_id
WHERE j.status = 'OPEN';

-- Application details with job + worker info
CREATE OR REPLACE VIEW application_details AS
SELECT
    a.id,
    a.status,
    a.cover_note,
    a.quoted_price,
    a.applied_at,
    j.id        AS job_id,
    j.title     AS job_title,
    j.category,
    j.location,
    j.budget,
    w.id        AS worker_id,
    w.name      AS worker_name,
    w.rating    AS worker_rating,
    p.id        AS provider_id,
    p.name      AS provider_name
FROM applications a
JOIN jobs  j ON j.id = a.job_id
JOIN users w ON w.id = a.worker_id
JOIN users p ON p.id = j.provider_id;


-- ═══════════════════════════════════════════════════════════════
--   VERIFY  — run these SELECTs to confirm data was inserted
-- ═══════════════════════════════════════════════════════════════

SELECT 'users'         AS tbl, COUNT(*) AS rows FROM users
UNION ALL
SELECT 'jobs',                  COUNT(*)         FROM jobs
UNION ALL
SELECT 'applications',          COUNT(*)         FROM applications
UNION ALL
SELECT 'messages',              COUNT(*)         FROM messages
UNION ALL
SELECT 'notifications',         COUNT(*)         FROM notifications
UNION ALL
SELECT 'reviews',               COUNT(*)         FROM reviews;

-- Expected output:
-- users         | 14
-- jobs          | 10
-- applications  |  7
-- messages      | 13
-- notifications | 12
-- reviews       |  4
