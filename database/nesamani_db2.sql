-- ═══════════════════════════════════════════════════════════════
--   NESAMANI — Corrected Complete Database Schema
--   Matches the exact logic flow specification:
--
--   Roles:
--     NEEDER   = posts jobs, browses services, books providers
--     PROVIDER = uploads services, responds to jobs, gets booked
--
--   Flow A: Needer posts Job → Provider responds → Needer books Provider
--   Flow B: Provider uploads Service → Needer browses → Needer books Provider
--   Both flows → Bookings table
--
--   Run: mysql -u root -p < nesamani_db.sql
-- ═══════════════════════════════════════════════════════════════

DROP DATABASE IF EXISTS nesamani_db;
CREATE DATABASE nesamani_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nesamani_db;

-- ═══════════════════════════════════════════════════════════════
--   TABLE 1: users
--   NEEDER   = work giver  → needer-dashboard.html
--   PROVIDER = work doer   → provider-dashboard.html
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    password     VARCHAR(255)  NOT NULL,
    phone        VARCHAR(20),
    role         ENUM('NEEDER','PROVIDER') NOT NULL,
    location     VARCHAR(150),
    bio          TEXT,
    is_active    BOOLEAN       DEFAULT TRUE,
    created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 2: jobs
--   Posted by NEEDER. Providers view all open jobs and respond.
--   Notification sent to all providers when a new job is posted.
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE jobs (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    needer_id     BIGINT        NOT NULL,
    title         VARCHAR(200)  NOT NULL,
    description   TEXT,
    category      VARCHAR(100),
    location      VARCHAR(150),
    budget        VARCHAR(100),
    duration      VARCHAR(100),
    expected_date DATE,
    status        ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'OPEN',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (needer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_needer   (needer_id),
    INDEX idx_status   (status),
    INDEX idx_category (category),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 3: services
--   Uploaded by PROVIDER. Needers browse all services.
--   If a needer is interested they can book directly (Flow B).
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE services (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    provider_id  BIGINT        NOT NULL,
    title        VARCHAR(200)  NOT NULL,
    description  TEXT,
    category     VARCHAR(100)  NOT NULL,
    price        VARCHAR(100),
    price_type   ENUM('FIXED','PER_HOUR','PER_DAY','PER_MONTH','NEGOTIABLE') DEFAULT 'NEGOTIABLE',
    location     VARCHAR(150),
    is_available BOOLEAN       DEFAULT TRUE,
    created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_provider  (provider_id),
    INDEX idx_category  (category),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 4: job_responses
--   Provider responds to a Needer's job posting.
--   Needer sees all providers who are interested.
--   Needer picks one → creates a Booking (Flow A).
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE job_responses (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    job_id       BIGINT        NOT NULL,
    provider_id  BIGINT        NOT NULL,
    message      TEXT,
    quoted_price VARCHAR(100),
    status       ENUM('PENDING','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'PENDING',
    responded_at DATETIME      DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_job_provider (job_id, provider_id),
    FOREIGN KEY (job_id)      REFERENCES jobs(id)  ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_job      (job_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 5: bookings
--   Created when a Needer books a Provider.
--   Covers BOTH flows:
--     job_id     is set for Flow A (from a job posting)
--     service_id is set for Flow B (from a service listing)
--   Status: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE bookings (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    needer_id    BIGINT        NOT NULL,
    provider_id  BIGINT        NOT NULL,
    job_id       BIGINT,
    service_id   BIGINT,
    notes        TEXT,
    agreed_price VARCHAR(100),
    scheduled_at DATETIME,
    status       ENUM('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (needer_id)   REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (job_id)      REFERENCES jobs(id)      ON DELETE SET NULL,
    FOREIGN KEY (service_id)  REFERENCES services(id)  ON DELETE SET NULL,
    INDEX idx_needer   (needer_id),
    INDEX idx_provider (provider_id),
    INDEX idx_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 6: messages
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE messages (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    sender_id   BIGINT  NOT NULL,
    receiver_id BIGINT  NOT NULL,
    message     TEXT    NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender   (sender_id),
    INDEX idx_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 7: notifications
--   Auto-triggered on:
--     • New job posted       → notify all PROVIDERS
--     • Provider responds    → notify NEEDER
--     • Booking created      → notify PROVIDER
--     • Booking status change → notify both parties
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    icon       VARCHAR(10) DEFAULT '🔔',
    title      VARCHAR(200),
    message    TEXT        NOT NULL,
    link_type  ENUM('JOB','SERVICE','BOOKING','MESSAGE','GENERAL') DEFAULT 'GENERAL',
    link_id    BIGINT,
    is_read    BOOLEAN     DEFAULT FALSE,
    created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user   (user_id),
    INDEX idx_unread (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   TABLE 8: reviews
--   Left after a booking is COMPLETED
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE reviews (
    id          BIGINT  NOT NULL AUTO_INCREMENT,
    booking_id  BIGINT  NOT NULL,
    reviewer_id BIGINT  NOT NULL,
    reviewed_id BIGINT  NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_booking_reviewer (booking_id, reviewer_id),
    FOREIGN KEY (booking_id)  REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id)    ON DELETE CASCADE,
    INDEX idx_reviewed (reviewed_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ═══════════════════════════════════════════════════════════════
--   SAMPLE DATA  (all passwords = "password123")
-- ═══════════════════════════════════════════════════════════════

-- Needers
INSERT INTO users (name, email, password, phone, role, location, bio) VALUES
('Priya Nair',     'priya@nesamani.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 90001 11001', 'NEEDER', 'Chennai',    'Homeowner, need reliable domestic help.'),
('Arjun Menon',    'arjun@nesamani.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 90001 11002', 'NEEDER', 'Madurai',    'Small business owner, need maintenance workers.'),
('Meena Sundaram', 'meena@nesamani.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 90001 11003', 'NEEDER', 'Trichy',     'Working professional, need part-time household help.'),
('Ravi Kumar',     'ravi@nesamani.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 90001 11004', 'NEEDER', 'Coimbatore', 'House owner looking for trades.');

-- Providers
INSERT INTO users (name, email, password, phone, role, location, bio) VALUES
('Murugan Selvam',  'murugan@nesamani.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43210', 'PROVIDER', 'Trichy',     '10 years plumbing experience.'),
('Lakshmi Rajan',   'lakshmi@nesamani.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43211', 'PROVIDER', 'Madurai',    'Certified electrician, solar setups.'),
('Rajan Annamalai', 'rajan@nesamani.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43212', 'PROVIDER', 'Coimbatore', 'Interior painting specialist.'),
('Senthil Kumar',   'senthil@nesamani.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43213', 'PROVIDER', 'Chennai',    'Licensed driver, 12 years experience.'),
('Geetha Devi',     'geetha@nesamani.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43214', 'PROVIDER', 'Trichy',     'Experienced maid, 6 years.'),
('Pandi Raj',       'pandi@nesamani.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43215', 'PROVIDER', 'Salem',      'Master carpenter, 15 years.'),
('Chitra Priya',    'chitra@nesamani.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi', '+91 98765 43216', 'PROVIDER', 'Madurai',    'Home cook, South and North Indian.');

-- Jobs posted by Needers (IDs 1-4)
INSERT INTO jobs (needer_id, title, description, category, location, budget, duration, status) VALUES
(1, 'Fix bathroom tap leak',       'Main bathroom tap leaking. Need urgent fix.',           'Plumbing',   'Chennai',    '₹600–₹900',    'One-time',  'OPEN'),
(2, 'Rewire living room switches', 'Two switchboards need full rewiring.',                  'Electrical', 'Madurai',    '₹1,200',       'One-time',  'IN_PROGRESS'),
(4, 'Interior painting 2BHK',      'Full interior painting. Walls only.',                  'Painting',   'Coimbatore', '₹8,000',       '3 days',    'OPEN'),
(1, 'Daily office commute driver', 'Need driver 6-9 AM and 6-9 PM, Mon-Sat.',              'Driving',    'Chennai',    '₹700/day',     'Long term', 'OPEN'),
(3, 'Part-time maid 4 hrs/day',    'Cleaning, vessel washing, basic cooking. 6 days/week.','Cleaning',   'Trichy',     '₹5,000/month', '1 month',   'IN_PROGRESS'),
(2, 'Custom wardrobe build',       'Full-wall sliding wardrobe master bedroom, 8x7 ft.',   'Carpentry',  'Salem',      '₹12,000',      '1 week',    'COMPLETED'),
(3, 'Daily cooking breakfast',     'South Indian breakfast for family of 4, 6 days/week.', 'Cooking',    'Madurai',    '₹2,400/month', '1 month',   'COMPLETED');

-- Services uploaded by Providers (IDs 5-11)
INSERT INTO services (provider_id, title, description, category, price, price_type, location) VALUES
(5,  'Pipe Fitting & Leak Repair',   'Expert leak repair, pipe joints, drainage systems.',   'Plumbing',   '₹500',       'PER_HOUR',   'Trichy'),
(5,  'Bathroom Renovation Plumbing', 'Full plumbing setup for new bathrooms.',               'Plumbing',   '₹4,000',     'FIXED',      'Trichy'),
(6,  'Home Electrical Wiring',       'Rewiring and switchboard replacement.',                'Electrical', '₹1,200',     'FIXED',      'Madurai'),
(6,  'Solar Panel Wiring',           'Installation, inspection and repair.',                 'Electrical', '₹2,500',     'FIXED',      'Madurai'),
(7,  'Interior Wall Painting',       'Smooth finish with quality paints included.',          'Painting',   '₹12/sq.ft',  'NEGOTIABLE', 'Coimbatore'),
(8,  'City & Outstation Driving',    'Daily commute or outstation. Own vehicle.',            'Driving',    '₹700',       'PER_DAY',    'Chennai'),
(9,  'Full Home Cleaning',           'Deep cleaning, vessel washing, mopping. 4 hrs.',       'Cleaning',   '₹5,000',     'PER_MONTH',  'Trichy'),
(10, 'Custom Furniture Build',       'Tables, wardrobes, shelves to specification.',         'Carpentry',  '₹500',       'PER_HOUR',   'Salem'),
(11, 'Home Cooking Service',         'Daily South Indian meals for families.',               'Cooking',    '₹2,400',     'PER_MONTH',  'Madurai');

-- Job Responses (Providers responding to Needers' jobs)
INSERT INTO job_responses (job_id, provider_id, message, quoted_price, status) VALUES
(1, 5,  'I can fix the tap tomorrow morning. I carry all tools.',                    '₹750',      'ACCEPTED'),
(1, 6,  'I can also help with this plumbing job.',                                   '₹800',      'REJECTED'),
(2, 6,  'I will assess and rewire safely. Available this Saturday.',                 '₹1,200',    'ACCEPTED'),
(3, 7,  'I specialise in interior painting. Can finish in 3 days.',                  '₹8,000',    'PENDING'),
(4, 8,  'Available for morning and evening timings. 12 years experience.',           '₹700/day',  'PENDING'),
(5, 9,  'Experienced in part-time household work. Can start Monday.',                '₹5,000/mo', 'ACCEPTED'),
(6, 10, 'I can build the wardrobe to exact spec. Quality guaranteed.',               '₹11,500',   'ACCEPTED');

-- Bookings (covers both Flow A and Flow B)
INSERT INTO bookings (needer_id, provider_id, job_id, service_id, notes, agreed_price, status) VALUES
-- Flow A: from job response
(1, 5,  1,    NULL, 'Please bring all tools. Available from 10 AM.',    '₹750',       'COMPLETED'),
(2, 6,  2,    NULL, 'Both switchboards need full replacement.',          '₹1,200',     'COMPLETED'),
(3, 9,  5,    NULL, 'Start Monday 6 AM. Keys given at first visit.',    '₹5,000',     'ACCEPTED'),
(2, 10, 6,    NULL, 'Sliding wardrobe, 8x7 ft, master bedroom.',        '₹11,500',    'COMPLETED'),
-- Flow B: from service browsing
(4, 6,  NULL, 4,    'Solar panels on rooftop need inspection.',         '₹1,800',     'PENDING'),
(2, 11, NULL, 9,    'Breakfast and lunch, 6 days/week.',                '₹2,400',     'COMPLETED');

-- Messages
INSERT INTO messages (sender_id, receiver_id, message) VALUES
(1, 5,  'Hi Murugan, the tap is leaking badly. Can you come tomorrow?'),
(5, 1,  'Yes, I will be there at 10 AM. Cost will be ₹700–₹800.'),
(1, 5,  'Perfect, see you then!'),
(2, 6,  'Lakshmi, we need two switchboards rewired.'),
(6, 2,  'I can come Saturday and assess. About 3 hours of work.'),
(6, 2,  'Rewiring is done! All tested and safe.'),
(3, 9,  'Geetha, can you start Monday? 6 AM to 10 AM shift.'),
(9, 3,  'Yes, I am available. I will be there 6 AM Monday sharp.'),
(3, 9,  'Wonderful, see you Monday!');

-- Notifications
INSERT INTO notifications (user_id, icon, title, message, link_type, link_id, is_read) VALUES
-- Providers notified when Priya posted job 1
(5,  '📋', 'New Job Posted', 'Priya Nair posted a Plumbing job in Chennai.',         'JOB',     1, TRUE),
(6,  '📋', 'New Job Posted', 'Priya Nair posted a Plumbing job in Chennai.',         'JOB',     1, TRUE),
(7,  '📋', 'New Job Posted', 'Ravi Kumar posted a Painting job in Coimbatore.',      'JOB',     3, FALSE),
-- Needer notified when provider responds
(1,  '💬', 'New Response',   'Murugan Selvam responded to your tap repair job.',     'JOB',     1, TRUE),
(1,  '💬', 'New Response',   'Lakshmi Rajan also responded to your job.',            'JOB',     1, TRUE),
-- Provider notified when booked
(5,  '✅', 'Booking Received','Priya Nair has booked you for the tap repair!',       'BOOKING', 1, TRUE),
(6,  '✅', 'Booking Received','Arjun Menon has booked you for the rewiring job.',    'BOOKING', 2, TRUE),
-- Booking completed
(1,  '🎉', 'Job Completed',  'Your tap repair booking is marked complete.',          'BOOKING', 1, FALSE),
(2,  '🎉', 'Job Completed',  'Your rewiring booking is marked complete.',            'BOOKING', 2, FALSE),
-- Service browsing notification
(4,  '⚡', 'New Service',    'Lakshmi Rajan added a Solar Panel service.',           'SERVICE', 4, FALSE);

-- Reviews
INSERT INTO reviews (booking_id, reviewer_id, reviewed_id, rating, comment) VALUES
(1, 1, 5,  5, 'Murugan fixed the tap in an hour. Honest pricing, no hidden charges.'),
(2, 2, 6,  5, 'Excellent rewiring. Professional and very clean.'),
(4, 2, 10, 5, 'Beautiful custom wardrobe. Perfect finish and great value.'),
(6, 2, 11, 5, 'Chitra cooked for a full month. Delicious authentic food every day.');


-- ═══════════════════════════════════════════════════════════════
--   VIEWS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW provider_profiles AS
SELECT u.id, u.name, u.email, u.phone, u.location, u.bio,
       COALESCE(AVG(r.rating), 0) AS avg_rating,
       COUNT(DISTINCT r.id)       AS review_count,
       COUNT(DISTINCT s.id)       AS service_count
FROM users u
LEFT JOIN reviews  r ON r.reviewed_id = u.id
LEFT JOIN services s ON s.provider_id = u.id AND s.is_available = TRUE
WHERE u.role = 'PROVIDER'
GROUP BY u.id;

CREATE OR REPLACE VIEW open_jobs_view AS
SELECT j.id, j.title, j.description, j.category, j.location,
       j.budget, j.duration, j.expected_date, j.created_at,
       u.name AS needer_name, u.id AS needer_id,
       COUNT(jr.id) AS response_count
FROM jobs j
JOIN users u ON u.id = j.needer_id
LEFT JOIN job_responses jr ON jr.job_id = j.id
WHERE j.status = 'OPEN'
GROUP BY j.id;

CREATE OR REPLACE VIEW available_services_view AS
SELECT s.id, s.title, s.description, s.category, s.price,
       s.price_type, s.location, s.created_at,
       u.name AS provider_name, u.id AS provider_id,
       COALESCE(AVG(r.rating), 0) AS provider_rating
FROM services s
JOIN users u ON u.id = s.provider_id
LEFT JOIN reviews r ON r.reviewed_id = u.id
WHERE s.is_available = TRUE
GROUP BY s.id;

CREATE OR REPLACE VIEW booking_summary AS
SELECT b.id, b.status, b.agreed_price, b.scheduled_at, b.created_at,
       n.id AS needer_id,   n.name AS needer_name,
       p.id AS provider_id, p.name AS provider_name,
       j.title  AS job_title,
       sv.title AS service_title
FROM bookings b
JOIN  users    n  ON n.id  = b.needer_id
JOIN  users    p  ON p.id  = b.provider_id
LEFT JOIN jobs     j  ON j.id  = b.job_id
LEFT JOIN services sv ON sv.id = b.service_id;


-- ═══════════════════════════════════════════════════════════════
--   VERIFY
-- ═══════════════════════════════════════════════════════════════
SELECT 'users'         AS tbl, COUNT(*) AS rows FROM users
UNION ALL SELECT 'jobs',          COUNT(*) FROM jobs
UNION ALL SELECT 'services',      COUNT(*) FROM services
UNION ALL SELECT 'job_responses', COUNT(*) FROM job_responses
UNION ALL SELECT 'bookings',      COUNT(*) FROM bookings
UNION ALL SELECT 'messages',      COUNT(*) FROM messages
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'reviews',       COUNT(*) FROM reviews;
