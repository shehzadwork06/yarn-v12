import { useState, useEffect } from "react";
import { saleReturnsAPI, salesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, RotateCcw, XCircle, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useBusinessMode } from "../context/BusinessModeContext";

const RESTOCK_LOCATIONS = ['FINISHED_STORE', 'STORE', 'CHEMICAL_STORE'];

export default function SaleReturnsPage() {
  const { businessMode } = useBusinessMode();
  const defaultUnit = businessMode === "CHEMICAL" ? "Kg" : "No Of Cones";
  const [returns, setReturns] = useState([]);
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);
  const [form, setForm] = useState({
    sale_id: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    restock_location: 'FINISHED_STORE',
  });
  const [items, setItems] = useState([]);

  // Edit modal
  const [editModal,  setEditModal]  = useState(false);
  const [editReturn, setEditReturn] = useState(null);
  const [editForm,   setEditForm]   = useState({ date: '', reason: '', notes: '', restock_location: 'FINISHED_STORE' });
  const [editItems,  setEditItems]  = useState([]);

  // Receipt modal
  const [receiptReturn, setReceiptReturn] = useState(null);

  const load = () => saleReturnsAPI.list().then(r => setReturns(r.data));

  useEffect(() => {
    load();
    salesAPI.list().then(r => setSales(r.data));
  }, []);

  // When sale is selected, load its items
  const handleSaleSelect = async (saleId) => {
    setForm(f => ({ ...f, sale_id: saleId }));
    setItems([]);
    setSaleDetail(null);
    if (!saleId) return;
    try {
      const { data } = await salesAPI.get(saleId);
      setSaleDetail(data);
      setItems((data.items || []).map(item => ({
        lot_id: item.lot_id,
        product_id: item.product_id,
        lot_number: item.lot_number,
        product_name: item.product_name,
        unit: item.unit || defaultUnit,
        original_qty: item.quantity,
        rate: item.rate,
        quantity: '',
      })));
    } catch {
      toast.error("Failed to load sale details");
    }
  };

  const updateItemQty = (idx, qty) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: qty } : it));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const returnItems = items
      .filter(it => parseFloat(it.quantity) > 0)
      .map(it => ({
        lot_id: it.lot_id,
        product_id: it.product_id,
        quantity: parseFloat(it.quantity),
        rate: it.rate,
      }));

    if (!returnItems.length) {
      toast.error("Enter a return quantity for at least one item");
      return;
    }

    try {
      await saleReturnsAPI.create({ ...form, items: returnItems });
      toast.success("Sale return recorded — stock restored");
      setShowForm(false);
      setForm({ sale_id: '', date: new Date().toISOString().split('T')[0], reason: '', notes: '', restock_location: 'FINISHED_STORE' });
      setItems([]);
      setSaleDetail(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error creating return");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this return? All stock and ledger effects will be reversed.")) return;
    try {
      await saleReturnsAPI.cancel(id);
      toast.success("Return cancelled and reversed");
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error cancelling return");
    }
  };

  const viewDetail = async (id) => {
    const { data } = await saleReturnsAPI.get(id);
    setSelected(data);
  };

  const openEdit = async (id) => {
    try {
      const { data } = await saleReturnsAPI.get(id);
      setEditReturn(data);
      setEditForm({ date: data.date, reason: data.reason, notes: data.notes || '', restock_location: data.restock_location || 'FINISHED_STORE' });
      setEditItems((data.items || []).map(item => ({
        lot_id: item.lot_id, product_id: item.product_id,
        lot_number: item.lot_number, product_name: item.product_name,
        unit: item.unit || defaultUnit,
        rate: item.rate, quantity: String(item.quantity),
      })));
      setEditModal(true);
    } catch { toast.error("Could not load return for editing"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const returnItems = editItems
      .filter(it => parseFloat(it.quantity) > 0)
      .map(it => ({ lot_id: it.lot_id, product_id: it.product_id, quantity: parseFloat(it.quantity), rate: it.rate }));
    if (!returnItems.length) { toast.error("Enter a quantity for at least one item"); return; }
    try {
      await saleReturnsAPI.update(editReturn.id, { ...editForm, items: returnItems });
      toast.success("Sale return updated");
      setEditModal(false);
      load();
      if (selected?.id === editReturn.id) {
        const { data } = await saleReturnsAPI.get(editReturn.id);
        setSelected(data);
      }
    } catch (err) { toast.error(err.response?.data?.error || "Error updating return"); }
  };

  const openReceipt = async (id) => {
    try {
      const { data } = await saleReturnsAPI.get(id);
      setReceiptReturn(data);
    } catch { toast.error("Could not load return details"); }
  };

  const printReceipt = (ret) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(251, 191, 36); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('GH & Sons Enterprises', pageW / 2, 10, { align: 'center' });
    doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text('Sale Return / Credit Note', pageW / 2, 16, { align: 'center' });
    doc.setFontSize(6.5); doc.setTextColor(100, 116, 139);
    doc.text('Industrial Area, Lahore  |  Tel: +92-XXX-XXXXXXX', pageW / 2, 21, { align: 'center' });

    let y = 34;
    doc.setFillColor(30, 39, 56); doc.rect(10, y, pageW - 20, 18, 'F');
    doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('RETURN #', 13, y + 5);
    doc.setTextColor(251, 191, 36); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(ret.return_number, 13, y + 12);
    doc.setTextColor(148, 163, 184); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text('CUSTOMER', pageW / 2, y + 5, { align: 'center' });
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(ret.customer_name || '-', pageW / 2, y + 12, { align: 'center' });
    doc.setTextColor(148, 163, 184); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text('DATE', pageW - 13, y + 5, { align: 'right' });
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(ret.date, pageW - 13, y + 12, { align: 'right' });
    y += 24;

    doc.setFillColor(20, 30, 48); doc.rect(10, y, pageW - 20, 9, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(148, 163, 184);
    doc.text('Against Sale:', 13, y + 5.5);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(251, 191, 36);
    doc.text(ret.sale_number || '-', 35, y + 5.5);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
    doc.text('Reason:', pageW / 2 - 10, y + 5.5);
    doc.setFont('helvetica', 'italic'); doc.setTextColor(200, 210, 220);
    doc.text(ret.reason || '-', pageW / 2 + 5, y + 5.5);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text('Restock: ' + (ret.restock_location || '-'), pageW - 13, y + 5.5, { align: 'right' });
    y += 15;

    autoTable(doc, {
      startY: y,
      head: [['Lot #', 'Product', 'Qty', 'Rate', 'Amount (PKR)']],
      body: (ret.items || []).map(item => [
        item.lot_number || '-', item.product_name,
        `${item.quantity?.toLocaleString() ?? ''} ${item.unit || defaultUnit}`.trim(),
        item.rate?.toLocaleString(),
        ((item.quantity || 0) * (item.rate || 0)).toLocaleString(),
      ]),
      headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2, lineColor: [200, 210, 220], lineWidth: 0.1 },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 10, right: 10 },
    });

    let tY = doc.lastAutoTable.finalY + 6;
    const rX = pageW - 10; const lX = pageW / 2 + 5;
    doc.setFillColor(15, 23, 42); doc.rect(lX - 2, tY - 4, rX - lX + 4, 9, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); doc.text('TOTAL CREDIT AMOUNT', lX, tY);
    doc.setTextColor(251, 191, 36);
    doc.text('PKR ' + (ret.total_amount?.toLocaleString() || '0'), rX, tY, { align: 'right' });
    if (ret.notes) {
      tY += 10;
      doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(120, 130, 145);
      doc.text('Note: ' + ret.notes, 10, tY);
    }
    doc.setFontSize(6); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal');
    doc.text('GH & Sons Enterprises — Sale Return / Credit Note', pageW / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });
    doc.save('sale-return-' + ret.return_number + '.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Sale Returns
          </h1>
          <p className="text-sm text-slate-500 mt-1">Process customer returns and restock goods</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSelected(null); }}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: 'Barlow Condensed' }}
        >
          <Plus size={16} /> New Return
        </button>
      </div>

      {/* New Return Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="industrial-card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>
            New Sale Return
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
            <div className="lg:col-span-2">
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Sale *</label>
              <select
                value={form.sale_id}
                onChange={e => handleSaleSelect(e.target.value)}
                required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
              >
                <option value="">Select sale</option>
                {sales.filter(s => s.status !== 'CANCELLED').map(s => (
                  <option key={s.id} value={s.id}>{s.sale_number} — {s.customer_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Date *</label>
              <input
                type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Restock Location</label>
              <select
                value={form.restock_location}
                onChange={e => setForm({ ...form, restock_location: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
              >
                {RESTOCK_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Reason *</label>
              <input
                value={form.reason} required
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Quality issue"
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Notes</label>
            <input
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
            />
          </div>

          {/* Items */}
          {items.length > 0 && (
            <>
              <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Barlow Condensed' }}>
                Return Quantities <span className="text-slate-600 normal-case">(leave 0 for items not being returned)</span>
              </h4>
              <div className="space-y-2 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 items-center bg-[#0A0F1C] border border-[#2D3648] rounded-sm px-3 py-2">
                    <div>
                      <p className="text-slate-200 text-xs font-medium">{item.product_name}</p>
                      <p className="text-amber-400 font-mono text-xs">{item.lot_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sold Qty</p>
                      <p className="text-slate-300 font-mono text-sm">{item.original_qty} {item.unit || defaultUnit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="text-slate-300 font-mono text-sm">{item.rate}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Return Qty ({item.unit || defaultUnit})</label>
                      <input
                        type="number" min="0" max={item.original_qty} step="0.01"
                        value={item.quantity}
                        onChange={e => updateItemQty(idx, e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#111827] border border-[#2D3648] text-white rounded-sm px-3 h-9 text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {form.sale_id && items.length === 0 && (
            <p className="text-slate-500 text-sm mb-4">Loading sale items...</p>
          )}

          <div className="flex gap-2">
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs" style={{ fontFamily: 'Barlow Condensed' }}>
              Record Return
            </button>
            <button type="button" onClick={() => { setShowForm(false); setSaleDetail(null); setItems([]); }}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Returns Table + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} industrial-card`}>
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Return #</th><th>Sale #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(r => (
                <tr key={r.id} onClick={() => viewDetail(r.id)} className="cursor-pointer">
                  <td className="text-amber-400 font-mono text-xs">{r.return_number}</td>
                  <td className="text-slate-400 font-mono text-xs">{r.sale_number}</td>
                  <td className="text-slate-200">{r.customer_name}</td>
                  <td className="text-slate-400 font-mono text-xs">{r.date}</td>
                  <td className="text-white font-mono font-bold">{r.total_amount?.toLocaleString()}</td>
                  <td>
                    <span className={r.status === 'COMPLETED' ? 'badge-success' : 'badge-error'}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-500 py-10">
                    <RotateCcw size={24} className="mx-auto mb-2 text-slate-700" />
                    No sale returns yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="industrial-card p-5 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Return Detail</h3>
              <div className="flex items-center gap-3">
                {selected.status === 'COMPLETED' && (
                  <button onClick={() => openEdit(selected.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors"
                    style={{ fontFamily: 'Barlow Condensed' }}>EDIT</button>
                )}
                <button onClick={() => openReceipt(selected.id)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  <Printer size={11} /> Print
                </button>
                <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-white">CLOSE</button>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Return #</span><span className="text-amber-400 font-mono">{selected.return_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sale #</span><span className="text-slate-300 font-mono">{selected.sale_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="text-white">{selected.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="text-slate-300 font-mono">{selected.date}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="text-slate-300">{selected.reason}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Restock At</span><span className="badge-info">{selected.restock_location}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Amount</span><span className="text-amber-400 font-mono font-bold">{selected.total_amount?.toLocaleString()}</span></div>
              {selected.notes && <div className="flex justify-between"><span className="text-slate-500">Notes</span><span className="text-slate-400 text-xs">{selected.notes}</span></div>}

              {selected.items?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Returned Items</p>
                  {selected.items.map(item => (
                    <div key={item.id} className="bg-[#0A0F1C] border border-[#2D3648] p-3 rounded-sm mb-2 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-medium">{item.product_name}</span>
                        <span className="text-amber-400 font-mono">{item.lot_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Qty</span>
                        <span className="font-mono text-white">{item.quantity} {item.unit || defaultUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-mono text-emerald-400">{item.amount?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancel button — only for COMPLETED returns */}
              {selected.status === 'COMPLETED' && (
                <div className="mt-5 pt-4 border-t border-[#2D3648]">
                  <button
                    onClick={() => handleCancel(selected.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-700/40 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors"
                    style={{ fontFamily: 'Barlow Condensed' }}
                  >
                    <XCircle size={13} /> Cancel Return
                  </button>
                  <p className="text-xs text-slate-600 text-center mt-1">This will reverse all stock and ledger effects</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Sale Return Receipt Modal ─────────────────────────────────────── */}
      {receiptReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setReceiptReturn(null)}>
          <div className="bg-[#0D1424] border border-[#2D3648] rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="bg-[#0A0F1C] px-5 py-4 border-b border-[#1E2738] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Sale Return Receipt</span>
              </div>
              <button onClick={() => setReceiptReturn(null)} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={16} /></button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="text-center mb-5 pb-4 border-b border-[#1E2738]">
                <p className="text-amber-400 font-bold text-lg tracking-widest uppercase" style={{ fontFamily: 'Barlow Condensed' }}>GH & Sons Enterprises</p>
                <p className="text-slate-500 text-xs mt-0.5">Sale Return / Credit Note</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Return #', value: receiptReturn.return_number, cls: 'text-amber-400 font-mono font-bold' },
                  { label: 'Customer', value: receiptReturn.customer_name,  cls: 'text-slate-200 font-semibold truncate' },
                  { label: 'Date',     value: receiptReturn.date,           cls: 'text-slate-200 font-mono' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Barlow Condensed' }}>{label}</p>
                    <p className={`text-xs ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Barlow Condensed' }}>Against Sale</p>
                  <p className="text-xs text-amber-400 font-mono">{receiptReturn.sale_number}</p>
                </div>
                <div className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Barlow Condensed' }}>Reason</p>
                  <p className="text-xs text-slate-300 italic">{receiptReturn.reason}</p>
                </div>
                <div className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Barlow Condensed' }}>Restock At</p>
                  <p className="text-xs text-blue-400 font-mono">{receiptReturn.restock_location}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="grid grid-cols-[72px_1fr_55px_55px_75px] gap-x-2 px-2 mb-1">
                  {['Lot #', 'Product', 'Qty', 'Rate', 'Amount'].map(h => (
                    <p key={h} className="text-[9px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>{h}</p>
                  ))}
                </div>
                <div className="border border-[#1E2738] rounded-sm overflow-hidden">
                  {(receiptReturn.items || []).map((item, i) => (
                    <div key={i} className={`grid grid-cols-[72px_1fr_55px_55px_75px] gap-x-2 px-3 py-2 items-center border-b border-[#1E2738] last:border-0 ${i % 2 === 0 ? 'bg-[#0A0F1C]' : 'bg-[#0D1424]'}`}>
                      <span className="text-amber-400/80 font-mono text-[10px]">{item.lot_number || '—'}</span>
                      <span className="text-slate-300 text-xs truncate">{item.product_name}</span>
                      <span className="text-slate-400 text-xs text-right font-mono">{item.quantity?.toLocaleString()} {item.unit || defaultUnit}</span>
                      <span className="text-slate-400 text-xs text-right font-mono">{item.rate?.toLocaleString()}</span>
                      <span className="text-white text-xs text-right font-mono font-semibold">{((item.quantity||0)*(item.rate||0)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center bg-[#0A0F1C] border border-[#2D3648] rounded-sm px-3 py-2 mb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Total Credit Amount</span>
                <span className="text-amber-400 font-mono font-bold">PKR {receiptReturn.total_amount?.toLocaleString()}</span>
              </div>
              {receiptReturn.notes && <p className="text-xs text-slate-500 italic px-1">Note: {receiptReturn.notes}</p>}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-[#1E2738] flex gap-2 shrink-0">
              <button onClick={() => printReceipt(receiptReturn)}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 text-xs transition-all active:scale-95"
                style={{ fontFamily: 'Barlow Condensed' }}>
                <Printer size={14} /> Print / Download PDF
              </button>
              <button onClick={() => setReceiptReturn(null)} className="px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 text-xs transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Sale Return Modal ─────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3648]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>
                Edit Return — {editReturn?.return_number}
              </h3>
              <button type="button" onClick={() => setEditModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Date *</label>
                  <input type="date" value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Restock Location</label>
                  <select value={editForm.restock_location}
                    onChange={e => setEditForm({ ...editForm, restock_location: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60">
                    {RESTOCK_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Reason *</label>
                  <input required value={editForm.reason}
                    onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Notes</label>
                  <input value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
              </div>

              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Barlow Condensed' }}>
                Items — lot numbers locked, adjust return quantities only
              </p>
              <div className="space-y-2 mb-4">
                {editItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 items-center bg-[#0A0F1C] border border-[#2D3648] rounded-sm px-3 py-2">
                    <div>
                      <p className="text-slate-200 text-xs font-medium">{item.product_name}</p>
                      <p className="text-amber-400 font-mono text-xs">{item.lot_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="text-slate-300 font-mono text-sm">{item.rate?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Return Qty ({item.unit || defaultUnit})</label>
                      <input type="number" min="0" step="0.01" value={item.quantity}
                        onChange={e => { const n=[...editItems]; n[idx].quantity=e.target.value; setEditItems(n); }}
                        className="w-full bg-[#111827] border border-[#2D3648] text-white rounded-sm px-3 h-9 text-sm outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Amount</p>
                      <p className="text-white font-mono text-sm">{((parseFloat(item.quantity)||0)*(item.rate||0)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#2D3648]">
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider mr-3" style={{ fontFamily: 'Barlow Condensed' }}>New Total</span>
                  <span className="text-amber-400 font-mono font-bold">
                    PKR {editItems.reduce((s,i) => s + (parseFloat(i.quantity)||0)*(i.rate||0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-6 text-xs transition-all active:scale-95"
                  style={{ fontFamily: 'Barlow Condensed' }}>Save Changes</button>
                <button type="button" onClick={() => setEditModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}