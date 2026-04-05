
import { useState, useEffect } from "react";
import { gatePassAPI } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useBusinessMode } from "../context/BusinessModeContext";

export default function GatePassPage() {
  const { businessMode } = useBusinessMode();
  const defaultUnit = businessMode === "CHEMICAL" ? "Kg" : "No Of Cones";
  const [passes, setPasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ verified_by: '', vehicle_number: '', notes: '' });

  const load = () => gatePassAPI.list().then(r => setPasses(r.data));
  useEffect(() => { load(); }, []);

  const totalQtyLabel = (gp) => {
    if (!gp) return "";
    const u = [...new Set((gp.items || []).map((i) => i.unit || defaultUnit))];
    return `${gp.total_quantity ?? ""}${u.length === 1 ? ` ${u[0]}` : ""}`;
  };

  const viewDetails = async (id) => {
    const { data } = await gatePassAPI.get(id);
    setSelected(data);
  };

  const handleVerify = async (id) => {
    if (!verifyForm.verified_by.trim()) {
      toast.error("Verified by is required");
      return;
    }
    if (!verifyForm.vehicle_number.trim()) {
      toast.error("Vehicle number is required");
      return;
    }
    try {
      await gatePassAPI.verify(id, verifyForm);
      toast.success("Gate pass verified");
      setSelected(null);
      setVerifyForm({ verified_by: '', vehicle_number: '', notes: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  // ─── PDF EXPORT ───────────────────────────────────────────────
  const printGatePass = (gp) => {
    if (!gp.verified_by) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Top header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 28, "F");

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("GH & Sons Enterprises", 14, 12);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("OUTWARD GATE PASS", 14, 19);

    // GP number badge top-right
    doc.setFillColor(251, 191, 36);
    doc.roundedRect(pageW - 58, 6, 44, 16, 2, 2, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(gp.gate_pass_number, pageW - 36, 16, { align: "center" });

    // ── Info grid
    let y = 38;

    const drawInfoRow = (label, value, x1, x2, rowY) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(label, x1, rowY);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(String(value || "-"), x2, rowY);
    };

    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.rect(14, y - 5, pageW - 28, 42, "S");

    drawInfoRow("SALE NUMBER", gp.sale_number, 18, 52, y + 2);
    drawInfoRow("DATE", gp.date, 120, 144, y + 2);

    drawInfoRow("CUSTOMER", gp.customer_name, 18, 52, y + 12);
    if (gp.customer_phone) drawInfoRow("PHONE", gp.customer_phone, 120, 144, y + 12);

    drawInfoRow("TOTAL QUANTITY", totalQtyLabel(gp), 18, 52, y + 22);

    drawInfoRow("VEHICLE NUMBER", gp.vehicle_number || "-", 18, 52, y + 32);
    drawInfoRow("VERIFIED BY", gp.verified_by, 120, 144, y + 32);

    y += 52;

    // ── Items table
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("DISPATCHED ITEMS", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["#", "Product", "Lot #", "Quantity"]],
      body: (gp.items || []).map((item, idx) => [
        idx + 1,
        item.product_name,
        item.lot_number,
        `${item.quantity} ${item.unit || defaultUnit}`,
      ]),
      headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [247, 249, 252] },
      styles: { cellPadding: 3, lineColor: [210, 218, 230], lineWidth: 0.15 },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        3: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 6;

    // ── Total Quantity row (no price)
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, pageW - 28, 10, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL QUANTITY", 18, y + 6.5);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${totalQtyLabel(gp)}`, pageW - 18, y + 6.5, { align: "right" });

    y += 20;


    // Signature box
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    doc.rect(pageW - 80, y, 66, 24, "S");
    doc.setTextColor(130, 140, 155);
    doc.setFontSize(7.5);
    doc.text("Authorized Signature", pageW - 47, y + 20, { align: "center" });
    doc.line(pageW - 72, y + 16, pageW - 22, y + 16);

    // ── Footer
    doc.setFillColor(245, 247, 250);
    doc.rect(0, pageH - 14, pageW, 14, "F");
    doc.setTextColor(150, 160, 175);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("GH & Sons Enterprises — This is a system-generated gate pass", 14, pageH - 5);
    doc.text(`Printed: ${new Date().toLocaleString()}`, pageW - 14, pageH - 5, { align: "right" });

    doc.save(`gate-pass-${gp.gate_pass_number}.pdf`);
  };

  return (
    <div data-testid="gate-pass-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Gate Passes</h1>
        <p className="text-sm text-slate-500 mt-1">Outward gate passes for dispatched goods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} industrial-card`} data-testid="gate-passes-table">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>GP #</th><th>Sale #</th><th>Customer</th><th>Date</th><th>Qty</th><th>Verified</th><th>Print</th>
              </tr>
            </thead>
            <tbody>
              {passes.map(gp => (
                <tr key={gp.id} onClick={() => viewDetails(gp.id)} className="cursor-pointer">
                  <td className="text-amber-400 font-mono text-xs">{gp.gate_pass_number}</td>
                  <td className="text-slate-400 font-mono text-xs">{gp.sale_number}</td>
                  <td className="text-slate-200">{gp.customer_name}</td>
                  <td className="text-slate-400 font-mono text-xs">{gp.date}</td>
                  <td className="text-white font-mono">{gp.total_quantity}</td>
                  <td>{gp.verified_by ? <span className="badge-success">Verified</span> : <span className="badge-warning">Pending</span>}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {gp.verified_by ? (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { data } = await gatePassAPI.get(gp.id);
                          printGatePass(data);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-600/30 rounded-sm text-xs transition-colors"
                        title="Print Gate Pass"
                      >
                        <Printer size={11} /> Print
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {passes.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-8">No gate passes</td></tr>}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="industrial-card p-5 animate-slide-in" data-testid="gate-pass-detail">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Gate Pass Detail</h3>
              {selected.verified_by && (
                <button
                  onClick={() => printGatePass(selected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-600/30 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'Barlow Condensed' }}
                >
                  <Printer size={12} /> Print PDF
                </button>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">GP #</span><span className="text-amber-400 font-mono">{selected.gate_pass_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sale #</span><span className="text-slate-300 font-mono">{selected.sale_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="text-white">{selected.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="text-white font-mono">{totalQtyLabel(selected)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="text-amber-400 font-mono">{selected.net_amount?.toLocaleString()}</span></div>

              {selected.items?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Items</p>
                  {selected.items.map(item => (
                    <div key={item.id} className="bg-[#0A0F1C] border border-[#2D3648] p-2 rounded-sm mb-1 text-xs flex justify-between">
                      <span>{item.product_name} ({item.lot_number})</span>
                      <span className="font-mono">{item.quantity} {item.unit || defaultUnit}</span>
                    </div>
                  ))}
                </div>
              )}

              {!selected.verified_by && (
                <div className="mt-4 pt-4 border-t border-[#2D3648]">
                  <p className="text-xs text-slate-400 uppercase mb-2">Verify Gate Pass</p>

                  <div className="mb-2">
                    <input
                      placeholder="Verified by *"
                      value={verifyForm.verified_by}
                      onChange={e => setVerifyForm({...verifyForm, verified_by: e.target.value})}
                      className={`w-full bg-[#0A0F1C] border text-slate-200 rounded-sm px-3 h-9 text-sm outline-none transition-colors ${
                        !verifyForm.verified_by ? 'border-[#2D3648]' : 'border-emerald-600/50'
                      }`}
                    />
                  </div>

                  <div className="mb-2">
                    <input
                      placeholder="Vehicle number *"
                      value={verifyForm.vehicle_number}
                      onChange={e => setVerifyForm({...verifyForm, vehicle_number: e.target.value})}
                      className={`w-full bg-[#0A0F1C] border text-slate-200 rounded-sm px-3 h-9 text-sm outline-none transition-colors ${
                        !verifyForm.vehicle_number ? 'border-[#2D3648]' : 'border-emerald-600/50'
                      }`}
                    />
                    {!verifyForm.vehicle_number && (
                      <p className="text-xs text-red-400/70 mt-1">Vehicle number is required</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleVerify(selected.id)}
                    data-testid="verify-gate-pass"
                    disabled={!verifyForm.verified_by.trim() || !verifyForm.vehicle_number.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase rounded-sm h-9 text-xs transition-all"
                    style={{ fontFamily: 'Barlow Condensed' }}
                  >
                    Verify & Dispatch
                  </button>
                </div>
              )}

              {selected.verified_by && (
                <div className="mt-4 pt-4 border-t border-[#2D3648]">
                  <div className="flex items-center gap-2 text-emerald-400"><CheckCircle size={16} /><span className="text-xs uppercase">Verified by {selected.verified_by}</span></div>
                  {selected.vehicle_number && <p className="text-xs text-slate-500 mt-1">Vehicle: {selected.vehicle_number}</p>}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 text-xs text-slate-500 hover:text-white">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}