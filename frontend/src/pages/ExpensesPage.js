// import { useState, useEffect } from "react";
// import { financeAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { Plus, Receipt, Search, Calendar, Filter, Trash2 } from "lucide-react";

// const EXPENSE_CATEGORIES = [
//   'UTILITIES',
//   'MAINTENANCE', 
//   'TRANSPORT',
//   'SALARY',
//   'RAW_MATERIAL',
//   'RENT',
//   'INSURANCE',
//   'OFFICE_SUPPLIES',
//   'MISCELLANEOUS',
//   'OTHER'
// ];

// export default function ExpensesPage() {
//   const [expenses, setExpenses] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ 
//     category: '', 
//     description: '', 
//     amount: '', 
//     date: new Date().toISOString().split('T')[0] 
//   });
//   const [filterCategory, setFilterCategory] = useState('');
//   const [search, setSearch] = useState('');

//   const loadExpenses = () => {
//     financeAPI.expenses().then(r => setExpenses(r.data)).catch(() => {});
//   };

//   useEffect(() => {
//     loadExpenses();
//   }, []);

//   const handleAddExpense = async (e) => {
//     e.preventDefault();
//     if (!form.category || !form.amount) {
//       toast.error("Category and amount are required");
//       return;
//     }
//     try {
//       await financeAPI.addExpense({ ...form, amount: parseFloat(form.amount) });
//       toast.success("Expense recorded successfully");
//       setShowForm(false);
//       setForm({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
//       loadExpenses();
//     } catch (err) { 
//       toast.error(err.response?.data?.error || "Failed to add expense"); 
//     }
//   };

//   // Filter expenses
//   const filteredExpenses = expenses.filter(exp => {
//     if (filterCategory && exp.category !== filterCategory) return false;
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       return exp.description?.toLowerCase().includes(q) || exp.category?.toLowerCase().includes(q);
//     }
//     return true;
//   });

//   // Calculate totals
//   const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
//   const todayExpenses = expenses.filter(exp => exp.date === new Date().toISOString().split('T')[0])
//     .reduce((sum, exp) => sum + (exp.amount || 0), 0);

//   // Group by category
//   const byCategory = EXPENSE_CATEGORIES.map(cat => ({
//     category: cat,
//     total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0),
//     count: expenses.filter(e => e.category === cat).length
//   })).filter(c => c.total > 0);

//   return (
//     <div data-testid="expenses-page" className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
//             Expenses
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">Track and manage daily operational expenses</p>
//         </div>
//         <button 
//           data-testid="new-expense-btn" 
//           onClick={() => setShowForm(!showForm)}
//           className="bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
//           style={{ fontFamily: 'Barlow Condensed' }}
//         >
//           <Plus size={16} /> Add Expense
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="industrial-card p-4 border-l-2 border-green-500">
//           <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Total Expenses</p>
//           <p className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
//             Rs. {totalAmount.toLocaleString()}
//           </p>
//         </div>
//         <div className="industrial-card p-4 border-l-2 border-amber-500">
//           <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Today's Expenses</p>
//           <p className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
//             Rs. {todayExpenses.toLocaleString()}
//           </p>
//         </div>
//         <div className="industrial-card p-4 border-l-2 border-blue-500">
//           <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Total Records</p>
//           <p className="text-2xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
//             {expenses.length}
//           </p>
//         </div>
//       </div>

//       {/* Add Expense Form */}
//       {showForm && (
//         <form onSubmit={handleAddExpense} className="industrial-card p-5 animate-fade-in border-l-2 border-green-500" data-testid="expense-form">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
//             Record New Expense
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Category *</label>
//               <select 
//                 data-testid="expense-category" 
//                 value={form.category} 
//                 onChange={e => setForm({...form, category: e.target.value})} 
//                 required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500"
//               >
//                 <option value="">Select category</option>
//                 {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Description</label>
//               <input 
//                 value={form.description} 
//                 onChange={e => setForm({...form, description: e.target.value})}
//                 placeholder="Brief description..."
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" 
//               />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Amount (Rs.) *</label>
//               <input 
//                 data-testid="expense-amount" 
//                 type="number" 
//                 step="0.01"
//                 value={form.amount} 
//                 onChange={e => setForm({...form, amount: e.target.value})} 
//                 required
//                 placeholder="0.00"
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" 
//               />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Date</label>
//               <input 
//                 type="date" 
//                 value={form.date} 
//                 onChange={e => setForm({...form, date: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" 
//               />
//             </div>
//             <div className="flex items-end gap-2">
//               <button 
//                 type="submit" 
//                 data-testid="submit-expense" 
//                 className="bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex-1" 
//                 style={{ fontFamily: 'Barlow Condensed' }}
//               >
//                 Save
//               </button>
//               <button 
//                 type="button"
//                 onClick={() => setShowForm(false)} 
//                 className="bg-[#1E2738] hover:bg-[#2D3648] text-slate-300 font-bold uppercase tracking-wider rounded-sm h-10 px-4 text-xs" 
//                 style={{ fontFamily: 'Barlow Condensed' }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </form>
//       )}

//       {/* Category Breakdown */}
//       {byCategory.length > 0 && (
//         <div className="industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
//             Expense by Category
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
//             {byCategory.map(cat => (
//               <div 
//                 key={cat.category} 
//                 className="bg-[#0A0F1C] border border-[#2D3648] rounded-sm p-3 hover:border-green-500/50 cursor-pointer transition-colors"
//                 onClick={() => setFilterCategory(cat.category === filterCategory ? '' : cat.category)}
//               >
//                 <p className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
//                   {cat.category.replace('_', ' ')}
//                 </p>
//                 <p className="text-lg font-bold text-white" style={{ fontFamily: 'JetBrains Mono' }}>
//                   Rs. {cat.total.toLocaleString()}
//                 </p>
//                 <p className="text-[10px] text-slate-600">{cat.count} entries</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="flex flex-wrap gap-3 items-center">
//         <div className="relative flex-1 max-w-xs">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
//           <input 
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search expenses..."
//             className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-3 h-10 text-sm outline-none focus:border-green-500"
//           />
//         </div>
//         <select
//           value={filterCategory}
//           onChange={e => setFilterCategory(e.target.value)}
//           className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
//         >
//           <option value="">All Categories</option>
//           {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
//         </select>
//         {filterCategory && (
//           <button onClick={() => setFilterCategory('')} className="text-xs text-slate-400 hover:text-white">
//             Clear filter
//           </button>
//         )}
//       </div>

//       {/* Expenses Table */}
//       <div className="industrial-card overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-[#1E2738] border-b border-[#2D3648]">
//             <tr>
//               <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Date</th>
//               <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Category</th>
//               <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Description</th>
//               <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Amount</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-[#2D3648]">
//             {filteredExpenses.length === 0 ? (
//               <tr>
//                 <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
//                   <Receipt size={32} className="mx-auto mb-2 opacity-30" />
//                   <p>No expenses recorded</p>
//                 </td>
//               </tr>
//             ) : (
//               filteredExpenses.map(exp => (
//                 <tr key={exp.id} className="hover:bg-[#1E2738]/50 transition-colors">
//                   <td className="px-4 py-3 text-slate-300" style={{ fontFamily: 'JetBrains Mono' }}>
//                     {exp.date}
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-sm uppercase">
//                       {exp.category?.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-slate-300">
//                     {exp.description || '-'}
//                   </td>
//                   <td className="px-4 py-3 text-right text-white font-medium" style={{ fontFamily: 'JetBrains Mono' }}>
//                     Rs. {(exp.amount || 0).toLocaleString()}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { financeAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Receipt, Search, Edit2, Trash2, X } from "lucide-react";

const EXPENSE_CATEGORIES = [
  'UTILITIES', 'MAINTENANCE', 'TRANSPORT', 'SALARY',
  'RAW_MATERIAL', 'RENT', 'INSURANCE', 'OFFICE_SUPPLIES', 'MISCELLANEOUS', 'OTHER'
];

const EMPTY_FORM = { category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] };

export default function ExpensesPage() {
  const [expenses, setExpenses]         = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null); // expense id being edited
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch]             = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id pending delete confirm

  const load = () => financeAPI.expenses().then(r => setExpenses(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  // ── Open blank form ────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // ── Open prefilled edit form ───────────────────────────────────────────────
  const openEdit = (exp) => {
    setEditing(exp.id);
    setForm({
      category:    exp.category    || '',
      description: exp.description || '',
      amount:      exp.amount != null ? String(exp.amount) : '',
      date:        exp.date        || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) { toast.error("Category and amount are required"); return; }
    try {
      if (editing) {
        await financeAPI.updateExpense(editing, { ...form, amount: parseFloat(form.amount) });
        toast.success("Expense updated");
      } else {
        await financeAPI.addExpense({ ...form, amount: parseFloat(form.amount) });
        toast.success("Expense recorded");
      }
      closeForm();
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await financeAPI.deleteExpense(id);
      toast.success("Expense deleted");
      setDeleteConfirm(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = expenses.filter(exp => {
    if (filterCategory && exp.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return exp.description?.toLowerCase().includes(q) || exp.category?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalAmount    = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const todayAmount    = expenses
    .filter(e => e.date === new Date().toISOString().split('T')[0])
    .reduce((s, e) => s + (e.amount || 0), 0);

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
    count: expenses.filter(e => e.category === cat).length,
  })).filter(c => c.total > 0);

  return (
    <div data-testid="expenses-page" className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage daily operational expenses</p>
        </div>
        <button data-testid="new-expense-btn" onClick={openNew}
          className="bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="industrial-card p-4 border-l-2 border-green-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
            {filterCategory || search ? 'Filtered Total' : 'All Expenses'}
          </p>
          <p className="text-2xl font-bold text-white font-mono">Rs. {totalAmount.toLocaleString()}</p>
        </div>
        <div className="industrial-card p-4 border-l-2 border-amber-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Today's Expenses</p>
          <p className="text-2xl font-bold text-white font-mono">Rs. {todayAmount.toLocaleString()}</p>
        </div>
        <div className="industrial-card p-4 border-l-2 border-blue-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Total Records</p>
          <p className="text-2xl font-bold text-white font-mono">{expenses.length}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSave}
          className="industrial-card p-5 animate-fade-in border-l-2 border-green-500"
          data-testid="expense-form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
              {editing ? 'Edit Expense' : 'Record New Expense'}
            </h3>
            <button type="button" onClick={closeForm} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Category *</label>
              <select data-testid="expense-category" value={form.category} required
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500">
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Amount (Rs.) *</label>
              <input data-testid="expense-amount" type="number" step="0.01" min="0" required
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-green-500" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" data-testid="submit-expense"
                className="bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex-1"
                style={{ fontFamily: 'Barlow Condensed' }}>
                {editing ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={closeForm}
                className="bg-[#1E2738] hover:bg-[#2D3648] text-slate-300 rounded-sm h-10 px-4 text-xs"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <div className="industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
            By Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {byCategory.map(cat => (
              <div key={cat.category}
                onClick={() => setFilterCategory(cat.category === filterCategory ? '' : cat.category)}
                className={`bg-[#0A0F1C] border rounded-sm p-3 cursor-pointer transition-colors ${
                  filterCategory === cat.category ? 'border-green-500' : 'border-[#2D3648] hover:border-green-500/50'
                }`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
                  {cat.category.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-bold text-white font-mono">Rs. {cat.total.toLocaleString()}</p>
                <p className="text-[10px] text-slate-600">{cat.count} entries</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
            className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-3 h-10 text-sm outline-none focus:border-green-500" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
        {(filterCategory || search) && (
          <button onClick={() => { setFilterCategory(''); setSearch(''); }} className="text-xs text-slate-400 hover:text-white">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="industrial-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1E2738] border-b border-[#2D3648]">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Date</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Category</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Description</th>
              <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Amount</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D3648]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No expenses recorded</p>
                </td>
              </tr>
            ) : (
              filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-[#1E2738]/50 transition-colors group">
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{exp.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-sm uppercase">
                      {exp.category?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{exp.description || '-'}</td>
                  <td className="px-4 py-3 text-right text-white font-medium font-mono">
                    Rs. {(exp.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(exp)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono uppercase">
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-mono uppercase">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0A0F1C] border border-red-500/30 rounded-sm p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
              Delete Expense?
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              This will permanently delete the expense record:{" "}
              <span className="text-white font-mono">
                Rs. {expenses.find(e => e.id === deleteConfirm)?.amount?.toLocaleString()}
                {" — "}
                {expenses.find(e => e.id === deleteConfirm)?.category?.replace(/_/g, ' ')}
              </span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs flex-1"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Yes, Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}