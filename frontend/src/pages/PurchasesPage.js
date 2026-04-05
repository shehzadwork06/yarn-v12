
import { useState, useEffect, useRef } from "react";
import { purchasesAPI, suppliersAPI, productsAPI, categoriesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, X, ChevronDown, Package, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useBusinessMode } from "../context/BusinessModeContext";

// ─── Searchable Product Picker ────────────────────────────────────────────────
function ProductPicker({ value, products, categories, businessMode, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [catId,  setCatId]  = useState('');
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── KEY FIX: include CHEMICAL_FINISHED for chemical workspace ──────────────
  const PURCHASE_TYPES = businessMode === 'CHEMICAL'
    ? ['CHEMICAL_RAW', 'CHEMICAL_FINISHED']
    : ['RAW_YARN', 'DYED_YARN'];

  const filtered = products.filter(p => {
    if (!PURCHASE_TYPES.includes(p.type)) return false;
    if (catId && String(p.category_id) !== String(catId)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) ||
             p.shade_code?.toLowerCase().includes(q) ||
             p.chemical_code?.toLowerCase().includes(q);
    }
    return true;
  });

  const selected = products.find(p => String(p.id) === String(value));
  const handleSelect = (p) => { onChange(p.id, p.type); setOpen(false); setSearch(''); };
  const handleClear  = (e) => { e.stopPropagation(); onChange('', ''); };

  return (
    <div ref={ref} className="relative col-span-2">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 h-9 px-3 text-xs rounded-sm border transition-colors outline-none
          ${open ? 'border-amber-500 bg-[#0A0F1C]' : 'border-[#2D3648] bg-[#0A0F1C] hover:border-amber-500/40'}
          ${selected ? 'text-slate-200' : 'text-slate-500'}`}>
        <span className="flex items-center gap-2 truncate">
          <Package size={11} className="shrink-0 text-slate-500" />
          {selected
            ? <span className="truncate">{selected.name} <span className="text-slate-500">({selected.type})</span>{selected.unit ? <span className="text-slate-600 ml-1 font-mono">· {selected.unit}</span> : null}</span>
            : <span>Select product…</span>}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span onClick={handleClear} className="text-slate-600 hover:text-slate-300 p-0.5 rounded">
              <X size={10} />
            </span>
          )}
          <ChevronDown size={11} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/60">
          <div className="flex gap-2 p-2 border-b border-[#2D3648]">
            {/* Category filter — yarn workspace only */}
            {businessMode !== 'CHEMICAL' && (
              <select value={catId} onChange={e => { setCatId(e.target.value); setSearch(''); }}
                className="flex-1 bg-[#1E2738] border border-slate-700 text-slate-300 rounded-sm px-2 h-7 text-xs outline-none focus:border-amber-500 cursor-pointer"
                style={{ fontFamily: 'Barlow Condensed' }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            )}
            <div className="relative flex-1">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-[#1E2738] border border-slate-700 text-slate-200 rounded-sm pl-6 pr-2 h-7 text-xs outline-none focus:border-amber-500 placeholder:text-slate-600" />
              {search && (
                <button type="button" onClick={() => setSearch('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300">
                  <X size={9} />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <div className="py-6 text-center text-xs text-slate-600">No products match</div>
              : filtered.map(p => (
                <button key={p.id} type="button" onClick={() => handleSelect(p)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-amber-500/10 transition-colors text-left
                    ${String(p.id) === String(value) ? 'bg-amber-500/10 text-amber-400' : 'text-slate-300'}`}>
                  <span className="truncate">{p.name}</span>
                  <span className="text-[10px] text-slate-600 font-mono ml-2 shrink-0">{p.type}</span>
                </button>
              ))}
          </div>
          <div className="px-3 py-1.5 border-t border-[#2D3648] text-[10px] text-slate-600 font-mono">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PurchasesPage() {
  const { businessMode } = useBusinessMode();
  const [purchases,  setPurchases]  = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [suppliers,  setSuppliers]  = useState([]);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [form, setForm] = useState({
    supplier_id: '', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [items, setItems] = useState([
    { product_id: '', product_type: '', quantity: '', rate: '', shade_code: '', chemical_code: '' },
  ]);

  // ── Edit modal state ───────────────────────────────────────────────────────
  const [editModal,   setEditModal]   = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [editForm,    setEditForm]    = useState({ supplier_id: '', date: '', notes: '' });
  const [editItems,   setEditItems]   = useState([]);

  const defaultUnit = businessMode === 'CHEMICAL' ? 'Kg' : 'No Of Cones';
  const unitForProductId = (productId) => {
    if (!productId) return defaultUnit;
    const p = products.find((x) => String(x.id) === String(productId));
    return p?.unit || defaultUnit;
  };

  const load = () => purchasesAPI.list().then(r => setPurchases(r.data)).catch(() => {});

  useEffect(() => {
    load();
    suppliersAPI.list().then(r => setSuppliers(r.data)).catch(() => {});
    productsAPI.list().then(r => setProducts(r.data)).catch(() => {});
    if (businessMode !== 'CHEMICAL') {
      categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
    }
  }, []);

  const addItem    = () => setItems([...items, { product_id: '', product_type: '', quantity: '', rate: '', shade_code: '', chemical_code: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const n = [...items]; n[i][field] = val; setItems(n);
  };
  const handleProductSelect = (i, id, type) => {
    const n = [...items];
    n[i].product_id   = id;
    n[i].product_type = type;
    n[i].shade_code   = '';
    n[i].chemical_code = '';
    setItems(n);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity:   parseFloat(item.quantity),
          rate:       parseFloat(item.rate),
          // yarn workspace: send shade_code for DYED_YARN
          ...(item.product_type === 'DYED_YARN' && item.shade_code
            ? { shade_code: item.shade_code } : {}),
          // chem workspace: send chemical_code for CHEMICAL_FINISHED
          ...(item.product_type === 'CHEMICAL_FINISHED' && item.chemical_code
            ? { chemical_code: item.chemical_code } : {}),
        })),
      };
      await purchasesAPI.create(payload);
      toast.success("Purchase created — lot numbers assigned");
      setShowForm(false);
      setForm({ supplier_id: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setItems([{ product_id: '', product_type: '', quantity: '', rate: '', shade_code: '', chemical_code: '' }]);
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error creating purchase"); }
  };

  const viewDetail = async (id) => {
    try {
      const { data } = await purchasesAPI.get(id);
      setSelected(data);
    } catch { toast.error("Failed to load detail"); }
  };

  // ── Edit helpers ───────────────────────────────────────────────────────────
  const openEditModal = (purchase) => {
    setEditId(purchase.id);
    setEditForm({
      supplier_id: String(purchase.supplier_id),
      date:        purchase.date,
      notes:       purchase.notes || '',
    });
    setEditItems(
      (purchase.items || []).map(item => ({
        product_id:    String(item.product_id),
        product_type:  item.product_type || '',
        quantity:      String(item.quantity),
        rate:          String(item.rate),
        shade_code:    item.shade_code    || '',
        chemical_code: item.chemical_code || '',
        lot_id:        item.lot_id,
        unit:          item.unit || unitForProductId(item.product_id),
      }))
    );
    setEditModal(true);
  };

  const updateEditItem = (i, field, val) => {
    const n = [...editItems]; n[i][field] = val; setEditItems(n);
  };
  const handleEditProductSelect = (i, id, type) => {
    const n = [...editItems];
    n[i].product_id    = id;
    n[i].product_type  = type;
    n[i].shade_code    = '';
    n[i].chemical_code = '';
    setEditItems(n);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        items: editItems.map(item => ({
          product_id: parseInt(item.product_id),
          quantity:   parseFloat(item.quantity),
          rate:       parseFloat(item.rate),
          ...(item.product_type === 'DYED_YARN' && item.shade_code
            ? { shade_code: item.shade_code } : {}),
          ...(item.product_type === 'CHEMICAL_FINISHED' && item.chemical_code
            ? { chemical_code: item.chemical_code } : {}),
        })),
      };
      await purchasesAPI.update(editId, payload);
      toast.success("Purchase updated successfully");
      setEditModal(false);
      // Refresh list and re-select updated detail
      await load();
      const { data } = await purchasesAPI.get(editId);
      setSelected(data);
    } catch (err) { toast.error(err.response?.data?.error || "Error updating purchase"); }
  };

  const isChemical = businessMode === 'CHEMICAL';
  // yarn: product(2) + qty + rate + shade_code + remove = 6 cols
  // chem: product(2) + qty + rate + chemical_code(for FINISHED) + remove = 6 cols
  const colClass = 'grid-cols-6';

  const printPurchaseReceipt = (purchase) => {
    if (!purchase) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });
    const pageW = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("GH & Sons Enterprises", pageW / 2, 10, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Purchase Receipt", pageW / 2, 16, { align: "center" });
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(
      "Industrial Area, Lahore  |  Tel: +92-XXX-XXXXXXX",
      pageW / 2,
      21,
      { align: "center" },
    );

    let y = 34;

    // Meta strip
    doc.setFillColor(30, 39, 56);
    doc.rect(10, y, pageW - 20, 18, "F");

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("PO #", 13, y + 5);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(purchase.purchase_number, 13, y + 12);

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("SUPPLIER", pageW / 2, y + 5, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(purchase.supplier_name, pageW / 2, y + 12, { align: "center" });

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("DATE", pageW - 13, y + 5, { align: "right" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(purchase.date, pageW - 13, y + 12, { align: "right" });

    y += 24;

    // Items table — includes category for yarn products
    const productDisplay = (item) => {
      let display = item.product_name;
      if (businessMode === "YARN" && item.category_name) {
        display += ` (${item.category_name})`;
      }
      return display;
    };

    autoTable(doc, {
      startY: y,
      head: [[`Lot #`, `Product`, `Qty`, `Rate / unit`, `Amount (PKR)`]],
      body: (purchase.items || []).map((item) => [
        item.lot_number || "-",
        productDisplay(item),
        `${item.quantity?.toLocaleString() ?? ""} ${item.unit || defaultUnit}`.trim(),
        item.rate?.toLocaleString(),
        ((item.quantity || 0) * (item.rate || 0)).toLocaleString(),
      ]),
      headStyles: {
        fillColor: [30, 39, 56],
        textColor: [251, 191, 36],
        fontStyle: "bold",
        fontSize: 7,
      },
      bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2, lineColor: [200, 210, 220], lineWidth: 0.1 },
      columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right", fontStyle: "bold" } },
      margin: { left: 10, right: 10 },
    });

    // Totals block
    let tY = doc.lastAutoTable.finalY + 5;
    const rX = pageW - 10;
    const lX = pageW / 2 + 5;

    // Total row
    doc.setFillColor(15, 23, 42);
    doc.rect(lX - 2, tY - 4, rX - lX + 4, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("TOTAL AMOUNT", lX, tY);
    doc.setTextColor(251, 191, 36);
    doc.text(`PKR ${purchase.total_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
    tY += 8;

    // Notes
    if (purchase.notes) {
      doc.setTextColor(120, 130, 145);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Note: ${purchase.notes}`,
        10,
        doc.internal.pageSize.getHeight() - 12,
      );
    }

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for your business — GH & Sons Enterprises",
      pageW / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" },
    );

    doc.save(`purchase-receipt-${purchase.purchase_number}.pdf`);
  };

  return (
    <div data-testid="purchases-page" className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: 'Barlow Condensed' }}>{isChemical ? 'Chemical Purchases' : 'Yarn Purchases'}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isChemical ? 'Chemical procurement — lot numbers auto-assigned' : 'Yarn procurement — lot numbers auto-assigned'}
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setSelected(null); }}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> New Purchase
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="industrial-card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4"
            style={{ fontFamily: 'Barlow Condensed' }}>New Purchase Order</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Supplier *</label>
              <select required value={form.supplier_id}
                onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
            </div>
          </div>

          {/* Column headers */}
          <div className={`grid ${colClass} gap-3 mb-1 px-0.5`}>
            <span className="col-span-2 text-[10px] text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>Product</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>Qty</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>Rate</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>
              {isChemical ? 'Chemical Code' : 'Shade Code'}
            </span>
            <span />
          </div>

          {/* Item rows */}
          {items.map((item, i) => {
            const isDyed     = item.product_type === 'DYED_YARN';
            const isFinished = item.product_type === 'CHEMICAL_FINISHED';

            return (
              <div key={i} className={`grid ${colClass} gap-3 mb-2 items-center`}>
                <ProductPicker
                  value={item.product_id}
                  products={products}
                  categories={categories}
                  businessMode={businessMode}
                  onChange={(id, type) => handleProductSelect(i, id, type)}
                />
                <input type="number" placeholder={`Qty (${unitForProductId(item.product_id)})`} required value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', e.target.value)}
                  className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
                <input type="number" placeholder="Rate" required value={item.rate}
                  onChange={e => updateItem(i, 'rate', e.target.value)}
                  className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />

                {/* Code field — shade for yarn DYED, chemical for chem FINISHED, N/A otherwise */}
                {isChemical
                  ? isFinished
                    ? <input placeholder="e.g. FA-300" value={item.chemical_code}
                        onChange={e => updateItem(i, 'chemical_code', e.target.value)}
                        className="bg-[#0A0F1C] border border-amber-500/30 text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors" />
                    : <div className="bg-[#0A0F1C]/50 border border-[#2D3648]/40 rounded-sm h-9 flex items-center px-3">
                        <span className="text-[10px] text-slate-600 italic">N/A — raw material</span>
                      </div>
                  : isDyed
                    ? <input placeholder="Shade code" value={item.shade_code}
                        onChange={e => updateItem(i, 'shade_code', e.target.value)}
                        className="bg-[#0A0F1C] border border-amber-500/30 text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors" />
                    : <div className="bg-[#0A0F1C]/50 border border-[#2D3648]/40 rounded-sm h-9 flex items-center px-3">
                        <span className="text-[10px] text-slate-600 italic">N/A — undyed</span>
                      </div>
                }

                <button type="button" onClick={() => removeItem(i)}
                  className="text-slate-600 hover:text-red-400 text-xs transition-colors text-center">
                  Remove
                </button>
              </div>
            );
          })}

          <button type="button" onClick={addItem}
            className="text-xs text-amber-400 hover:text-amber-300 mt-2 transition-colors">
            + Add Item
          </button>

          <div className="flex gap-2 mt-4">
            <button type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs transition-all active:scale-95"
              style={{ fontFamily: 'Barlow Condensed' }}>Create Purchase</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">Cancel</button>
          </div>
        </form>
      )}

      {/* Table + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} industrial-card`}>
          <table className="w-full erp-table">
            <thead>
              <tr><th>PO #</th><th>Supplier</th><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} onClick={() => viewDetail(p.id)} className="cursor-pointer">
                  <td className="text-amber-400 font-mono text-xs">{p.purchase_number}</td>
                  <td className="text-slate-200">{p.supplier_name}</td>
                  <td className="text-slate-400 font-mono text-xs">{p.date}</td>
                  <td className="text-white font-mono font-bold">{p.total_amount?.toLocaleString()}</td>
                  <td><span className="badge-success">{p.status}</span></td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-500 py-8">No purchases yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="industrial-card p-5 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white uppercase"
                style={{ fontFamily: 'Barlow Condensed' }}>Purchase Detail</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => printPurchaseReceipt(selected)}
                  className="text-xs text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors flex items-center gap-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  <Printer size={12} /> PRINT
                </button>
                <button
                  onClick={() => openEditModal(selected)}
                  className="text-xs text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors"
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  EDIT
                </button>
                <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-white">CLOSE</button>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                { l: 'PO #',     v: selected.purchase_number, cls: 'text-amber-400 font-mono' },
                { l: 'Supplier', v: selected.supplier_name,   cls: 'text-white' },
                { l: 'Date',     v: selected.date,            cls: 'text-slate-300 font-mono' },
                { l: 'Total',    v: `PKR ${selected.total_amount?.toLocaleString()}`, cls: 'text-amber-400 font-mono font-bold' },
              ].map(({ l, v, cls }) => (
                <div key={l} className="flex justify-between">
                  <span className="text-slate-500">{l}</span>
                  <span className={cls}>{v}</span>
                </div>
              ))}
            </div>
            {selected.items?.length > 0 && (
              <>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Items & Lot Numbers</p>
                {selected.items.map(item => (
                  <div key={item.id} className="bg-[#0A0F1C] border border-[#2D3648] p-3 rounded-sm mb-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">{item.product_name}</span>
                      <span className="text-amber-400 font-mono">LOT {item.lot_number}</span>
                    </div>
                    {businessMode === 'YARN' && item.category_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category</span>
                        <span className="font-mono text-amber-400">{item.category_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Qty × Rate</span>
                      <span className="font-mono text-white">{item.quantity} {item.unit || defaultUnit} × {item.rate}</span>
                    </div>
                    {item.shade_code && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shade</span>
                        <span className="font-mono text-amber-400">{item.shade_code}</span>
                      </div>
                    )}
                    {item.chemical_code && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chemical Code</span>
                        <span className="font-mono text-amber-400">{item.chemical_code}</span>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Purchase Modal ─────────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3648]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider"
                style={{ fontFamily: 'Barlow Condensed' }}>Edit Purchase Order</h3>
              <button type="button" onClick={() => setEditModal(false)}
                className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              {/* Header fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1"
                    style={{ fontFamily: 'Barlow Condensed' }}>Supplier *</label>
                  <select required value={editForm.supplier_id}
                    onChange={e => setEditForm({ ...editForm, supplier_id: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60">
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1"
                    style={{ fontFamily: 'Barlow Condensed' }}>Date</label>
                  <input type="date" value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1"
                    style={{ fontFamily: 'Barlow Condensed' }}>Notes</label>
                  <input value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
              </div>

              {/* Items section */}
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Items — lot numbers are preserved, only qty / rate / code update
              </p>

              {/* Column headers */}
              <div className={`grid ${colClass} gap-3 mb-1 px-0.5`}>
                <span className="col-span-2 text-[10px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed' }}>Product</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed' }}>Qty</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed' }}>Rate</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed' }}>
                  {isChemical ? 'Chemical Code' : 'Shade Code'}
                </span>
                <span />
              </div>

              {editItems.map((item, i) => {
                const isDyed     = item.product_type === 'DYED_YARN';
                const isFinished = item.product_type === 'CHEMICAL_FINISHED';
                return (
                  <div key={i} className={`grid ${colClass} gap-3 mb-2 items-center`}>
                    {/* Product picker — disabled for existing items to preserve lot integrity */}
                    {item.lot_id
                      ? (
                        <div className="col-span-2 bg-[#0A0F1C] border border-[#2D3648]/60 rounded-sm h-9 flex items-center px-3 gap-2">
                          <Package size={11} className="shrink-0 text-slate-600" />
                          <span className="text-xs text-slate-400 truncate">
                            {products.find(p => String(p.id) === String(item.product_id))?.name || `Product #${item.product_id}`}
                            <span className="text-slate-600 ml-1">({item.product_type})</span>
                          </span>
                        </div>
                      )
                      : (
                        <ProductPicker
                          value={item.product_id}
                          products={products}
                          categories={categories}
                          businessMode={businessMode}
                          onChange={(id, type) => handleEditProductSelect(i, id, type)}
                        />
                      )
                    }

                    <input type="number" placeholder={`Qty (${unitForProductId(item.product_id)})`} required value={item.quantity}
                      onChange={e => updateEditItem(i, 'quantity', e.target.value)}
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
                    <input type="number" placeholder="Rate" required value={item.rate}
                      onChange={e => updateEditItem(i, 'rate', e.target.value)}
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />

                    {isChemical
                      ? isFinished
                        ? <input placeholder="e.g. FA-300" value={item.chemical_code}
                            onChange={e => updateEditItem(i, 'chemical_code', e.target.value)}
                            className="bg-[#0A0F1C] border border-amber-500/30 text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors" />
                        : <div className="bg-[#0A0F1C]/50 border border-[#2D3648]/40 rounded-sm h-9 flex items-center px-3">
                            <span className="text-[10px] text-slate-600 italic">N/A — raw material</span>
                          </div>
                      : isDyed
                        ? <input placeholder="Shade code" value={item.shade_code}
                            onChange={e => updateEditItem(i, 'shade_code', e.target.value)}
                            className="bg-[#0A0F1C] border border-amber-500/30 text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors" />
                        : <div className="bg-[#0A0F1C]/50 border border-[#2D3648]/40 rounded-sm h-9 flex items-center px-3">
                            <span className="text-[10px] text-slate-600 italic">N/A — undyed</span>
                          </div>
                    }

                    {/* Existing items cannot be removed (lot already created) */}
                    {item.lot_id
                      ? <span className="text-[10px] text-slate-600 text-center italic">locked</span>
                      : <button type="button" onClick={() => setEditItems(editItems.filter((_, idx) => idx !== i))}
                          className="text-slate-600 hover:text-red-400 text-xs transition-colors text-center">
                          Remove
                        </button>
                    }
                  </div>
                );
              })}

              {/* Totals preview */}
              <div className="mt-4 pt-3 border-t border-[#2D3648] flex justify-end">
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider mr-3"
                    style={{ fontFamily: 'Barlow Condensed' }}>New Total</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    PKR {editItems.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
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