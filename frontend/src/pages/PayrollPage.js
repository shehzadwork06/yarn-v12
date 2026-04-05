// import { useState, useEffect } from "react";
// import { payrollAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { DollarSign } from "lucide-react";

// export default function PayrollPage() {
//   const [payrolls, setPayrolls] = useState([]);
//   const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
//   const [year, setYear] = useState(new Date().getFullYear().toString());

//   const load = () => payrollAPI.list({ month, year }).then(r => setPayrolls(r.data));
//   useEffect(() => { load(); }, [month, year]);

//   const handleGenerate = async () => {
//     try {
//       const { data } = await payrollAPI.generate({ month, year: parseInt(year) });
//       toast.success(`Payroll generated for ${data.length} employees`);
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleConfirm = async (id) => {
//     try {
//       await payrollAPI.confirm(id);
//       toast.success("Payroll confirmed");
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handlePay = async (id) => {
//     try {
//       await payrollAPI.pay(id);
//       toast.success("Salary paid");
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const statusColors = { DRAFT: 'badge-warning', CONFIRMED: 'badge-info', PAID: 'badge-success' };

//   return (
//     <div data-testid="payroll-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Payroll</h1>
//           <p className="text-sm text-slate-500 mt-1">Salary calculation with loan deductions</p>
//         </div>
//         <button data-testid="generate-payroll" onClick={handleGenerate}
//           className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95" style={{ fontFamily: 'Barlow Condensed' }}>
//           <DollarSign size={16} /> Generate Payroll
//         </button>
//       </div>

//       {/* Month/Year selector */}
//       <div className="flex gap-3 items-center">
//         <select value={month} onChange={e => setMonth(e.target.value)} data-testid="payroll-month"
//           className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//           {Array.from({length: 12}, (_, i) => {
//             const m = (i + 1).toString().padStart(2, '0');
//             return <option key={m} value={m}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>;
//           })}
//         </select>
//         <input type="number" value={year} onChange={e => setYear(e.target.value)} data-testid="payroll-year"
//           className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none w-24" />
//       </div>

//       <div className="industrial-card" data-testid="payroll-table">
//         <div className="overflow-x-auto">
//           <table className="w-full erp-table">
//             <thead><tr><th>Employee</th><th>Basic</th><th>Present</th><th>Absent</th><th>OT Hrs</th><th>OT Amt</th><th>Absent Ded.</th><th>Loan Ded.</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead>
//             <tbody>
//               {payrolls.map(p => (
//                 <tr key={p.id}>
//                   <td className="text-slate-200">{p.employee_name} <span className="text-xs text-slate-500 font-mono">{p.employee_code}</span></td>
//                   <td className="font-mono text-slate-400">{p.basic_salary?.toLocaleString()}</td>
//                   <td className="font-mono text-emerald-400">{p.present_days}</td>
//                   <td className="font-mono text-red-400">{p.absent_days}</td>
//                   <td className="font-mono text-blue-400">{p.overtime_hours?.toFixed(1)}</td>
//                   <td className="font-mono text-blue-400">{p.overtime_amount?.toLocaleString()}</td>
//                   <td className="font-mono text-red-400">{p.absent_deduction?.toLocaleString()}</td>
//                   <td className="font-mono text-amber-400">{p.loan_deduction?.toLocaleString()}</td>
//                   <td className="font-mono text-white font-bold">{p.net_salary?.toLocaleString()}</td>
//                   <td><span className={statusColors[p.status] || 'badge-neutral'}>{p.status}</span></td>
//                   <td className="flex gap-2">
//                     {p.status === 'DRAFT' && <button onClick={() => handleConfirm(p.id)} className="text-xs text-blue-400 hover:text-blue-300 uppercase font-mono">Confirm</button>}
//                     {p.status === 'CONFIRMED' && <button onClick={() => handlePay(p.id)} className="text-xs text-emerald-400 hover:text-emerald-300 uppercase font-mono">Pay</button>}
//                   </td>
//                 </tr>
//               ))}
//               {payrolls.length === 0 && <tr><td colSpan={11} className="text-center text-slate-500 py-8">No payroll data. Click "Generate Payroll" to create.</td></tr>}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { payrollAPI } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Edit2, X, Printer, RefreshCw, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function printSalarySlip(p) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 26, "F");
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text("GH & Sons Enterprises", pageW / 2, 10, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text("SALARY SLIP", pageW / 2, 16, { align: "center" });
  doc.setFontSize(6.5);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  doc.text(monthNames[parseInt(p.month) - 1] + " " + p.year, pageW / 2, 21, { align: "center" });

  let y = 32;
  doc.setFillColor(20, 30, 50);
  doc.rect(10, y, pageW - 20, 22, "F");
  doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("EMPLOYEE", 13, y + 5);
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(p.employee_name, 13, y + 12);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
  doc.text("Code: " + p.employee_code, 13, y + 18);
  if (p.designation) {
    doc.text(p.designation + (p.department ? " — " + p.department : ""), pageW / 2, y + 18);
  }
  const badgeColor = p.status === "PAID" ? [34,197,94] : p.status === "CONFIRMED" ? [59,130,246] : [245,158,11];
  doc.setFillColor(...badgeColor);
  doc.roundedRect(pageW - 30, y + 6, 20, 8, 1, 1, "F");
  doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
  doc.text(p.status, pageW - 20, y + 11.5, { align: "center" });
  y += 28;

  // Salary breakdown
  const perDay = p.working_days > 0 ? (p.basic_salary / p.working_days).toFixed(0) : 0;
  autoTable(doc, {
    startY: y,
    head: [["Description", "Details", "Amount (PKR)"]],
    body: [
      ["Basic Salary",       "Rs. " + perDay + "/day × " + p.working_days + " payable days", p.basic_salary?.toLocaleString()],
      ["Earned Salary",      p.present_days + " present day(s)",                              "Rs. " + Math.round((p.basic_salary / Math.max(p.working_days,1)) * p.present_days).toLocaleString()],
      ["Overtime",           (p.overtime_hours?.toFixed(1)) + " hrs",                         "+ " + (p.overtime_amount?.toLocaleString() || "0")],
      ["Absent Deduction",   p.absent_days + " absent day(s)",                                "- " + (p.absent_deduction?.toLocaleString() || "0")],
      ["Loan Deduction",     "—",                                                             "- " + (p.loan_deduction?.toLocaleString() || "0")],
    ],
    headStyles: { fillColor: [30,39,56], textColor: [251,191,36], fontStyle: "bold", fontSize: 7 },
    bodyStyles: { fontSize: 7.5, textColor: [40,40,40] },
    alternateRowStyles: { fillColor: [245,248,252] },
    styles: { cellPadding: 2.5, lineColor: [210,220,230], lineWidth: 0.1 },
    columnStyles: { 2: { halign: "right", fontStyle: "bold" } },
    margin: { left: 10, right: 10 },
  });

  y = doc.lastAutoTable.finalY + 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(10, y, pageW - 20, 12, "F");
  doc.setTextColor(148, 163, 184); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  doc.text("NET SALARY", 14, y + 7.5);
  doc.setTextColor(251, 191, 36); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("PKR " + p.net_salary?.toLocaleString(), pageW - 12, y + 8, { align: "right" });
  y += 18;

  if (p.paid_date) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(100,120,140);
    doc.text("Paid on: " + p.paid_date, pageW - 12, y, { align: "right" });
    y += 5;
  }

  y = Math.max(y, pageH - 30);
  doc.setDrawColor(180,190,205); doc.setLineWidth(0.2);
  doc.line(12, y, 55, y); doc.line(pageW - 55, y, pageW - 12, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(130,140,155);
  doc.text("Employee Signature", 33, y + 4, { align: "center" });
  doc.text("Authorized Signature", pageW - 33, y + 4, { align: "center" });

  doc.setFillColor(245,247,250);
  doc.rect(0, pageH - 10, pageW, 10, "F");
  doc.setFontSize(6); doc.setTextColor(150,160,175);
  doc.text("GH & Sons Enterprises — Salary Slip (System Generated)", pageW / 2, pageH - 4, { align: "center" });

  doc.save("salary-slip-" + p.employee_code + "-" + p.month + "-" + p.year + ".pdf");
}

export default function PayrollPage() {
  const [payrolls, setPayrolls]     = useState([]);
  const [month, setMonth]           = useState((new Date().getMonth() + 1).toString().padStart(2,"0"));
  const [year, setYear]             = useState(new Date().getFullYear().toString());
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm]     = useState({});

  const load = () => payrollAPI.list({ month, year }).then(r => setPayrolls(r.data));
  useEffect(() => { load(); }, [month, year]);

  // Generate (skips existing)
  const handleGenerate = async () => {
    try {
      const { data } = await payrollAPI.generate({ month, year: parseInt(year) });
      toast.success("Payroll generated for " + data.length + " employees");
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // Reset all DRAFTs for this month and regenerate fresh
  const handleRegenerate = async () => {
    if (!window.confirm("This will DELETE all DRAFT payroll records for " + month + "/" + year + " and regenerate from scratch. Confirmed/Paid records are safe. Continue?")) return;
    try {
      await payrollAPI.deleteMonth(month, year);
      const { data } = await payrollAPI.generate({ month, year: parseInt(year) });
      toast.success("Regenerated payroll for " + data.length + " employees");
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handleConfirm = async id => {
    try { await payrollAPI.confirm(id); toast.success("Confirmed"); load(); }
    catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handlePay = async id => {
    try { await payrollAPI.pay(id); toast.success("Salary paid"); load(); }
    catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this DRAFT payroll record?")) return;
    try { await payrollAPI.deleteOne(id); toast.success("Deleted"); load(); }
    catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const openEdit = p => {
    setEditRecord(p);
    setEditForm({
      present_days:     String(p.present_days     ?? ""),
      absent_days:      String(p.absent_days      ?? ""),
      half_days:        String(p.half_days         ?? ""),
      overtime_hours:   String(p.overtime_hours   ?? ""),
      overtime_amount:  String(p.overtime_amount  ?? ""),
      absent_deduction: String(p.absent_deduction ?? ""),
      loan_deduction:   String(p.loan_deduction   ?? ""),
      net_salary:       String(p.net_salary       ?? ""),
    });
  };

  const handleEdit = async e => {
    e.preventDefault();
    try {
      const payload = {};
      Object.entries(editForm).forEach(([k, v]) => { if (v !== "") payload[k] = parseFloat(v); });
      await payrollAPI.update(editRecord.id, payload);
      toast.success("Payroll updated");
      setEditRecord(null); load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const statusColors = { DRAFT: "badge-warning", CONFIRMED: "badge-info", PAID: "badge-success" };
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const draftCount = payrolls.filter(p => p.status === "DRAFT").length;

  return (
    <div data-testid="payroll-page" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "Barlow Condensed" }}>Payroll</h1>
          <p className="text-sm text-slate-500 mt-1">Net = (Basic ÷ Payable Days) × Present Days + Overtime − Loans</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {draftCount > 0 && (
            <button onClick={handleRegenerate}
              className="bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 font-bold uppercase tracking-wider rounded-sm h-10 px-4 text-xs flex items-center gap-2 transition-all"
              style={{ fontFamily: "Barlow Condensed" }}
              title="Delete all DRAFT records and regenerate with correct joining dates">
              <RefreshCw size={14} /> Reset & Regenerate
            </button>
          )}
          <button data-testid="generate-payroll" onClick={handleGenerate}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
            style={{ fontFamily: "Barlow Condensed" }}>
            <DollarSign size={16} /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Month / Year selector */}
      <div className="flex gap-3 items-center flex-wrap">
        <select value={month} onChange={e => setMonth(e.target.value)} data-testid="payroll-month"
          className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
          {monthNames.map((m, i) => (
            <option key={i+1} value={String(i+1).padStart(2,"0")}>{m}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} data-testid="payroll-year"
          className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none w-24" />
        {draftCount > 0 && (
          <p className="text-xs text-amber-400/70">
            {draftCount} DRAFT record(s) — use "Reset & Regenerate" if joining dates or attendance changed
          </p>
        )}
      </div>

      {/* Table */}
      <div className="industrial-card" data-testid="payroll-table">
        <div className="overflow-x-auto">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic</th>
                <th title="Working days from joining date (or month start) to month end">Payable Days</th>
                <th>Present</th>
                <th>Absent</th>
                <th>OT Hrs</th>
                <th>OT Amt</th>
                <th>Abs.Ded.</th>
                <th>Loan Ded.</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id}>
                  <td className="text-slate-200">{p.employee_name} <span className="text-xs text-slate-500 font-mono">{p.employee_code}</span></td>
                  <td className="font-mono text-slate-400">{p.basic_salary?.toLocaleString()}</td>
                  <td className="font-mono text-slate-300">{p.working_days}</td>
                  <td className="font-mono text-emerald-400">{p.present_days}</td>
                  <td className="font-mono text-red-400">{p.absent_days}</td>
                  <td className="font-mono text-blue-400">{p.overtime_hours?.toFixed(1)}</td>
                  <td className="font-mono text-blue-400">{p.overtime_amount?.toLocaleString()}</td>
                  <td className="font-mono text-red-400">{p.absent_deduction?.toLocaleString()}</td>
                  <td className="font-mono text-amber-400">{p.loan_deduction?.toLocaleString()}</td>
                  <td className="font-mono text-white font-bold">{p.net_salary?.toLocaleString()}</td>
                  <td><span className={statusColors[p.status] || "badge-neutral"}>{p.status}</span></td>
                  <td>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => printSalarySlip(p)} title="Print salary slip"
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono uppercase">
                        <Printer size={11} /> Slip
                      </button>
                      {p.status === "DRAFT" && (<>
                        <button onClick={() => openEdit(p)}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 uppercase font-mono">
                          <Edit2 size={11} /> Edit
                        </button>
                        <button onClick={() => handleConfirm(p.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 uppercase font-mono">
                          Confirm
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 uppercase font-mono">
                          <Trash2 size={11} />
                        </button>
                      </>)}
                      {p.status === "CONFIRMED" && (
                        <button onClick={() => handlePay(p.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 uppercase font-mono">
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr><td colSpan={12} className="text-center text-slate-500 py-8">
                  No payroll data. Click "Generate Payroll" to create.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleEdit} className="bg-[#0A0F1C] border border-[#2D3648] rounded-sm p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
                Edit Payroll — {editRecord.employee_name}
              </h3>
              <button type="button" onClick={() => setEditRecord(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Basic: <span className="text-white font-mono">Rs. {editRecord.basic_salary?.toLocaleString()}</span>
              {" · "}Payable Days: <span className="text-white font-mono">{editRecord.working_days}</span>
              {" · "}Per Day: <span className="text-amber-400 font-mono">Rs. {editRecord.working_days > 0 ? Math.round(editRecord.basic_salary / editRecord.working_days).toLocaleString() : 0}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "present_days",     label: "Present Days",          color: "text-emerald-400" },
                { key: "absent_days",      label: "Absent Days",           color: "text-red-400" },
                { key: "half_days",        label: "Half Days",             color: "text-amber-400" },
                { key: "overtime_hours",   label: "Overtime Hours",        color: "text-blue-400" },
                { key: "overtime_amount",  label: "Overtime Amount",       color: "text-blue-400" },
                { key: "absent_deduction", label: "Absent Deduction",      color: "text-red-400" },
                { key: "loan_deduction",   label: "Loan Deduction",        color: "text-amber-400" },
                { key: "net_salary",       label: "Net Salary (override)", color: "text-white font-bold" },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className={"block text-xs uppercase mb-1 " + color} style={{ fontFamily: "Barlow Condensed" }}>{label}</label>
                  <input type="number" step="0.01" value={editForm[key]}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full bg-[#050810] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none focus:border-amber-500/50" />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3">Leave Net Salary blank to auto-recalculate.</p>
            <div className="flex gap-2 mt-4">
              <button type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs flex-1"
                style={{ fontFamily: "Barlow Condensed" }}>Save Changes</button>
              <button type="button" onClick={() => setEditRecord(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-4 text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}