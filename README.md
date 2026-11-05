# Agentic AI: 35-Day Curriculum & Roadmap Application

An interactive developer roadmap application built with **Angular 21** and backed by **MongoDB Atlas** for tracking progress through the 35-day (5-week) **Agentic AI: Zero to Production** curriculum.

---

## 🚀 Features

- **🗺️ Interactive 35-Day Roadmap Timeline**: Visual matrix of all 35 days across 5 core weeks with phase badges, concepts, and deliverables.
- **📅 5 Weekly Focus Overviews**: Goals, weekly project callouts, and Definition of Done checklists.
- **🚀 5 Phase Milestone Projects (P1 – P5)**: Architectural specs, tool constraints, rubrics, and submission tracker.
- **🔗 Flexible Proof of Completion**: Submit and manage multiple proof URLs (GitHub repositories, live deployments, Loom walkthroughs, PRs/commits) for daily tasks and weekly projects.
- **🔄 Revision & Portfolio Hub**: Post-curriculum review mode with bookmarking ("Starred for Revision"), Markdown portfolio generator, and JSON progress export.
- **✏️ Dual View / Edit Mode**: Clean view mode for studying; one-click edit mode for saving notes and links anytime.
- **☁️ MongoDB Atlas Sync & Resilient Local Cache**: Real-time progress synchronization with fallback to local storage.

---

## 📁 Project Architecture

```text
agentic-ai/
├── data/                               # Curriculum raw data (daily, weekly, phase projects)
├── server/                             # Express backend connected to MongoDB Atlas
│   ├── config/db.js                    # Atlas TLS connection
│   ├── models/                         # Mongoose schemas (DailyPlan, WeeklyPlan, PhaseProject, UserProgress)
│   ├── routes/                         # API endpoints (/api/plans, /api/progress)
│   ├── scripts/seed.js                 # Database seeding script
│   └── server.js                       # Express server (Port 3000)
├── src/app/
│   ├── components/                     # Standalone Angular Components
│   │   ├── header/                     # Brand bar, Atlas connection pill, navigation
│   │   ├── progress-stats/             # Progress %, streak, hours, project metrics
│   │   ├── roadmap-overview/           # 35-day timeline matrix with filters & search
│   │   ├── week-card/                  # Weekly breakdown & DoD checklists
│   │   ├── day-detail/                 # Daily task checklists, concepts, proof links & notes
│   │   ├── phase-project/              # P1-P5 specs, stack, milestones, submissions
│   │   └── revision-hub/               # Post-35-day recap, starred filters & portfolio export
│   ├── services/
│   │   ├── roadmap.service.ts          # Curriculum data fetching with offline fallback
│   │   └── progress.service.ts         # Reactive state (Angular Signals), Atlas syncing
│   └── interfaces/                     # Strong TypeScript models
│       ├── daily-plan.interface.ts
│       ├── weekly-plan.interface.ts
│       ├── phase-project.interface.ts
│       └── user-progress.interface.ts
```

---

## 🛠️ Quick Start

### 1. Start the Backend API (MongoDB Atlas)
In one terminal:
```bash
npm run server
```
The API starts at `http://localhost:3000` and connects securely to your MongoDB Atlas cluster (`agentic_ai_roadmap`).

> **Note**: To re-seed the MongoDB Atlas collections from JSON files:
> ```bash
> npm run seed
> ```

### 2. Start the Angular Roadmap Frontend
In a second terminal:
```bash
npm start
```
Navigate to `http://localhost:4200/` in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates optimized production assets in `dist/agentic-ai/`.
