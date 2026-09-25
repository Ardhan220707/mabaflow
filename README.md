# MabaFlow

> From overwhelming deadlines to clear daily actions.

MabaFlow is an AI-powered task and time management application designed specifically for university freshmen. It helps students organize academic tasks, determine priorities, break large assignments into smaller actionable steps, and create structured daily schedules.

MabaFlow is being developed with a mobile-first approach and is planned as a Progressive Web App (PWA).

---

## Overview

The transition from high school to university often introduces new challenges in managing academic responsibilities.

Students may have to deal with:

- Multiple assignments from different courses
- Overlapping deadlines
- Difficulty determining which task should be completed first
- Large assignments that are difficult to break into smaller steps
- Difficulty planning when and how to work on assignments

MabaFlow focuses on solving not only:

> "What do I need to do?"

but also:

> "Where should I start, and when should I do it?"

---

## Solution

MabaFlow transforms a list of academic tasks into a structured execution plan through the following workflow:

```text
Input Task
    ↓
AI Priority Analysis
    ↓
Task Breakdown
    ↓
Smart Scheduling
    ↓
Daily Planner
    ↓
Execute & Track Progress
Core Value
Task → AI → Plan → Execute → Progress
Planned Features
Task Management

Users will be able to create and manage academic tasks with information such as:

Task title
Course
Expected output
Due date
Priority
Status
AI Assistant

The AI Assistant is designed to act as a planning partner rather than simply a chatbot.

It will help users:

Analyze task priorities
Break large assignments into smaller sub-tasks
Generate brainstorming ideas
Identify actionable next steps
Recommend suitable working times
Daily Planner

The Daily Planner will transform task recommendations into an actionable daily schedule.

Example:

16:00
└── Algorithm Assignment
    └── Create flowchart

17:00
└── Algorithm Assignment
    └── Implement code
Progress Tracking

Users will be able to:

Mark sub-tasks as completed
Monitor task progress
Track daily activities
Review upcoming assignments
Progressive Web App

MabaFlow is planned to support PWA capabilities, including:

Installation on supported devices
Application-like experience
Local data access
Basic functionality while offline
Smart Notifications

The system is planned to provide deadline-related notifications to help users stay aware of upcoming academic responsibilities.

Technology Stack
Layer	Technology
Framework	Next.js
Language	TypeScript
UI	React
Styling	Tailwind CSS
Icons	Lucide React
State Management	Zustand
Database	Supabase PostgreSQL / Firebase
Authentication	Supabase Auth / Firebase Auth
AI	OpenAI API / Gemini API
PWA	Serwist / next-pwa
Push Notification	Firebase Cloud Messaging

Some technologies listed above are part of the planned architecture and have not yet been implemented.

Project Structure
MabaFlow/
├── app/
│   ├── beranda/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ai/
│   ├── dashboard/
│   ├── layout/
│   ├── planner/
│   └── tasks/
│
├── lib/
│
├── stores/
│
├── public/
│
├── package.json
├── package-lock.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md
Development Status

MabaFlow is currently in the Initial Development / MVP Foundation stage.

Completed
 Next.js project setup
 TypeScript setup
 Tailwind CSS setup
 Lucide React integration
 Zustand integration
 Initial project structure
 Root route redirect
 Basic Beranda page
 Git repository initialization
Planned
 Application Shell and Bottom Navigation
 Final Beranda UI
 Task Management
 Task Detail
 AI Assistant
 AI Task Breakdown
 AI Priority Analysis
 Smart Scheduling
 Daily Planner
 Progress Tracking
 Authentication
 Database Integration
 PWA Support
 Offline-first Functionality
 Synchronization Queue
 Push Notifications
 Testing
 Production Deployment
Development Roadmap
Phase 1 — Foundation
Project setup
Basic routing
UI foundation
State management
Application shell
Phase 2 — Task Management
Task CRUD
Task priority
Deadline management
Expected output
Sub-task system
Progress tracking
Phase 3 — AI Assistant
AI brainstorming
Priority analysis
Task breakdown
Smart scheduling
Save recommendations to Planner
Phase 4 — Planner
Daily timeline
Time blocking
Task and sub-task checklist
Daily progress tracking
Phase 5 — Backend
Authentication
Database
API routes
Data synchronization
Phase 6 — PWA and Offline
PWA installation
Offline task access
Offline planner access
Local state persistence
Synchronization queue
Phase 7 — Notifications and Optimization
Deadline notifications
AI usage limitations
Performance optimization
Testing
Production deployment
Product Principles
Focus and Essential Information

MabaFlow focuses on presenting information that is most relevant to the user's immediate academic responsibilities:

Tasks due today
Tasks due tomorrow
Tasks that require immediate attention
AI as a Planning Partner

AI is not intended to function only as a conversational chatbot.

It is designed to assist with:

Understanding task requirements
Determining task priorities
Breaking assignments into smaller actions
Identifying the next actionable step
Creating scheduling recommendations
Offline-first Approach

Core task and planner functionality is designed to remain accessible when an internet connection is temporarily unavailable.

Getting Started
Requirements

Make sure the following are installed:

Node.js
npm
Git
Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/MabaFlow.git
cd MabaFlow

Install dependencies:

npm install
Run Development Server
npm run dev

Open the application at:

http://localhost:3000
Available Scripts
Development
npm run dev

Starts the development server.

Production Build
npm run build

Creates an optimized production build.

Production Server
npm run start

Starts the production server.

Lint
npm run lint

Runs ESLint to check the project code.

Environment Variables

MabaFlow will use environment variables for configuration such as:

AI API keys
Database URLs
Authentication credentials
Firebase configuration

Create a local environment file:

.env.local

Example:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=

Never commit API keys, database passwords, service role keys, or other sensitive credentials to the repository.

Product Metrics

The following metrics are planned to evaluate the MVP:

Activation Rate

The percentage of testers who install MabaFlow as a Progressive Web App.

Daily Active Users

Users who interact with MabaFlow through activities such as:

Viewing tasks
Opening the Planner
Completing sub-tasks
Monitoring progress
AI to Planner Ratio

Measures how frequently AI-generated recommendations are converted into actual Planner entries.

Save to Planner Actions
-----------------------
AI Recommendation Sessions
Target Users

Primary User

University freshmen and students in the early stages of their university experience.

Product Category

Academic Productivity and Student Task Management.

MabaFlow focuses on individual academic productivity and is not intended to function as a social productivity or collaboration platform.

Future Direction

MabaFlow is built around the principle:

Simple input → Intelligent planning → Clear execution

The long-term goal is to help students move beyond simply maintaining a list of assignments and instead understand:

What needs to be done?
        ↓
What should be prioritized?
        ↓
Where should I start?
        ↓
When should I work on it?
        ↓
What has been completed?
Project Status

Version: 0.1.0

Status: Early Development

MabaFlow is currently under active development.

Author

MabaFlow

An academic and product development project focused on improving task and time management for university students.

License

This project is currently intended for academic development and product prototyping purposes.
```
