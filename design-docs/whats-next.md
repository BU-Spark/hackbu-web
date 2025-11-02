# HackBU Website – What's Next

## ✅ Current Status (WIP Demo Ready)

We've successfully built the core OS-style interface with:

- ✅ **Desktop Environment**: Draggable windows with focus states, z-order management
- ✅ **Boot Screen**: Terminal-style boot animation with click-to-skip
- ✅ **Dock Navigation**: Bottom dock with app launchers (Bounties, Gallery, Leaderboard, Events)
- ✅ **Terminal**: Quake/Doom-style dropdown from top with commands (`help`, `apps`, `open`, `status`, `clear`)
- ✅ **Dynamic Status Bar**: Real-time user time, Boston time, and live Boston weather
- ✅ **MOTD Window**: Message of the Day positioned top-left, opens on boot
- ✅ **Theme**: Full Spark color palette (teal, chartreuse, eggshell, orange, black)
- ✅ **Database**: SQLite + Prisma with seeded data for bounties, projects, leaderboard, events
- ✅ **Window Management**: Unlimited windows, proper focus/unfocus states, bring-to-front on click
- ✅ **Brand Integration**: Spark and HackBU logos with faded background images from Spark site
- ✅ **About Page**: Full about page with mission, sponsors, team, FAQ, and governance sections

---

## 🎯 Priority List

### WIP Demo (Current Sprint)

1. [Live/Streaming Page - Placeholder version](#livestreaming-page)
2. [Light Mode Theme Toggle](#light-mode-theme-toggle)
3. [Contextual Help for Apps](#contextual-help-for-apps)
4. [Window Close Buttons](#window-close-buttons)
5. [Discord Integration - Placeholder](#discord-integration)

### Launch Requirements (v1.0)

#### Required for Launch

1. [Live/Streaming Page - Full version](#livestreaming-page)
2. [BU Google OAuth](#bu-google-oauth)
3. [Project & Bounty Detail Pages](#project--bounty-detail-pages)
4. [Discord Integration - Full](#discord-integration)
5. [Leaderboard with Real Scoring](#leaderboard-with-real-scoring)

#### Nice to Have

1. [Accessibility Improvements](#accessibility-improvements)
2. [Enhanced Terminal Commands](#enhanced-terminal-commands)
3. [Resizable Windows](#resizable-windows)

---

## 📋 Detailed Requirements

### About Page/Window

**Status**: ✅ COMPLETE - Implemented and deployed
**Requirements** (from design doc):

- Mission & Promise statement
- Sponsors (BU IS&T + BU Spark! with logos and blurbs)
- What We Do (3-up cards: Bounties, Projects, Events)
- How to Join (Discord invite flow)
- Governance & Safety (Code of conduct, reporting)
- Team & Roles (Staff leads, student maintainers, IS&T reps)
- FAQ (Eligibility, time commitment, IP/licensing, prizes, proposals)

**Implementation**:

- Add `about` route: `/about`
- Add `About` window to WindowManager that can be opened from dock
- Create `About.astro` component with full-bleed hero and content sections
- Add "About" button to dock
- Use teal-to-eggshell gradient hero with skyline watermark
- Include pull quotes and candid photos (Spark style)
- Persistent CTAs: Join Discord, Browse Bounties, Submit a Project

**Data needed**:

- Markdown or JSON for Mission, Sponsors, Team bios, FAQ entries
- Team photos
- Sponsor logos (already have Spark logo)

---

### Live/Streaming Page

**Status**: Not implemented yet
**Requirements** (from design doc):

- `/live` route that detects if stream is active
- Embedded player (YouTube Live / Twitch)
- Episode information card
- Quest CTAs (for gamification)
- Join Discord button
- Post-stream: auto-show highlights and repo links

**Implementation**:

- Add `live` route: `/live`
- Add `Live` window to WindowManager
- Create `Live.astro` / `LiveStream.tsx` component
- Check live status via YouTube API or static flag
- Swap between "Live Now" player view and "Next Episode" card view
- Add "Live" button to dock (maybe with indicator when live?)

**Data Model Additions**:

```prisma
model Episode {
  id        String   @id @default(cuid())
  title     String
  type      String   // api_tour | ship_room | live_bounty | office_hours
  startsAt  DateTime
  duration  Int?
  vodUrl    String?
  guests    String?
  repoUrls  String?
  isLive    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Quest {
  id        String   @id @default(cuid())
  episodeId String
  title     String
  description String?
  points    Int
  startsAt  DateTime
  endsAt    DateTime?
}
```

**Integration needs**:

- YouTube API key for live status detection (or manual toggle)
- Quest claim system (requires auth - see below)

---

## 🔐 Authentication & User Features

### BU Google OAuth

**Status**: Not implemented
**Requirements**:

- Google OAuth restricted to `@bu.edu` domain
- Arbitrary display names (editable in profile)
- Optional Discord OAuth for community features
- Anonymous read-only browsing allowed

**Implementation**:

- Add Auth.js (Core) with Google provider
- Gate to `@bu.edu` emails only
- Create `/api/auth/[...auth].ts` endpoint
- Add User model (already in Prisma schema from design doc)
- Create `/profile` page for display name editing

**Why needed**:

- Required for Live stream check-ins and quests
- Required for bounty submissions
- Leaderboard attribution

---

### Leaderboard with Real Scoring

**Status**: Currently shows static seeded data
**Requirements**:

- Track points from various sources:
  - Stream check-ins (`!checkin` command)
  - Quest completions
  - Bounty submissions
  - GitHub activity (optional)
  - Discord participation (optional)

**Data Model**:

```prisma
model Points {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String
  source    String   // stream_checkin | quest | bounty | github | discord
  createdAt DateTime @default(now())
}

model LeaderboardEntry {
  id     String @id @default(cuid())
  userId String @unique
  name   String
  points Int    @default(0)
  badges String? // comma-separated badge IDs
  rank   Int?
}
```

**Implementation**:

- API endpoints: `/api/checkin`, `/api/quests/claim`, `/api/bounty/submit`
- Aggregate Points into LeaderboardEntry
- Real-time or periodic rank calculation
- Badge system for achievements

---

## 🎨 Polish & Enhancements

### Light Mode Theme Toggle

**Status**: Not implemented
**Requirements** (from design doc):

- Primary (default): Teal BG `#06B1A2`, Foreground `#D9EADF`
- Light mode: BG `#D9EADF`, Deep teal text `#063E3A`, accents `#06B1A2`
- Toggle button in top bar

**Implementation**:

- Add dark mode class to tailwind config
- Add theme toggle button next to help/terminal buttons
- Store preference in localStorage
- Update all components to respect theme

---

### Window Close Buttons

**Status**: Windows have X button but it's not functional
**Implementation**:

- Wire up close button to remove window from `openWindows` array
- Remove from `zIndices` as well
- Keep MOTD from being closable (or warn before closing)

---

### Contextual Help for Apps

**Status**: Not implemented
**User feedback**: "i think the 'apps' when open need '?' maybe to the left of the window decoration (or other ideas?) that would link to the about section that explains it? or maybe its more like a tooltip but of the same content?"

**Implementation options**:

- **Option 1**: Add a "?" button in the window title bar (left of the X button) that opens a tooltip/popover explaining that specific app
- **Option 2**: Clicking "?" jumps to the relevant section in the About page (e.g., Bounties window → About page's "What We Do > Bounties" section)
- **Option 3**: Inline help icon that shows a brief description on hover

**Content needed**:

- Brief descriptions for each app:
  - **Bounties**: "Browse open coding challenges with prizes. Claim a bounty, submit your work, and earn rewards."
  - **Gallery**: "Explore student-built projects serving the BU community. All projects are open source and collaborative."
  - **Leaderboard**: "See top contributors ranked by points from bounties, quests, and community participation."
  - **Events**: "Upcoming HackBU events: Syntax & Snax (coding sessions), Code & Tell (demo nights), and live streams."
  - **About**: "Learn about HackBU's mission, how to join, our team, and community guidelines."
  - **Live**: "Watch live coding streams, participate in quests, and interact with the community in real-time."

**Recommendation**: Start with Option 1 (tooltip/popover) for quick context, with Option 2 as a fallback for deeper info.

---

### Resizable Windows

**Status**: Not implemented
**User feedback**: "i think we need to make the windows resizable :/ [...] i realized you can max the window and it is very usable so maybe the resizable goes far down the backlog"

**Implementation**:

- Add resize handles to window corners/edges
- Respect min/max dimensions
- Store resize state in WindowManager
- Update Window component to handle resize events

**Priority**: LOW - Users can already maximize windows which provides good usability. Nice to have but not critical for v1.0.

---

### Terminal Auto-Hide on Window Focus

**Status**: Not implemented
**Issue**: Terminal dropdown stays visible when user clicks on a window, creating visual clutter and potential usability confusion.

**Expected behavior**: When a user focuses any window (clicks on it), the terminal should automatically close/hide.

**Implementation**:

- Listen for window focus events in Terminal component or WindowManager
- Close terminal when any window receives focus
- User can still reopen terminal with backtick (`) key or terminal toggle button

**Priority**: MEDIUM - Nice UX improvement, prevents overlapping interfaces

---

### Enhanced Terminal Commands

**Current commands**: `help`, `apps`, `open <app>`, `status`, `clear`

**Additional ideas**:

- `whoami` - show current user (if logged in)
- `about` - open About window
- `live` - open Live window
- `leaderboard` - open Leaderboard window (alias to `open leaderboard`)
- `theme` or `theme toggle` - switch light/dark mode
- `easter eggs` - fun hidden commands for community culture

---

### Project & Bounty Detail Pages

**Status**: Gallery and Bounties show lists, but no detail views

**Implementation**:

- `/project/[slug]` route for individual projects
- `/bounty/[id]` route for individual bounties
- Deep linking from cards/tables
- Could open as full-screen window or dedicated route

---

### Discord Integration

**Requirements**:

- Prominent "Join Discord" CTA
- Discord invite link in footer
- Optional: Discord OAuth for linking accounts
- Optional: Discord bot for stream commands (`!checkin`, `!quest`)

---

### Accessibility Improvements

**Current status**: Basic keyboard nav works, needs audit

**TODO**:

- Ensure all windows have proper ARIA labels
- Keyboard shortcuts for window management
- Reduce motion support
- Color contrast audit (already using good Spark colors)
- Screen reader testing
- Focus trap in windows
- Close window with Escape key

---

## 📊 Content & Data Needs

### Immediate (for WIP demo):

- [x] **About page content**: Mission statement, sponsor blurbs, team bios, FAQ entries
- [ ] **Team photos**: Staff leads, student maintainers (following Spark photo style)
- [ ] **BU IS&T logo**: For sponsors section
- [ ] **Code of Conduct**: Text for governance section
- [ ] **Discord invite link**: For all CTAs

### Short-term (for v1.0):

- [ ] **Episode schedule**: First 3-5 episodes planned with titles, dates, types
- [ ] **Quest definitions**: 5-10 quest templates for different episode types
- [ ] **Real bounties**: Replace seed data with actual open bounties
- [ ] **Real projects**: Add 3-5 real HackBU projects to gallery
- [ ] **Event calendar**: Syntax & Snax, Code & Tell dates

---

## 🚀 Deployment Checklist

### Before first public demo:

- [x] About page complete
- [ ] Live page implemented (even if no stream scheduled yet)
- [ ] Discord links working
- [ ] Mobile responsive check (OS interface might need simplified mobile view)
- [ ] Performance audit
- [ ] SEO meta tags
- [ ] Favicon and social preview images

### Before v1.0 launch:

- [ ] Auth working (BU Google OAuth)
- [ ] Real leaderboard data
- [ ] First stream episode ready
- [ ] Quest system functional
- [ ] Analytics integrated
- [ ] Deploy to Netlify/Vercel
- [ ] Custom domain setup
- [ ] SSL cert
- [ ] Error tracking (Sentry?)

---

## 🎯 Recommended Next Steps

### For WIP/Demo (Short-term):

1. ✅ ~~**Build About window/page**~~ - COMPLETE! Answers "what is this?"
2. **Build Live window/page** - Most critical remaining piece, creates anticipation for streams
3. **Add contextual help "?" buttons to windows** - Help users understand each app
4. **Add window close functionality** - Basic UX improvement
5. **Mobile responsive check** - Make sure it doesn't break on phones

### For v1.0 (Medium-term):

1. **Implement Auth** - Unlocks user features
2. **Real leaderboard scoring** - Makes gamification work
3. **Episode & Quest system** - Powers the streaming show
4. **Light mode toggle** - Accessibility and user preference

### For v2.0+ (Long-term):

- GitHub integration for auto-tracking contributions
- Discord bot for stream interactions
- Project submission flow
- Bounty claim/submission system
- User profiles with achievements
- Community showcase
- Analytics dashboard for organizers

---

## 📝 Notes

- **Tech stack is solid**: Astro + React + Tailwind + Prisma + SQLite works great for dev
- **Design is 90% there**: The OS interface feels unique and on-brand
- **Main gaps are content pages**: About and Live are the critical missing pieces
- **Auth is the next technical hurdle**: Once that's in, user features can roll out
- **Keep the quirky vibe**: The terminal, boot screen, and window management are delightful

---

## 📱 Mobile Strategy

### Concept: "Phone OS" Mode

**Core Idea**: On mobile, the HackBU OS becomes a phone-style interface with app icons instead of windows.

**Implementation**:

- **Layout**: App buttons arranged like phone app icons (grid layout)
- **No multi-window**: Single-app view at a time - tapping an app icon navigates to that app's full-screen view
- **No terminal dropdown**: Terminal feature is desktop-only
- **Dock buttons become app grid**: The same apps (Bounties, Gallery, Leaderboard, Events, About, Live) displayed as touch-friendly icons

**Open Questions**:

- **Navigation UX**: How to navigate between HackBU apps without conflicting with phone's native back/forward gestures?
  - Option 1: Persistent top nav bar with back arrow + home icon
  - Option 2: Bottom tab bar (mobile app style) for quick switching
  - Option 3: Swipe gestures between apps (like mobile app switcher)
  - Option 4: Each app has a "home" button to return to app grid

**Previous idea (preserved for reference)**:

- Alternative approach was to simplify to traditional nav on mobile, or attempt to keep window metaphor scaled down

**Recommendation**: Test Option 1 (top nav with back/home) + app grid home screen as it's most intuitive and doesn't conflict with system gestures.

---

## 🤔 Open Questions

1. **Show name decision**: Which streaming show name? ("hackbu: unboxed" vs "hackbu: insider" vs other?)
2. **Live detection**: Manual toggle or automated via YouTube API?
3. **Badge design**: What do achievement badges look like? Cookie icons from Spark style guide?
4. **Anonymous users**: Can they see everything but not interact? Or hide some features?
5. **Discord requirement**: Is Discord account required for participation, or just encouraged?

---

**Last Updated**: 2025-11-02
**Current Version**: WIP Demo (v0.5)
**Target for v1.0**: TBD based on first stream date
