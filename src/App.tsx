import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  User,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Page =
  | "dashboard"
  | "tell"
  | "discover"
  | "problems"
  | "interventions"
  | "progress"
  | "insights";

type Observation = {
  id: string;
  text: string;
  category: string;
  minutes: number;
  date: string;
};

type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  occurrences: number;
  minutes: number;
  color: string;
};

type Intervention = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "Try this" | "Worked" | "Didn't work" | "Forgot to try";
};

/* =========================================================
   DEMO DATA
========================================================= */

const initialObservations: Observation[] = [
  {
    id: "obs-1",
    text: "Couldn't find my ID before leaving for college and was late.",
    category: "Departure",
    minutes: 8,
    date: "Today",
  },
  {
    id: "obs-2",
    text: "Forgot my charger and had to go upstairs.",
    category: "Departure",
    minutes: 5,
    date: "Yesterday",
  },
  {
    id: "obs-3",
    text: "Where are my keys?",
    category: "Departure",
    minutes: 6,
    date: "2 days ago",
  },
  {
    id: "obs-4",
    text: "Spent 10 minutes searching for my notebook.",
    category: "Study",
    minutes: 10,
    date: "3 days ago",
  },
  {
    id: "obs-5",
    text: "Forgot my ID again.",
    category: "Departure",
    minutes: 5,
    date: "4 days ago",
  },
];

const initialProblems: Problem[] = [
  {
    id: "departure",
    title: "Departure friction",
    description:
      "Several small delays happen while getting ready to leave home.",
    category: "Home",
    occurrences: 7,
    minutes: 42,
    color: "#2563eb",
  },
  {
    id: "rework",
    title: "Study rework",
    description:
      "Lost items and repeated work are creating avoidable study delays.",
    category: "Study",
    occurrences: 5,
    minutes: 31,
    color: "#ef6a55",
  },
  {
    id: "searching",
    title: "Things don't have a home",
    description:
      "Frequently used objects are being stored inconsistently.",
    category: "Home",
    occurrences: 4,
    minutes: 24,
    color: "#16a34a",
  },
  {
    id: "context",
    title: "Context switching",
    description:
      "Small interruptions are repeatedly breaking your flow.",
    category: "Focus",
    occurrences: 7,
    minutes: 38,
    color: "#7c3aed",
  },
];

const initialInterventions: Intervention[] = [
  {
    id: "int-1",
    title: "Create an Exit Station",
    description:
      "Keep your ID, keys, wallet and charger in one place near the door.",
    type: "30-second fix",
    status: "Try this",
  },
  {
    id: "int-2",
    title: "Keep the charger in your backpack",
    description:
      "Remove one decision from your morning by keeping your charger permanently in your bag.",
    type: "5-minute fix",
    status: "Try this",
  },
  {
    id: "int-3",
    title: "One home for study materials",
    description:
      "Create a single visible location for your notebook and current assignments.",
    type: "5-minute fix",
    status: "Try this",
  },
];

/* =========================================================
   GLOBAL CSS
========================================================= */

const GLOBAL_CSS = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  width: 100%;
}

body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  background: #f6f7f9;
  color: #202532;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at 85% 5%, rgba(37, 99, 235, 0.06), transparent 25%),
    #f6f7f9;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.18);
  outline-offset: 2px;
}

/* LOGIN */

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(37,99,235,.10), transparent 28%),
    radial-gradient(circle at 80% 80%, rgba(124,58,237,.08), transparent 28%),
    #f7f8fa;
}

.login-card {
  width: min(460px, 100%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 28px;
  padding: 38px;
  box-shadow: 0 24px 70px rgba(32,37,50,.10);
}

.logo-mark {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: #202532;
  color: white;
  margin-bottom: 24px;
}

.logo-mark svg {
  width: 25px;
}

.login-card h1 {
  font-size: 34px;
  margin: 0 0 10px;
  letter-spacing: -1.2px;
}

.login-card p {
  color: #737b8c;
  line-height: 1.6;
}

.login-input {
  width: 100%;
  border: 1px solid #dfe3ea;
  background: #fafbfc;
  padding: 14px 16px;
  border-radius: 13px;
  margin-top: 10px;
}

.primary-button {
  border: 0;
  background: #202532;
  color: white;
  padding: 13px 18px;
  border-radius: 12px;
  font-weight: 700;
  transition: .2s;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(32,37,50,.16);
}

.login-button {
  width: 100%;
  margin-top: 18px;
}

/* LAYOUT */

.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  flex: 0 0 250px;
  border-right: 1px solid #e5e7eb;
  background: rgba(255,255,255,.88);
  padding: 22px 15px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 5px 10px 28px;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -.4px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #202532;
  color: white;
  display: grid;
  place-items: center;
}

.nav-section {
  margin-top: 12px;
}

.nav-label {
  padding: 8px 12px;
  color: #9aa1af;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 0;
  background: transparent;
  padding: 11px 12px;
  border-radius: 11px;
  color: #6d7482;
  text-align: left;
  margin: 2px 0;
}

.nav-item:hover {
  background: #f3f5f8;
  color: #202532;
}

.nav-item.active {
  background: #edf3ff;
  color: #2563eb;
  font-weight: 700;
}

.sidebar-bottom {
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 18px;
}

.main-area {
  flex: 1;
  min-width: 0;
}

.topbar {
  height: 68px;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255,255,255,.82);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
}

.mobile-menu {
  display: none;
  border: 0;
  background: transparent;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e1e5eb;
  background: white;
  padding: 9px 13px;
  border-radius: 10px;
  width: 240px;
  color: #969dab;
}

.search-box input {
  border: 0;
  outline: 0;
  width: 100%;
  background: transparent;
  color: #202532;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  background: transparent;
  color: #4d5564;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e9eef8;
  color: #31538d;
  font-weight: 800;
}

.content {
  padding: 34px;
  max-width: 1500px;
  margin: auto;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  color: #8b93a2;
  font-size: 10px;
  letter-spacing: 1.4px;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-heading h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -1.5px;
}

.page-heading p {
  color: #747c8c;
  margin: 8px 0 0;
  line-height: 1.6;
}

.section-title {
  font-size: 17px;
  margin: 0 0 14px;
}

/* CARDS */

.card {
  background: white;
  border: 1px solid #e5e8ee;
  border-radius: 18px;
  box-shadow: 0 7px 25px rgba(32,37,50,.045);
}

.card-padding {
  padding: 22px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.stat-card {
  padding: 20px;
}

.stat-icon {
  width: 37px;
  height: 37px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #f1f4f8;
  color: #596477;
  margin-bottom: 18px;
}

.stat-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
}

.stat-label {
  color: #818997;
  font-size: 13px;
  margin-top: 3px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr .65fr;
  gap: 18px;
}

.hero-card {
  min-height: 320px;
  padding: 30px;
  position: relative;
  overflow: hidden;
}

.hero-card:after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: #eef4ff;
  right: -90px;
  top: -90px;
}

.hero-card h2 {
  position: relative;
  z-index: 2;
  max-width: 620px;
  font-size: 31px;
  letter-spacing: -1.1px;
  margin: 8px 0 12px;
}

.hero-card p {
  position: relative;
  z-index: 2;
  color: #70798a;
  max-width: 600px;
  line-height: 1.65;
}

.hero-action {
  margin-top: 22px;
  position: relative;
  z-index: 2;
}

.insight-card {
  padding: 24px;
}

.insight-card h3 {
  margin: 12px 0 9px;
}

.insight-card p {
  color: #727b8a;
  line-height: 1.6;
  font-size: 14px;
}

.insight-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  background: #fff2e8;
  color: #e26a2e;
}

/* TELL */

.tell-layout {
  max-width: 900px;
  margin: auto;
}

.tell-card {
  padding: 30px;
}

.tell-textarea {
  width: 100%;
  min-height: 180px;
  resize: vertical;
  border: 0;
  outline: 0;
  font-size: 21px;
  line-height: 1.6;
  color: #202532;
}

.tell-textarea::placeholder {
  color: #aeb4bf;
}

.tell-footer {
  border-top: 1px solid #edf0f3;
  padding-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.muted {
  color: #8a92a1;
  font-size: 13px;
}

/* OBSERVATIONS */

.observation-list {
  display: grid;
  gap: 10px;
}

.observation-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px;
  border: 1px solid #e9ebef;
  border-radius: 14px;
  background: white;
}

.observation-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #2563eb;
  flex: 0 0 auto;
}

.observation-main {
  flex: 1;
  min-width: 0;
}

.observation-text {
  font-weight: 650;
  line-height: 1.45;
}

.observation-meta {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  color: #9299a7;
  font-size: 12px;
}

/* PROBLEM MAP */

.problem-map-shell {
  background: white;
  border: 1px solid #e5e8ee;
  border-radius: 22px;
  box-shadow: 0 10px 32px rgba(32,37,50,.05);
  overflow: hidden;
}

.problem-map-header {
  padding: 26px 28px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #edf0f3;
}

.problem-map-header h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -.6px;
}

.problem-map-header p {
  color: #7c8492;
  font-size: 13px;
  line-height: 1.55;
  max-width: 620px;
}

.map-stat {
  text-align: right;
  min-width: 80px;
}

.map-stat strong {
  display: block;
  font-size: 28px;
}

.map-stat span {
  font-size: 11px;
  color: #8b93a2;
}

.problem-map {
  width: 100%;
  height: 600px;
  padding: 8px;
  background:
    radial-gradient(circle at center, rgba(37,99,235,.035), transparent 42%),
    #fcfcfd;
}

.problem-map-footer {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 14px 22px;
  border-top: 1px solid #edf0f3;
  color: #858d9b;
  font-size: 12px;
}

.problem-map-footer span {
  display: flex;
  align-items: center;
  gap: 7px;
}

.map-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: #7c3aed;
}

.map-dot.blue {
  background: #2563eb;
}

/* PROBLEMS */

.problem-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.problem-card {
  padding: 22px;
  cursor: pointer;
  transition: .2s;
}

.problem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(32,37,50,.08);
}

.problem-card-top {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.problem-color {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-top: 5px;
}

.problem-card h3 {
  margin: 0;
  font-size: 18px;
}

.problem-card p {
  color: #747d8c;
  line-height: 1.55;
  font-size: 13px;
}

.problem-number {
  font-size: 25px;
  font-weight: 800;
}

.problem-small {
  font-size: 11px;
  color: #9299a6;
}

/* INTERVENTIONS */

.intervention-list {
  display: grid;
  gap: 14px;
}

.intervention-card {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.intervention-card h3 {
  margin: 0 0 8px;
}

.intervention-card p {
  margin: 0;
  color: #747d8c;
  line-height: 1.55;
  font-size: 14px;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
  background: #f1f4f8;
  color: #687182;
  margin-bottom: 10px;
}

.outline-button {
  border: 1px solid #dfe3e9;
  background: white;
  color: #353d4b;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  white-space: nowrap;
}

.outline-button:hover {
  background: #f7f8fa;
}

/* PROGRESS */

.progress-card {
  padding: 28px;
}

.progress-number {
  font-size: 54px;
  font-weight: 850;
  letter-spacing: -2px;
}

.progress-label {
  color: #7e8695;
}

.progress-bar {
  height: 13px;
  background: #edf0f4;
  border-radius: 999px;
  overflow: hidden;
  margin: 22px 0 10px;
}

.progress-fill {
  height: 100%;
  width: 61%;
  background: #2563eb;
  border-radius: inherit;
}

.before-after {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 20px;
}

.before-after-box {
  padding: 20px;
  background: #fafbfc;
  border: 1px solid #e9ecf0;
  border-radius: 15px;
}

.before-after-box strong {
  font-size: 25px;
  display: block;
}

.before-after-box span {
  color: #858d9b;
  font-size: 12px;
}

/* DETAIL */

.detail-card {
  padding: 30px;
}

.back-button {
  border: 0;
  background: transparent;
  padding: 0;
  color: #667080;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
}

.detail-card h1 {
  font-size: 31px;
  margin: 0 0 10px;
}

.detail-card p {
  color: #747d8c;
  line-height: 1.65;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 25px;
}

.detail-stat {
  padding: 18px;
  background: #f8f9fb;
  border-radius: 14px;
}

.detail-stat strong {
  font-size: 25px;
  display: block;
}

.detail-stat span {
  font-size: 11px;
  color: #8c94a1;
}

/* MOBILE */

.mobile-bottom {
  display: none;
}

@media (max-width: 1000px) {
  .sidebar {
    width: 215px;
    flex-basis: 215px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .sidebar {
    display: none;
  }

  .topbar {
    height: 62px;
    padding: 0 15px;
  }

  .mobile-menu {
    display: block;
  }

  .search-box {
    display: none;
  }

  .content {
    padding: 22px 15px 90px;
  }

  .page-heading {
    display: block;
  }

  .page-heading h1 {
    font-size: 30px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-value {
    font-size: 25px;
  }

  .hero-card {
    padding: 22px;
  }

  .hero-card h2 {
    font-size: 25px;
  }

  .problem-grid {
    grid-template-columns: 1fr;
  }

  .problem-map {
    height: 430px;
  }

  .problem-map-header {
    padding: 20px;
  }

  .problem-map-header h2 {
    font-size: 19px;
  }

  .map-stat {
    display: none;
  }

  .problem-map-footer {
    gap: 12px;
  }

  .intervention-card {
    display: block;
  }

  .intervention-card .outline-button {
    margin-top: 15px;
  }

  .detail-stats {
    grid-template-columns: 1fr;
  }

  .before-after {
    grid-template-columns: 1fr;
  }

  .mobile-bottom {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    height: 68px;
    background: rgba(255,255,255,.94);
    border-top: 1px solid #e5e8ee;
    backdrop-filter: blur(14px);
    justify-content: space-around;
    align-items: center;
  }

  .mobile-bottom button {
    border: 0;
    background: transparent;
    color: #8a92a1;
    font-size: 10px;
    display: grid;
    justify-items: center;
    gap: 4px;
  }

  .mobile-bottom button.active {
    color: #2563eb;
    font-weight: 800;
  }
}
`;

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function IconLogo({ small = false }: { small?: boolean }) {
  return (
    <div
      className={small ? "brand-icon" : "logo-mark"}
      aria-label="INVISIBLE logo"
    >
      <Eye size={small ? 18 : 25} />
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState("");

  return (
    <div className="login-page">
      <div className="login-card">
        <IconLogo />

        <h1>INVISIBLE</h1>

        <p>
          Find the problems you've stopped noticing.
          Tell us what happened. We'll connect the dots.
        </p>

        <label className="muted">Your name</label>

        <input
          className="login-input"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <button
          className="primary-button login-button"
          onClick={onLogin}
        >
          Enter INVISIBLE
          <ArrowRight
            size={16}
            style={{ verticalAlign: "middle", marginLeft: 7 }}
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  setPage,
  onLogout,
}: {
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}) {
  const items: {
    id: Page;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      id: "dashboard",
      label: "Overview",
      icon: <Home size={17} />,
    },
    {
      id: "tell",
      label: "Tell INVISIBLE",
      icon: <Plus size={17} />,
    },
    {
      id: "discover",
      label: "Problem Map",
      icon: <Network size={17} />,
    },
    {
      id: "problems",
      label: "Problems",
      icon: <Target size={17} />,
    },
    {
      id: "interventions",
      label: "Interventions",
      icon: <Lightbulb size={17} />,
    },
    {
      id: "progress",
      label: "Progress",
      icon: <TrendingDown size={17} />,
    },
    {
      id: "insights",
      label: "Insights",
      icon: <Sparkles size={17} />,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <IconLogo small />
        INVISIBLE
      </div>

      <div className="nav-section">
        <div className="nav-label">EXPLORE</div>

        {items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              page === item.id ? "active" : ""
            }`}
            onClick={() => setPage(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button
          className="nav-item"
          onClick={() => alert("Settings coming soon")}
        >
          <Settings size={17} />
          Settings
        </button>

        <button className="nav-item" onClick={onLogout}>
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOP BAR
========================================================= */

function TopBar({
  onMenu,
  onHome,
}: {
  onMenu: () => void;
  onHome: () => void;
}) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}>
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={16} />
        <input placeholder="Search INVISIBLE..." />
      </div>

      <button className="user-button" onClick={onHome}>
        <span className="avatar">A</span>
        <span>Astha</span>
      </button>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  observations,
  problems,
  setPage,
}: {
  observations: Observation[];
  problems: Problem[];
  setPage: (page: Page) => void;
}) {
  const extraObservations = Math.max(
    0,
    observations.length - initialObservations.length
  );

  const weeklySignals = 23 + extraObservations;

  const totalMinutes = observations.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  return (
    <>
      <PageHeading
        eyebrow="YOUR WEEK"
        title="What have you been not noticing?"
        description="INVISIBLE watches the small friction points that usually disappear from memory."
        action={
          <button
            className="primary-button"
            onClick={() => setPage("tell")}
          >
            Tell me what happened
            <ArrowRight
              size={15}
              style={{ marginLeft: 7, verticalAlign: "middle" }}
            />
          </button>
        }
      />

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <Activity size={19} />
          </div>
          <div className="stat-value">{weeklySignals}</div>
          <div className="stat-label">small friction signals</div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Network size={19} />
          </div>
          <div className="stat-value">{problems.length}</div>
          <div className="stat-label">underlying problems</div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Clock3 size={19} />
          </div>
          <div className="stat-value">{totalMinutes}</div>
          <div className="stat-label">minutes in recent logs</div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <TrendingDown size={19} />
          </div>
          <div className="stat-value">61%</div>
          <div className="stat-label">estimated friction reduced</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card hero-card">
          <div className="eyebrow">I FOUND A PATTERN</div>

          <h2>
            Your small delays may actually be one problem wearing
            different disguises.
          </h2>

          <p>
            Searching for your ID, keys, charger and notebook look
            like separate incidents. INVISIBLE connects them to
            discover the underlying friction.
          </p>

          <div className="hero-action">
            <button
              className="primary-button"
              onClick={() => setPage("discover")}
            >
              See the connection
              <ArrowRight
                size={15}
                style={{ marginLeft: 7, verticalAlign: "middle" }}
              />
            </button>
          </div>
        </div>

        <div className="card insight-card">
          <div className="insight-icon">
            <Sparkles size={20} />
          </div>

          <h3>What you're not noticing</h3>

          <p>
            You tend to lose time before leaving home. Several
            different incidents share the same pattern.
          </p>

          <button
            className="outline-button"
            onClick={() => setPage("insights")}
          >
            Explore insight
            <ChevronRight
              size={14}
              style={{ verticalAlign: "middle", marginLeft: 4 }}
            />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 className="section-title">Recent observations</h2>

        <div className="observation-list">
          {observations.slice(0, 5).map((observation) => (
            <div className="observation-row" key={observation.id}>
              <span className="observation-dot" />

              <div className="observation-main">
                <div className="observation-text">
                  {observation.text}
                </div>

                <div className="observation-meta">
                  <span>{observation.category}</span>
                  <span>•</span>
                  <span>{observation.minutes} min</span>
                  <span>•</span>
                  <span>{observation.date}</span>
                </div>
              </div>

              <ChevronRight size={17} color="#a2a9b5" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   TELL
========================================================= */

function TellPage({
  onAdd,
  observations,
}: {
  onAdd: (text: string) => void;
  observations: Observation[];
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;

    onAdd(text.trim());
    setText("");
  };

  return (
    <>
      <PageHeading
        eyebrow="LOG A FRICTION"
        title="Just tell me what happened."
        description="Don't organize it. Don't diagnose it. INVISIBLE will do that part."
      />

      <div className="tell-layout">
        <div className="card tell-card">
          <textarea
            className="tell-textarea"
            placeholder="I spent 15 minutes looking for my charger again..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
              ) {
                submit();
              }
            }}
          />

          <div className="tell-footer">
            <span className="muted">
              {observations.length} observations remembered
            </span>

            <button
              className="primary-button"
              onClick={submit}
              disabled={!text.trim()}
              style={{
                opacity: text.trim() ? 1 : 0.45,
              }}
            >
              Remember this
              <ArrowRight
                size={15}
                style={{ marginLeft: 7, verticalAlign: "middle" }}
              />
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20 }} className="card card-padding">
          <div className="eyebrow">HOW IT WORKS</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 15,
            }}
          >
            <div>
              <strong>01 · LOG</strong>
              <p className="muted">
                Tell INVISIBLE what happened.
              </p>
            </div>

            <div>
              <strong>02 · CONNECT</strong>
              <p className="muted">
                It remembers repeated signals.
              </p>
            </div>

            <div>
              <strong>03 · REVEAL</strong>
              <p className="muted">
                It surfaces the hidden problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   DYNAMIC PROBLEM MAP
========================================================= */

function ProblemMap({
  observations,
  problems,
  onSelect,
}: {
  observations: Observation[];
  problems: Problem[];
  onSelect: (problem: Problem | null) => void;
}) {
  const [hoveredObservation, setHoveredObservation] =
    useState<string | null>(null);

  const getProblemForObservation = (
    observation: Observation
  ): Problem => {
    const text = observation.text.toLowerCase();

    if (
      text.includes("id") ||
      text.includes("key") ||
      text.includes("charger") ||
      text.includes("wallet") ||
      text.includes("leave") ||
      text.includes("leaving") ||
      text.includes("upstairs") ||
      text.includes("home")
    ) {
      const departureProblem = problems.find(
        (problem) =>
          problem.id === "departure" ||
          problem.title.toLowerCase().includes("departure")
      );

      if (departureProblem) return departureProblem;
    }

    if (
      text.includes("assignment") ||
      text.includes("notebook") ||
      text.includes("study") ||
      text.includes("redo") ||
      observation.category.toLowerCase() === "study"
    ) {
      const studyProblem = problems.find(
        (problem) =>
          problem.id === "rework" ||
          problem.title.toLowerCase().includes("rework")
      );

      if (studyProblem) return studyProblem;
    }

    if (problems.length > 0) {
      return problems[0];
    }

    return {
      id: "unknown",
      title: "Uncategorized",
      description: "",
      category: "General",
      occurrences: 0,
      minutes: 0,
      color: "#64748b",
    };
  };

  const visibleObservations = observations.slice(0, 10);

  const observationNodes = visibleObservations.map(
    (observation, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);

      return {
        observation,
        x: 110 + column * 210,
        y: 95 + row * 155,
      };
    }
  );

  const problemNodes = problems.map((problem, index) => {
    const spacing =
      problems.length > 1
        ? 850 / (problems.length - 1)
        : 0;

    return {
      problem,
      x:
        problems.length > 1
          ? 125 + index * spacing
          : 550,
      y: 490,
    };
  });

  const connections = observationNodes.map(
    ({ observation, x, y }) => {
      const problem =
        getProblemForObservation(observation);

      const target = problemNodes.find(
        (node) => node.problem.id === problem.id
      );

      return {
        observation,
        x,
        y,
        problem,
        target,
      };
    }
  );

  return (
    <div className="problem-map-shell">
      <div className="problem-map-header">
        <div>
          <div className="eyebrow">PROBLEM UNIVERSE</div>

          <h2>See what your small problems have in common.</h2>

          <p>
            Each dot is an observation. Connections show patterns
            that may point to a deeper underlying problem.
          </p>
        </div>

        <div className="map-stat">
          <strong>{observations.length}</strong>
          <span>signals</span>
        </div>
      </div>

      <div className="problem-map">
        <svg
          viewBox="0 0 1100 600"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* DYNAMIC CONNECTIONS */}
          {connections.map(
            ({
              observation,
              x,
              y,
              problem,
              target,
            }) => {
              if (!target) return null;

              const active =
                hoveredObservation === null ||
                hoveredObservation === observation.id;

              return (
                <line
                  key={`connection-${observation.id}-${problem.id}`}
                  x1={x}
                  y1={y + 30}
                  x2={target.x}
                  y2={target.y - 42}
                  stroke={target.problem.color}
                  strokeWidth={active ? 2.5 : 1}
                  opacity={active ? 0.42 : 0.07}
                  strokeDasharray="5 6"
                />
              );
            }
          )}

          {/* DYNAMIC OBSERVATIONS */}
          {observationNodes.map(
            ({ observation, x, y }) => {
              const problem =
                getProblemForObservation(observation);

              const active =
                hoveredObservation === null ||
                hoveredObservation === observation.id;

              return (
                <g
                  key={observation.id}
                  transform={`translate(${x},${y})`}
                  style={{
                    cursor: "pointer",
                    opacity: active ? 1 : 0.3,
                  }}
                  onMouseEnter={() =>
                    setHoveredObservation(observation.id)
                  }
                  onMouseLeave={() =>
                    setHoveredObservation(null)
                  }
                  onClick={() => onSelect(problem)}
                >
                  <circle
                    r="30"
                    fill="white"
                    stroke="#d9dee7"
                    strokeWidth="2"
                  />

                  <circle
                    r="8"
                    fill="#2563eb"
                  />

                  <text
                    x="0"
                    y="54"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill="#202532"
                  >
                    {observation.text.length > 25
                      ? observation.text.slice(0, 25) + "..."
                      : observation.text}
                  </text>

                  <text
                    x="0"
                    y="72"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#8a92a3"
                  >
                    {observation.category}
                  </text>
                </g>
              );
            }
          )}

          {/* DYNAMIC PROBLEM NODES */}
          {problemNodes.map(
            ({ problem, x, y }) => (
              <g
                key={problem.id}
                transform={`translate(${x},${y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(problem)}
              >
                <rect
                  x="-92"
                  y="-42"
                  width="184"
                  height="84"
                  rx="20"
                  fill="white"
                  stroke={problem.color}
                  strokeWidth="2.5"
                />

                <circle
                  cx="-65"
                  cy="-15"
                  r="7"
                  fill={problem.color}
                />

                <text
                  x="-48"
                  y="-10"
                  fontSize="10"
                  fontWeight="800"
                  fill={problem.color}
                >
                  UNDERLYING PROBLEM
                </text>

                <text
                  x="0"
                  y="16"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#202532"
                >
                  {problem.title.length > 22
                    ? problem.title.slice(0, 22) + "..."
                    : problem.title}
                </text>

                <text
                  x="0"
                  y="32"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8a92a3"
                >
                  {problem.occurrences} repeated signals
                </text>
              </g>
            )
          )}
        </svg>
      </div>

      <div className="problem-map-footer">
        <span>
          <i className="map-dot blue" />
          Individual observation
        </span>

        <span>
          <i className="map-dot" />
          Underlying problem
        </span>

        <span>
          Hover to trace a connection
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   DISCOVER
========================================================= */

function DiscoverPage({
  observations,
  problems,
  onSelect,
}: {
  observations: Observation[];
  problems: Problem[];
  onSelect: (problem: Problem | null) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="DISCOVERY"
        title="I found something."
        description="This map is generated from the observations INVISIBLE currently remembers."
      />

      <ProblemMap
        observations={observations}
        problems={problems}
        onSelect={onSelect}
      />
    </>
  );
}

/* =========================================================
   PROBLEMS
========================================================= */

function ProblemsPage({
  problems,
  onSelect,
}: {
  problems: Problem[];
  onSelect: (problem: Problem | null) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="UNDERLYING PATTERNS"
        title="Problems beneath the problems."
        description="Individual incidents become useful when they reveal something repeated."
      />

      <div className="problem-grid">
        {problems.map((problem) => (
          <div
            className="card problem-card"
            key={problem.id}
            onClick={() => onSelect(problem)}
          >
            <div className="problem-card-top">
              <div>
                <div
                  className="problem-color"
                  style={{
                    background: problem.color,
                  }}
                />

                <h3 style={{ marginTop: 14 }}>
                  {problem.title}
                </h3>

                <div className="badge">
                  {problem.category}
                </div>
              </div>

              <ChevronRight
                size={18}
                color="#9ba2ae"
              />
            </div>

            <p>{problem.description}</p>

            <div
              style={{
                display: "flex",
                gap: 28,
                marginTop: 20,
              }}
            >
              <div>
                <div className="problem-number">
                  {problem.occurrences}
                </div>
                <div className="problem-small">
                  repeated signals
                </div>
              </div>

              <div>
                <div className="problem-number">
                  {problem.minutes}
                </div>
                <div className="problem-small">
                  minutes lost
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   PROBLEM DETAIL
========================================================= */

function ProblemDetail({
  problem,
  onBack,
  setPage,
}: {
  problem: Problem;
  onBack: () => void;
  setPage: (page: Page) => void;
}) {
  return (
    <div className="card detail-card">
      <button className="back-button" onClick={onBack}>
        ← Back to problems
      </button>

      <div
        className="problem-color"
        style={{
          background: problem.color,
          width: 14,
          height: 14,
        }}
      />

      <div className="eyebrow" style={{ marginTop: 18 }}>
        {problem.category}
      </div>

      <h1>{problem.title}</h1>

      <p>{problem.description}</p>

      <div className="detail-stats">
        <div className="detail-stat">
          <strong>{problem.occurrences}</strong>
          <span>repeated signals</span>
        </div>

        <div className="detail-stat">
          <strong>{problem.minutes}m</strong>
          <span>estimated time lost</span>
        </div>

        <div className="detail-stat">
          <strong>6–7</strong>
          <span>days of repeated friction</span>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 20,
          padding: 22,
          background: "#fafbfc",
        }}
      >
        <div className="eyebrow">INVISIBLE'S READ</div>

        <p style={{ margin: 0 }}>
          These incidents may look unrelated individually, but
          their repeated context suggests a common friction
          point. The useful question is not "How do I solve
          every incident?" but "What small change prevents the
          whole cluster?"
        </p>
      </div>

      <button
        className="primary-button"
        style={{ marginTop: 20 }}
        onClick={() => setPage("interventions")}
      >
        Find an intervention
        <ArrowRight
          size={15}
          style={{
            marginLeft: 7,
            verticalAlign: "middle",
          }}
        />
      </button>
    </div>
  );
}

/* =========================================================
   INTERVENTIONS
========================================================= */

function InterventionsPage({
  interventions,
  onUpdate,
}: {
  interventions: Intervention[];
  onUpdate: (
    id: string,
    status: Intervention["status"]
  ) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="FIX THE PATTERN"
        title="Small changes, tested in real life."
        description="INVISIBLE suggests interventions and learns from whether they actually work."
      />

      <div className="intervention-list">
        {interventions.map((item) => (
          <div
            className="card intervention-card"
            key={item.id}
          >
            <div>
              <div className="badge">{item.type}</div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </div>

            <div>
              {item.status === "Try this" ? (
                <button
                  className="outline-button"
                  onClick={() =>
                    onUpdate(item.id, "Worked")
                  }
                >
                  <Zap
                    size={14}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 5,
                    }}
                  />
                  Try it
                </button>
              ) : (
                <span className="badge">
                  <Check
                    size={12}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 4,
                    }}
                  />
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressPage() {
  return (
    <>
      <PageHeading
        eyebrow="MEASURE"
        title="Did the change actually help?"
        description="Progress is based on repeated observations before and after an intervention."
      />

      <div className="card progress-card">
        <div className="eyebrow">DEPARTURE FRICTION</div>

        <div className="progress-number">61%</div>

        <div className="progress-label">
          estimated reduction in repeated friction
        </div>

        <div className="progress-bar">
          <div className="progress-fill" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#8a92a1",
          }}
        >
          <span>Before intervention</span>
          <span>After intervention</span>
        </div>

        <div className="before-after">
          <div className="before-after-box">
            <strong>7</strong>
            <span>friction incidents</span>
          </div>

          <div className="before-after-box">
            <strong>2</strong>
            <span>friction incidents</span>
          </div>
        </div>

        <div className="before-after">
          <div className="before-after-box">
            <strong>42 min</strong>
            <span>estimated time lost</span>
          </div>

          <div className="before-after-box">
            <strong>14 min</strong>
            <span>estimated time lost</span>
          </div>
        </div>

        <p
          className="muted"
          style={{
            marginTop: 22,
            lineHeight: 1.6,
          }}
        >
          Demo values shown for the prototype. In a real deployment,
          these would be calculated from the user's historical
          observations.
        </p>
      </div>
    </>
  );
}

/* =========================================================
   INSIGHTS
========================================================= */

function InsightsPage({
  observations,
  problems,
}: {
  observations: Observation[];
  problems: Problem[];
}) {
  const totalMinutes = observations.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  return (
    <>
      <PageHeading
        eyebrow="INVISIBLE INSIGHTS"
        title="What you might not notice yourself."
        description="Patterns become visible when small events are remembered together."
      />

      <div className="problem-grid">
        <div className="card insight-card">
          <div className="insight-icon">
            <Clock3 size={20} />
          </div>

          <h3>You lose time before leaving.</h3>

          <p>
            Several observations happen during the transition
            from "at home" to "ready to leave."
          </p>

          <strong>
            {totalMinutes} minutes currently logged
          </strong>
        </div>

        <div className="card insight-card">
          <div className="insight-icon">
            <Network size={20} />
          </div>

          <h3>Different incidents share a cause.</h3>

          <p>
            ID, keys, chargers and other objects repeatedly
            create small search or preparation delays.
          </p>

          <strong>
            {problems.length} underlying patterns
          </strong>
        </div>

        <div className="card insight-card">
          <div className="insight-icon">
            <TrendingDown size={20} />
          </div>

          <h3>Small delays add up.</h3>

          <p>
            A five-minute problem feels insignificant once.
            Repeated across a month, it becomes meaningful.
          </p>

          <strong>Estimated monthly impact: 2.4h</strong>
        </div>

        <div className="card insight-card">
          <div className="insight-icon">
            <Lightbulb size={20} />
          </div>

          <h3>The fix can be smaller than the problem.</h3>

          <p>
            Instead of trying to become more organized, create
            one consistent location for the things you repeatedly
            search for.
          </p>

          <strong>Suggested: Exit Station</strong>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileBottomNav({
  page,
  setPage,
}: {
  page: Page;
  setPage: (page: Page) => void;
}) {
  const items: {
    id: Page;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      id: "dashboard",
      label: "Home",
      icon: <Home size={18} />,
    },
    {
      id: "tell",
      label: "Tell",
      icon: <Plus size={18} />,
    },
    {
      id: "discover",
      label: "Map",
      icon: <Network size={18} />,
    },
    {
      id: "insights",
      label: "Insights",
      icon: <Sparkles size={18} />,
    },
  ];

  return (
    <nav className="mobile-bottom">
      {items.map((item) => (
        <button
          key={item.id}
          className={
            page === item.id ? "active" : ""
          }
          onClick={() => setPage(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [page, setPage] =
    useState<Page>("dashboard");

  const [observations, setObservations] =
    useState<Observation[]>(initialObservations);

  const [problems] =
    useState<Problem[]>(initialProblems);

  const [interventions, setInterventions] =
    useState<Intervention[]>(initialInterventions);

  const [selectedProblem, setSelectedProblem] =
    useState<Problem | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const addObservation = (text: string) => {
    const lower = text.toLowerCase();

    let category = "General";

    if (
      lower.includes("id") ||
      lower.includes("key") ||
      lower.includes("charger") ||
      lower.includes("wallet") ||
      lower.includes("leave") ||
      lower.includes("home")
    ) {
      category = "Departure";
    } else if (
      lower.includes("assignment") ||
      lower.includes("notebook") ||
      lower.includes("study") ||
      lower.includes("class")
    ) {
      category = "Study";
    } else if (
      lower.includes("work") ||
      lower.includes("meeting")
    ) {
      category = "Work";
    }

    const minuteMatch = text.match(
      /(\d+)\s*(?:min|mins|minute|minutes)/i
    );

    const minutes = minuteMatch
      ? Number(minuteMatch[1])
      : 5;

    const newObservation: Observation = {
      id: `obs-${Date.now()}`,
      text,
      category,
      minutes,
      date: "Just now",
    };

    setObservations((current) => [
      newObservation,
      ...current,
    ]);

    setPage("discover");
  };

  const updateIntervention = (
    id: string,
    status: Intervention["status"]
  ) => {
    setInterventions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status }
          : item
      )
    );
  };

  const currentPage = useMemo(() => {
    if (selectedProblem) {
      return (
        <ProblemDetail
          problem={selectedProblem}
          onBack={() => setSelectedProblem(null)}
          setPage={(nextPage) => {
            setSelectedProblem(null);
            setPage(nextPage);
          }}
        />
      );
    }

    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            observations={observations}
            problems={problems}
            setPage={setPage}
          />
        );

      case "tell":
        return (
          <TellPage
            observations={observations}
            onAdd={addObservation}
          />
        );

      case "discover":
        return (
          <DiscoverPage
            observations={observations}
            problems={problems}
            onSelect={setSelectedProblem}
          />
        );

      case "problems":
        return (
          <ProblemsPage
            problems={problems}
            onSelect={setSelectedProblem}
          />
        );

      case "interventions":
        return (
          <InterventionsPage
            interventions={interventions}
            onUpdate={updateIntervention}
          />
        );

      case "progress":
        return <ProgressPage />;

      case "insights":
        return (
          <InsightsPage
            observations={observations}
            problems={problems}
          />
        );

      default:
        return null;
    }
  }, [
    page,
    observations,
    problems,
    interventions,
    selectedProblem,
  ]);

  if (!loggedIn) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>

        <LoginPage
          onLogin={() => setLoggedIn(true)}
        />
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="app">
        <div className="app-layout">
          <Sidebar
            page={page}
            setPage={(nextPage) => {
              setSelectedProblem(null);
              setPage(nextPage);
            }}
            onLogout={() => {
              setLoggedIn(false);
              setSelectedProblem(null);
              setPage("dashboard");
            }}
          />

          <main className="main-area">
            <TopBar
              onMenu={() =>
                setMobileMenuOpen((current) => !current)
              }
              onHome={() => {
                setSelectedProblem(null);
                setPage("dashboard");
              }}
            />

            {mobileMenuOpen && (
              <div
                style={{
                  position: "fixed",
                  top: 62,
                  left: 0,
                  right: 0,
                  zIndex: 40,
                  background: "white",
                  borderBottom: "1px solid #e5e8ee",
                  padding: 12,
                }}
              >
                {[
                  ["dashboard", "Overview"],
                  ["tell", "Tell INVISIBLE"],
                  ["discover", "Problem Map"],
                  ["problems", "Problems"],
                  ["interventions", "Interventions"],
                  ["progress", "Progress"],
                  ["insights", "Insights"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    style={{
                      width: "100%",
                      border: 0,
                      background:
                        page === id
                          ? "#edf3ff"
                          : "transparent",
                      padding: "12px",
                      borderRadius: 10,
                      textAlign: "left",
                      color:
                        page === id
                          ? "#2563eb"
                          : "#4d5564",
                      fontWeight:
                        page === id ? 700 : 500,
                    }}
                    onClick={() => {
                      setSelectedProblem(null);
                      setPage(id as Page);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="content">
              {currentPage}
            </div>
          </main>
        </div>

        <MobileBottomNav
          page={page}
          setPage={(nextPage) => {
            setSelectedProblem(null);
            setPage(nextPage);
          }}
        />
      </div>
    </>
  );
}