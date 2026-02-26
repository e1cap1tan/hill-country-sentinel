# Sentinel Roadmap

*Aligned to VISION.md priorities. Updated May 22, 2026.*

---

## ✅ What We Already Have

- **31 candidate/official profiles** with detailed bios
- **Voting records** for city council members (JSON-driven)
- **3 news feeds** — candidate news, policy feed, business watch
- **Find My Officials** — address lookup → precinct + officials
- **Election dates section** on homepage with early voting alerts
- **Candidate name auto-linking** across all content

## 🔜 Priority 1 Features — Election Readiness

### 1A. "Know Before You Go" Voter Guide (per election)
- **What:** Standalone page per election cycle (e.g., `/voter-guide-nov-2026.html`)
- **Content:** Every race, every candidate, side-by-side comparison, key issues, endorsements
- **Format:** Shareable, printable, mobile-friendly
- **Effort:** Medium — template + content research per cycle
- **Status:** Not started

### 1B. Voter Registration & Tools Hub
- **What:** Dedicated page with all voter tools in one place
- **Content:**
  - Register to vote (link to VoteTexas.gov)
  - Check registration status
  - Find polling locations (integrate with existing Find My Officials)
  - Early voting dates & locations
  - Voter ID requirements
  - Sample ballots (when available)
- **Effort:** Small — mostly curated links + clean layout
- **Status:** Not started

### 1C. Election Countdown on Homepage
- **What:** Prominent countdown timer to next election date
- **Content:** Days until election, key races at stake, link to voter guide
- **Format:** Above-the-fold, impossible to miss
- **Effort:** Small — JS countdown + data from existing election dates
- **Status:** Partially exists (election date sections), needs countdown timer + "what's at stake" summary

## 🔜 Priority 2 Features — Watchdog & Accountability

### 2A. Official Voting Scorecard
- **What:** Simple visual scorecard per elected official
- **Content:** Key votes rated against conservative values (✅ aligned / ❌ opposed / ➖ absent)
- **Format:** Embedded on each profile page + standalone scorecard page
- **Data:** Already have voting records JSON — need to add alignment ratings
- **Effort:** Medium — scoring criteria + UI component + per-vote rating
- **Status:** Voting records exist, scorecard UI and ratings not started

### 2B. Business Watch Enhancement
- **What:** Expand business-watch.json coverage, add a dedicated Business Watch page
- **Content:** Local businesses' political donations, DEI stances, endorsements
- **Effort:** Small-Medium — page template exists in feed system, needs dedicated landing page
- **Status:** Feed exists, dedicated page not started

## 📋 Nice-to-Haves (Later)

- Email newsletter / subscriber list
- Push notifications for election reminders
- Social sharing cards optimized per article
- Archive of past elections and results
- Endorsement tracker (who endorsed whom, visualized)
