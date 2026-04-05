import { useState, useEffect } from "react";
import { financeAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  BarChart2, TrendingUp, TrendingDown, Calendar, DollarSign,
  Filter, RefreshCw, Download
} from "lucide-react";
import { useBusinessMode } from "../context/BusinessModeContext";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt   = (n) => (n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 });
const fmtPKR = (n) => `PKR ${fmt(n)}`;
const today  = () => new Date().toISOString().split('T')[0];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function startOfMonth(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function startOfYear(dateStr) {
  return `${new Date(dateStr).getFullYear()}-01-01`;
}

const QUICK_RANGES = [
  { label: '1 Day',    key: '1d',     days: 0 },
  { label: '1 Week',   key: '1w',     days: -6 },
  { label: '1 Month',  key: '1m',     days: -29 },
  { label: '3 Months', key: '3m',     days: -89 },
  { label: 'Custom',   key: 'custom', days: null },
];

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'text-white', icon: Icon, highlight }) {
  return (
    <div className={`industrial-card p-4 ${highlight ? 'border border-amber-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
          {label}
        </p>
        {Icon && <Icon size={14} className="text-slate-600" />}
      </div>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Monthly breakdown row ────────────────────────────────────────────────────

function MonthRow({ item }) {
  const profit = (item.revenue || 0) - (item.cogs || 0) - (item.total_expenses || 0);
  const isPos  = profit >= 0;
  return (
    <tr>
      <td className="text-slate-300 font-mono text-xs">{item.period}</td>
      <td className="text-emerald-400 font-mono">{fmt(item.revenue)}</td>
      <td className="text-red-400 font-mono">{fmt(item.purchase_cost)}</td>
      <td className="text-orange-400 font-mono">{fmt(item.wastage_cost)}</td>
      <td className="text-slate-400 font-mono">{fmt(item.total_expenses)}</td>
      <td className={`font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPos ? '+' : ''}{fmt(profit)}
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { businessMode } = useBusinessMode();

  // View mode: 'date' | 'month' | 'year' | 'custom'
  const [view,      setView]      = useState('date');
  const [quickKey,  setQuickKey]  = useState('1d');
  const [fromDate,  setFromDate]  = useState(today());
  const [toDate,    setToDate]    = useState(today());
  const [data,      setData]      = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading,   setLoading]   = useState(false);

  // Selected year / month for year-wise and month-wise views
  const [selYear,  setSelYear]  = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);

  // Apply a quick range
  const applyQuick = (key) => {
    setQuickKey(key);
    if (key === 'custom') return;
    const end   = today();
    const range = QUICK_RANGES.find(r => r.key === key);
    const start = range.days === 0 ? end : addDays(end, range.days);
    setFromDate(start);
    setToDate(end);
  };

  // Fetch summary for the current range
  const fetchReport = async () => {
    setLoading(true);
    try {
      let from = fromDate;
      let to   = toDate;

      if (view === 'month') {
        from = `${selYear}-${String(selMonth).padStart(2, '0')}-01`;
        to   = new Date(selYear, selMonth, 0).toISOString().split('T')[0]; // last day of month
      } else if (view === 'year') {
        from = `${selYear}-01-01`;
        to   = `${selYear}-12-31`;
      }

      // Fetch monthly breakdown for the range (date-by-date summarised server-side)
      const r = await financeAPI.rangeProfit({ from_date: from, to_date: to });
      setData(r.data?.summary || r.data);
      setBreakdown(r.data?.breakdown || []);
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [view, fromDate, toDate, selYear, selMonth]);

  const profit = data
    ? (data.revenue || 0) - (data.cogs || 0) - (data.total_expenses || 0)
    : null;
  const isProfit = profit !== null && profit >= 0;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: 'Barlow Condensed' }}>Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Profit & Loss — Date / Month / Year wise</p>
        </div>
        <button onClick={fetchReport} disabled={loading}
          className="flex items-center gap-2 bg-[#1E2738] hover:bg-[#2a3547] text-slate-300 rounded-sm h-9 px-4 text-xs uppercase tracking-wider transition-colors border border-[#2D3648]"
          style={{ fontFamily: 'Barlow Condensed' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── View Mode Tabs ── */}
      <div className="flex gap-1 p-1 bg-[#0A0F1C] border border-[#2D3648] rounded-sm w-fit">
        {[
          { key: 'date',  label: 'Date Range' },
          { key: 'month', label: 'Month Wise' },
          { key: 'year',  label: 'Year Wise' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors font-semibold
              ${view === tab.key
                ? 'bg-amber-500 text-black'
                : 'text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'Barlow Condensed' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filter Controls ── */}
      <div className="industrial-card p-4">
        {view === 'date' && (
          <div className="space-y-3">
            {/* Quick range chips */}
            <div className="flex flex-wrap gap-2">
              {QUICK_RANGES.map(r => (
                <button key={r.key} onClick={() => applyQuick(r.key)}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-colors font-semibold uppercase tracking-wider
                    ${quickKey === r.key
                      ? 'bg-amber-500 text-black border-amber-500'
                      : 'bg-[#0A0F1C] text-slate-400 border-[#2D3648] hover:border-amber-500/40 hover:text-white'}`}
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  {r.label}
                </button>
              ))}
            </div>
            {/* Date pickers — always shown, enabled in custom mode */}
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>From</label>
                <input type="date" value={fromDate}
                  onChange={e => { setFromDate(e.target.value); setQuickKey('custom'); }}
                  className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase mb-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>To</label>
                <input type="date" value={toDate}
                  onChange={e => { setToDate(e.target.value); setQuickKey('custom'); }}
                  className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div className="text-xs text-slate-600 font-mono pb-2">
                {fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`}
              </div>
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Month</label>
              <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
                className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none min-w-[120px]">
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Year</label>
              <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {view === 'year' && (
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1"
              style={{ fontFamily: 'Barlow Condensed' }}>Year</label>
            <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <RefreshCw size={20} className="animate-spin text-amber-500" />
          <span className="ml-2 text-slate-500 text-sm">Loading report…</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      {!loading && data && (
        <>
          {/* P&L headline */}
          <div className={`industrial-card p-5 border-2 ${isProfit ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
            <div className="flex items-center gap-3 mb-1">
              {isProfit
                ? <TrendingUp size={20} className="text-emerald-400" />
                : <TrendingDown size={20} className="text-red-400" />}
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Net Profit / Loss
              </span>
            </div>
            <p className={`text-4xl font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{fmtPKR(profit)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Revenue − COGS − Expenses
            </p>
          </div>

          {/* 5 detail cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Revenue"        value={fmtPKR(data.revenue)}        color="text-emerald-400" icon={TrendingUp} />
            <StatCard label="Purchase Cost"  value={fmtPKR(data.purchase_cost)}  color="text-red-400"     icon={DollarSign} />
            <StatCard label="Wastage Cost"   value={fmtPKR(data.wastage_cost)}   color="text-orange-400"  icon={BarChart2} />
            <StatCard label="Expenses"       value={fmtPKR(data.operating_expenses || data.expenses)}
              color="text-yellow-400" icon={DollarSign} />
            <StatCard label="Payroll Cost"   value={fmtPKR(data.payroll_cost)}   color="text-purple-400"  icon={DollarSign} />
          </div>

          {/* Margin */}
          {data.revenue > 0 && (
            <div className="industrial-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed' }}>Profit Margin</span>
                <span className={`text-sm font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {((profit / data.revenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[#1E2738] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, Math.abs((profit / data.revenue) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Breakdown table (for year view shows monthly, for range shows daily) ── */}
      {!loading && breakdown.length > 0 && (
        <div className="industrial-card">
          <div className="px-5 py-3 border-b border-[#2D3648]">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>
              {view === 'year' ? 'Monthly Breakdown' : 'Period Breakdown'}
            </h3>
          </div>
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Purchase Cost</th>
                <th>Wastage</th>
                <th>Expenses</th>
                <th>Net P/L</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, i) => <MonthRow key={i} item={item} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && (
        <div className="industrial-card flex flex-col items-center justify-center py-16">
          <BarChart2 size={32} className="text-slate-700 mb-3" />
          <p className="text-slate-500 text-sm">Select a date range to view the report</p>
        </div>
      )}
    </div>
  );
}