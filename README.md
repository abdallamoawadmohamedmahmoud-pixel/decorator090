Production-ready CMS for Decorator site

Overview
- A minimal CMS with a fixed owner account ramadan.nady1985@gmail.com and password defined via environment variables for production.
- Owner can log in and add projects; regular users are treated as standard users without owner privileges.
- Backend built with Node.js + Express; data stored in JSON files for simple setup (can be swapped to a proper DB later).

Getting started (local development)
- Install dependencies: npm install
- Create a .env file or use environment variables:
  - OWNER_EMAIL=ramadan.nady1985@gmail.com
  - OWNER_PASSWORD=01099797984
  - JWT_SECRET=your_secret_key
- Start the server: npm run start
- Access CMS endpoints at: http://localhost:3000
- Admin UI (public/admin.html) and owner dashboard (public/owner-dashboard.html) can be used for development.

Usage notes
- When logging in as the owner, you will have access to endpoints that allow adding projects via /cms/projects.
- Other accounts are treated as regular users with no owner privileges.
- The CMS uses localStorage/sessionStorage for demo data in the frontend; for production, API-backed storage is recommended.

Security considerations
- Move to a proper DB and add hashing for owner credentials.
- Use proper JWT handling and refresh tokens for production.
- Make sure CORS and other security headers are configured for deployment.

This document is a simple starter. Adjust per your deployment needs.
