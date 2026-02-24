import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter,
  RadialBarChart, RadialBar, LineChart, Line, ComposedChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ZAxis
} from "recharts";
import { 
  FileText, Brain, BarChart3, MessageSquare, 
  UploadCloud, FileSpreadsheet, Calculator, 
  CheckCircle2, Sparkles, User, Folder, Tag,
  TrendingUp, Database, Layers, Activity
} from "lucide-react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const C = {
  bg: "#050C1A", card: "#0A1628", card2: "#0F1E38",
  accent: "#00E5C8", accent2: "#FF5A6E", accent3: "#9B7FFF",
  yellow: "#FFD166", blue: "#3ECFFF",
  text: "#E8F0FE", muted: "#4A5A78", border: "rgba(255,255,255,0.06)",
  glass: "rgba(255,255,255,0.03)"
};
const PALETTE = ["#00E5C8","#FF5A6E","#9B7FFF","#FFD166","#3ECFFF","#FF9F43","#26de81","#fd79a8"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: ${C.bg}; color: ${C.text}; font-family: 'Syne', sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: ${C.bg}; }
::-webkit-scrollbar-thumb { background: #1a2d4a; border-radius: 99px; }

#bg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

.grid-overlay {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,229,200,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,200,0.022) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 100%);
}

.orb {
  position: fixed; border-radius: 50%; filter: blur(110px);
  pointer-events: none; z-index: 0; animation: orbFloat ease-in-out infinite alternate;
}
@keyframes orbFloat {
  0%   { transform: translate(0,0) scale(1); }
  50%  { transform: translate(25px,-18px) scale(1.04); }
  100% { transform: translate(-15px,20px) scale(0.98); }
}

.app-shell { position: relative; z-index: 1; min-height: 100vh; }

/* ── NAV ── */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 60px;
  background: rgba(5,12,26,0.88);
  border-bottom: 1px solid rgba(0,229,200,0.1);
  position: sticky; top: 0; z-index: 200;
  backdrop-filter: blur(24px) saturate(200%);
}
.logo { font-size: 1.3rem; font-weight: 800; color: ${C.accent}; letter-spacing: -0.04em; display: flex; align-items: center; gap: 10px; }
.logo-txt { color: ${C.text}; }
.logo-ai { font-size: 0.56rem; color: ${C.accent3}; border: 1px solid rgba(155,127,255,0.35); border-radius: 4px; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
.nav-tabs { display: flex; gap: 2px; }
.nav-tab {
  padding: 6px 14px; border-radius: 7px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; border: none; background: transparent; color: ${C.muted};
  transition: all 0.18s; letter-spacing: 0.02em; font-family: 'Syne', sans-serif;
}
.nav-tab:hover { color: ${C.text}; background: rgba(255,255,255,0.05); }
.nav-tab.active { background: rgba(0,229,200,0.1); color: ${C.accent}; }
.nav-tab.ask-tab { color: ${C.accent3}; }
.nav-tab.ask-tab.active { background: rgba(155,127,255,0.12); }
.file-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,229,200,0.07); border: 1px solid rgba(0,229,200,0.18);
  border-radius: 20px; padding: 4px 12px; font-size: 0.72rem;
  color: ${C.accent}; font-family: 'JetBrains Mono', monospace;
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── HOME ── */
.home {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: calc(100vh - 60px); padding: 2rem; text-align: center;
}
.ai-pill {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(155,127,255,0.1); border: 1px solid rgba(155,127,255,0.28);
  border-radius: 20px; padding: 5px 14px; font-size: 0.72rem;
  color: ${C.accent3}; font-family: 'JetBrains Mono', monospace;
  margin-bottom: 1.5rem; animation: fadeUp 0.6s ease both;
}
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.accent3}; animation: pulse 1.8s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }

.hero-title {
  font-size: clamp(2.6rem, 6vw, 5.4rem); font-weight: 800;
  line-height: 1.04; letter-spacing: -0.045em;
  animation: fadeUp 0.7s 0.1s ease both;
}
.hl  { color: ${C.accent}; }
.hl2 { color: ${C.accent2}; }
.hl3 { color: ${C.accent3}; }

.hero-sub {
  font-size: 1rem; color: ${C.muted}; margin-top: 1.3rem; max-width: 460px;
  line-height: 1.85; font-family: 'JetBrains Mono', monospace; font-weight: 300;
  animation: fadeUp 0.7s 0.2s ease both;
}
.hero-ctas { display: flex; gap: 12px; margin-top: 2.4rem; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.7s 0.3s ease both; }
.btn-primary {
  padding: 13px 28px; background: linear-gradient(135deg, ${C.accent}, #00b8a0); color: #050C1A;
  border: none; border-radius: 9px; font-family: 'Syne', sans-serif;
  font-weight: 700; font-size: 0.92rem; cursor: pointer; transition: all 0.22s;
  position: relative; overflow: hidden;
}
.btn-primary::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition: opacity 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,229,200,0.35); }
.btn-ghost {
  padding: 13px 28px; background: transparent; color: ${C.text};
  border: 1.5px solid rgba(255,255,255,0.1); border-radius: 9px;
  font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.92rem;
  cursor: pointer; transition: all 0.22s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); transform: translateY(-1px); }

.feat-row {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
  margin-top: 3.5rem; max-width: 900px; width: 100%;
  animation: fadeUp 0.7s 0.4s ease both;
}
.feat-card {
  background: rgba(10,22,40,0.85); border: 1px solid ${C.border};
  border-radius: 14px; padding: 22px; text-align: left;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  backdrop-filter: blur(12px); position: relative; overflow: hidden;
}
.feat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, rgba(0,229,200,0.3), transparent); opacity:0; transition: opacity 0.3s; }
.feat-card:hover { border-color: rgba(0,229,200,0.2); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
.feat-card:hover::before { opacity: 1; }
.feat-ico { margin-bottom: 14px; }
.feat-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; }
.feat-desc { font-size: 0.76rem; color: ${C.muted}; line-height: 1.7; font-family: 'JetBrains Mono', monospace; }

/* ── UPLOAD ── */
.upload-page { padding: 2.5rem; max-width: 680px; margin: 0 auto; }
.pg-title { font-size: 1.7rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 4px; }
.pg-sub { color: ${C.muted}; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; margin-bottom: 2rem; }

.dropzone {
  border: 2px dashed rgba(0,229,200,0.18); border-radius: 18px;
  padding: 4rem 2rem; text-align: center; cursor: pointer;
  transition: all 0.25s; background: rgba(0,229,200,0.012);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
}
.dropzone::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,200,0.04), transparent);
  pointer-events: none;
}
.dropzone:hover, .dropzone.drag { border-color: ${C.accent}; background: rgba(0,229,200,0.04); }
.dz-ico { margin-bottom: 1.2rem; color: ${C.accent}; opacity: 0.8; }
.dz-title { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.dz-sub { font-size: 0.76rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }
.file-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(0,229,200,0.1); border: 1px solid rgba(0,229,200,0.28);
  border-radius: 20px; padding: 6px 14px; font-size: 0.76rem;
  color: ${C.accent}; margin-top: 1.2rem; font-family: 'JetBrains Mono', monospace;
}
.upload-btn {
  width: 100%; margin-top: 1.4rem; padding: 14px;
  background: linear-gradient(135deg, ${C.accent}, #00b8a0); color: #050C1A; border: none; border-radius: 11px;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem;
  cursor: pointer; transition: all 0.22s; letter-spacing: 0.02em;
}
.upload-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,229,200,0.35); }
.upload-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pbar { height: 3px; background: rgba(0,229,200,0.08); border-radius: 99px; margin-top: 1rem; overflow: hidden; }
.pfill { height: 100%; background: linear-gradient(90deg, ${C.accent}, ${C.accent3}); border-radius: 99px; transition: width 0.4s ease; box-shadow: 0 0 14px rgba(0,229,200,0.5); }
.pstatus { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; font-size: 0.73rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

/* ── DASHBOARD ── */
.dash { padding: 2rem 2.5rem; }
.dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 12px; }
.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 1.8rem; }

.stat-card {
  background: rgba(10,22,40,0.9); border: 1px solid ${C.border};
  border-radius: 14px; padding: 20px; position: relative; overflow: hidden;
  backdrop-filter: blur(12px); transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
.stat-card::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--accent-color, ${C.accent}); opacity: 0.7;
  box-shadow: 0 0 10px var(--accent-color, ${C.accent});
}
.stat-card::before {
  content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px;
  background: radial-gradient(circle, var(--accent-color, ${C.accent}) 0%, transparent 70%);
  opacity: 0.06; border-radius: 0 14px 0 0;
}
.stat-lbl { font-size: 0.68rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.stat-val { font-size: 2rem; font-weight: 800; margin: 6px 0 2px; letter-spacing: -0.04em; }
.stat-desc { font-size: 0.68rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.chart-card {
  background: rgba(10,22,40,0.9); border: 1px solid ${C.border};
  border-radius: 14px; padding: 20px; backdrop-filter: blur(12px);
  transition: border-color 0.25s, transform 0.25s;
  position: relative; overflow: hidden;
}
.chart-card::before {
  content: ''; position:absolute; top:0; left:0; right:0; height:1px;
  background: linear-gradient(90deg, transparent, rgba(0,229,200,0.15), transparent);
}
.chart-card:hover { border-color: rgba(0,229,200,0.15); transform: translateY(-2px); }
.chart-card.full { grid-column: 1/-1; }
.chart-title { font-size: 0.86rem; font-weight: 700; margin-bottom: 2px; }
.chart-sub { font-size: 0.68rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; margin-bottom: 14px; line-height: 1.5; }

.mini-stats { display: flex; gap: 16px; margin-bottom: 10px; flex-wrap: wrap; }
.mini-stat { font-size: 0.69rem; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px; }
.mini-stat-val { font-weight: 700; }
.mini-stat-lbl { color: ${C.muted}; }

.donut-wrap { position: relative; }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
.donut-center-num { font-size: 1.1rem; font-weight: 800; color: ${C.text}; }
.donut-center-lbl { font-size: 0.6rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

.dash-section-label {
  font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: ${C.muted}; font-family: 'JetBrains Mono', monospace;
  margin: 1.8rem 0 0.8rem; display: flex; align-items: center; gap: 10px;
}
.dash-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
.dash-section-label::before { content: ''; width: 4px; height: 12px; background: ${C.accent}; border-radius: 2px; box-shadow: 0 0 8px ${C.accent}; }

.custom-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; font-family: 'JetBrains Mono', monospace; color: ${C.muted}; }
.legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

/* ── NUMERIC MINI CARDS ── */
.num-card {
  background: rgba(10,22,40,0.9); border: 1px solid ${C.border};
  border-radius: 12px; padding: 14px 16px;
  border-left: 3px solid var(--col-color, ${C.accent});
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative; overflow: hidden;
}
.num-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.num-card::after {
  content: ''; position: absolute; top: 0; right: 0; width: 60px; height: 60px;
  background: radial-gradient(circle, var(--col-color, ${C.accent}) 0%, transparent 70%);
  opacity: 0.05;
}
.num-card-name { font-size: 0.76rem; font-weight: 700; margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.num-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
.num-stat-row { font-size: 0.66rem; font-family: 'JetBrains Mono', monospace; }

/* ── SUMMARY ── */
.sum-page { padding: 2.5rem; max-width: 880px; margin: 0 auto; }
.sblock {
  background: rgba(10,22,40,0.9); border: 1px solid ${C.border};
  border-radius: 16px; padding: 26px; margin-bottom: 16px;
  position: relative; overflow: hidden; backdrop-filter: blur(12px);
}
.sblock::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, rgba(0,229,200,0.2), transparent); }
.sblock-glow {
  position: absolute; top: -80px; right: -80px; width: 220px; height: 220px;
  border-radius: 50%; filter: blur(70px); pointer-events: none; opacity: 0.1;
}
.sblock-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.sblock-label::before { content:''; width:3px; height:10px; background:${C.accent}; border-radius:2px; box-shadow:0 0 6px ${C.accent}; }
.sum-text { font-size: 0.86rem; color: ${C.text}; line-height: 2; font-family: 'JetBrains Mono', monospace; white-space: pre-wrap; }
.note-row { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.note-row:last-child { border-bottom: none; }
.note-pip { width: 5px; height: 5px; border-radius: 50%; background: ${C.accent}; margin-top: 9px; flex-shrink: 0; box-shadow: 0 0 6px ${C.accent}; }
.note-txt { font-size: 0.82rem; color: ${C.text}; font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
.data-tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.67rem; font-family: 'JetBrains Mono', monospace; margin: 3px; }
.col-tbl { width: 100%; border-collapse: collapse; font-size: 0.76rem; font-family: 'JetBrains Mono', monospace; }
.col-tbl th { text-align: left; padding: 9px 12px; color: ${C.muted}; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.08em; }
.col-tbl td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.035); vertical-align: top; }
.col-tbl tr:last-child td { border-bottom: none; }
.col-tbl tr:hover td { background: rgba(255,255,255,0.02); }
.regen-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 15px;
  background: rgba(155,127,255,0.08); border: 1px solid rgba(155,127,255,0.25);
  border-radius: 8px; font-size: 0.74rem; color: ${C.accent3};
  cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
}
.regen-btn:hover:not(:disabled) { background: rgba(155,127,255,0.15); transform: translateY(-1px); }
.regen-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.model-credit { display: inline-flex; align-items: center; gap: 5px; font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; color: ${C.accent3}; margin-top: 12px; opacity: 0.55; }

/* ── ASK AI ── */
.ask-page {
  padding: 1.5rem 2.5rem 0; max-width: 860px; margin: 0 auto;
  display: flex; flex-direction: column; height: calc(100vh - 60px);
}
.ask-hdr { margin-bottom: 0.8rem; flex-shrink: 0; }
.data-context-bar {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: rgba(0,229,200,0.05); border: 1px solid rgba(0,229,200,0.13);
  border-radius: 10px; margin-bottom: 0.9rem; flex-shrink: 0; flex-wrap: wrap;
}
.ctx-chip { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; font-family: 'JetBrains Mono', monospace; color: ${C.accent}; background: rgba(0,229,200,0.08); border-radius: 4px; padding: 4px 8px; }
.ctx-label { font-size: 0.7rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

.sq-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 0.9rem; flex-shrink: 0; }
.sq {
  padding: 5px 12px; background: rgba(0,229,200,0.04);
  border: 1px solid rgba(0,229,200,0.15); border-radius: 20px;
  font-size: 0.7rem; color: ${C.accent}; cursor: pointer;
  transition: all 0.18s; font-family: 'JetBrains Mono', monospace;
}
.sq:hover { background: rgba(0,229,200,0.1); border-color: rgba(0,229,200,0.35); transform: translateY(-1px); }

.messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 4px 0 1rem; min-height: 0; }
.msg { display: flex; gap: 10px; animation: fadeUp 0.28s ease; }
.msg.user { flex-direction: row-reverse; }
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.ai   { background: rgba(155,127,255,0.12); color: ${C.accent3}; border: 1px solid rgba(155,127,255,0.2); }
.avatar.user { background: rgba(255,90,110,0.12); color: ${C.accent2}; border: 1px solid rgba(255,90,110,0.2); }

.bubble { max-width: 84%; padding: 13px 16px; border-radius: 13px; font-size: 0.83rem; line-height: 1.9; font-family: 'JetBrains Mono', monospace; word-break: break-word; }
.bubble.ai { background: rgba(10,22,40,0.96); border: 1px solid rgba(155,127,255,0.12); color: ${C.text}; border-radius: 2px 13px 13px 13px; }
.bubble.user { background: rgba(255,90,110,0.08); border: 1px solid rgba(255,90,110,0.18); color: ${C.text}; border-radius: 13px 2px 13px 13px; }

.typing-indicator { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
.typing-indicator span { width: 5px; height: 5px; border-radius: 50%; background: ${C.accent3}; animation: blink 1.3s ease infinite; }
.typing-indicator span:nth-child(2) { animation-delay: 0.18s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.36s; }
@keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }

.chat-footer { padding: 0.9rem 0 1.2rem; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.05); }
.chat-row { display: flex; gap: 10px; align-items: flex-end; }
.chat-input {
  flex: 1; background: rgba(10,22,40,0.96); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 11px; padding: 12px 16px; color: ${C.text};
  font-family: 'JetBrains Mono', monospace; font-size: 0.83rem; outline: none;
  transition: border-color 0.2s; resize: none; min-height: 48px;
}
.chat-input:focus { border-color: rgba(155,127,255,0.35); }
.send-btn {
  padding: 12px 18px; background: ${C.accent3}; color: #050C1A; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 11px; cursor: pointer; transition: all 0.2s;
  font-weight: 800; min-width: 48px; min-height: 48px;
}
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(155,127,255,0.4); }
.send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── SHARED ── */
.no-data { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 5rem 2rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; font-size: 0.83rem; text-align: center; }
.no-data-ico { opacity: 0.4; margin-bottom: 0.5rem; }
.spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(155,127,255,0.2); border-top-color: ${C.accent3}; border-radius: 50%; animation: sp 0.7s linear infinite; }
@keyframes sp { to { transform: rotate(360deg); } }

/* ── RICH TEXT ── */
.rt-h2  { font-weight: 800; color: ${C.accent}; font-size: 0.9rem; margin: 12px 0 5px; }
.rt-h3  { font-weight: 700; color: ${C.accent}; font-size: 0.84rem; margin: 9px 0 3px; }
.rt-li  { display: flex; gap: 8px; margin-top: 4px; }
.rt-pip { color: ${C.accent}; flex-shrink: 0; }
.rt-num { color: ${C.muted}; flex-shrink: 0; min-width: 18px; }
.rt-gap { height: 6px; }
.rt-bold { color: ${C.accent}; font-weight: 600; }
.rt-code { background: rgba(0,229,200,0.08); padding: 1px 6px; border-radius: 4px; color: ${C.accent}; font-size: 0.9em; }

/* ── TOOLTIP CUSTOM ── */
.custom-tooltip {
  background: rgba(10,22,40,0.97) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: 10px !important;
  padding: 10px 14px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
}
.custom-tooltip .recharts-tooltip-label { color: ${C.muted}; margin-bottom: 4px; font-size: 10px; }

/* ── EXCEL BADGE ── */
.excel-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(38,222,129,0.1); border: 1px solid rgba(38,222,129,0.25);
  border-radius: 6px; padding: 3px 10px; font-size: 0.68rem;
  color: #26de81; font-family: 'JetBrains Mono', monospace; margin-left: 8px;
}

@media (max-width: 768px) {
  .feat-row { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .ask-page { padding: 1rem; }
  .nav-tabs .nav-tab { padding: 5px 9px; font-size: 0.74rem; }
}
`;

// ── ANIMATED BACKGROUND ──────────────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const N = 50;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
      r: Math.random()*1.8+0.8,
      color: [C.accent, C.accent2, C.accent3, C.yellow, C.blue][Math.floor(Math.random()*5)],
    }));
    let t = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      // wave lines
      for (let wave=0; wave<3; wave++) {
        const hue=[C.accent,C.accent3,C.accent2][wave];
        ctx.beginPath(); ctx.strokeStyle=hue+"1a"; ctx.lineWidth=1;
        for (let x=0; x<=W; x+=4) {
          const y = H/2 + Math.sin(x/180+t+wave*1.2)*45 + Math.sin(x/95+t*1.3+wave)*22 + Math.cos(x/270+t*0.7)*55;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // connections
      for (let i=0;i<N;i++) {
        for (let j=i+1;j<N;j++) {
          const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if (d<130) {
            ctx.beginPath();
            ctx.strokeStyle=`rgba(0,229,200,${(1-d/130)*0.14})`;
            ctx.lineWidth=0.5;
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.stroke();
          }
        }
      }
      // nodes
      nodes.forEach(n => {
        n.x+=n.vx; n.y+=n.vy;
        if (n.x<0||n.x>W) n.vx*=-1;
        if (n.y<0||n.y>H) n.vy*=-1;
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3);
        g.addColorStop(0,n.color+"bb"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      });
      // scan line
      const sY=((t*38)%H);
      const sg=ctx.createLinearGradient(0,sY-30,0,sY+30);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,"rgba(0,229,200,0.03)"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,sY-30,W,60);
      t+=0.005;
      animRef.current=requestAnimationFrame(draw);
    };
    draw();
    const onResize=()=>{ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
    window.addEventListener("resize",onResize);
    return ()=>{ cancelAnimationFrame(animRef.current); window.removeEventListener("resize",onResize); };
  },[]);
  return <canvas ref={canvasRef} id="bg-canvas" style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}} />;
}

// ── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{background:"rgba(10,22,40,0.97)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,boxShadow:"0 10px 30px rgba(0,0,0,0.5)"}}>
      {label && <div style={{color:C.muted,marginBottom:6,fontSize:10}}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:i<payload.length-1?3:0}}>
          <div style={{width:7,height:7,borderRadius:2,background:p.color||p.fill,flexShrink:0}}/>
          <span style={{color:C.muted}}>{p.name || p.dataKey}:</span>
          <span style={{color:C.text,fontWeight:600}}>{formatter ? formatter(p.value, p.name) : p.value?.toLocaleString?.() ?? p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── DATA HELPERS ─────────────────────────────────────────────────────────────
function isEmpty(v) {
  if (v===null||v===undefined) return true;
  const s=String(v).trim().toLowerCase();
  return s===""||s==="null"||s==="n/a"||s==="na"||s==="undefined"||s==="-"||s==="none";
}
function detectType(vals) {
  const ne = vals.filter(v => !isEmpty(v));
  if (!ne.length) return "empty";

  const nums = ne.filter(v => normalizeNumeric(v) !== null);

  return nums.length / ne.length > 0.7 ? "numeric" : "categorical";
}

// FIX: Normalize Excel numeric values (handle commas, currency symbols, etc.)
function normalizeNumeric(v) {
  if (v===null||v===undefined) return null;
  let s = String(v).trim();
  // Remove common non-numeric chars that Excel might keep
  s = s.replace(/[$,€£¥%]/g, "").trim();
  // Handle parentheses for negatives like (123)
  if (s.startsWith("(") && s.endsWith(")")) s = "-" + s.slice(1,-1);
  const n = parseFloat(s);
  return (!isNaN(n) && isFinite(n)) ? n : null;
}

function analyzeData(rows) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const colInfo = cols.map(col => {
    const allVals = rows.map(r => r[col]);
    const vals = allVals.filter(v => !isEmpty(v));
    const emptyCount = allVals.length - vals.length;
    const type = detectType(vals);
    if (type==="numeric") {
      const nums = vals.map(v=>normalizeNumeric(v)).filter(v=>v!==null);
      if (!nums.length) return {col,type:"empty",emptyCount:allVals.length};
      const sum=nums.reduce((a,b)=>a+b,0);
      const sorted=[...nums].sort((a,b)=>a-b);
      const mid=Math.floor(nums.length/2);
      const median=nums.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
      const mean=sum/nums.length;
      const std=Math.sqrt(nums.reduce((a,n)=>a+(n-mean)**2,0)/nums.length);
      return {
        col,type,count:nums.length,emptyCount,
        min:+sorted[0].toFixed(4),max:+sorted[sorted.length-1].toFixed(4),
        mean:+mean.toFixed(3),median:+median.toFixed(3),
        std:+std.toFixed(3),sum:+sum.toFixed(2),
        q1:sorted[Math.floor(nums.length*0.25)],
        q3:sorted[Math.floor(nums.length*0.75)],
        zeros:nums.filter(n=>n===0).length,
        negatives:nums.filter(n=>n<0).length,
      };
    }
    const freq={};
    vals.forEach(v=>{
      // FIX: Properly stringify Excel cell values including dates and objects
      let key;
      if (v instanceof Date) {
        key = v.toLocaleDateString();
      } else {
        key = String(v).trim();
      }
      if (key) freq[key]=(freq[key]||0)+1;
    });
    const entries=Object.entries(freq).sort((a,b)=>b[1]-a[1]);
    return {col,type,unique:entries.length,emptyCount,top:entries.slice(0,10),nullCount:emptyCount};
  });
  const validCols=colInfo.filter(c=>c.type!=="empty");
  return {rows:rows.length,cols:validCols.length,colInfo:validCols};
}

// FIX: Enhanced serialization for Excel data — properly handle all cell types
function serializeFullData(rows, analysis) {
  if (!rows.length) return "";
  const cols = analysis.colInfo.map(c=>c.col);
  const header = cols.join(" | ");
  const maxRows = Math.min(rows.length, 400);
  const step = rows.length>400?Math.floor(rows.length/400):1;
  const sampled = [];
  for (let i=0; i<rows.length && sampled.length<maxRows; i+=step) {
    const rowVals = cols.map(c => {
      const v = rows[i][c];
      if (isEmpty(v)) return "";
      if (v instanceof Date) return v.toLocaleDateString();
      // FIX: Ensure numeric Excel values are properly converted
      const s = String(v).trim();
      return s;
    });
    if (rowVals.every(v=>v==="")) continue;
    sampled.push(rowVals.join(" | "));
  }
  return `${header}\n${sampled.join("\n")}`;
}

// FIX: Better context building with Excel-specific notes
function buildFullContext(analysis, fileName, rows) {
  const ext = fileName.split(".").pop().toLowerCase();
  const isExcel = ext==="xlsx"||ext==="xls";
  const numCols=analysis.colInfo.filter(c=>c.type==="numeric");
  const catCols=analysis.colInfo.filter(c=>c.type==="categorical");

  const statsBlock=[
    `=== DATASET: "${fileName}" ${isExcel?"[Excel File]":"[CSV File]"} ===`,
    `Total rows: ${analysis.rows.toLocaleString()} | Total columns: ${analysis.cols}`,
    isExcel?`NOTE: This is an Excel file. Numeric values have been normalized (commas, currency symbols removed). All statistics below reflect actual data values.`:`NOTE: Empty, null, blank, N/A values are excluded from all statistics.`,
    ``,
    `=== NUMERIC COLUMNS (${numCols.length}) ===`,
    ...numCols.map(c=>
      `${c.col}:\n  non_empty_count=${c.count}, min=${c.min}, max=${c.max}, mean=${c.mean}, median=${c.median}, std=${c.std}, sum=${c.sum?.toLocaleString()}, q1=${c.q1}, q3=${c.q3}, zeros=${c.zeros}, negatives=${c.negatives}${c.emptyCount>0?`, empty_cells_ignored=${c.emptyCount}`:""}`
    ),
    ``,
    `=== CATEGORICAL COLUMNS (${catCols.length}) ===`,
    ...catCols.map(c=>
      `${c.col}:\n  unique_values=${c.unique} (excluding blank), empty_cells_ignored=${c.nullCount||0}\n  top_values: ${c.top.slice(0,6).map(([v,n])=>`"${v}"(n=${n},${(n/analysis.rows*100).toFixed(1)}%)`).join(", ")}`
    ),
  ].join("\n");

  const dataBlock=serializeFullData(rows, analysis);
  return `${statsBlock}\n\n=== FULL DATA SAMPLE (up to 400 rows, pipe-separated) ===\n${dataBlock}`;
}

function buildCharts(rows, colInfo) {
  const charts=[];
  const nums=colInfo.filter(c=>c.type==="numeric");
  const cats=colInfo.filter(c=>c.type==="categorical"&&c.unique>1&&c.unique<=20);
  const safeNum = v => normalizeNumeric(v);
  const validRows=(cA,cB)=>rows.filter(r=>!isEmpty(r[cA])&&!isEmpty(r[cB])&&safeNum(r[cA])!==null&&safeNum(r[cB])!==null);

  // 1. DONUT
  cats.slice(0,4).forEach(c=>{
    const data=c.top.slice(0,8).filter(([n])=>n&&!isEmpty(n)).map(([name,value])=>({name:String(name).trim().slice(0,18),value}));
    if (data.length>1) charts.push({type:"donut",title:`${c.col}`,sub:`${c.unique} unique values · top ${data.length} shown`,data,total:data.reduce((s,d)=>s+d.value,0)});
  });

  // 2. HBAR
  if (cats.length&&nums.length) {
    const cat=cats[0].col,num=nums[0].col;
    const agg={};
    rows.forEach(r=>{
      if (isEmpty(r[cat])||isEmpty(r[num])) return;
      const k=String(r[cat] instanceof Date?r[cat].toLocaleDateString():r[cat]).trim().slice(0,22);
      const n=safeNum(r[num]);
      if (k&&n!==null) agg[k]=(agg[k]||0)+n;
    });
    const data=Object.entries(agg).filter(([n])=>n).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,value])=>({name,value:+value.toFixed(2)}));
    if (data.length>1) charts.push({type:"hbar",title:`Top ${num} by ${cat}`,sub:"Horizontal ranking · sorted by value",data});
  }

  // 3. GROUPED BAR
  if (cats.length>=1&&nums.length>=2) {
    const cat=cats[0].col;
    const numPair=nums.slice(0,3);
    const agg={};
    rows.forEach(r=>{
      if (isEmpty(r[cat])) return;
      const k=String(r[cat] instanceof Date?r[cat].toLocaleDateString():r[cat]).trim().slice(0,20);
      if (!k) return;
      if (!agg[k]) agg[k]={name:k};
      numPair.forEach(nc=>{
        const n=safeNum(r[nc.col]);
        if (n!==null) agg[k][nc.col]=(agg[k][nc.col]||0)+n;
      });
    });
    const data=Object.values(agg).sort((a,b)=>(b[numPair[0].col]||0)-(a[numPair[0].col]||0)).slice(0,8);
    if (data.length>1&&numPair.length>=2) charts.push({type:"grouped",title:`${cat} — Multi-Metric`,sub:`${numPair.map(n=>n.col).join(" vs ")} compared`,data,keys:numPair.map(n=>n.col)});
  }

  // 4. LINE
  nums.slice(0,3).forEach(nc=>{
    const validR=rows.filter(r=>!isEmpty(r[nc.col])&&safeNum(r[nc.col])!==null);
    const step=Math.max(1,Math.floor(validR.length/60));
    const data=[];
    for (let i=0;i<validR.length&&data.length<60;i+=step) {
      const v=safeNum(validR[i][nc.col]);
      if (v!==null) data.push({idx:data.length+1,value:v});
    }
    if (data.length>3) charts.push({type:"line",title:`${nc.col} — Trend`,sub:`Range: ${nc.min} – ${nc.max} · Mean: ${nc.mean}`,data,mean:nc.mean,col:nc.col});
  });

  // 5. AREA
  if (nums.length>=2) {
    const k0=nums[0].col,k1=nums[1].col;
    const vrows=validRows(k0,k1);
    const step=Math.max(1,Math.floor(vrows.length/55));
    const data=[];
    for (let i=0;i<vrows.length&&data.length<55;i+=step)
      data.push({idx:data.length+1,[k0]:safeNum(vrows[i][k0]),[k1]:safeNum(vrows[i][k1])});
    if (data.length>3) charts.push({type:"area",title:`${k0} vs ${k1}`,sub:"Dual-axis area comparison",data,keys:[k0,k1]});
  }

  // 6. HISTOGRAM
  nums.slice(0,2).forEach(nc=>{
    const vals=rows.map(r=>safeNum(r[nc.col])).filter(v=>v!==null);
    if (vals.length<5) return;
    const min=nc.min,max=nc.max,bins=Math.min(15,Math.ceil(Math.sqrt(vals.length)));
    const bw=(max-min)/bins||1;
    const buckets=Array.from({length:bins},(_,i)=>({label:`${(min+i*bw).toFixed(1)}`,count:0,range:`${(min+i*bw).toFixed(1)}–${(min+(i+1)*bw).toFixed(1)}`}));
    vals.forEach(v=>{
      const bi=Math.min(bins-1,Math.floor((v-min)/bw));
      if (bi>=0) buckets[bi].count++;
    });
    charts.push({type:"histogram",title:`${nc.col} — Distribution`,sub:`${bins} bins · ${vals.length} values · mean: ${nc.mean}`,data:buckets,mean:nc.mean,median:nc.median});
  });

  // 7. SCATTER
  if (nums.length>=2) {
    const k0=nums[0].col,k1=nums[1].col;
    const vrows=validRows(k0,k1);
    const step=Math.max(1,Math.floor(vrows.length/90));
    const data=[];
    for (let i=0;i<vrows.length&&data.length<90;i+=step)
      data.push({x:safeNum(vrows[i][k0]),y:safeNum(vrows[i][k1])});
    if (data.length>4) charts.push({type:"scatter",title:`${k0} × ${k1}`,sub:"Scatter correlation",data,xKey:k0,yKey:k1});
  }

  // 8. RADIAL
  if (nums.length>=2) {
    const radData=nums.slice(0,6).map((nc,i)=>({name:nc.col.slice(0,14),value:nc.max>0?Math.round((nc.mean/nc.max)*100):0,fill:PALETTE[i%PALETTE.length]})).filter(d=>d.value>0);
    if (radData.length>=2) charts.push({type:"radial",title:"Mean as % of Max",sub:"How average compares to maximum per column",data:radData});
  }

  // 9. COMPOSED
  if (cats.length>=1&&nums.length>=1) {
    const cat=cats.length>=2?cats[1].col:cats[0].col;
    const num=nums[0].col;
    const agg={},cnt={};
    rows.forEach(r=>{
      if (isEmpty(r[cat])||isEmpty(r[num])) return;
      const k=String(r[cat] instanceof Date?r[cat].toLocaleDateString():r[cat]).trim().slice(0,20);
      const n=safeNum(r[num]);
      if (k&&n!==null){agg[k]=(agg[k]||0)+n;cnt[k]=(cnt[k]||0)+1;}
    });
    const data=Object.entries(agg).filter(([n])=>n).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,total])=>({name,total:+total.toFixed(2),avg:+(total/cnt[name]).toFixed(2)}));
    if (data.length>2) charts.push({type:"composed",title:`${cat} — Total & Average ${num}`,sub:"Bars = total · Line = average",data});
  }

  // 10. RADAR
  if (cats.length>=1&&nums.length>=3) {
    const cat=cats[0].col;
    const topCats=cats[0].top.slice(0,3).map(t=>t[0]);
    const metrics=nums.slice(0,5);
    const data=metrics.map(m=>{
      const row={metric:m.col.slice(0,12)};
      topCats.forEach(tc=>{
        const matches=rows.filter(r=>String(r[cat]).trim()===tc&&safeNum(r[m.col])!==null);
        const sum=matches.reduce((s,r)=>s+safeNum(r[m.col]),0);
        row[tc]=matches.length&&m.max>0?+((sum/matches.length/m.max)*100).toFixed(1):0;
      });
      return row;
    });
    if (data.length>2) charts.push({type:"radar",title:`${cat} — Metric Profile`,sub:"Normalized means (% of max) for top groups",data,keys:topCats});
  }

  // 11. DEVIATION
  if (cats.length>=1&&nums.length>=1) {
    const cat=cats[0].col;
    const num=nums.length>1?nums[1]:nums[0];
    const mean=num.mean;
    const agg={},cnt={};
    rows.forEach(r=>{
      if (isEmpty(r[cat])||isEmpty(r[num.col])) return;
      const k=String(r[cat] instanceof Date?r[cat].toLocaleDateString():r[cat]).trim().slice(0,20);
      const n=safeNum(r[num.col]);
      if (k&&n!==null){agg[k]=(agg[k]||0)+n;cnt[k]=(cnt[k]||0)+1;}
    });
    const data=Object.entries(agg).map(([name,val])=>({name,diff:+((val/cnt[name])-mean).toFixed(2),avg:+(val/cnt[name]).toFixed(2)})).sort((a,b)=>b.diff-a.diff).filter(d=>d.diff!==0).slice(0,12);
    if (data.length>2) charts.push({type:"deviation",title:`${num.col} — Variance`,sub:`+/- deviation from global mean (${mean}) by ${cat}`,data,yKey:"diff"});
  }

  // 12. STACKED
  if (cats.length>=2&&nums.length>=2) {
    const cat=cats[1].col;
    const numPair=nums.slice(-2);
    const agg={};
    rows.forEach(r=>{
      if (isEmpty(r[cat])) return;
      const k=String(r[cat] instanceof Date?r[cat].toLocaleDateString():r[cat]).trim().slice(0,20);
      if (!k) return;
      if (!agg[k]) agg[k]={name:k};
      numPair.forEach(nc=>{
        const n=safeNum(r[nc.col]);
        if (n!==null) agg[k][nc.col]=(agg[k][nc.col]||0)+n;
      });
    });
    const data=Object.values(agg).sort((a,b)=>(b[numPair[0].col]||0)-(a[numPair[0].col]||0)).slice(0,8);
    if (data.length>1) charts.push({type:"stacked",title:`${cat} — Stacked Composition`,sub:`${numPair.map(n=>n.col).join(" + ")}`,data,keys:numPair.map(n=>n.col)});
  }

  // 13. BUBBLE
  if (nums.length>=3) {
    const k0=nums[0].col,k1=nums[1].col,k2=nums[2].col;
    const vrows=rows.filter(r=>safeNum(r[k0])!==null&&safeNum(r[k1])!==null&&safeNum(r[k2])!==null);
    const step=Math.max(1,Math.floor(vrows.length/80));
    const data=[];
    for (let i=0;i<vrows.length&&data.length<80;i+=step)
      data.push({x:safeNum(vrows[i][k0]),y:safeNum(vrows[i][k1]),z:safeNum(vrows[i][k2])});
    if (data.length>4) charts.push({type:"bubble",title:`${k0} × ${k1} (Size: ${k2})`,sub:"Bubble chart — size encodes 3rd variable",data,xKey:k0,yKey:k1,zKey:k2});
  }

  return charts;
}

// ── API CALL ─────────────────────────────────────────────────────────────────
async function callOpenAI(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({messages})
  });
  if (!res.ok) { const e=await res.text(); throw new Error(e); }
  const data = await res.json();
  return data.reply;
}

// ── RICH TEXT ─────────────────────────────────────────────────────────────────
function Md({ text }) {
  if (!text) return null;
  const lines=text.split("\n");
  const elements=[];
  let i=0;
  while (i<lines.length) {
    const line=lines[i];
    if (line.startsWith("## ")) { elements.push(<div key={i} className="rt-h2">{inlineRender(line.slice(3))}</div>); i++; continue; }
    if (line.startsWith("### ")) { elements.push(<div key={i} className="rt-h3">{inlineRender(line.slice(4))}</div>); i++; continue; }
    if (line.match(/^[\-\*] /)) { elements.push(<div key={i} className="rt-li"><span className="rt-pip">▸</span><span>{inlineRender(line.slice(2))}</span></div>); i++; continue; }
    if (line.match(/^\d+\. /)) { const m=line.match(/^(\d+)\. /); elements.push(<div key={i} className="rt-li"><span className="rt-num">{m[1]}.</span><span>{inlineRender(line.slice(m[0].length))}</span></div>); i++; continue; }
    if (line.trim()==="") { elements.push(<div key={i} className="rt-gap"/>); i++; continue; }
    elements.push(<div key={i} style={{marginTop:2}}>{inlineRender(line)}</div>);
    i++;
  }
  return <div>{elements}</div>;
}
function inlineRender(txt) {
  return txt.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((p,i)=>{
    if (p.startsWith("**")&&p.endsWith("**")) return <span key={i} className="rt-bold">{p.slice(2,-2)}</span>;
    if (p.startsWith("`")&&p.endsWith("`")) return <span key={i} className="rt-code">{p.slice(1,-1)}</span>;
    return p;
  });
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("home");
  const [file,setFile]=useState(null);
  const [rows,setRows]=useState([]);
  const [analysis,setAnalysis]=useState(null);
  const [charts,setCharts]=useState([]);
  const [progress,setProgress]=useState(0);
  const [loading,setLoading]=useState(false);
  const [drag,setDrag]=useState(false);
  const [fileType,setFileType]=useState("");

  const [aiOverview,setAiOverview]=useState("");
  const [aiNotes,setAiNotes]=useState([]);
  const [sumLoading,setSumLoading]=useState(false);

  const [messages,setMessages]=useState([{role:"ai",text:"Hi! I'm your **AI data analyst**.\n\nUpload a CSV or Excel file and I'll analyze every row. Ask me anything about trends, statistics, outliers, comparisons, or summaries — I'll give you real, data-driven answers."}]);
  const [chatHistory,setChatHistory]=useState([]);
  const [input,setInput]=useState("");
  const [thinking,setThinking]=useState(false);
  const [fullCtx,setFullCtx]=useState("");

  const fileRef=useRef();
  const chatEndRef=useRef();
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const generateSummary = async (a, f, r, ctx) => {
    setSumLoading(true); setAiOverview(""); setAiNotes([]);
    const ext = f.name.split(".").pop().toLowerCase();
    const isExcel = ext==="xlsx"||ext==="xls";

    const sys=`You are a world-class data analyst. You have FULL access to the dataset. ${isExcel?"This is an Excel file — numeric values have been normalized and properly parsed.":""} Analyze it deeply and produce:

OVERVIEW:
A rich, specific 5–7 sentence paragraph describing what this dataset is about, its scale, key patterns, distributions, notable values, and what business or analytical story it tells. Mention actual numbers and column names. ${isExcel?"Since this is an Excel file, reference the actual computed statistics provided (min, max, mean, sum) — do not guess or approximate.":""}

NOTES:
10 highly specific, data-driven bullet insights using exact values from the data. Include: statistical highlights, distributions, correlations, anomalies, top performers, comparisons. Be precise — cite actual numbers from the statistics provided.

Respond EXACTLY in this format, nothing else:
OVERVIEW:
<paragraph>

NOTES:
- <insight with real numbers>
- <insight with real numbers>
...`;
    try {
      // FIX: Send stats context separately for Excel to ensure numbers are correct
      const userContent = isExcel
        ? `Here is the complete dataset statistics and sample data:\n\n${ctx}\n\nIMPORTANT: Use the exact statistics above (min, max, mean, sum, count) — they are pre-computed from the actual Excel data.`
        : `Here is the complete dataset context:\n\n${ctx}`;

      const resp = await callOpenAI([
        {role:"system",content:sys},
        {role:"user",content:userContent}
      ]);
      const ov=resp.match(/OVERVIEW:\s*([\s\S]*?)(?=\nNOTES:|$)/i);
      const nt=resp.match(/NOTES:\s*([\s\S]*)/i);
      setAiOverview(ov?ov[1].trim():resp.trim());
      if (nt) {
        const notes=nt[1].trim().split("\n").map(l=>l.replace(/^[-*•\d.]\s*/,"").trim()).filter(l=>l.length>8);
        setAiNotes(notes);
      }
    } catch(e) {
      setAiOverview(`Dataset "${f.name}": ${a.rows.toLocaleString()} rows, ${a.cols} columns. AI summary unavailable: ${e.message}`);
    }
    setSumLoading(false);
  };

  const processFile = useCallback((f) => {
    setFile(f); setLoading(true); setProgress(8);
    const ext=f.name.split(".").pop().toLowerCase();
    setFileType(ext);
    const reader=new FileReader();
    reader.onload=(e)=>{
      setProgress(40);
      let parsed=[];
      try {
        if (ext==="csv") {
          parsed=Papa.parse(e.target.result,{header:true,skipEmptyLines:true,dynamicTyping:false}).data;
        } else {
          // FIX: Better Excel parsing options
          const wb = XLSX.read(e.target.result, { type: "binary", cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];

// Get sheet as raw 2D array
const sheetData = XLSX.utils.sheet_to_json(ws, {
  header: 1,   // returns array of arrays
  raw: false
});

// 1️⃣ Find header row (row with most non-empty cells)
let headerRowIndex = 0;
let maxCells = 0;

sheetData.forEach((row, index) => {
  const nonEmpty = row.filter(cell => cell && String(cell).trim() !== "").length;
  if (nonEmpty > maxCells) {
    maxCells = nonEmpty;
    headerRowIndex = index;
  }
});

// 2️⃣ Extract headers
const headers = sheetData[headerRowIndex].map(h =>
  String(h).replace(/\n/g, " ").trim()
);

// 3️⃣ Build data rows
parsed = sheetData
  .slice(headerRowIndex + 1)
  .map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  })
  .filter(row =>
    Object.values(row).some(v => String(v).trim() !== "")
  );
        }
      } catch(err) { console.error("Parse error:",err); }

      const isJunkCol=(key)=>{
        if (!key) return true;
        const k=String(key).trim();
        return k===""||/^__EMPTY/i.test(k)||/^Unnamed:/i.test(k)||/^Column\d+$/i.test(k)||/^F\d+$/.test(k);
      };

      if (parsed.length>0) {
        const goodKeys=Object.keys(parsed[0]).filter(k=>!isJunkCol(k));
        parsed=parsed.map(row=>{
          const clean={};
          goodKeys.forEach(k=>{clean[k]=row[k];});
          return clean;
        });
        parsed=parsed.filter(row=>Object.values(row).some(v=>!isEmpty(v)));
      }

      setProgress(68);
      setRows(parsed);
      console.log("Parsed Rows:", parsed.length);
      console.log("First Row:", parsed[0]);
      const a=analyzeData(parsed);
      console.log("Column Info:", a?.colInfo);
      setAnalysis(a);
      if (a) {
        setCharts(buildCharts(parsed,a.colInfo));
        const ctx=buildFullContext(a,f.name,parsed);
        setFullCtx(ctx);
        generateSummary(a,f,parsed,ctx);
      }
      setProgress(100);
      const colCount=parsed[0]?Object.keys(parsed[0]).length:0;
      setMessages([{role:"ai",text:`**${f.name}** fully loaded!\n\n**${parsed.length.toLocaleString()} rows** · **${colCount} columns** · Full data access enabled.\n\nAsk me anything — trends, statistics, outliers, comparisons, predictions.`}]);
      setChatHistory([]);
      setTimeout(()=>{ setLoading(false); setProgress(0); setTab("dashboard"); },500);
    };
    if (ext==="csv") reader.readAsText(f); else reader.readAsBinaryString(f);
  },[]);

  const onDrop=(e)=>{ e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f) processFile(f); };
  const onFile=(e)=>{ if(e.target.files[0]) processFile(e.target.files[0]); };

  const sendMsg=async()=>{
    if (!input.trim()||!rows.length||thinking) return;
    const userText=input.trim();
    setInput(""); setThinking(true);
    setMessages(m=>[...m,{role:"user",text:userText}]);
    const sys=`You are an expert data analyst AI with FULL access to a real dataset. Answer using actual data. Be specific, cite real numbers.
Guidelines: Use **bold** for key numbers, bullets for lists, ## for headers. Reference actual column names and values. Be concise but thorough.
COMPLETE DATASET CONTEXT:\n${fullCtx}`;
    const apiHistory=[...chatHistory,{role:"user",content:userText}];
    const trimmed=apiHistory.length>16?[{role:"user",content:`[Continuing analysis of "${file?.name}"]`},...apiHistory.slice(-14)]:apiHistory;
    try {
      const reply=await callOpenAI([{role:"system",content:sys},...trimmed]);
      setChatHistory(h=>[...h,{role:"user",content:userText},{role:"assistant",content:reply}]);
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch(err) {
      setMessages(m=>[...m,{role:"ai",text:`**Error:** ${err.message}\n\nPlease try again.`}]);
    }
    setThinking(false);
  };

  const suggestedQs=analysis?["Give me a complete analysis"]:["What can you tell me about this data?"];

  const tt={background:C.card2,border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,fontSize:11,fontFamily:"'JetBrains Mono',monospace",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"};

  return (
    <>
      <style>{css}</style>
      <AnimatedBackground />
      <div className="grid-overlay"/>
      <div className="orb" style={{width:500,height:500,background:C.accent,left:"3%",top:"-8%",opacity:0.055,animationDuration:"13s"}}/>
      <div className="orb" style={{width:400,height:400,background:C.accent2,right:"1%",top:"28%",opacity:0.06,animationDuration:"16s",animationDelay:"4s"}}/>
      <div className="orb" style={{width:360,height:360,background:C.accent3,left:"33%",bottom:"2%",opacity:0.055,animationDuration:"19s",animationDelay:"7s"}}/>

      <div className="app-shell">
        {/* NAV */}
        <nav className="nav">
          <div
  className="logo"
  onClick={() => {
    setTab("home");          // go to Home tab
    setRows([]);
    setAnalysis(null);
    setSummary("");
    setCharts([]);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke={C.accent} strokeWidth="1.5" fill="none"/>
              <path d="M11 2v18M3 7l8 5 8-5" stroke={C.accent} strokeWidth="1" opacity="0.5"/>
            </svg>
            <span className="logo-txt">Sheet</span> Snap
            <span className="logo-ai">AI</span>
          </div>
          <div className="nav-tabs">
            {[["home","Home"],["upload","Upload"],["dashboard","Dashboard"],["summary","Summary"],["ask","✦ Ask AI"]].map(([t,l])=>(
              <button key={t} className={`nav-tab${t==="ask"?" ask-tab":""}${tab===t?" active":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>
          {file && (
            <div className="file-chip">
              <FileText size={13}/>
              {file.name}
              {(fileType==="xlsx"||fileType==="xls")&&<span className="excel-badge">XLS</span>}
            </div>
          )}
        </nav>

        {/* HOME */}
        {tab==="home"&&(
          <div className="home">
            <div className="ai-pill"><div className="pulse-dot"/> AI · Full Data Access</div>
            <h1 className="hero-title">
              Your data,<br/>analyzed by <span className="hl">AI</span>.<br/>
              <span className="hl2">Every</span> <span className="hl3">row.</span>
            </h1>
            <p className="hero-sub">Upload CSV or Excel. AI gets access to all your data — not just a summary — and answers any question with real, specific insights.</p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File →</button>
              <button className="btn-ghost" onClick={()=>setTab("ask")}>✦ Chat with AI</button>
            </div>
            <div className="feat-row">
              {[
                {ico:<Brain size={22} color={C.accent}/>,name:"Full Data Access",desc:"AI reads every single row of your file — not a sample. Answers based on complete, real data."},
                {ico:<BarChart3 size={22} color={C.accent3}/>,name:"13 Chart Types",desc:"Bar, donut, scatter, radar, bubble, area, histogram & more — generated automatically."},
                {ico:<MessageSquare size={22} color={C.accent2}/>,name:"Conversational AI",desc:"Ask follow-up questions. AI remembers context across your entire session for deep analysis."},
              ].map(f=>(
                <div className="feat-card" key={f.name}>
                  <div className="feat-ico">{f.ico}</div>
                  <div className="feat-name">{f.name}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {tab==="upload"&&(
          <div className="upload-page">
            <div className="pg-title">Upload your file</div>
            <div className="pg-sub">CSV, XLSX, or XLS · AI gets full access to all your data</div>
            <div className={`dropzone${drag?" drag":""}`}
              onDragOver={e=>{e.preventDefault();setDrag(true)}}
              onDragLeave={()=>setDrag(false)}
              onDrop={onDrop}
              onClick={()=>fileRef.current.click()}>
              <div className="dz-ico"><UploadCloud size={52} strokeWidth={1.4}/></div>
              <div className="dz-title">Drag & drop your file here</div>
              <div className="dz-sub">or click to browse · CSV, XLSX, XLS supported</div>
              {file&&<div className="file-badge"><CheckCircle2 size={13}/> {file.name} · {(file.size/1024).toFixed(1)} KB</div>}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={onFile}/>
            {loading&&(
              <>
                <div className="pbar"><div className="pfill" style={{width:`${progress}%`}}/></div>
                <div className="pstatus">
                  {progress<50?<><FileSpreadsheet size={13}/> Parsing file…</>:progress<80?<><Calculator size={13}/> Computing statistics…</>:<><Brain size={13}/> Sending to AI…</>}
                </div>
              </>
            )}
            <button className="upload-btn" disabled={!file||loading} onClick={()=>{if(analysis)setTab("dashboard")}}>
              {loading?"Analyzing…":analysis?"View Dashboard →":"Upload a file to get started"}
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div className="dash">
            {!analysis?(
              <div className="no-data">
                <div className="no-data-ico"><BarChart3 size={44} strokeWidth={1.4}/></div>
                <div>No data yet — upload a file to see your dashboard.</div>
                <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
              </div>
            ):(
              <>
                <div className="dash-header">
                  <div>
                    <div className="pg-title">
                      {file?.name}
                      {(fileType==="xlsx"||fileType==="xls")&&<span className="excel-badge" style={{marginLeft:10}}>Excel File</span>}
                    </div>
                    <div className="pg-sub">{analysis.rows.toLocaleString()} rows · {analysis.cols} columns · Full AI access enabled</div>
                  </div>
                  <button className="btn-primary" style={{fontSize:"0.78rem",padding:"9px 18px"}} onClick={()=>setTab("ask")}>✦ Ask AI →</button>
                </div>
                <div className="stat-grid">
                  {[
                    {lbl:"Total Rows",val:analysis.rows.toLocaleString(),desc:"records in dataset",color:C.accent,ico:<Database size={18}/>},
                    {lbl:"Columns",val:analysis.cols,desc:"fields detected",color:C.yellow,ico:<Layers size={18}/>},
                    {lbl:"Numeric Cols",val:analysis.colInfo.filter(c=>c.type==="numeric").length,desc:"quantitative fields",color:C.accent3,ico:<TrendingUp size={18}/>},
                    {lbl:"Categorical",val:analysis.colInfo.filter(c=>c.type==="categorical").length,desc:"qualitative fields",color:C.accent2,ico:<Activity size={18}/>},
                  ].map((s,i)=>(
                    <div className="stat-card" key={i} style={{"--accent-color":s.color}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div className="stat-lbl">{s.lbl}</div>
                        <div style={{color:s.color,opacity:0.4}}>{s.ico}</div>
                      </div>
                      <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                      <div className="stat-desc">{s.desc}</div>
                    </div>
                  ))}
                </div>

                {analysis.colInfo.filter(c=>c.type==="numeric").length>0&&(
                  <>
                    <div className="dash-section-label">Numeric Column Stats</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12,marginBottom:"1.8rem"}}>
                      {analysis.colInfo.filter(c=>c.type==="numeric").map((nc,i)=>(
                        <div className="num-card" key={i} style={{"--col-color":PALETTE[i%PALETTE.length]}}>
                          <div className="num-card-name" style={{color:C.text}}>{nc.col}</div>
                          <div className="num-card-grid">
                            {[["min",nc.min],["max",nc.max],["avg",nc.mean],["sum",typeof nc.sum==="number"?nc.sum.toLocaleString():nc.sum]].map(([l,v])=>(
                              <div className="num-stat-row" key={l}>
                                <span style={{color:C.muted}}>{l} </span>
                                <span style={{color:PALETTE[i%PALETTE.length],fontWeight:600}}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="dash-section-label">Visual Analysis · {charts.length} Charts</div>
                <div className="chart-grid">
                  {charts.map((ch,i)=>{
                    // DONUT
                    if (ch.type==="donut") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="donut-wrap" style={{position:"relative"}}>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={ch.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                                {ch.data.map((_,idx)=><Cell key={idx} fill={PALETTE[idx%PALETTE.length]}/>)}
                              </Pie>
                              <Tooltip content={<CustomTooltip formatter={(v,n)=>[`${v} (${(v/ch.total*100).toFixed(1)}%)`,n]}/>}/>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="donut-center">
                            <div className="donut-center-num">{ch.total.toLocaleString()}</div>
                            <div className="donut-center-lbl">total</div>
                          </div>
                        </div>
                        <div className="custom-legend">
                          {ch.data.slice(0,6).map((d,idx)=>(
                            <div className="legend-item" key={idx}>
                              <div className="legend-dot" style={{background:PALETTE[idx%PALETTE.length]}}/>
                              <span style={{color:C.text}}>{d.name}</span>
                              <span style={{color:PALETTE[idx%PALETTE.length]}}>{(d.value/ch.total*100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    // HBAR
                    if (ch.type==="hbar") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={230}>
                          <BarChart data={ch.data} layout="vertical" margin={{left:4,right:20,top:4,bottom:4}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                            <XAxis type="number" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:C.text}} width={90} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="value" radius={[0,5,5,0]} maxBarSize={22}>
                              {ch.data.map((_,idx)=><Cell key={idx} fill={PALETTE[idx%PALETTE.length]}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // GROUPED
                    if (ch.type==="grouped") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={230}>
                          <BarChart data={ch.data} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="name" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                            {ch.keys.map((k,ki)=><Bar key={ki} dataKey={k} fill={PALETTE[ki%PALETTE.length]} radius={[4,4,0,0]} maxBarSize={32}/>)}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // STACKED
                    if (ch.type==="stacked") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={230}>
                          <BarChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="name" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                            {ch.keys.map((k,ki)=><Bar key={ki} dataKey={k} stackId="a" fill={PALETTE[(ki+2)%PALETTE.length]}/>)}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // LINE
                    if (ch.type==="line") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="mini-stats">
                          <span className="mini-stat"><span className="mini-stat-val" style={{color:C.accent}}>{ch.mean}</span><span className="mini-stat-lbl"> mean</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{color:C.accent3}}>{ch.data[0]?.value}</span><span className="mini-stat-lbl"> start</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{color:C.accent2}}>{ch.data[ch.data.length-1]?.value}</span><span className="mini-stat-lbl"> end</span></span>
                        </div>
                        <ResponsiveContainer width="100%" height={175}>
                          <LineChart data={ch.data}>
                            <defs>
                              <linearGradient id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={PALETTE[i%PALETTE.length]} stopOpacity={0.15}/>
                                <stop offset="95%" stopColor={PALETTE[i%PALETTE.length]} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="idx" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip formatter={(v)=>[v,ch.col]}/>}/>
                            <ReferenceLine y={ch.mean} stroke={C.accent} strokeDasharray="4 4" strokeOpacity={0.4}/>
                            <Line type="monotone" dataKey="value" stroke={PALETTE[i%PALETTE.length]} strokeWidth={2} dot={false} activeDot={{r:4,fill:PALETTE[i%PALETTE.length]}}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // AREA
                    if (ch.type==="area") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={ch.data}>
                            <defs>
                              {ch.keys.map((k,ki)=>(
                                <linearGradient key={ki} id={`ag${i}${ki}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={PALETTE[ki]} stopOpacity={0.35}/>
                                  <stop offset="95%" stopColor={PALETTE[ki]} stopOpacity={0}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="idx" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                            {ch.keys.map((k,ki)=>(
                              <Area key={ki} type="monotone" dataKey={k} stroke={PALETTE[ki]} fill={`url(#ag${i}${ki})`} strokeWidth={2}/>
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // HISTOGRAM
                    if (ch.type==="histogram") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="mini-stats">
                          <span className="mini-stat"><span className="mini-stat-val" style={{color:C.accent}}>{ch.mean}</span><span className="mini-stat-lbl"> mean</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{color:C.accent3}}>{ch.median}</span><span className="mini-stat-lbl"> median</span></span>
                        </div>
                        <ResponsiveContainer width="100%" height={175}>
                          <BarChart data={ch.data} barCategoryGap="4%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="label" tick={{fontSize:8,fill:C.muted}} interval={2} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip formatter={(v,_,p)=>[v,`range: ${p?.payload?.range}`]}/>}/>
                            <Bar dataKey="count" radius={[3,3,0,0]}>
                              {ch.data.map((d,idx)=><Cell key={idx} fill={`hsl(${160+idx*(110/ch.data.length)},75%,55%)`}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // DEVIATION
                    if (ch.type==="deviation") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="name" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <ReferenceLine y={0} stroke={C.muted} strokeWidth={1}/>
                            <Bar dataKey={ch.yKey} radius={[3,3,0,0]}>
                              {ch.data.map((d,idx)=><Cell key={idx} fill={d[ch.yKey]>=0?C.accent:C.accent2}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // SCATTER
                    if (ch.type==="scatter") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <ScatterChart margin={{top:4,right:20,bottom:20,left:4}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="x" name={ch.xKey} tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}
                              label={{value:ch.xKey,position:"insideBottom",offset:-4,fontSize:9,fill:C.muted}}/>
                            <YAxis dataKey="y" name={ch.yKey} tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip formatter={(v,n)=>[v,n==="x"?ch.xKey:ch.yKey]}/>} cursor={{strokeDasharray:"3 3"}}/>
                            <Scatter data={ch.data} fill={PALETTE[i%PALETTE.length]} opacity={0.6}/>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // BUBBLE
                    if (ch.type==="bubble") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <ScatterChart margin={{top:4,right:20,bottom:20,left:4}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="x" name={ch.xKey} tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis dataKey="y" name={ch.yKey} tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <ZAxis dataKey="z" range={[15,320]} name={ch.zKey}/>
                            <Tooltip content={<CustomTooltip formatter={(v,n)=>[v,n==="x"?ch.xKey:n==="y"?ch.yKey:ch.zKey]}/>} cursor={{strokeDasharray:"3 3"}}/>
                            <Scatter data={ch.data} fill={C.accent3} opacity={0.55}/>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // RADIAL
                    if (ch.type==="radial") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={90} data={ch.data} startAngle={180} endAngle={0}>
                            <RadialBar minAngle={5} dataKey="value" cornerRadius={5} label={{position:"insideStart",fill:C.text,fontSize:9}}/>
                            <Tooltip content={<CustomTooltip formatter={(v)=>[`${v}%`,"mean/max"]}/>}/>
                            <Legend iconSize={8} wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // RADAR
                    if (ch.type==="radar") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <RadarChart data={ch.data} outerRadius="70%">
                            <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                            <PolarAngleAxis dataKey="metric" tick={{fontSize:9,fill:C.muted}}/>
                            <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:8,fill:"transparent"}} stroke="transparent"/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                            {ch.keys.map((k,ki)=>(
                              <Radar key={ki} name={k} dataKey={k} stroke={PALETTE[ki%PALETTE.length]} fill={PALETTE[ki%PALETTE.length]} fillOpacity={0.25}/>
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // COMPOSED
                    if (ch.type==="composed") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <ComposedChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="name" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={{stroke:"rgba(255,255,255,0.06)"}}/>
                            <YAxis yAxisId="left" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:C.muted}} tickLine={false} axisLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}/>
                            <Bar yAxisId="left" dataKey="total" fill={C.accent} opacity={0.65} radius={[4,4,0,0]}/>
                            <Line yAxisId="right" type="monotone" dataKey="avg" stroke={C.accent2} strokeWidth={2.5} dot={{r:3,fill:C.accent2,strokeWidth:0}} activeDot={{r:5}}/>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    return null;
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* SUMMARY */}
        {tab==="summary"&&(
          <div className="sum-page">
            <div className="pg-title">AI Summary & Insights</div>
            <div className="pg-sub">AI reads your full dataset and writes genuine, specific analysis</div>
            {!analysis?(
              <div className="no-data">
                <div className="no-data-ico"><Brain size={44} strokeWidth={1.4}/></div>
                <div>Upload a file to get your AI-powered summary.</div>
                <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
              </div>
            ):(
              <>
                <div className="sblock">
                  <div className="sblock-glow" style={{background:C.accent3}}/>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:8}}>
                    <div className="sblock-label" style={{marginBottom:0}}>// AI Overview</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {(fileType==="xlsx"||fileType==="xls")&&<span className="excel-badge">Excel-Aware Analysis</span>}
                      <button className="regen-btn" disabled={sumLoading} onClick={()=>generateSummary(analysis,file,rows,fullCtx)}>
                        {sumLoading?<><span className="spin"/>&nbsp;Generating…</>:<>✦ Regenerate</>}
                      </button>
                    </div>
                  </div>
                  {sumLoading?(
                    <div style={{display:"flex",alignItems:"center",gap:10,color:C.accent3,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.83rem"}}>
                      <span className="spin"/> AI is analyzing all {analysis.rows.toLocaleString()} rows…
                    </div>
                  ):(
                    <div className="sum-text">{aiOverview||"Generating…"}</div>
                  )}
                  <div className="model-credit">✦ GPT-4o · Full data access</div>
                </div>

                {aiNotes.length>0&&(
                  <div className="sblock">
                    <div className="sblock-glow" style={{background:C.accent}}/>
                    <div className="sblock-label">// AI Key Insights ({aiNotes.length})</div>
                    {aiNotes.map((n,i)=>(
                      <div className="note-row" key={i}>
                        <div className="note-pip"/>
                        <div className="note-txt"><Md text={n}/></div>
                      </div>
                    ))}
                    <div className="model-credit">✦ GPT-4o · Cited from actual data</div>
                  </div>
                )}

                <div className="sblock">
                  <div className="sblock-label">// Column Statistics</div>
                  <table className="col-tbl">
                    <thead>
                      <tr><th>Column</th><th>Type</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {analysis.colInfo.map(c=>(
                        <tr key={c.col}>
                          <td style={{color:C.accent,fontWeight:600}}>{c.col}</td>
                          <td>
                            <span className="data-tag" style={{
                              background:c.type==="numeric"?"rgba(155,127,255,0.1)":"rgba(0,229,200,0.07)",
                              color:c.type==="numeric"?C.accent3:C.accent,
                              border:`1px solid ${c.type==="numeric"?"rgba(155,127,255,0.22)":"rgba(0,229,200,0.16)"}`
                            }}>{c.type}</span>
                          </td>
                          <td style={{color:C.muted,fontSize:"0.73rem"}}>
                            {c.type==="numeric"
                              ?`count:${c.count} · min:${c.min} · max:${c.max} · avg:${c.mean} · median:${c.median} · sum:${typeof c.sum==="number"?c.sum.toLocaleString():c.sum}${c.emptyCount>0?` · (${c.emptyCount} empty ignored)`:""}`
                              :`${c.unique} unique · top: ${c.top.filter(([v])=>v&&!isEmpty(v)).slice(0,3).map(([v,n])=>`"${v}"(${n})`).join(", ")}${c.emptyCount>0?` · (${c.emptyCount} empty ignored)`:""}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ASK AI */}
        {tab==="ask"&&(
          <div className="ask-page">
            <div className="ask-hdr">
              <div className="pg-title">✦ Ask AI</div>
              <div className="pg-sub">AI has full access to your data · Remembers conversation context · Real, specific answers</div>
            </div>
            {analysis&&(
              <div className="data-context-bar">
                <div className="ctx-label">Data Context:</div>
                <div className="ctx-chip"><Folder size={11}/> {file?.name}</div>
                <div className="ctx-chip"><BarChart3 size={11}/> {analysis.rows.toLocaleString()} rows</div>
                <div className="ctx-chip"><Calculator size={11}/> {analysis.colInfo.filter(c=>c.type==="numeric").length} numeric</div>
                <div className="ctx-chip"><Tag size={11}/> {analysis.colInfo.filter(c=>c.type==="categorical").length} categorical</div>
                {(fileType==="xlsx"||fileType==="xls")&&<div className="ctx-chip" style={{color:"#26de81",background:"rgba(38,222,129,0.1)"}}>Excel</div>}
                <div className="ctx-chip" style={{color:C.accent3,background:"rgba(155,127,255,0.1)"}}>✦ GPT-4o</div>
              </div>
            )}
            {rows.length>0&&(
              <div className="sq-bar">
                {suggestedQs.map(q=>(
                  <button key={q} className="sq" onClick={()=>setInput(q)}>{q}</button>
                ))}
              </div>
            )}
            <div className="messages">
              {messages.map((m,i)=>(
                <div className={`msg ${m.role}`} key={i}>
                  <div className={`avatar ${m.role}`}>{m.role==="ai"?<Sparkles size={15}/>:<User size={15}/>}</div>
                  <div className={`bubble ${m.role}`}>
                    <Md text={m.text}/>
                    {m.role==="ai"&&i>0&&<div className="model-credit">✦ GPT-4o · Full data context</div>}
                  </div>
                </div>
              ))}
              {thinking&&(
                <div className="msg ai">
                  <div className="avatar ai"><Sparkles size={15}/></div>
                  <div className="bubble ai">
                    <div className="typing-indicator"><span/><span/><span/></div>
                    <div style={{fontSize:"0.66rem",color:C.muted,marginTop:5,fontFamily:"'JetBrains Mono',monospace"}}>
                      Analyzing {analysis?.rows.toLocaleString()||""} rows…
                    </div>
                  </div>
                </div>
              )}
              {!rows.length&&(
                <div className="no-data">
                  <div className="no-data-ico"><Sparkles size={44} strokeWidth={1.4}/></div>
                  <div>Upload a file first to give AI access to your data.</div>
                  <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div className="chat-footer">
              <div className="chat-row">
                <textarea
                  className="chat-input"
                  rows={2}
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  placeholder={rows.length?"Ask AI anything about your data… (Enter to send)":"Upload a file first…"}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}}}
                  disabled={!rows.length}
                />
                <button className="send-btn" onClick={sendMsg} disabled={!input.trim()||!rows.length||thinking}>
                  {thinking?<span className="spin"/>:<Sparkles size={19}/>}
                </button>
              </div>
            </div>
          </div>
        )}
        <footer style={{
  marginTop: "3rem",
  padding: "2rem 0",
  textAlign: "center",
  borderTop: "1px solid rgba(255,255,255,0.05)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.75rem",
  color: C.muted
}}>
  <div style={{ marginBottom: "8px" }}>
  Made by <span style={{ color: C.accent, fontWeight: 700 }}>Addy</span> · Founder, SheetSnap
     </div>

  <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
    <a 
      href="https://www.instagram.com/iaddy29"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: C.accent2, textDecoration: "none" }}
    >
      Instagram
    </a>

    <a 
      href="https://www.x.com/iaddy29"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: C.accent3, textDecoration: "none" }}
    >
      X (Twitter)
    </a>
  </div>
</footer>
      </div>
    </>
  );
}
