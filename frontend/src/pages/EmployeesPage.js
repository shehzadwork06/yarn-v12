// import { useState, useEffect } from "react";
// import { employeesAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { Plus, UserCheck } from "lucide-react";

// export default function EmployeesPage() {
//   const [employees, setEmployees] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [showLoan, setShowLoan] = useState(null);
//   const [form, setForm] = useState({ name: '', phone: '', address: '', designation: '', department: '', basic_salary: '', joining_date: '' });
//   const [loanForm, setLoanForm] = useState({ amount: '', monthly_deduction: '', notes: '' });

//   const load = () => employeesAPI.list().then(r => setEmployees(r.data));
//   useEffect(() => { load(); }, []);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     try {
//       await employeesAPI.create({ ...form, basic_salary: parseFloat(form.basic_salary) || 0 });
//       toast.success("Employee added");
//       setShowForm(false);
//       setForm({ name: '', phone: '', address: '', designation: '', department: '', basic_salary: '', joining_date: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleLoan = async (e) => {
//     e.preventDefault();
//     try {
//       await employeesAPI.addLoan(showLoan, { amount: parseFloat(loanForm.amount), monthly_deduction: parseFloat(loanForm.monthly_deduction), notes: loanForm.notes });
//       toast.success("Loan added");
//       setShowLoan(null);
//       setLoanForm({ amount: '', monthly_deduction: '', notes: '' });
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const departments = ['DYEING', 'PRODUCTION', 'CHEMICAL', 'STORE', 'FINANCE', 'ADMIN'];

//   return (
//     <div data-testid="employees-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Employees</h1>
//           <p className="text-sm text-slate-500 mt-1">HR management and loan tracking</p>
//         </div>
//         <button data-testid="add-employee-btn" onClick={() => setShowForm(!showForm)}
//           className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
//           <Plus size={16} /> Add Employee
//         </button>
//       </div>

//       {showForm && (
//         <form onSubmit={handleCreate} className="industrial-card p-5 animate-fade-in" data-testid="employee-form">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>New Employee</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {[{ key: 'name', label: 'Name', required: true }, { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' }, { key: 'designation', label: 'Designation' }].map(f => (
//               <div key={f.key}>
//                 <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>{f.label}</label>
//                 <input data-testid={`emp-${f.key}`} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.required}
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//               </div>
//             ))}
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Department</label>
//               <select data-testid="emp-department" value={form.department} onChange={e => setForm({...form, department: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                 <option value="">Select</option>
//                 {departments.map(d => <option key={d} value={d}>{d}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Basic Salary</label>
//               <input data-testid="emp-salary" type="number" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Joining Date</label>
//               <input type="date" value={form.joining_date} onChange={e => setForm({...form, joining_date: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//           </div>
//           <div className="flex gap-2 mt-4">
//             <button type="submit" data-testid="submit-employee" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Save</button>
//             <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
//           </div>
//         </form>
//       )}

//       {showLoan && (
//         <form onSubmit={handleLoan} className="industrial-card p-5 animate-fade-in" data-testid="loan-form">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Add Loan</h3>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Loan Amount</label>
//               <input data-testid="loan-amount" type="number" value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: e.target.value})} required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Monthly Deduction</label>
//               <input data-testid="loan-deduction" type="number" value={loanForm.monthly_deduction} onChange={e => setLoanForm({...loanForm, monthly_deduction: e.target.value})} required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//             <div>
//               <label className="block text-xs text-slate-400 uppercase mb-1">Notes</label>
//               <input value={loanForm.notes} onChange={e => setLoanForm({...loanForm, notes: e.target.value})}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//             </div>
//           </div>
//           <div className="flex gap-2 mt-4">
//             <button type="submit" data-testid="submit-loan" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>Add Loan</button>
//             <button type="button" onClick={() => setShowLoan(null)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
//           </div>
//         </form>
//       )}

//       <div className="industrial-card" data-testid="employees-table">
//         <table className="w-full erp-table">
//           <thead><tr><th>Code</th><th>Name</th><th>Designation</th><th>Dept</th><th>Salary</th><th>Actions</th></tr></thead>
//           <tbody>
//             {employees.map(emp => (
//               <tr key={emp.id}>
//                 <td className="text-amber-400 font-mono text-xs">{emp.employee_code}</td>
//                 <td className="text-slate-200">{emp.name}</td>
//                 <td className="text-slate-400 text-sm">{emp.designation || '-'}</td>
//                 <td><span className="badge-neutral">{emp.department || '-'}</span></td>
//                 <td className="text-white font-mono">{emp.basic_salary?.toLocaleString()}</td>
//                 <td><button onClick={() => setShowLoan(emp.id)} className="text-xs text-amber-400 hover:text-amber-300 font-mono uppercase">+ Loan</button></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { employeesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit2, X } from "lucide-react";

const DEPARTMENTS = ['DYEING', 'PRODUCTION', 'CHEMICAL', 'STORE', 'FINANCE', 'ADMIN', 'SECURITY', 'CLEANING'];

const EMPTY_FORM = { name: '', phone: '', address: '', designation: '', department: '', basic_salary: '', joining_date: '' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null); // employee id being edited
  const [form, setForm]           = useState(EMPTY_FORM);
  const [showLoan, setShowLoan]   = useState(null);
  const [loanForm, setLoanForm]   = useState({ amount: '', monthly_deduction: '', notes: '' });

  const load = () => employeesAPI.list().then(r => setEmployees(r.data));
  useEffect(() => { load(); }, []);

  // ── Open blank form for new employee ──────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  // ── Open pre-filled form for editing ──────────────────────────────────────
  const openEdit = (emp) => {
    setEditing(emp.id);
    setForm({
      name:         emp.name         || '',
      phone:        emp.phone        || '',
      address:      emp.address      || '',
      designation:  emp.designation  || '',
      department:   emp.department   || '',
      basic_salary: emp.basic_salary != null ? String(emp.basic_salary) : '',
      joining_date: emp.joining_date || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, basic_salary: parseFloat(form.basic_salary) || 0 };
    try {
      if (editing) {
        await employeesAPI.update(editing, payload);
        toast.success("Employee updated");
      } else {
        await employeesAPI.create(payload);
        toast.success("Employee added");
      }
      closeForm();
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // ── Loan ──────────────────────────────────────────────────────────────────
  const handleLoan = async (e) => {
    e.preventDefault();
    try {
      await employeesAPI.addLoan(showLoan, {
        amount:            parseFloat(loanForm.amount),
        monthly_deduction: parseFloat(loanForm.monthly_deduction),
        notes:             loanForm.notes,
      });
      toast.success("Loan added");
      setShowLoan(null);
      setLoanForm({ amount: '', monthly_deduction: '', notes: '' });
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // Helper: how many Mon-Sat days are in a month
  const workingDaysInMonth = (year, month) => {
    const days = new Date(year, month, 0).getDate();
    let count = 0;
    for (let d = 1; d <= days; d++) {
      if (new Date(year, month - 1, d).getDay() !== 0) count++;
    }
    return count;
  };

  const perDayPreview = (salary) => {
    if (!salary) return null;
    const now = new Date();
    const wd  = workingDaysInMonth(now.getFullYear(), now.getMonth() + 1);
    return Math.round(parseFloat(salary) / wd);
  };

  const salaryPreview = form.basic_salary ? perDayPreview(form.basic_salary) : null;

  return (
    <div data-testid="employees-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Employees
          </h1>
          <p className="text-sm text-slate-500 mt-1">HR management and loan tracking</p>
        </div>
        <button data-testid="add-employee-btn" onClick={openNew}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="industrial-card p-5 animate-fade-in" data-testid="employee-form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
              {editing ? 'Edit Employee' : 'New Employee'}
            </h3>
            <button type="button" onClick={closeForm} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Name *</label>
              <input data-testid="emp-name" value={form.name} required
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Phone</label>
              <input data-testid="emp-phone" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
            </div>
            {/* Address */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Address</label>
              <input data-testid="emp-address" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
            </div>
            {/* Designation */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Designation</label>
              <input data-testid="emp-designation" value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
            </div>
            {/* Department */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Department</label>
              <select data-testid="emp-department" value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Monthly Salary */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
                Monthly Salary (Rs.) *
              </label>
              <input data-testid="emp-salary" type="number" min="0" value={form.basic_salary} required
                onChange={e => setForm({ ...form, basic_salary: e.target.value })}
                placeholder="e.g. 30000"
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
              {salaryPreview && (
                <p className="text-[11px] text-slate-500 mt-1">
                  ≈ <span className="text-amber-400 font-mono">Rs. {salaryPreview.toLocaleString()}/day</span>
                  {" "}this month ({workingDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1)} working days)
                </p>
              )}
            </div>
            {/* Joining Date */}
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>
                Joining Date <span className="text-slate-600 normal-case">(used for mid-month pro-rating)</span>
              </label>
              <input type="date" value={form.joining_date}
                onChange={e => setForm({ ...form, joining_date: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/50" />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button type="submit" data-testid="submit-employee"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs"
              style={{ fontFamily: 'Barlow Condensed' }}>
              {editing ? 'Update Employee' : 'Save Employee'}
            </button>
            <button type="button" onClick={closeForm}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loan Form */}
      {showLoan && (
        <form onSubmit={handleLoan} className="industrial-card p-5 animate-fade-in border-l-2 border-amber-500" data-testid="loan-form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
              Add Loan — {employees.find(e => e.id === showLoan)?.name}
            </h3>
            <button type="button" onClick={() => setShowLoan(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Loan Amount (Rs.)</label>
              <input data-testid="loan-amount" type="number" min="1" value={loanForm.amount}
                onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Monthly Deduction (Rs.)</label>
              <input data-testid="loan-deduction" type="number" min="1" value={loanForm.monthly_deduction}
                onChange={e => setLoanForm({ ...loanForm, monthly_deduction: e.target.value })} required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
              {loanForm.amount && loanForm.monthly_deduction && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Paid off in ~<span className="text-amber-400 font-mono">{Math.ceil(parseFloat(loanForm.amount) / parseFloat(loanForm.monthly_deduction))}</span> months
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Notes</label>
              <input value={loanForm.notes} onChange={e => setLoanForm({ ...loanForm, notes: e.target.value })}
                placeholder="Optional reason..."
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" data-testid="submit-loan"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs"
              style={{ fontFamily: 'Barlow Condensed' }}>Add Loan</button>
            <button type="button" onClick={() => setShowLoan(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
          </div>
        </form>
      )}

      {/* Employees Table */}
      <div className="industrial-card" data-testid="employees-table">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Dept</th>
              <th>Joining Date</th>
              <th>Monthly Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="text-amber-400 font-mono text-xs">{emp.employee_code}</td>
                <td className="text-slate-200 font-medium">{emp.name}</td>
                <td className="text-slate-400 text-sm">{emp.designation || '-'}</td>
                <td><span className="badge-neutral">{emp.department || '-'}</span></td>
                <td className="text-slate-400 font-mono text-xs">{emp.joining_date || '-'}</td>
                <td className="text-white font-mono">
                  Rs. {emp.basic_salary?.toLocaleString()}
                  <span className="text-slate-600 text-xs ml-1">
                    /mo
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(emp)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono uppercase">
                      <Edit2 size={11} /> Edit
                    </button>
                    <button onClick={() => setShowLoan(emp.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-mono uppercase">
                      + Loan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-500 py-8">No employees yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}