# 🐶 Pawtine – Product Requirements Document (PRD)

## 1. Overview
**Product Name:** Pawtine  
**Version:** MVP (Minimum Viable Product)  
**Owner:** Tu Quang Vinh Do  
**Date:** October 2025  
**Purpose:**  
Pawtine is an AI-powered routine tracker for dog owners. It automates reminders for feeding, hydration, and walks, helping users maintain consistent and healthy habits for their dogs.

---

## 2. Vision
To become the simplest and smartest assistant for dog owners — combining structured habit tracking with light AI automation to improve pet care and daily consistency.

---

## 3. Target Users
- Dog owners aged **18–45**
- **Working professionals** balancing pet care with schedules
- **Families** sharing care responsibilities
- **Tech-savvy pet lovers** interested in smart tools

---

## 4. Goals & Non-Goals

### Goals
- Simplify daily dog care through **automated reminders**
- Encourage **habit consistency** (feeding, walks, hydration)
- Provide a **clear and fun dashboard** to track habits
- Build a foundation for **future AI-based personalization**

### Non-Goals
- Real-time health diagnosis  
- Advanced AI pet monitoring (post-MVP)  
- Device integrations (collars, smart bowls) in MVP

---

## 5. Core Features (MVP Scope)

| Feature | Description | Priority |
|----------|--------------|----------|
| 🕒 **Automated Reminders** | Create and manage alerts for feeding, walking, and water changes. | ✅ High |
| 🐾 **Habit Tracker (Walks)** | Track completed walks manually or via GPS toggle. | ✅ High |
| 📊 **Weekly Overview Dashboard** | View daily/weekly progress through simple visual indicators. | 🟡 Medium |
| ⚙️ **Customizable Routines** | Users can rename, reschedule, or disable habits. | 🟡 Medium |
| 🔔 **Notification Engine** | Local push notifications for reminders (expandable for AI logic). | ✅ High |

---

## 6. Future Features (Post-MVP Ideas)

| Feature | Description |
|----------|-------------|
| 🧠 **AI Routine Optimization** | Predicts ideal times based on user behavior (e.g., adjusts feeding reminders). |
| 🐶 **Health Insights** | Suggests diet or activity changes by dog breed, weight, or age. |
| 🗣️ **Voice Assistant** | Users can ask “When did Luna last eat?” and get instant answers. |
| 📍 **Smart GPS Tracking** | Automatically logs walks via phone location or smartwatch. |
| 🧩 **Smart Device Integration** | Connect to Galaxy Watch, Alexa, or Smart Collars. |

---

## 7. User Flow (MVP)

### Onboarding
1. User enters dog’s name, breed, and feeding schedule.  
2. App suggests default routines (Morning/Evening feed, 3 walks).  
3. User confirms or customizes times.

### Home Screen
- Daily Routine List: Feed / Water / Walk  
- “Done” buttons with checkmarks for completed actions  
- Progress bar or paw icons visualizing completion

### Notifications
- Push alerts for reminders  
- Optional “Snooze” or “Reschedule” option

### Dashboard
- Weekly summary (bar graph or paw icon grid)  
- Streak counter (“You’ve walked Luna 5 days in a row!”)

---

## 8. Technical Architecture

| Layer | Technology Stack |
|--------|------------------|
| **Frontend** | Flutter or React Native (cross-platform) |
| **Backend** | Firebase / Supabase (Auth, DB, Notifications) |
| **Storage** | Cloud Firestore or Supabase DB + local cache |
| **AI Layer (Post-MVP)** | TensorFlow Lite or OpenAI API for pattern recognition |
| **Notifications** | Firebase Cloud Messaging (mobile push) |

---

## 9. Data Model (MVP)

### Entities
**User**
- `user_id`
- `email`
- `name`
- `timezone`

**Dog**
- `dog_id`
- `user_id`
- `name`
- `breed`
- `age`

**Routine**
- `routine_id`
- `dog_id`
- `type` (feed / walk / water)
- `time`
- `status` (active / paused)
- `last_completed`

**History**
- `entry_id`
- `routine_id`
- `date`
- `status` (done / missed)
- `notes`

---

## 10. Design Principles
- **Simple:** 3 screens max (Home, Dashboard, Settings)
- **Friendly UI:** soft colors, rounded cards, paw icons
- **Gamified Feedback:** streaks, badges, small AI messages
- **Accessible:** readable typography, offline-ready reminders

---

## 11. KPIs (Success Metrics)
- **Retention (7-Day):** ≥ 70% active users  
- **Daily engagement:** ≥ 2 interactions per day  
- **Reminder response rate:** ≥ 80%  
- **User satisfaction:** ≥ 4.5/5 in feedback  
- **Crash-free sessions:** ≥ 99%

---

## 12. Monetization Strategy
| Tier | Features |
|------|-----------|
| **Free** | Core reminders, manual habit tracking, basic stats |
| **Premium** | AI predictions, smart suggestions, multi-dog profiles, cloud sync |

---

## 13. Timeline (Roadmap)
| Phase | Duration | Deliverable |
|--------|-----------|-------------|
| Concept & Design | 2 weeks | Wireframes, branding, logo |
| MVP Development | 6 weeks | Core app + reminders + habit tracker |
| Beta Testing | 2 weeks | Feedback & bug fixes |
| Launch | +2 weeks | App Store release |

---

## 14. Risks & Dependencies
| Risk | Mitigation |
|------|-------------|
| Notification reliability | Use Firebase Cloud Messaging with fallback local alerts |
| User confusion in setup | Guided onboarding with pre-filled templates |
| Scope creep | Keep MVP limited to 3 routine types |

---

## 15. Future Vision
Pawtine will evolve into a complete **AI-powered pet wellness assistant**, integrating:
- real behavioral insights,
- automatic routine adaptation,
- cross-device syncing,
- and an emotional AI companion that learns from your dog’s patterns.

---

**Author:** Tu Quang Vinh Do  
**Project:** Pawtine – AI Dog Routine Tracker  
**Version:** MVP 1.0  
**Date:** 2025-10-20
