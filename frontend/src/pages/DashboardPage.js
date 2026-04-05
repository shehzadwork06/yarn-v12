// import { useState, useEffect } from "react";
// import { dashboardAPI } from "@/lib/api";
// import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Factory, ArrowUpRight, ArrowDownRight, Users, Calendar, Receipt, Clock } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// import { useBusinessMode } from "../context/BusinessModeContext";

// const KPICard = ({ title, value, subtitle, icon: Icon, color = "amber", trend }) => (
//   <div className="industrial-card p-5 animate-fade-in">
//     <div className="flex items-start justify-between">
//       <div>
//         <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>{title}</p>
//         <p className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
//           {typeof value === 'number' ? value.toLocaleString('en-PK', { minimumFractionDigits: 0 }) : value}
//         </p>
//         {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
//       </div>
//       <div className={`w-10 h-10 bg-${color}-500/10 border border-${color}-500/20 rounded-sm flex items-center justify-center`}>
//         <Icon className={`w-5 h-5 text-${color}-500`} />
//       </div>
//     </div>
//     {trend !== undefined && (
//       <div className="flex items-center gap-1 mt-3">
//         {trend >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
//         <span className={`text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'JetBrains Mono' }}>
//           {Math.abs(trend).toFixed(1)}%
//         </span>
//       </div>
//     )}
//   </div>
// );

// const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];

// // Operations Dashboard Component
// function OperationsDashboard({ data }) {
//   return (
//     <div data-testid="dashboard-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
//             Operations Dashboard
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">HR & Finance overview</p>
//         </div>
//         <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-sm uppercase tracking-wider font-semibold" data-testid="system-status">
//           OPERATIONS ACTIVE
//         </div>
//       </div>

//       {/* KPI Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard title="Total Employees" value={data.total_employees || 0} icon={Users} color="green" subtitle="Active workforce" />
//         <KPICard title="Today Present" value={data.today_present || 0} icon={Calendar} color="emerald" subtitle="Checked in today" />
//         <KPICard title="Today Absent" value={data.today_absent || 0} icon={Clock} color="red" subtitle="Not checked in" />
//         <KPICard title="Pending Payroll" value={data.pending_payroll || 0} icon={DollarSign} color="amber" subtitle="Draft payrolls" />
//       </div>

//       {/* Second Row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <KPICard title="Monthly Expenses" value={data.monthly_expenses || 0} icon={Receipt} color="red" subtitle="This month's expenditure" />
//         <KPICard title="Monthly Payroll" value={data.monthly_payroll || 0} icon={DollarSign} color="blue" subtitle="Salary disbursement" />
//       </div>

//       {/* Recent Expenses */}
//       <div className="industrial-card p-5">
//         <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
//           Recent Expenses
//         </h3>
//         {(data.recent_expenses || []).length === 0 ? (
//           <p className="text-slate-500 text-sm">No recent expenses</p>
//         ) : (
//           <div className="space-y-2">
//             {(data.recent_expenses || []).slice(0, 5).map((exp, i) => (
//               <div key={i} className="flex items-center justify-between py-2 border-b border-[#2D3648] last:border-0">
//                 <div>
//                   <span className="text-slate-300 text-sm">{exp.description || exp.category}</span>
//                   <span className="text-slate-600 text-xs ml-2">{exp.date}</span>
//                 </div>
//                 <span className="text-red-400 font-mono text-sm">Rs. {(exp.amount || 0).toLocaleString()}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   const { businessMode, isOperations } = useBusinessMode();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     dashboardAPI.get().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
//   }, []);

//   if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading dashboard...</div></div>;
//   if (!data) return <div className="text-red-400">Failed to load dashboard</div>;

//   // Return Operations Dashboard for OPERATIONS workspace
//   if (isOperations) {
//     return <OperationsDashboard data={data} />;
//   }

//   const locationData = (data.stock_by_location || []).map(l => ({ name: l.location, value: l.total_quantity }));

//   return (
//     <div data-testid="dashboard-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
//             Control Dashboard
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">Real-time factory overview</p>
//         </div>
//         <div className="badge-success" data-testid="system-status">SYSTEM ONLINE</div>
//       </div>

//       {/* KPI Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard title="Stock Value" value={data.stock_value} icon={Package} color="amber" subtitle="Total inventory value" />
//         <KPICard title="Today Sales" value={data.today_sales?.total || 0} icon={TrendingUp} color="emerald" subtitle={`${data.today_sales?.count || 0} transactions`} />
//         <KPICard title="Receivable" value={data.total_receivable} icon={DollarSign} color="blue" subtitle="Customer balances" />
//         <KPICard title="Payable" value={data.total_payable} icon={TrendingDown} color="red" subtitle="Supplier balances" />
//       </div>

//       {/* Second Row */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <KPICard title="Monthly Revenue" value={data.monthly_sales?.total || 0} icon={TrendingUp} color="emerald" subtitle={`${data.monthly_sales?.count || 0} sales this month`} />
//         <KPICard title="Active Manufacturing" value={data.active_manufacturing} icon={Factory} color="amber" subtitle="Processes in progress" />
//         <KPICard title="Monthly Profit" value={data.monthly_profit?.net || 0} icon={DollarSign} color={data.monthly_profit?.net >= 0 ? "emerald" : "red"} subtitle="Revenue - COGS - Expenses" />
//       </div>

//       {/* Charts + Alerts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Sales Trend */}
//         <div className="lg:col-span-2 industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
//             Sales Trend (7 Days)
//           </h3>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={data.sales_trend || []}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
//               <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => v.slice(5)} />
//               <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
//               <Tooltip contentStyle={{ background: '#0F1623', border: '1px solid #2D3648', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
//               <Bar dataKey="total" fill="#F59E0B" radius={[2, 2, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Stock by Location */}
//         <div className="industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
//             Stock by Location
//           </h3>
//           {locationData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={220}>
//               <PieChart>
//                 <Pie data={locationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
//                   {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//                 </Pie>
//                 <Tooltip contentStyle={{ background: '#0F1623', border: '1px solid #2D3648', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : <p className="text-slate-500 text-sm">No stock data</p>}
//           <div className="space-y-1 mt-2">
//             {locationData.map((item, i) => (
//               <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
//                 <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
//                 <span className="font-mono">{item.name}: {item.value?.toLocaleString()} No Of Cones</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Low Stock + Recent Sales */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {/* Low Stock Alerts */}
//         <div className="industrial-card" data-testid="low-stock-alerts">
//           <div className="px-5 py-3 border-b border-[#2D3648] flex items-center gap-2">
//             <AlertTriangle className="w-4 h-4 text-amber-500" />
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
//               Low Stock Alerts
//             </h3>
//             {data.low_stock_alerts?.length > 0 && (
//               <span className="badge-warning ml-auto">{data.low_stock_alerts.length}</span>
//             )}
//           </div>
//           <div className="p-0">
//             {data.low_stock_alerts?.length > 0 ? (
//               <table className="w-full erp-table">
//                 <thead><tr><th>Product</th><th>Current</th><th>Min Level</th></tr></thead>
//                 <tbody>
//                   {data.low_stock_alerts.map(item => (
//                     <tr key={item.id}>
//                       <td className="text-slate-300">{item.name}</td>
//                       <td className="text-red-400 font-mono">{item.total_quantity} {item.unit}</td>
//                       <td className="text-slate-500 font-mono">{item.min_stock_level} {item.unit}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p className="p-5 text-sm text-emerald-400">All stock levels normal</p>
//             )}
//           </div>
//         </div>

//         {/* Recent Sales */}
//         <div className="industrial-card" data-testid="recent-sales">
//           <div className="px-5 py-3 border-b border-[#2D3648]">
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
//               Recent Sales
//             </h3>
//           </div>
//           <table className="w-full erp-table">
//             <thead><tr><th>Sale #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
//             <tbody>
//               {(data.recent_sales || []).map(s => (
//                 <tr key={s.id}>
//                   <td className="text-amber-400 font-mono text-xs">{s.sale_number}</td>
//                   <td className="text-slate-300 text-sm">{s.customer_name}</td>
//                   <td className="text-white font-mono">{s.net_amount?.toLocaleString()}</td>
//                   <td><span className={s.status === 'DISPATCHED' ? 'badge-success' : s.status === 'CONFIRMED' ? 'badge-info' : 'badge-neutral'}>{s.status}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Wastage Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="industrial-card p-5" data-testid="wastage-summary">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
//             Total Wastage
//           </h3>
//           <div className="flex gap-6">
//             <div>
//               <p className="text-xs text-slate-500">Amount</p>
//               <p className="text-xl font-bold text-red-400 font-mono">{data.total_wastage?.total_amount?.toLocaleString() || 0} No Of Cones</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Cost Impact</p>
//               <p className="text-xl font-bold text-red-400 font-mono">Rs {data.total_wastage?.total_cost?.toLocaleString() || 0}</p>
//             </div>
//           </div>
//         </div>
//         <div className="industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
//             Monthly Purchases
//           </h3>
//           <p className="text-2xl font-bold text-white font-mono">{(data.monthly_purchases?.total || 0).toLocaleString()}</p>
//           <p className="text-xs text-slate-500 mt-1">{data.monthly_purchases?.count || 0} purchase orders</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";
import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Factory, ArrowUpRight, ArrowDownRight, Users, Calendar, Receipt, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useBusinessMode } from "../context/BusinessModeContext";

const KPICard = ({ title, value, subtitle, icon: Icon, color = "amber", trend }) => (
  <div className="industrial-card p-5 animate-fade-in">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>{title}</p>
        <p className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
          {typeof value === 'number' ? value.toLocaleString('en-PK', { minimumFractionDigits: 0 }) : value}
        </p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 bg-${color}-500/10 border border-${color}-500/20 rounded-sm flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-1 mt-3">
        {trend >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
        <span className={`text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'JetBrains Mono' }}>
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    )}
  </div>
);

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];

// Operations Dashboard Component
function OperationsDashboard({ data }) {
  return (
    <div data-testid="dashboard-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">HR & Finance overview</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1 rounded-sm uppercase tracking-wider font-semibold" data-testid="system-status">
          OPERATIONS ACTIVE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Employees" value={data.total_employees || 0} icon={Users} color="green" subtitle="Active workforce" />
        <KPICard title="Today Present" value={data.today_present || 0} icon={Calendar} color="emerald" subtitle="Checked in today" />
        <KPICard title="Today Absent" value={data.today_absent || 0} icon={Clock} color="red" subtitle="Not checked in" />
        <KPICard title="Pending Payroll" value={data.pending_payroll || 0} icon={DollarSign} color="amber" subtitle="Draft payrolls" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard title="Monthly Expenses" value={data.monthly_expenses || 0} icon={Receipt} color="red" subtitle="This month's expenditure" />
        <KPICard title="Monthly Payroll" value={data.monthly_payroll || 0} icon={DollarSign} color="blue" subtitle="Salary disbursement" />
      </div>

      {/* Recent Expenses */}
      <div className="industrial-card p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
          Recent Expenses
        </h3>
        {(data.recent_expenses || []).length === 0 ? (
          <p className="text-slate-500 text-sm">No recent expenses</p>
        ) : (
          <div className="space-y-2">
            {(data.recent_expenses || []).slice(0, 5).map((exp, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#2D3648] last:border-0">
                <div>
                  <span className="text-slate-300 text-sm">{exp.description || exp.category}</span>
                  <span className="text-slate-600 text-xs ml-2">{exp.date}</span>
                </div>
                <span className="text-red-400 font-mono text-sm">Rs. {(exp.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { businessMode, isOperations } = useBusinessMode();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const defaultUnit = businessMode === 'CHEMICAL' ? 'Kg' : 'No Of Cones';
  const wastageUnit = data?.total_wastage?.unit || defaultUnit;

  useEffect(() => {
    dashboardAPI.get().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading dashboard...</div></div>;
  if (!data) return <div className="text-red-400">Failed to load dashboard</div>;

  // Return Operations Dashboard for OPERATIONS workspace
  if (isOperations) {
    return <OperationsDashboard data={data} />;
  }

  const locationData = (data.stock_by_location || []).map(l => ({ name: l.location, value: l.total_quantity }));

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Control Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time factory overview</p>
        </div>
        <div className="badge-success" data-testid="system-status">SYSTEM ONLINE</div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Stock Value" value={data.stock_value} icon={Package} color="amber" subtitle="Total inventory value" />
        <KPICard title="Today Sales" value={data.today_sales?.total || 0} icon={TrendingUp} color="emerald" subtitle={`${data.today_sales?.count || 0} transactions`} />
        <KPICard title="Receivable" value={data.total_receivable} icon={DollarSign} color="blue" subtitle="Customer balances" />
        <KPICard title="Payable" value={data.total_payable} icon={TrendingDown} color="red" subtitle="Supplier balances" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Monthly Revenue" value={data.monthly_sales?.total || 0} icon={TrendingUp} color="emerald" subtitle={`${data.monthly_sales?.count || 0} sales this month`} />
        <KPICard title="Active Manufacturing" value={data.active_manufacturing} icon={Factory} color="amber" subtitle="Processes in progress" />
        <KPICard title="Monthly Profit" value={data.monthly_profit?.net || 0} icon={DollarSign} color={data.monthly_profit?.net >= 0 ? "emerald" : "red"} subtitle="Revenue - COGS - Expenses" />
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <div className="lg:col-span-2 industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
            Sales Trend (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.sales_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              <Bar dataKey="total" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock by Location */}
        <div className="industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
            Stock by Location
          </h3>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={locationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '2px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm">No stock data</p>}
          <div className="space-y-1 mt-2">
            {locationData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="font-mono">{item.name}: {item.value?.toLocaleString()} {defaultUnit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="industrial-card" data-testid="low-stock-alerts">
          <div className="px-5 py-3 border-b border-[#2D3648] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
              Low Stock Alerts
            </h3>
            {data.low_stock_alerts?.length > 0 && (
              <span className="badge-warning ml-auto">{data.low_stock_alerts.length}</span>
            )}
          </div>
          <div className="p-0">
            {data.low_stock_alerts?.length > 0 ? (
              <table className="w-full erp-table">
                <thead><tr><th>Product</th><th>Current</th><th>Min Level</th></tr></thead>
                <tbody>
                  {data.low_stock_alerts.map(item => (
                    <tr key={item.id}>
                      <td className="text-slate-300">{item.name}</td>
                      <td className="text-red-400 font-mono">{item.total_quantity} {item.unit}</td>
                      <td className="text-slate-500 font-mono">{item.min_stock_level} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-5 text-sm text-emerald-400">All stock levels normal</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="industrial-card" data-testid="recent-sales">
          <div className="px-5 py-3 border-b border-[#2D3648]">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
              Recent Sales
            </h3>
          </div>
          <table className="w-full erp-table">
            <thead><tr><th>Sale #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {(data.recent_sales || []).map(s => (
                <tr key={s.id}>
                  <td className="text-amber-400 font-mono text-xs">{s.sale_number}</td>
                  <td className="text-slate-300 text-sm">{s.customer_name}</td>
                  <td className="text-white font-mono">{s.net_amount?.toLocaleString()}</td>
                  <td><span className={s.status === 'DISPATCHED' ? 'badge-success' : s.status === 'CONFIRMED' ? 'badge-info' : 'badge-neutral'}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wastage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="industrial-card p-5" data-testid="wastage-summary">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
            Total Wastage
          </h3>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p className="text-xl font-bold text-red-400 font-mono">{data.total_wastage?.total_amount?.toLocaleString() || 0} {wastageUnit}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cost Impact</p>
              <p className="text-xl font-bold text-red-400 font-mono">Rs {data.total_wastage?.total_cost?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
            Monthly Purchases
          </h3>
          <p className="text-2xl font-bold text-white font-mono">{(data.monthly_purchases?.total || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{data.monthly_purchases?.count || 0} purchase orders</p>
        </div>
      </div>
    </div>
  );
}