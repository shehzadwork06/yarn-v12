import { useState, useEffect } from "react";
import { categoriesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Layers, Search, Edit2, X } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  const loadCategories = async () => {
    try {
      const { data } = await categoriesAPI.list({ search });
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [search]);

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoriesAPI.update(editing, form);
        toast.success("Category updated successfully");
      } else {
        await categoriesAPI.create(form);
        toast.success("Category created successfully");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving category");
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      description: category.description || ""
    });
    setEditing(category.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div data-testid="categories-page" className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product classification structure
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
          style={{ fontFamily: "Barlow Condensed" }}
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="industrial-card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label
              className="block text-xs text-slate-500 uppercase mb-1"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Search
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-4 h-9 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="industrial-card p-5 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {editing ? "Edit Category" : "New Category"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>

            <div>
              <label
                className="block text-xs text-slate-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {editing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="industrial-card p-4">
          <p
            className="text-xs text-slate-500 uppercase"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Total Categories
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {categories.length}
          </p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="industrial-card">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="text-slate-200 font-medium">{cat.name}</td>
                <td className="text-slate-400 text-sm">{cat.description || "-"}</td>
                <td className="text-slate-500 font-mono text-xs">
                  {new Date(cat.created_at).toLocaleDateString()}
                </td>
                <td className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono uppercase flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-slate-500 py-12">
                  <Layers className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}