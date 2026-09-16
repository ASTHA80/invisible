import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
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

  X,
  Zap,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE = "http://127.0.0.1:8000";

type Page =
  | "dashboard"
  | "tell"
  | "discover"
  | "problems"
  | "interventions"
  | "progress"
  | "insights";

type UserData = {
  id: number;
  name: string;
  email: string;
};

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
  observationIds?: string[];
  intervention?: string;
};

type InterventionStatus =
  | "Try this"
  | "Worked"
  | "Didn't work"
  | "Forgot to try";

type Intervention = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: InterventionStatus;
  problemId?: string;
};

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

function formatDate(value: string | undefined) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

function estimateMinutes(text: string) {
  const match = text.match(
    /(\d+)\s*(?:min|mins|minute|minutes)/i
  );

  return match ? Number(match[1]) : 5;
}

function categoryColor(category: string) {
  const value = category.toLowerCase();

  if (value.includes("departure")) return "#2563eb";
  if (value.includes("study")) return "#ef6a55";
  if (value.includes("digital")) return "#7c3aed";
  if (value.includes("time")) return "#16a34a";
  if (value.includes("organization")) return "#0891b2";

  return "#64748b";
}

function mapObservation(item: any): Observation {
  return {
    id: String(item.id),
    text: item.text,
    category: item.category || "General",
    minutes: item.friction
      ? estimateMinutes(item.text)
      : estimateMinutes(item.text),
    date: formatDate(item.created_at),
  };
}

function mapProblem(item: any): Problem {
  const category = item.category || "General";

  return {
    id: String(item.id),
    title: item.title || "Underlying problem",
    description: item.description || "",
    category,
    occurrences: Array.isArray(item.observation_ids)
      ? item.observation_ids.length
      : 0,
    minutes: Number(item.estimated_minutes_lost || 0),
    color: categoryColor(category),
    observationIds: Array.isArray(item.observation_ids)
      ? item.observation_ids.map(String)
      : [],
    intervention: item.intervention || "",
  };
}

function mapIntervention(item: any): Intervention {
  let status: InterventionStatus = "Try this";

  if (item.status === "worked") status = "Worked";
  else if (item.status === "didnt_work") status = "Didn't work";
  else if (item.status === "forgot") status = "Forgot to try";
  else if (
    item.status === "Worked" ||
    item.status === "Didn't work" ||
    item.status === "Forgot to try"
  ) {
    status = item.status;
  }

  return {
    id: String(item.id),
    title: item.title || "Try this intervention",
    description: item.action || "",
    type: "Suggested fix",
    status,
    problemId: item.problem_id
      ? String(item.problem_id)
      : undefined,
  };
}

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
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
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

button:disabled {
  cursor: not-allowed;
}

.app {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 85% 5%,
      rgba(37, 99, 235, 0.06),
      transparent 25%
    ),
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
    radial-gradient(
      circle at 20% 20%,
      rgba(37, 99, 235, 0.1),
      transparent 28%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(124, 58, 237, 0.08),
      transparent 28%
    ),
    #f7f8fa;
}

.login-card {
  width: min(460px, 100%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 28px;
  padding: 38px;
  box-shadow: 0 24px 70px rgba(32, 37, 50, 0.1);
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

.login-card h1 {
  font-size: 34px;
  margin: 0 0 10px;
  letter-spacing: -1.2px;
}

.login-card p {
  color: #737b8c;
  line-height: 1.6;
  margin-bottom: 25px;
}

.login-input {
  width: 100%;
  border: 1px solid #dfe3ea;
  background: #fafbfc;
  padding: 14px 16px;
  border-radius: 13px;
  margin-top: 8px;
  margin-bottom: 15px;
  outline: none;
}

.login-input:focus {
  border-color: #2563eb;
  background: white;
}

.primary-button {
  border: 0;
  background: #202532;
  color: white;
  padding: 13px 18px;
  border-radius: 12px;
  font-weight: 700;
  transition: 0.2s;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(32, 37, 50, 0.16);
}

.login-button {
  width: 100%;
  margin-top: 4px;
}

.error-message {
  background: #fff1f0;
  color: #c2413a;
  border: 1px solid #ffd5d1;
  border-radius: 10px;
  padding: 11px 13px;
  margin-top: 12px;
  font-size: 13px;
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
  background: rgba(255, 255, 255, 0.88);
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
  letter-spacing: -0.4px;
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
  background: rgba(255, 255, 255, 0.82);
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
  font-weight: 600;
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
  box-shadow: 0 7px 25px rgba(32, 37, 50, 0.045);
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
  grid-template-columns: 1.35fr 0.65fr;
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

/* EMPTY */

.empty-state {
  text-align: center;
  padding: 55px 25px;
  color: #737b8c;
}

.empty-state-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #f1f4f8;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  color: #6d7482;
}

.empty-state h3 {
  color: #202532;
  margin: 0 0 8px;
}

.empty-state p {
  max-width: 460px;
  margin: 0 auto 20px;
  line-height: 1.6;
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
  box-shadow: 0 10px 32px rgba(32, 37, 50, 0.05);
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
  letter-spacing: -0.6px;
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
    radial-gradient(
      circle at center,
      rgba(37, 99, 235, 0.035),
      transparent 42%
    ),
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
  transition: 0.2s;
}

.problem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(32, 37, 50, 0.08);
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
  border-radius: inherit;
  background: #2563eb;
  transition: width 0.3s;
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
    background: rgba(255, 255, 255, 0.94);
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

function LoginPage({
  onLogin,
}: {
  onLogin: (name: string, email: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter both your name and email.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onLogin(name.trim(), email.trim().toLowerCase());
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not connect to INVISIBLE backend."
      );
    } finally {
      setLoading(false);
    }
  };

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
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <label className="muted">Your email</label>

        <input
          className="login-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
        />

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button
          className="primary-button login-button"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Enter INVISIBLE"}

          {!loading && (
            <ArrowRight
              size={16}
              style={{
                verticalAlign: "middle",
                marginLeft: 7,
              }}
            />
          )}
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
          onClick={() =>
            alert("Settings coming soon")
          }
        >
          <Settings size={17} />
          Settings
        </button>

        <button
          className="nav-item"
          onClick={onLogout}
        >
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
  userName,
}: {
  onMenu: () => void;
  onHome: () => void;
  userName: string;
}) {
  const initial = userName
    ? userName.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onMenu}
      >
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={16} />
        <input placeholder="Search INVISIBLE..." />
      </div>

      <button
        className="user-button"
        onClick={onHome}
      >
        <span className="avatar">{initial}</span>
        <span>{userName || "User"}</span>
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
  interventions,
  setPage,
}: {
  observations: Observation[];
  problems: Problem[];
  interventions: Intervention[];
  setPage: (page: Page) => void;
}) {
  const totalMinutes = observations.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  const worked = interventions.filter(
    (item) => item.status === "Worked"
  ).length;

  const tracked = interventions.filter(
    (item) => item.status !== "Try this"
  ).length;

  const reduction =
    tracked > 0
      ? Math.round((worked / tracked) * 100)
      : 0;

  return (
    <>
      <PageHeading
        eyebrow="YOUR DATA"
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
              style={{
                marginLeft: 7,
                verticalAlign: "middle",
              }}
            />
          </button>
        }
      />

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <Activity size={19} />
          </div>
          <div className="stat-value">
            {observations.length}
          </div>
          <div className="stat-label">
            friction signals
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Network size={19} />
          </div>
          <div className="stat-value">
            {problems.length}
          </div>
          <div className="stat-label">
            underlying problems
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Clock3 size={19} />
          </div>
          <div className="stat-value">
            {totalMinutes}
          </div>
          <div className="stat-label">
            estimated minutes lost
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <TrendingDown size={19} />
          </div>
          <div className="stat-value">
            {reduction}%
          </div>
          <div className="stat-label">
            intervention success
          </div>
        </div>
      </div>

      {observations.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Eye size={24} />
          </div>

          <h3>Nothing invisible yet.</h3>

          <p>
            Start by telling INVISIBLE about one small
            frustration from your day. It will remember
            it and look for patterns over time.
          </p>

          <button
            className="primary-button"
            onClick={() => setPage("tell")}
          >
            Log your first observation
            <ArrowRight
              size={15}
              style={{
                marginLeft: 7,
                verticalAlign: "middle",
              }}
            />
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="card hero-card">
            <div className="eyebrow">
              {problems.length > 0
                ? "I FOUND A PATTERN"
                : "I'M WATCHING"}
            </div>

            <h2>
              {problems.length > 0
                ? "Your small delays may actually be one problem wearing different disguises."
                : "Keep telling me what happened. Patterns appear when small events repeat."}
            </h2>

            <p>
              {problems.length > 0
                ? `INVISIBLE has connected ${observations.length} observations into ${problems.length} underlying pattern${
                    problems.length === 1 ? "" : "s"
                  }.`
                : "You don't need to organize or diagnose your observations. INVISIBLE does that part."}
            </p>

            <div className="hero-action">
              <button
                className="primary-button"
                onClick={() =>
                  setPage(
                    problems.length > 0
                      ? "discover"
                      : "tell"
                  )
                }
              >
                {problems.length > 0
                  ? "See the connection"
                  : "Tell me more"}

                <ArrowRight
                  size={15}
                  style={{
                    marginLeft: 7,
                    verticalAlign: "middle",
                  }}
                />
              </button>
            </div>
          </div>

          <div className="card insight-card">
            <div className="insight-icon">
              <Sparkles size={20} />
            </div>

            <h3>
              {problems.length > 0
                ? "Something is emerging."
                : "You're building a picture."}
            </h3>

            <p>
              {problems.length > 0
                ? "Different incidents are beginning to share common causes."
                : "Keep logging ordinary frustrations. Repetition is what lets INVISIBLE discover hidden problems."}
            </p>

            <button
              className="outline-button"
              onClick={() =>
                setPage(
                  problems.length > 0
                    ? "insights"
                    : "tell"
                )
              }
            >
              {problems.length > 0
                ? "Explore insight"
                : "Add observation"}

              <ChevronRight
                size={14}
                style={{
                  verticalAlign: "middle",
                  marginLeft: 4,
                }}
              />
            </button>
          </div>
        </div>
      )}

      {observations.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">
            Recent observations
          </h2>

          <div className="observation-list">
            {observations
              .slice(0, 5)
              .map((observation) => (
                <div
                  className="observation-row"
                  key={observation.id}
                >
                  <span className="observation-dot" />

                  <div className="observation-main">
                    <div className="observation-text">
                      {observation.text}
                    </div>

                    <div className="observation-meta">
                      <span>
                        {observation.category}
                      </span>
                      <span>•</span>
                      <span>
                        {observation.minutes} min
                      </span>
                      <span>•</span>
                      <span>
                        {observation.date}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={17}
                    color="#a2a9b5"
                  />
                </div>
              ))}
          </div>
        </div>
      )}
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
  onAdd: (text: string) => Promise<void>;
  observations: Observation[];
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);

    try {
      await onAdd(text.trim());
      setText("");
    } finally {
      setLoading(false);
    }
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
            onChange={(event) =>
              setText(event.target.value)
            }
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
              disabled={!text.trim() || loading}
              style={{
                opacity:
                  text.trim() && !loading ? 1 : 0.45,
              }}
            >
              {loading
                ? "Remembering..."
                : "Remember this"}

              {!loading && (
                <ArrowRight
                  size={15}
                  style={{
                    marginLeft: 7,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </button>
          </div>
        </div>

        <div
          style={{ marginTop: 20 }}
          className="card card-padding"
        >
          <div className="eyebrow">
            HOW IT WORKS
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
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

  const visibleObservations =
    observations.slice(0, 10);

  const observationNodes =
    visibleObservations.map(
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

  const problemNodes = problems.map(
    (problem, index) => {
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
    }
  );

  const getProblemForObservation = (
    observation: Observation
  ) => {
    return problems.find((problem) =>
      problem.observationIds?.includes(
        String(observation.id)
      )
    );
  };

  if (
    observations.length === 0 ||
    problems.length === 0
  ) {
    return (
      <div className="problem-map-shell">
        <div className="problem-map-header">
          <div>
            <div className="eyebrow">
              PROBLEM UNIVERSE
            </div>

            <h2>
              Your problem map is still forming.
            </h2>

            <p>
              Add repeated observations and INVISIBLE
              will connect them into underlying
              problems.
            </p>
          </div>

          <div className="map-stat">
            <strong>{observations.length}</strong>
            <span>signals</span>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            <Network size={24} />
          </div>

          <h3>
            No connection to show yet.
          </h3>

          <p>
            The map becomes meaningful once INVISIBLE
            has enough repeated signals to discover a
            pattern.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-map-shell">
      <div className="problem-map-header">
        <div>
          <div className="eyebrow">
            PROBLEM UNIVERSE
          </div>

          <h2>
            See what your small problems have in common.
          </h2>

          <p>
            Each dot is an observation. Connections show
            patterns detected from your stored data.
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
          {/* CONNECTIONS */}

          {observationNodes.map(
            ({ observation, x, y }) => {
              const problem =
                getProblemForObservation(
                  observation
                );

              if (!problem) return null;

              const target = problemNodes.find(
                (node) =>
                  node.problem.id === problem.id
              );

              if (!target) return null;

              const active =
                hoveredObservation === null ||
                hoveredObservation ===
                  observation.id;

              return (
                <line
                  key={`connection-${observation.id}-${problem.id}`}
                  x1={x}
                  y1={y + 30}
                  x2={target.x}
                  y2={target.y - 42}
                  stroke={problem.color}
                  strokeWidth={
                    active ? 2.5 : 1
                  }
                  opacity={
                    active ? 0.42 : 0.07
                  }
                  strokeDasharray="5 6"
                />
              );
            }
          )}

          {/* OBSERVATIONS */}

          {observationNodes.map(
            ({ observation, x, y }) => {
              const problem =
                getProblemForObservation(
                  observation
                );

              const active =
                hoveredObservation === null ||
                hoveredObservation ===
                  observation.id;

              return (
                <g
                  key={observation.id}
                  transform={`translate(${x},${y})`}
                  style={{
                    cursor: problem
                      ? "pointer"
                      : "default",
                    opacity: active ? 1 : 0.3,
                  }}
                  onMouseEnter={() =>
                    setHoveredObservation(
                      observation.id
                    )
                  }
                  onMouseLeave={() =>
                    setHoveredObservation(null)
                  }
                  onClick={() => {
                    if (problem) {
                      onSelect(problem);
                    }
                  }}
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
                      ? observation.text.slice(
                          0,
                          25
                        ) + "..."
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

          {/* PROBLEM NODES */}

          {problemNodes.map(
            ({ problem, x, y }) => (
              <g
                key={problem.id}
                transform={`translate(${x},${y})`}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  onSelect(problem)
                }
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
                    ? problem.title.slice(
                        0,
                        22
                      ) + "..."
                    : problem.title}
                </text>

                <text
                  x="0"
                  y="32"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8a92a3"
                >
                  {problem.occurrences} repeated
                  signals
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

      {problems.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Target size={24} />
          </div>

          <h3>No underlying problems yet.</h3>

          <p>
            Keep logging small frustrations. INVISIBLE
            needs repeated signals before it can reveal
            a deeper pattern.
          </p>
        </div>
      ) : (
        <div className="problem-grid">
          {problems.map((problem) => (
            <div
              className="card problem-card"
              key={problem.id}
              onClick={() =>
                onSelect(problem)
              }
            >
              <div className="problem-card-top">
                <div>
                  <div
                    className="problem-color"
                    style={{
                      background:
                        problem.color,
                    }}
                  />

                  <h3
                    style={{
                      marginTop: 14,
                    }}
                  >
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
      )}
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
  onCreateIntervention,
}: {
  problem: Problem;
  onBack: () => void;
  setPage: (page: Page) => void;
  onCreateIntervention: (
    problem: Problem
  ) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const createIntervention = async () => {
    setLoading(true);

    try {
      await onCreateIntervention(problem);
      setPage("interventions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card detail-card">
      <button
        className="back-button"
        onClick={onBack}
      >
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

      <div
        className="eyebrow"
        style={{ marginTop: 18 }}
      >
        {problem.category}
      </div>

      <h1>{problem.title}</h1>

      <p>{problem.description}</p>

      <div className="detail-stats">
        <div className="detail-stat">
          <strong>
            {problem.occurrences}
          </strong>

          <span>repeated signals</span>
        </div>

        <div className="detail-stat">
          <strong>
            {problem.minutes}m
          </strong>

          <span>estimated time lost</span>
        </div>

        <div className="detail-stat">
          <strong>
            {problem.observationIds?.length ||
              0}
          </strong>

          <span>linked observations</span>
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
        <div className="eyebrow">
          INVISIBLE'S READ
        </div>

        <p style={{ margin: 0 }}>
          These incidents may look unrelated
          individually, but their repeated context
          suggests a common friction point. The useful
          question is not "How do I solve every
          incident?" but "What small change prevents
          the whole cluster?"
        </p>
      </div>

      {problem.intervention && (
        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 22,
            background: "#f8fbff",
          }}
        >
          <div className="eyebrow">
            SUGGESTED INTERVENTION
          </div>

          <p
            style={{
              margin: 0,
              color: "#202532",
              fontWeight: 600,
            }}
          >
            {problem.intervention}
          </p>
        </div>
      )}

      <button
        className="primary-button"
        style={{ marginTop: 20 }}
        onClick={createIntervention}
        disabled={loading}
      >
        {loading
          ? "Creating..."
          : "Try an intervention"}

        {!loading && (
          <ArrowRight
            size={15}
            style={{
              marginLeft: 7,
              verticalAlign: "middle",
            }}
          />
        )}
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
    status: InterventionStatus
  ) => Promise<void>;
}) {
  return (
    <>
      <PageHeading
        eyebrow="FIX THE PATTERN"
        title="Small changes, tested in real life."
        description="INVISIBLE suggests interventions and learns from whether they actually work."
      />

      {interventions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Lightbulb size={24} />
          </div>

          <h3>No interventions yet.</h3>

          <p>
            Once INVISIBLE discovers an underlying
            problem, open it and create an intervention
            to test a small change.
          </p>
        </div>
      ) : (
        <div className="intervention-list">
          {interventions.map((item) => (
            <div
              className="card intervention-card"
              key={item.id}
            >
              <div>
                <div className="badge">
                  {item.type}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>

              <div>
                {item.status === "Try this" ? (
                  <button
                    className="outline-button"
                    onClick={() =>
                      onUpdate(
                        item.id,
                        "Worked"
                      )
                    }
                  >
                    <Zap
                      size={14}
                      style={{
                        verticalAlign:
                          "middle",
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
                        verticalAlign:
                          "middle",
                        marginRight: 4,
                      }}
                    />
                    {item.status}
                  </span>
                )}

                {item.status === "Try this" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    <button
                      className="outline-button"
                      style={{
                        fontSize: 11,
                        padding: "7px 9px",
                      }}
                      onClick={() =>
                        onUpdate(
                          item.id,
                          "Didn't work"
                        )
                      }
                    >
                      Didn't work
                    </button>

                    <button
                      className="outline-button"
                      style={{
                        fontSize: 11,
                        padding: "7px 9px",
                      }}
                      onClick={() =>
                        onUpdate(
                          item.id,
                          "Forgot to try"
                        )
                      }
                    >
                      Later
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressPage({
  interventions,
}: {
  interventions: Intervention[];
}) {
  const worked = interventions.filter(
    (item) => item.status === "Worked"
  ).length;

  const didntWork = interventions.filter(
    (item) => item.status === "Didn't work"
  ).length;

  const forgot = interventions.filter(
    (item) => item.status === "Forgot to try"
  ).length;

  const tracked =
    worked + didntWork + forgot;

  const successRate =
    tracked > 0
      ? Math.round((worked / tracked) * 100)
      : 0;

  return (
    <>
      <PageHeading
        eyebrow="MEASURE"
        title="Did the change actually help?"
        description="Progress is based on how you respond to the interventions INVISIBLE suggests."
      />

      {interventions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <TrendingDown size={24} />
          </div>

          <h3>No intervention results yet.</h3>

          <p>
            Try an intervention first. Once you mark
            it as worked or not worked, INVISIBLE can
            start showing your results.
          </p>
        </div>
      ) : (
        <div className="card progress-card">
          <div className="eyebrow">
            INTERVENTION RESULTS
          </div>

          <div className="progress-number">
            {successRate}%
          </div>

          <div className="progress-label">
            of tracked interventions marked as worked
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${successRate}%`,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              fontSize: 12,
              color: "#8a92a1",
            }}
          >
            <span>
              {tracked} tracked
            </span>

            <span>
              {interventions.length} total
            </span>
          </div>

          <div className="before-after">
            <div className="before-after-box">
              <strong>{worked}</strong>
              <span>worked</span>
            </div>

            <div className="before-after-box">
              <strong>{didntWork}</strong>
              <span>didn't work</span>
            </div>
          </div>

          <div className="before-after">
            <div className="before-after-box">
              <strong>{forgot}</strong>
              <span>forgot to try</span>
            </div>

            <div className="before-after-box">
              <strong>
                {interventions.length}
              </strong>
              <span>total suggestions</span>
            </div>
          </div>

          <p
            className="muted"
            style={{
              marginTop: 22,
              lineHeight: 1.6,
            }}
          >
            These numbers are calculated from your
            actual intervention responses. No demo
            values are being used.
          </p>
        </div>
      )}
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

  if (
    observations.length === 0 &&
    problems.length === 0
  ) {
    return (
      <>
        <PageHeading
          eyebrow="INVISIBLE INSIGHTS"
          title="What you might not notice yourself."
          description="Patterns become visible when small events are remembered together."
        />

        <div className="card empty-state">
          <div className="empty-state-icon">
            <Sparkles size={24} />
          </div>

          <h3>Your first insight is waiting.</h3>

          <p>
            Log a few ordinary frustrations and INVISIBLE
            will start looking for repeated causes.
          </p>
        </div>
      </>
    );
  }

  const largestProblem =
    [...problems].sort(
      (a, b) => b.minutes - a.minutes
    )[0];

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

          <h3>
            Small delays are adding up.
          </h3>

          <p>
            Across the observations you've logged,
            INVISIBLE has estimated:
          </p>

          <strong>
            {totalMinutes} minutes of friction
          </strong>
        </div>

        <div className="card insight-card">
          <div className="insight-icon">
            <Network size={20} />
          </div>

          <h3>
            Different incidents can share a cause.
          </h3>

          <p>
            INVISIBLE has currently grouped your
            observations into:
          </p>

          <strong>
            {problems.length} underlying{" "}
            {problems.length === 1
              ? "pattern"
              : "patterns"}
          </strong>
        </div>

        {largestProblem && (
          <div className="card insight-card">
            <div className="insight-icon">
              <TrendingDown size={20} />
            </div>

            <h3>
              One pattern is costing the most time.
            </h3>

            <p>
              Your largest currently detected cluster
              is:
            </p>

            <strong>
              {largestProblem.title}
            </strong>

            <p
              style={{
                marginTop: 8,
              }}
            >
              {largestProblem.minutes} estimated
              minutes across{" "}
              {largestProblem.occurrences} signals.
            </p>
          </div>
        )}

        {largestProblem?.intervention && (
          <div className="card insight-card">
            <div className="insight-icon">
              <Lightbulb size={20} />
            </div>

            <h3>
              The fix can be smaller than the problem.
            </h3>

            <p>
              INVISIBLE suggests starting with:
            </p>

            <strong>
              {largestProblem.intervention}
            </strong>
          </div>
        )}
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
  const [user, setUser] =
    useState<UserData | null>(null);

  const [page, setPage] =
    useState<Page>("dashboard");

  const [observations, setObservations] =
    useState<Observation[]>([]);

  const [problems, setProblems] =
    useState<Problem[]>([]);

  const [interventions, setInterventions] =
    useState<Intervention[]>([]);

  const [selectedProblem, setSelectedProblem] =
    useState<Problem | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(false);

  const [appError, setAppError] =
    useState("");

  /* -------------------------------------------------------
     LOAD USER DATA
  ------------------------------------------------------- */

  const loadUserData = async (
    userId: number
  ) => {
    setLoadingData(true);
    setAppError("");

    try {
      const [
        observationData,
        problemData,
        interventionData,
      ] = await Promise.all([
        apiRequest(
          `/api/observations?user_id=${userId}`
        ),
        apiRequest(
          `/api/problems?user_id=${userId}`
        ),
        apiRequest(
          `/api/interventions?user_id=${userId}`
        ),
      ]);

      setObservations(
        Array.isArray(observationData)
          ? observationData.map(mapObservation)
          : []
      );

      setProblems(
        Array.isArray(problemData)
          ? problemData.map(mapProblem)
          : []
      );

      setInterventions(
        Array.isArray(interventionData)
          ? interventionData.map(mapIntervention)
          : []
      );
    } catch (error: any) {
      console.error(error);
      setAppError(
        "Could not load your data from the backend."
      );

      setObservations([]);
      setProblems([]);
      setInterventions([]);
    } finally {
      setLoadingData(false);
    }
  };

  /* -------------------------------------------------------
     AUTO RESTORE SESSION
  ------------------------------------------------------- */

  useEffect(() => {
    const savedUser =
      localStorage.getItem(
        "invisible_user"
      );

    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser);

      if (parsed?.id) {
        setUser(parsed);
        loadUserData(parsed.id);
      }
    } catch {
      localStorage.removeItem(
        "invisible_user"
      );
    }
  }, []);

  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const handleLogin = async (
    name: string,
    email: string
  ) => {
    const userData = await apiRequest(
      "/api/users",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
        }),
      }
    );

    const backendUser = userData.user ?? userData;

    const currentUser: UserData = {
      id: Number(backendUser.id),
      name: backendUser.name,
      email: backendUser.email,
    };

    setUser(currentUser);

    localStorage.setItem(
      "invisible_user",
      JSON.stringify(currentUser)
    );

    setPage("dashboard");
    setSelectedProblem(null);

    await loadUserData(currentUser.id);
  };

  /* -------------------------------------------------------
     ADD OBSERVATION
  ------------------------------------------------------- */

  const addObservation = async (
    text: string
  ) => {
    if (!user) return;

    setAppError("");

    try {
      const result = await apiRequest(
        "/api/observations",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            text,
          }),
        }
      );

      if (result?.observation) {
        setObservations((current) => [
          mapObservation(result.observation),
          ...current,
        ]);
      }

      if (Array.isArray(result?.problems)) {
        setProblems(
          result.problems.map(mapProblem)
        );
      } else {
        await loadUserData(user.id);
      }

      setPage("discover");
    } catch (error: any) {
      console.error(error);

      setAppError(
        "Could not save this observation. Make sure the backend is running."
      );

      throw error;
    }
  };

  /* -------------------------------------------------------
     CREATE INTERVENTION
  ------------------------------------------------------- */

  const createIntervention = async (
    problem: Problem
  ) => {
    if (!user) return;

    const action =
      problem.intervention ||
      `Create a small change that reduces the repeated friction behind "${problem.title}".`;

    try {
      const result = await apiRequest(
        "/api/interventions",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            problem_id: Number(problem.id),
            action,
          }),
        }
      );

      if (result) {
        setInterventions((current) => [
          ...current,
          mapIntervention({
            ...result,
            title: problem.title,
            action,
          }),
        ]);
      }
    } catch (error: any) {
      console.error(error);

      setAppError(
        "Could not create the intervention."
      );

      throw error;
    }
  };

  /* -------------------------------------------------------
     UPDATE INTERVENTION
  ------------------------------------------------------- */

  const updateIntervention = async (
    id: string,
    status: InterventionStatus
  ) => {
    if (!user) return;

    let backendStatus = "not_started";

    if (status === "Worked") {
      backendStatus = "worked";
    } else if (status === "Didn't work") {
      backendStatus = "didnt_work";
    } else if (
      status === "Forgot to try"
    ) {
      backendStatus = "forgot";
    }

    try {
      await apiRequest(
        `/api/interventions/${id}?user_id=${user.id}&status=${backendStatus}`,
        {
          method: "PATCH",
        }
      );

      setInterventions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (error: any) {
      console.error(error);

      setAppError(
        "Could not update the intervention."
      );
    }
  };

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const logout = () => {
    localStorage.removeItem(
      "invisible_user"
    );

    setUser(null);
    setObservations([]);
    setProblems([]);
    setInterventions([]);
    setSelectedProblem(null);
    setPage("dashboard");
  };

  /* -------------------------------------------------------
     CURRENT PAGE
  ------------------------------------------------------- */

  const currentPage = useMemo(() => {
    if (selectedProblem) {
      return (
        <ProblemDetail
          problem={selectedProblem}
          onBack={() =>
            setSelectedProblem(null)
          }
          setPage={(nextPage) => {
            setSelectedProblem(null);
            setPage(nextPage);
          }}
          onCreateIntervention={
            createIntervention
          }
        />
      );
    }

    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            observations={observations}
            problems={problems}
            interventions={interventions}
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
        return (
          <ProgressPage
            interventions={interventions}
          />
        );

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

  /* -------------------------------------------------------
     LOGIN SCREEN
  ------------------------------------------------------- */

  if (!user) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>

        <LoginPage
          onLogin={handleLogin}
        />
      </>
    );
  }

  /* -------------------------------------------------------
     APP
  ------------------------------------------------------- */

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
            onLogout={logout}
          />

          <main className="main-area">
            <TopBar
              userName={user.name}
              onMenu={() =>
                setMobileMenuOpen(
                  (current) => !current
                )
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
                  borderBottom:
                    "1px solid #e5e8ee",
                  padding: 12,
                }}
              >
                {[
                  ["dashboard", "Overview"],
                  ["tell", "Tell INVISIBLE"],
                  ["discover", "Problem Map"],
                  ["problems", "Problems"],
                  [
                    "interventions",
                    "Interventions",
                  ],
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
                        page === id
                          ? 700
                          : 500,
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
              {appError && (
                <div
                  className="error-message"
                  style={{
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 10,
                  }}
                >
                  <span>{appError}</span>

                  <button
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      color: "inherit",
                    }}
                    onClick={() =>
                      setAppError("")
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {loadingData ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">
                    <Activity size={24} />
                  </div>

                  <h3>
                    Loading your INVISIBLE data...
                  </h3>

                  <p>
                    Connecting your observations,
                    patterns and interventions.
                  </p>
                </div>
              ) : (
                currentPage
              )}
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


