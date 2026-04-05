import { useState, useEffect } from "react";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Package, Search, Edit2, X } from "lucide-react";
import { useBusinessMode } from "../context/BusinessModeContext";

// ─── Workspace-specific constants ─────────────────────────────────────────────

const YARN_TYPES = [
  { value: 'RAW_YARN',  label: 'Raw Yarn (Undyed)', color: 'badge-info'    },
  { value: 'DYED_YARN', label: 'Dyed Yarn',         color: 'badge-success' },
];

const CHEM_TYPES = [
  { value: 'CHEMICAL_RAW',      label: 'Chemical Raw',      color: 'badge-warning' },
  { value: 'CHEMICAL_FINISHED', label: 'Chemical Finished', color: 'badge-error'   },
];

const YARN_UNITS = ['No Of Cones', 'Kg', 'Bundle', 'Bag', 'Meter', 'ft'];
const CHEM_UNITS = ['Kg', 'Liter', 'Gram', 'Bundle', 'Bag'];

const getTypeInfo = (typeValue) =>
  [...YARN_TYPES, ...CHEM_TYPES].find(t => t.value === typeValue);

const getBadge = (type) => getTypeInfo(type)?.color  ?? 'badge-neutral';
const getLabel = (type) => getTypeInfo(type)?.label  ?? type;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { businessMode } = useBusinessMode();
  // businessMode is always 'YARN' | 'CHEMICAL' | 'OPERATIONS' (uppercase, from BusinessModeContext)
  const isChemical = businessMode === 'CHEMICAL';

  const workspaceTypes = isChemical ? CHEM_TYPES : YARN_TYPES;
  const workspaceUnits = isChemical ? CHEM_UNITS : YARN_UNITS;
  const defaultType    = isChemical ? 'CHEMICAL_RAW'   : 'RAW_YARN';
  const defaultUnit    = isChemical ? 'Kg'             : 'No Of Cones';

  // Each workspace gets its own blank form with only the fields it needs.
  // IMPORTANT: yarn form never has chemical_code; chem form never has shade_code / category_id.
  const blankForm = () =>
    isChemical
      ? {
          name:            '',
          type:            defaultType,
          unit:            defaultUnit,
          min_stock_level: 0,
          chemical_code:   '',
          description:     '',
        }
      : {
          name:            '',
          type:            defaultType,
          category_id:     '',
          unit:            defaultUnit,
          min_stock_level: 0,
          shade_code:      '',
          description:     '',
        };

  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [search,         setSearch]         = useState('');
  const [typeFilter,     setTypeFilter]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories,     setCategories]     = useState([]);
  const [form,           setForm]           = useState(blankForm());

  // ── Load products ───────────────────────────────────────────────────────────
  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)         params.search      = search;
      if (typeFilter)     params.type        = typeFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      const { data } = await productsAPI.list(params);
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [search, typeFilter, categoryFilter]);

  // Load categories for yarn workspace only
  useEffect(() => {
    if (!isChemical) {
      categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
    }
  }, [isChemical]);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const resetForm = () => { setForm(blankForm()); setEditing(null); setShowForm(false); };

  const handleEdit = (p) => {
    // Build form from product data — only include fields valid for this workspace
    if (isChemical) {
      setForm({
        name:            p.name            || '',
        type:            p.type            || defaultType,
        unit:            p.unit            || defaultUnit,
        min_stock_level: p.min_stock_level || 0,
        chemical_code:   p.chemical_code   || '',
        description:     p.description     || '',
        // Never set shade_code or category_id for chemical
      });
    } else {
      setForm({
        name:            p.name            || '',
        type:            p.type            || defaultType,
        category_id:     p.category_id     || '',
        unit:            p.unit            || defaultUnit,
        min_stock_level: p.min_stock_level || 0,
        shade_code:      p.shade_code      || '',
        description:     p.description     || '',
        // Never set chemical_code for yarn
      });
    }
    setEditing(p.id);
    setShowForm(true);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build a strictly isolated payload — NEVER send the other workspace's fields.
    // This prevents SQLite errors like "no such column: chemical_code" on yarn_products.
    let payload;

    if (isChemical) {
      payload = {
        name:            form.name.trim(),
        type:            form.type,
        unit:            form.unit,
        min_stock_level: parseFloat(form.min_stock_level) || 0,
        chemical_code:   form.chemical_code || null,
        description:     form.description   || null,
        // Explicitly excluded: category_id, shade_code
      };
    } else {
      payload = {
        name:            form.name.trim(),
        type:            form.type,
        category_id:     form.category_id  || null,
        unit:            form.unit,
        min_stock_level: parseFloat(form.min_stock_level) || 0,
        // shade_code only meaningful for DYED_YARN
        shade_code:      form.type === 'DYED_YARN' ? (form.shade_code || null) : null,
        description:     form.description  || null,
        // Explicitly excluded: chemical_code
      };
    }

    try {
      if (editing) {
        await productsAPI.update(editing, payload);
        toast.success('Product updated');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving product');
    }
  };

  const handleToggle = async (p) => {
    try {
      await productsAPI.update(p.id, { is_active: p.is_active ? 0 : 1 });
      toast.success(p.is_active ? 'Deactivated' : 'Activated');
      loadProducts();
    } catch {
      toast.error('Failed to update');
    }
  };

  // Shade code field only relevant for DYED_YARN in yarn workspace
  const showShadeCode = !isChemical && form.type === 'DYED_YARN';

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-500">Loading products…</div>
    </div>
  );

  return (
    <div data-testid="products-page" className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: 'Barlow Condensed' }}>{isChemical ? 'Chemical Products' : 'Yarn Products'}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isChemical ? 'Chemical product catalog' : 'Yarn product catalog'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: 'Barlow Condensed' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="industrial-card p-4">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 uppercase mb-1"
              style={{ fontFamily: 'Barlow Condensed' }}>Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isChemical ? 'Search by name or code…' : 'Search by name or shade…'}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-4 h-9 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>
          </div>

          {/* Category filter — yarn only */}
          {!isChemical && (
            <div>
              <label className="block text-xs text-slate-500 uppercase mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none min-w-[150px]">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Type filter */}
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1"
              style={{ fontFamily: 'Barlow Condensed' }}>Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none min-w-[150px]">
              <option value="">All Types</option>
              {workspaceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Clear filters */}
          {(search || typeFilter || categoryFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setCategoryFilter(''); }}
              className="flex items-center gap-1 h-9 px-3 text-xs text-slate-400 hover:text-white bg-[#0A0F1C] border border-[#2D3648] rounded-sm transition-colors">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="industrial-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>
              {editing ? 'Edit Product' : 'New Product'}
            </h2>
            <button type="button" onClick={resetForm} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Name *</label>
              <input
                type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={isChemical ? 'e.g. Acidic Buffer' : 'e.g. 1001'}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none">
                {workspaceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Category — yarn workspace only */}
            {!isChemical && (
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>Category *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  required
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Unit */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Unit</label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none">
                {workspaceUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Min Stock Level</label>
              <input
                type="number" step="0.01" min="0"
                value={form.min_stock_level}
                onChange={e => setForm({ ...form, min_stock_level: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>

            {/* Shade Code — DYED_YARN in yarn workspace only */}
            {showShadeCode && (
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>Shade Code</label>
                <input
                  type="text" value={form.shade_code}
                  onChange={e => setForm({ ...form, shade_code: e.target.value })}
                  placeholder="e.g. 1001"
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                />
              </div>
            )}

            {/* Chemical Code — chemical workspace only */}
            {isChemical && (
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                  style={{ fontFamily: 'Barlow Condensed' }}>Chemical Code</label>
                <input
                  type="text" value={form.chemical_code}
                  onChange={e => setForm({ ...form, chemical_code: e.target.value })}
                  placeholder="e.g. FA-300"
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
                />
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: 'Barlow Condensed' }}>Description</label>
              <textarea
                value={form.description} rows={2}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional…"
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs"
              style={{ fontFamily: 'Barlow Condensed' }}>
              {editing ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={resetForm}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="industrial-card p-4">
          <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Total</p>
          <p className="text-2xl font-bold text-white font-mono mt-1">{products.length}</p>
        </div>
        {workspaceTypes.map(t => (
          <div key={t.value} className="industrial-card p-4">
            <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>{t.label}</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {products.filter(p => p.type === t.value).length}
            </p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="industrial-card">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th>Name</th>
              {!isChemical && <th>Category</th>}
              <th>Type</th>
              <th>Unit</th>
              <th>{isChemical ? 'Chemical Code' : 'Shade Code'}</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                <td className="text-slate-200 font-medium">{p.name}</td>
                {!isChemical && <td className="text-slate-400 text-xs">{p.category_name || '—'}</td>}
                <td><span className={getBadge(p.type)}>{getLabel(p.type)}</span></td>
                <td className="text-slate-400 font-mono text-xs">{p.unit}</td>
                <td className="text-amber-400 font-mono text-xs">
                  {isChemical ? (p.chemical_code || '—') : (p.shade_code || '—')}
                </td>
                <td>
                  <span className={p.is_active ? 'badge-success' : 'badge-neutral'}>
                    {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button onClick={() => handleEdit(p)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono uppercase flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleToggle(p)}
                    className={`text-xs font-mono uppercase ${p.is_active ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={isChemical ? 6 : 7} className="text-center text-slate-500 py-12">
                  <Package className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}