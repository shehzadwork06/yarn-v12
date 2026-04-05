
import { useState, useEffect } from "react";
import { lotsAPI, categoriesAPI } from "@/lib/api";
import { Layers, Search } from "lucide-react";

const statusColors = {
  IN_STORE: 'badge-info', DYEING: 'badge-warning', FINISHED: 'badge-success',
  CHEMICAL_MANUFACTURING: 'badge-warning', READY_FOR_SALE: 'badge-success',
  SOLD: 'badge-neutral', PARTIALLY_SOLD: 'badge-info'
};

export default function LotsPage() {
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadLots = () => lotsAPI.list({ search: search || undefined, status: statusFilter || undefined }).then(r => setLots(r.data));
  useEffect(() => { loadLots(); }, [statusFilter]);
  useEffect(() => { categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {}); }, []);

  const filteredLots = categoryFilter
    ? lots.filter(l => String(l.category_id) === String(categoryFilter))
    : lots;

  const statuses = ['IN_STORE', 'DYEING', 'READY_FOR_SALE', 'PARTIALLY_SOLD', 'SOLD'];

  const viewDetails = async (id) => {
    const { data } = await lotsAPI.get(id);
    setSelected(data);
  };

  return (
    <div data-testid="lots-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Lot Management</h1>
        <p className="text-sm text-slate-500 mt-1">Track every lot from purchase to sale</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-600" />
          <input data-testid="lot-search" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadLots()}
            placeholder="Search lot number..." className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-4 h-9 text-sm focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 outline-none w-64" />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div className="flex gap-1.5">
          <button onClick={() => setStatusFilter("")} className={`px-3 py-1.5 text-xs rounded-sm ${!statusFilter ? 'bg-amber-500/20 text-amber-400' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}>All</button>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-sm font-mono ${statusFilter === s ? 'bg-amber-500/20 text-amber-400' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} industrial-card`} data-testid="lots-table">
          <table className="w-full erp-table">
            <thead><tr><th>Lot #</th><th>Product</th><th>Status</th><th>Location</th><th>Qty</th><th>Cost/Unit</th></tr></thead>
            <tbody>
              {filteredLots.map(lot => (
                <tr key={lot.id} onClick={() => viewDetails(lot.id)} className="cursor-pointer">
                  <td className="text-amber-400 font-mono text-xs">{lot.lot_number}</td>
                  <td className="text-slate-200 text-sm">{lot.product_name}</td>
                  <td><span className={statusColors[lot.status] || 'badge-neutral'}>{lot.status}</span></td>
                  <td className="text-slate-400 font-mono text-xs">{lot.location}</td>
                  <td className="text-white font-mono">{lot.current_quantity}/{lot.initial_quantity}</td>
                  <td className="text-slate-400 font-mono">{lot.cost_per_unit?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="industrial-card p-5 animate-slide-in" data-testid="lot-detail">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Lot Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">CLOSE</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Lot #</span><span className="text-amber-400 font-mono">{selected.lot_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="text-white">{selected.product_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="badge-neutral">{selected.product_type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={statusColors[selected.status]}>{selected.status}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-slate-300 font-mono">{selected.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="text-white font-mono">{selected.current_quantity} / {selected.initial_quantity}</span></div>
              {selected.shade_code && <div className="flex justify-between"><span className="text-slate-500">Shade</span><span className="text-amber-400 font-mono">{selected.shade_code}</span></div>}
              {selected.manufacturing?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Manufacturing History</p>
                  {selected.manufacturing.map(m => (
                    <div key={m.id} className="bg-[#0A0F1C] border border-[#2D3648] p-3 rounded-sm mb-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Process</span><span className="text-amber-400">{m.process_type}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Input</span><span className="font-mono">{m.input_weight} {selected.unit || 'units'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Output</span><span className="font-mono">{m.actual_output || '-'} {selected.unit || 'units'}</span></div>
                    </div>
                  ))}
                </div>
              )}
              {selected.wastage?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Wastage</p>
                  {selected.wastage.map(w => (
                    <div key={w.id} className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm mb-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="text-red-400 font-mono">{w.wastage_amount} {selected.unit || 'units'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Cost</span><span className="text-red-400 font-mono">Rs {w.wastage_cost}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}