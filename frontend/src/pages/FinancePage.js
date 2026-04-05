// import { useState, useEffect } from "react";
// import { financeAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { TrendingUp, Plus } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// export default function FinancePage() {
//   const [tab, setTab] = useState('monthly');
//   const [monthlyProfit, setMonthlyProfit] = useState(null);
//   const [dailyProfit, setDailyProfit] = useState(null);
//   const [lotProfit, setLotProfit] = useState([]);
//   const [expenses, setExpenses] = useState([]);
//   const [showExpForm, setShowExpForm] = useState(false);
//   const [expForm, setExpForm] = useState({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });

//   useEffect(() => {
//     financeAPI.monthlyProfit().then(r => setMonthlyProfit(r.data));
//     financeAPI.dailyProfit().then(r => setDailyProfit(r.data));
//     financeAPI.lotProfit().then(r => setLotProfit(r.data));
//     financeAPI.expenses().then(r => setExpenses(r.data));
//   }, []);

//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     try {
//       await financeAPI.addExpense({ ...expForm, amount: parseFloat(expForm.amount) });
//       toast.success("Expense recorded");
//       setShowExpForm(false);
//       setExpForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
//       financeAPI.expenses().then(r => setExpenses(r.data));
//       financeAPI.monthlyProfit().then(r => setMonthlyProfit(r.data));
//       financeAPI.dailyProfit().then(r => setDailyProfit(r.data));
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const profitData = monthlyProfit ? [
//     { name: 'Revenue', value: monthlyProfit.revenue, fill: '#10B981' },
//     { name: 'COGS', value: monthlyProfit.cogs, fill: '#EF4444' },
//     { name: 'Expenses', value: monthlyProfit.total_expenses, fill: '#F59E0B' },
//     { name: 'Net Profit', value: monthlyProfit.net_profit, fill: monthlyProfit.net_profit >= 0 ? '#10B981' : '#EF4444' },
//   ] : [];

//   return (
//     <div data-testid="finance-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Profit Engine</h1>
//           <p className="text-sm text-slate-500 mt-1">Financial analysis and expense tracking</p>
//         </div>
//         <button data-testid="add-expense-btn" onClick={() => setShowExpForm(!showExpForm)}
//           className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
//           <Plus size={16} /> Add Expense
//         </button>
//       </div>

//       {showExpForm && (
//         <form onSubmit={handleAddExpense} className="industrial-card p-5 animate-fade-in" data-testid="expense-form">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Category</label>
//               <select data-testid="expense-category" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                 <option value="">Select</option>
//                 {['UTILITIES', 'MAINTENANCE', 'TRANSPORT', 'SALARY', 'RAW_MATERIAL', 'RENT', 'INSURANCE', 'OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Description</label>
//               <input value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Amount</label>
//               <input data-testid="expense-amount" type="number" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//             <div className="flex items-end">
//               <button type="submit" data-testid="submit-expense" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs w-full" style={{ fontFamily: 'Barlow Condensed' }}>Save</button>
//             </div>
//           </div>
//         </form>
//       )}

//       <div className="flex gap-2">
//         {['monthly', 'daily', 'lot-wise', 'expenses'].map(t => (
//           <button key={t} onClick={() => setTab(t)} data-testid={`fin-tab-${t}`}
//             className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
//             style={{ fontFamily: 'Barlow Condensed' }}>{t.replace('-', ' ')}</button>
//         ))}
//       </div>

//       {tab === 'monthly' && monthlyProfit && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           <div className="industrial-card p-5">
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Monthly P&L</h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={profitData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
//                 <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
//                 <Tooltip contentStyle={{ background: '#0F1623', border: '1px solid #2D3648', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
//                 <Bar dataKey="value" radius={[2, 2, 0, 0]}>
//                   {profitData.map((entry, i) => <Bar key={i} fill={entry.fill} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="industrial-card p-5">
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Monthly Breakdown</h3>
//             <div className="space-y-3">
//               {[
//                 { label: 'Revenue', value: monthlyProfit.revenue, color: 'emerald' },
//                 { label: 'Purchase Cost', value: monthlyProfit.purchase_cost, color: 'red' },
//                 { label: 'Wastage Cost', value: monthlyProfit.wastage_cost, color: 'amber' },
//                 { label: 'Operating Expenses', value: monthlyProfit.operating_expenses, color: 'amber' },
//                 { label: 'Payroll Cost', value: monthlyProfit.payroll_cost, color: 'blue' },
//               ].map((item, i) => (
//                 <div key={i} className="flex justify-between items-center py-2 border-b border-[#2D3648]/30">
//                   <span className="text-sm text-slate-400">{item.label}</span>
//                   <span className={`font-mono font-bold text-${item.color}-400`}>{item.value?.toLocaleString()}</span>
//                 </div>
//               ))}
//               <div className="flex justify-between items-center py-3 border-t-2 border-amber-500/30">
//                 <span className="text-sm text-white font-bold uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Net Profit</span>
//                 <span className={`font-mono font-bold text-xl ${monthlyProfit.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{monthlyProfit.net_profit?.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {tab === 'daily' && dailyProfit && (
//         <div className="industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Today's P&L ({dailyProfit.date})</h3>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {[
//               { label: 'Revenue', value: dailyProfit.revenue, color: 'emerald' },
//               { label: 'Purchase Cost', value: dailyProfit.purchase_cost, color: 'red' },
//               { label: 'Wastage Cost', value: dailyProfit.wastage_cost, color: 'amber' },
//               { label: 'Expenses', value: dailyProfit.expenses, color: 'amber' },
//               { label: 'Net Profit', value: dailyProfit.net_profit, color: dailyProfit.net_profit >= 0 ? 'emerald' : 'red' },
//             ].map((item, i) => (
//               <div key={i} className="bg-[#0A0F1C] border border-[#2D3648] p-4 rounded-sm">
//                 <p className="text-xs text-slate-500 uppercase">{item.label}</p>
//                 <p className={`text-xl font-bold font-mono text-${item.color}-400 mt-1`}>{item.value?.toLocaleString()}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {tab === 'lot-wise' && (
//         <div className="industrial-card" data-testid="lot-profit-table">
//           <table className="w-full erp-table">
//             <thead><tr><th>Lot #</th><th>Product</th><th>Purchase Cost</th><th>Sale Revenue</th><th>Wastage Cost</th><th>Profit</th><th>Margin</th></tr></thead>
//             <tbody>
//               {lotProfit.map(l => (
//                 <tr key={l.id}>
//                   <td className="text-amber-400 font-mono text-xs">{l.lot_number}</td>
//                   <td className="text-slate-200">{l.product_name}</td>
//                   <td className="font-mono text-red-400">{l.purchase_cost?.toLocaleString()}</td>
//                   <td className="font-mono text-emerald-400">{l.sale_revenue?.toLocaleString()}</td>
//                   <td className="font-mono text-amber-400">{l.wastage_cost?.toLocaleString()}</td>
//                   <td className={`font-mono font-bold ${l.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{l.profit?.toLocaleString()}</td>
//                   <td className="font-mono text-slate-400">{l.margin}%</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {tab === 'expenses' && (
//         <div className="industrial-card" data-testid="expenses-table">
//           <table className="w-full erp-table">
//             <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
//             <tbody>
//               {expenses.map(e => (
//                 <tr key={e.id}>
//                   <td className="text-slate-400 font-mono text-xs">{e.date}</td>
//                   <td><span className="badge-neutral">{e.category}</span></td>
//                   <td className="text-slate-300 text-sm">{e.description}</td>
//                   <td className="font-mono text-red-400 font-bold">{e.amount?.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { financeAPI } from "@/lib/api";
import { toast } from "sonner";
import { TrendingUp, Plus } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function FinancePage() {
  const [tab, setTab] = useState('monthly');
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [dailyProfit, setDailyProfit] = useState(null);
  const [lotProfit, setLotProfit] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    financeAPI.monthlyProfit().then(r => setMonthlyProfit(r.data));
    financeAPI.dailyProfit().then(r => setDailyProfit(r.data));
    financeAPI.lotProfit().then(r => setLotProfit(r.data));
    financeAPI.expenses().then(r => setExpenses(r.data));
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.addExpense({ ...expForm, amount: parseFloat(expForm.amount) });
      toast.success("Expense recorded");
      setShowExpForm(false);
      setExpForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      financeAPI.expenses().then(r => setExpenses(r.data));
      financeAPI.monthlyProfit().then(r => setMonthlyProfit(r.data));
      financeAPI.dailyProfit().then(r => setDailyProfit(r.data));
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const profitData = monthlyProfit ? [
    { name: 'Revenue', value: monthlyProfit.revenue, fill: '#10B981' },
    { name: 'COGS', value: monthlyProfit.cogs, fill: '#EF4444' },
    { name: 'Expenses', value: monthlyProfit.total_expenses, fill: '#F59E0B' },
    { name: 'Net Profit', value: monthlyProfit.net_profit, fill: monthlyProfit.net_profit >= 0 ? '#10B981' : '#EF4444' },
  ] : [];

  return (
    <div data-testid="finance-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Profit Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Financial analysis and expense tracking</p>
        </div>
        <button data-testid="add-expense-btn" onClick={() => setShowExpForm(!showExpForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {showExpForm && (
        <form onSubmit={handleAddExpense} className="industrial-card p-5 animate-fade-in" data-testid="expense-form">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Category</label>
              <select data-testid="expense-category" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                <option value="">Select</option>
                {['UTILITIES', 'MAINTENANCE', 'TRANSPORT', 'SALARY', 'RAW_MATERIAL', 'RENT', 'INSURANCE', 'OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1">Description</label>
              <input value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1">Amount</label>
              <input data-testid="expense-amount" type="number" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
            <div className="flex items-end">
              <button type="submit" data-testid="submit-expense" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs w-full" style={{ fontFamily: 'Barlow Condensed' }}>Save</button>
            </div>
          </div>
        </form>
      )}

      <div className="flex gap-2">
        {['monthly', 'daily', 'lot-wise', 'expenses'].map(t => (
          <button key={t} onClick={() => setTab(t)} data-testid={`fin-tab-${t}`}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'Barlow Condensed' }}>{t.replace('-', ' ')}</button>
        ))}
      </div>

      {tab === 'monthly' && monthlyProfit && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="industrial-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Monthly P&L</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', color: 'var(--tooltip-text)', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--tooltip-text)' }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {profitData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="industrial-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Monthly Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Revenue', value: monthlyProfit.revenue, color: 'emerald' },
                { label: 'Purchase Cost', value: monthlyProfit.purchase_cost, color: 'red' },
                { label: 'Wastage Cost', value: monthlyProfit.wastage_cost, color: 'amber' },
                { label: 'Operating Expenses', value: monthlyProfit.operating_expenses, color: 'amber' },
                { label: 'Payroll Cost', value: monthlyProfit.payroll_cost, color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#2D3648]/30">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className={`font-mono font-bold text-${item.color}-400`}>{item.value?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-amber-500/30">
                <span className="text-sm text-white font-bold uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Net Profit</span>
                <span className={`font-mono font-bold text-xl ${monthlyProfit.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{monthlyProfit.net_profit?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'daily' && dailyProfit && (
        <div className="industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Today's P&L ({dailyProfit.date})</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Revenue', value: dailyProfit.revenue, color: 'emerald' },
              { label: 'Purchase Cost', value: dailyProfit.purchase_cost, color: 'red' },
              { label: 'Wastage Cost', value: dailyProfit.wastage_cost, color: 'amber' },
              { label: 'Expenses', value: dailyProfit.expenses, color: 'amber' },
              { label: 'Net Profit', value: dailyProfit.net_profit, color: dailyProfit.net_profit >= 0 ? 'emerald' : 'red' },
            ].map((item, i) => (
              <div key={i} className="bg-[#0A0F1C] border border-[#2D3648] p-4 rounded-sm">
                <p className="text-xs text-slate-500 uppercase">{item.label}</p>
                <p className={`text-xl font-bold font-mono text-${item.color}-400 mt-1`}>{item.value?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'lot-wise' && (
        <div className="industrial-card" data-testid="lot-profit-table">
          <table className="w-full erp-table">
            <thead><tr><th>Lot #</th><th>Product</th><th>Purchase Cost</th><th>Sale Revenue</th><th>Wastage Cost</th><th>Profit</th><th>Margin</th></tr></thead>
            <tbody>
              {lotProfit.map(l => (
                <tr key={l.id}>
                  <td className="text-amber-400 font-mono text-xs">{l.lot_number}</td>
                  <td className="text-slate-200">{l.product_name}</td>
                  <td className="font-mono text-red-400">{l.purchase_cost?.toLocaleString()}</td>
                  <td className="font-mono text-emerald-400">{l.sale_revenue?.toLocaleString()}</td>
                  <td className="font-mono text-amber-400">{l.wastage_cost?.toLocaleString()}</td>
                  <td className={`font-mono font-bold ${l.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{l.profit?.toLocaleString()}</td>
                  <td className="font-mono text-slate-400">{l.margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="industrial-card" data-testid="expenses-table">
          <table className="w-full erp-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td className="text-slate-400 font-mono text-xs">{e.date}</td>
                  <td><span className="badge-neutral">{e.category}</span></td>
                  <td className="text-slate-300 text-sm">{e.description}</td>
                  <td className="font-mono text-red-400 font-bold">{e.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}