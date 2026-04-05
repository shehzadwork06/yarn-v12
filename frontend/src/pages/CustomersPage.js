// import { useState, useEffect } from "react";
// import { customersAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { Plus } from "lucide-react";

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [showPayment, setShowPayment] = useState(null);
//   const [ledger, setLedger] = useState([]);
//   const [ledgerName, setLedgerName] = useState(null);
//   const [form, setForm] = useState({ name: '', phone: '', address: '', credit_limit: 0, opening_balance: 0 });
//   const [payForm, setPayForm] = useState({ amount: '', description: '' });

//   const load = () => customersAPI.list().then(r => setCustomers(r.data));
//   useEffect(() => { load(); }, []);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     try {
//       await customersAPI.create({ ...form, credit_limit: parseFloat(form.credit_limit) || 0, opening_balance: parseFloat(form.opening_balance) || 0 });
//       toast.success("Customer created");
//       setShowForm(false);
//       setForm({ name: '', phone: '', address: '', credit_limit: 0, opening_balance: 0 });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handlePayment = async (e) => {
//     e.preventDefault();
//     try {
//       await customersAPI.payment(showPayment, { amount: parseFloat(payForm.amount), description: payForm.description });
//       toast.success("Payment received");
//       setShowPayment(null);
//       setPayForm({ amount: '', description: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const viewLedger = async (id, name) => {
//     const { data } = await customersAPI.ledger(id);
//     setLedger(data);
//     setLedgerName(name);
//   };

//   return (
//     <div data-testid="customers-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Customers</h1>
//           <p className="text-sm text-slate-500 mt-1">Manage customer accounts and receivables</p>
//         </div>
//         <button data-testid="add-customer-btn" onClick={() => setShowForm(!showForm)}
//           className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
//           <Plus size={16} /> Add Customer
//         </button>
//       </div>

//       {showForm && (
//         <form onSubmit={handleCreate} className="industrial-card p-5 animate-fade-in" data-testid="customer-form">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>New Customer</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {[{ key: 'name', label: 'Name', required: true }, { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' }, { key: 'credit_limit', label: 'Credit Limit', type: 'number' }, { key: 'opening_balance', label: 'Opening Balance', type: 'number' }].map(f => (
//               <div key={f.key}>
//                 <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>{f.label}</label>
//                 <input data-testid={`customer-${f.key}`} type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.required}
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
//               </div>
//             ))}
//           </div>
//           <div className="flex gap-2 mt-4">
//             <button type="submit" data-testid="submit-customer" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Save</button>
//             <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
//           </div>
//         </form>
//       )}

//       {showPayment && (
//         <form onSubmit={handlePayment} className="industrial-card p-5 animate-fade-in" data-testid="customer-payment-form">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Receive Payment</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Amount</label>
//               <input data-testid="cust-payment-amount" type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Description</label>
//               <input value={payForm.description} onChange={e => setPayForm({...payForm, description: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
//             </div>
//           </div>
//           <div className="flex gap-2 mt-4">
//             <button type="submit" data-testid="submit-cust-payment" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Receive</button>
//             <button type="button" onClick={() => setShowPayment(null)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
//           </div>
//         </form>
//       )}

//       <div className="industrial-card" data-testid="customers-table">
//         <table className="w-full erp-table">
//           <thead><tr><th>Name</th><th>Phone</th><th>Credit Limit</th><th>Balance</th><th>Actions</th></tr></thead>
//           <tbody>
//             {customers.map(c => (
//               <tr key={c.id}>
//                 <td className="text-slate-200">{c.name}</td>
//                 <td className="text-slate-400 font-mono text-xs">{c.phone}</td>
//                 <td className="text-slate-400 font-mono">{c.credit_limit?.toLocaleString()}</td>
//                 <td className="text-amber-400 font-mono font-bold">{c.current_balance?.toLocaleString()}</td>
//                 <td className="flex gap-2">
//                   <button onClick={() => setShowPayment(c.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-mono uppercase">Receive</button>
//                   <button onClick={() => viewLedger(c.id, c.name)} className="text-xs text-blue-400 hover:text-blue-300 font-mono uppercase">Ledger</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {ledger.length > 0 && (
//         <div className="industrial-card animate-fade-in" data-testid="customer-ledger">
//           <div className="px-5 py-3 border-b border-[#2D3648] flex items-center justify-between">
//             <h3 className="text-sm font-semibold text-slate-300 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Ledger: {ledgerName}</h3>
//             <button onClick={() => { setLedger([]); setLedgerName(null); }} className="text-xs text-slate-500 hover:text-white">CLOSE</button>
//           </div>
//           <table className="w-full erp-table">
//             <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
//             <tbody>
//               {ledger.map(l => (
//                 <tr key={l.id}>
//                   <td className="text-slate-400 font-mono text-xs">{l.date}</td>
//                   <td><span className={l.type === 'PAYMENT' ? 'badge-success' : 'badge-warning'}>{l.type}</span></td>
//                   <td className="text-slate-300 text-sm">{l.description}</td>
//                   <td className="text-red-400 font-mono">{l.debit > 0 ? l.debit.toLocaleString() : '-'}</td>
//                   <td className="text-emerald-400 font-mono">{l.credit > 0 ? l.credit.toLocaleString() : '-'}</td>
//                   <td className="text-white font-mono font-bold">{l.balance?.toLocaleString()}</td>
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
import { customersAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useBusinessMode } from "../context/BusinessModeContext";

export default function CustomersPage() {
  const { businessMode } = useBusinessMode();
  const isChemical = businessMode === "CHEMICAL";
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [ledgerName, setLedgerName] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', credit_limit: 0, opening_balance: 0 });
  const [payForm, setPayForm] = useState({ amount: '', description: '' });
  const [editModal, setEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', credit_limit: '' });

  const load = () => customersAPI.list().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await customersAPI.create({ ...form, credit_limit: parseFloat(form.credit_limit) || 0, opening_balance: parseFloat(form.opening_balance) || 0 });
      toast.success("Customer created");
      setShowForm(false);
      setForm({ name: '', phone: '', address: '', credit_limit: 0, opening_balance: 0 });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await customersAPI.payment(showPayment, { amount: parseFloat(payForm.amount), description: payForm.description });
      toast.success("Payment received");
      setShowPayment(null);
      setPayForm({ amount: '', description: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const viewLedger = async (id, name) => {
    const { data } = await customersAPI.ledger(id);
    setLedger(data);
    setLedgerName(name);
  };

  const openEdit = (c) => {
    setEditCustomer(c);
    setEditForm({ name: c.name, phone: c.phone || '', address: c.address || '', credit_limit: c.credit_limit ?? '' });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await customersAPI.update(editCustomer.id, { ...editForm, credit_limit: parseFloat(editForm.credit_limit) || 0 });
      toast.success("Customer updated");
      setEditModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error updating customer"); }
  };

  return (
    <div data-testid="customers-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>{isChemical ? 'Chemical Customers' : 'Yarn Customers'}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer accounts and receivables</p>
        </div>
        <button data-testid="add-customer-btn" onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="industrial-card p-5 animate-fade-in" data-testid="customer-form">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>New Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ key: 'name', label: 'Name', required: true }, { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' }, { key: 'credit_limit', label: 'Credit Limit', type: 'number' }, { key: 'opening_balance', label: 'Opening Balance', type: 'number' }].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: 'Barlow Condensed' }}>{f.label}</label>
                <input data-testid={`customer-${f.key}`} type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.required}
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" data-testid="submit-customer" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
          </div>
        </form>
      )}

      {showPayment && (
        <form onSubmit={handlePayment} className="industrial-card p-5 animate-fade-in" data-testid="customer-payment-form">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Receive Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1">Amount</label>
              <input data-testid="cust-payment-amount" type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1">Description</label>
              <input value={payForm.description} onChange={e => setPayForm({...payForm, description: e.target.value})}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" data-testid="submit-cust-payment" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Receive</button>
            <button type="button" onClick={() => setShowPayment(null)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
          </div>
        </form>
      )}

      <div className="industrial-card" data-testid="customers-table">
        <table className="w-full erp-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Credit Limit</th><th>Balance</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td className="text-slate-200">{c.name}</td>
                <td className="text-slate-400 font-mono text-xs">{c.phone}</td>
                <td className="text-slate-400 font-mono">{c.credit_limit?.toLocaleString()}</td>
                <td className="text-amber-400 font-mono font-bold">{c.current_balance?.toLocaleString()}</td>
                <td className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-xs text-amber-400 hover:text-amber-300 font-mono uppercase">Edit</button>
                  <button onClick={() => setShowPayment(c.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-mono uppercase">Receive</button>
                  <button onClick={() => viewLedger(c.id, c.name)} className="text-xs text-blue-400 hover:text-blue-300 font-mono uppercase">Ledger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ledger.length > 0 && (
        <div className="industrial-card animate-fade-in" data-testid="customer-ledger">
          <div className="px-5 py-3 border-b border-[#2D3648] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Ledger: {ledgerName}</h3>
            <button onClick={() => { setLedger([]); setLedgerName(null); }} className="text-xs text-slate-500 hover:text-white">CLOSE</button>
          </div>
          <table className="w-full erp-table">
            <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
            <tbody>
              {ledger.map(l => (
                <tr key={l.id}>
                  <td className="text-slate-400 font-mono text-xs">{l.date}</td>
                  <td><span className={l.type === 'PAYMENT' ? 'badge-success' : 'badge-warning'}>{l.type}</span></td>
                  <td className="text-slate-300 text-sm">{l.description}</td>
                  <td className="text-red-400 font-mono">{l.debit > 0 ? l.debit.toLocaleString() : '-'}</td>
                  <td className="text-emerald-400 font-mono">{l.credit > 0 ? l.credit.toLocaleString() : '-'}</td>
                  <td className="text-white font-mono font-bold">{l.balance?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit Customer Modal ──────────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/80 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3648]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider"
                style={{ fontFamily: 'Barlow Condensed' }}>Edit Customer</h3>
              <button type="button" onClick={() => setEditModal(false)}
                className="text-slate-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'name',         label: 'Name',         required: true },
                  { key: 'phone',        label: 'Phone' },
                  { key: 'address',      label: 'Address' },
                  { key: 'credit_limit', label: 'Credit Limit', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                      style={{ fontFamily: 'Barlow Condensed' }}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={editForm[f.key]}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      required={f.required}
                      className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60 transition-colors" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 mt-4 italic">
                Opening / current balance cannot be changed here — use the Receive payment flow instead.
              </p>
              <div className="flex gap-2 mt-5">
                <button type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-6 text-xs transition-all active:scale-95"
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}