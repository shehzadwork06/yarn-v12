
// import { useState, useEffect } from "react";
// import { inventoryAPI, categoriesAPI } from "@/lib/api";
// import { MapPin, FileDown, FileSpreadsheet, Search, X, Layers, List } from "lucide-react";
// import { useBusinessMode } from "../context/BusinessModeContext";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";

// export default function InventoryPage() {
//   const { businessMode } = useBusinessMode();
//   const isChemical = businessMode === 'CHEMICAL';

//   const [inventory, setInventory] = useState([]);
//   const [summary,   setSummary]   = useState([]);
//   const [lowStock,  setLowStock]  = useState([]);
//   const [tab,       setTab]       = useState("stock");
//   const [locFilter, setLocFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [search,    setSearch]    = useState("");
//   const [categories, setCategories] = useState([]);
//   const [lotView, setLotView] = useState(true); // true = show by lot, false = grouped by product

//   useEffect(() => {
//     inventoryAPI.list({
//       location:    locFilter    || undefined,
//       category_id: categoryFilter || undefined,
//     }).then(r => setInventory(r.data));
//     inventoryAPI.summary().then(r => setSummary(r.data));
//     inventoryAPI.lowStock().then(r => setLowStock(r.data));
//   }, [locFilter, categoryFilter]);

//   useEffect(() => {
//     // Only load yarn categories — chemical workspace has no categories
//     if (!isChemical) {
//       categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
//     }
//   }, []);

//   // Relevant locations per workspace
//   const locations = isChemical
//     ? ['CHEMICAL_STORE']
//     : ['STORE', 'DYEING', 'FINISHED_STORE'];

//   const now       = new Date().toLocaleString();
//   const dateStamp = new Date().toISOString().slice(0, 10);

//   // Helper to get the display code for a row
//   const getCode = (item) => item.chemical_code || item.shade_code || '-';

//   const applyFilters = (rows, nameKey = 'product_name', useCatFilter = false) => {
//     const q = search.toLowerCase().trim();
//     return rows.filter(i => {
//       // For summary tab, filter client-side; for stock tab the backend already filtered by category
//       const matchCat    = !useCatFilter || !categoryFilter || String(i.category_id) === String(categoryFilter);
//       const matchSearch = !q ||
//         i[nameKey]?.toLowerCase().includes(q) ||
//         i.shade_code?.toLowerCase().includes(q) ||
//         i.chemical_code?.toLowerCase().includes(q);
//       return matchCat && matchSearch;
//     });
//   };

//   // Stock tab: backend already handles category filter — only apply search client-side
//   const filteredInventory = applyFilters(inventory, 'product_name', false);
//   // Summary tab: filter client-side since it's a separate endpoint
//   const filteredSummary   = applyFilters(summary, 'name', true);

//   // ── Grouped (no-lot) view: collapse rows with same product_id ──────────────
//   const groupedInventory = (() => {
//     const map = new Map();
//     filteredInventory.forEach(item => {
//       const key = item.product_id;
//       if (map.has(key)) {
//         const existing = map.get(key);
//         existing.quantity += item.quantity;
//         existing._lotCount = (existing._lotCount || 1) + 1;
//       } else {
//         map.set(key, { ...item, _lotCount: 1 });
//       }
//     });
//     return Array.from(map.values());
//   })();

//   // ─── PDF EXPORT ───────────────────────────────────────────────
//   const exportPDF = () => {
//     const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
//     const pageW = doc.internal.pageSize.getWidth();
//     doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageW, 22, "F");
//     doc.setTextColor(251, 191, 36); doc.setFontSize(16); doc.setFont("helvetica", "bold");
//     doc.text("GH & Sons Enterprises", 14, 10);
//     doc.setFontSize(9); doc.setTextColor(148, 163, 184);
//     doc.text(tab === "stock" ? "STOCK DETAIL REPORT" : "PRODUCT SUMMARY REPORT", 14, 16);
//     doc.setTextColor(100, 116, 139); doc.setFontSize(8);
//     doc.text(`Generated: ${now}${locFilter ? `  |  Location: ${locFilter}` : "  |  All Locations"}`, pageW - 14, 16, { align: "right" });

//     const codeLabel = isChemical ? 'Chemical Code' : 'Shade/Code';

//     if (tab === "stock") {
//       const rows = lotView ? filteredInventory : groupedInventory;
//       const head = lotView
//         ? [["Product", "Type", "Lot #", "Location", "Quantity", codeLabel]]
//         : [["Product", "Type", "Lots", "Total Quantity"]];
//       const body = lotView
//         ? rows.map(i => [i.product_name, i.product_type, i.lot_number, i.location, `${i.quantity} ${i.unit}`, getCode(i)])
//         : rows.map(i => [i.product_name, i.product_type, `${i._lotCount}`, `${i.quantity} ${i.unit}`]);
//       autoTable(doc, {
//         startY: 30,
//         head,
//         body,
//         headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
//         bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
//         alternateRowStyles: { fillColor: [245, 247, 250] },
//         styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
//         margin: { left: 14, right: 14 },
//       });
//     } else {
//       autoTable(doc, {
//         startY: 30,
//         head: [["Product", "Type", "Total Qty", "Min Level", "Status"]],
//         body: filteredSummary.map(i => [
//           i.name, i.type,
//           `${i.total_quantity || 0} ${i.unit}`,
//           i.min_stock_level,
//           i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? 'LOW' : 'OK'
//         ]),
//         headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
//         bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
//         alternateRowStyles: { fillColor: [245, 247, 250] },
//         styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
//         margin: { left: 14, right: 14 },
//       });
//     }
//     doc.save(`inventory-${tab}-${dateStamp}.pdf`);
//   };

//   // ─── EXCEL EXPORT ─────────────────────────────────────────────
//   const exportExcel = () => {
//     const wb   = XLSX.utils.book_new();
//     const codeLabel = isChemical ? 'Chemical Code' : 'Shade/Code';

//     if (tab === "stock") {
//       const rows = lotView ? filteredInventory : groupedInventory;
//       const headers = lotView
//         ? ["Product", "Type", "Lot #", "Location", "Quantity", "Unit", codeLabel]
//         : ["Product", "Type", "Lots", "Total Quantity", "Unit"];
//       const data = lotView
//         ? rows.map(i => [i.product_name, i.product_type, i.lot_number, i.location, i.quantity, i.unit, getCode(i)])
//         : rows.map(i => [i.product_name, i.product_type, i._lotCount, i.quantity, i.unit]);
//       const ws = XLSX.utils.aoa_to_sheet([
//         ["GH & Sons Enterprises — STOCK DETAIL"], [`Generated: ${now}`], [],
//         headers, ...data,
//       ]);
//       ws["!cols"] = lotView
//         ? [{ wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 14 }]
//         : [{ wch: 24 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 10 }];
//       XLSX.utils.book_append_sheet(wb, ws, "Stock Detail");
//     } else {
//       const ws = XLSX.utils.aoa_to_sheet([
//         ["GH & Sons Enterprises — PRODUCT SUMMARY"], [`Generated: ${now}`], [],
//         ["Product", "Type", "Total Qty", "Unit", "Min Level", "Status"],
//         ...filteredSummary.map(i => [
//           i.name, i.type, i.total_quantity || 0, i.unit, i.min_stock_level,
//           i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? 'LOW' : 'OK'
//         ]),
//       ]);
//       ws["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
//       XLSX.utils.book_append_sheet(wb, ws, "Summary");
//     }
//     XLSX.writeFile(wb, `inventory-${tab}-${dateStamp}.xlsx`);
//   };

//   return (
//     <div className="space-y-6">

//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight"
//             style={{ fontFamily: 'Barlow Condensed' }}>Inventory</h1>
//           <p className="text-sm text-slate-500 mt-1">Stock levels across all locations</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={exportExcel}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-emerald-400 hover:text-emerald-300 hover:bg-[#2a3547] border border-emerald-700 hover:border-emerald-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: 'Barlow Condensed' }}>
//             <FileSpreadsheet size={14} /> Export Excel
//           </button>
//           <button onClick={exportPDF}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-amber-400 hover:text-amber-300 hover:bg-[#2a3547] border border-amber-700 hover:border-amber-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: 'Barlow Condensed' }}>
//             <FileDown size={14} /> Export PDF
//           </button>
//         </div>
//       </div>

//       {/* Tabs + Lot Toggle */}
//       <div className="flex items-center justify-between">
//         <div className="flex gap-2">
//           {['stock', 'summary'].map(t => (
//             <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)}
//               className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors
//                 ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
//               style={{ fontFamily: 'Barlow Condensed' }}>{t}
//             </button>
//           ))}
//         </div>
//         {tab === 'stock' && (
//           <div className="flex items-center gap-1 bg-[#1E2738] border border-slate-600 rounded-sm p-0.5">
//             <button
//               onClick={() => setLotView(true)}
//               title="View by Lot"
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors
//                 ${lotView ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
//               style={{ fontFamily: 'Barlow Condensed' }}>
//               <List size={12} /> By Lot
//             </button>
//             <button
//               onClick={() => setLotView(false)}
//               title="View by Product (grouped)"
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors
//                 ${!lotView ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
//               style={{ fontFamily: 'Barlow Condensed' }}>
//               <Layers size={12} /> By Product
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Location Filter */}
//       <div className="flex gap-2 flex-wrap items-center">
//         <span className="text-xs text-slate-500 uppercase tracking-wider w-20"
//           style={{ fontFamily: 'Barlow Condensed' }}>Location:</span>
//         <button onClick={() => setLocFilter("")}
//           className={`px-3 py-1.5 text-xs rounded-sm transition-colors
//             ${!locFilter ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
//           All
//         </button>
//         {locations.map(loc => (
//           <button key={loc} onClick={() => setLocFilter(loc)}
//             className={`px-3 py-1.5 text-xs rounded-sm transition-colors font-mono
//               ${locFilter === loc ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
//             <MapPin size={12} className="inline mr-1" />{loc}
//           </button>
//         ))}
//       </div>

//       {/* Category + Search Filters — category hidden in chemical workspace */}
//       <div className="flex gap-3 items-center flex-wrap">
//         {!isChemical && (
//           <div className="flex items-center gap-2">
//             <span className="text-xs text-slate-500 uppercase tracking-wider"
//               style={{ fontFamily: 'Barlow Condensed' }}>Category:</span>
//             <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
//               className="px-3 py-1.5 text-xs rounded-sm bg-[#1E2738] text-slate-300 border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
//               style={{ fontFamily: 'Barlow Condensed', minWidth: '160px' }}>
//               <option value="">All Categories</option>
//               {categories.map(cat => (
//                 <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
//               ))}
//             </select>
//             {categoryFilter && (
//               <button onClick={() => setCategoryFilter("")}
//                 className="px-2 py-1.5 text-xs rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">
//                 ✕ Clear
//               </button>
//             )}
//           </div>
//         )}

//         {/* Search */}
//         <div className="relative">
//           <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
//           <input type="text" value={search} onChange={e => setSearch(e.target.value)}
//             placeholder={isChemical ? "Search product or code…" : "Search product or shade…"}
//             className="bg-[#1E2738] border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 text-slate-200 rounded-sm pl-7 pr-8 py-1.5 text-xs outline-none transition-colors placeholder:text-slate-600 w-56" />
//           {search && (
//             <button onClick={() => setSearch('')}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
//               <X size={11} />
//             </button>
//           )}
//         </div>

//         {(categoryFilter || search) && (
//           <span className="text-[10px] text-slate-500 font-mono">
//             {tab === 'stock' ? filteredInventory.length : filteredSummary.length} result{(tab === 'stock' ? filteredInventory.length : filteredSummary.length) !== 1 ? 's' : ''}
//           </span>
//         )}
//       </div>

//       {/* Low Stock Banner */}
//       {lowStock.length > 0 && (
//         <div className="flex items-center gap-3 px-4 py-2.5 bg-red-900/20 border border-red-700/40 rounded-sm">
//           <span className="text-red-400 text-xs font-bold uppercase tracking-wider">⚠ Low Stock Alert</span>
//           <span className="text-red-300 text-xs">{lowStock.length} product{lowStock.length !== 1 ? "s" : ""} below minimum level</span>
//         </div>
//       )}

//       {/* Stock Table */}
//       {tab === 'stock' ? (
//         <div className="industrial-card" data-testid="inventory-table">
//           <table className="w-full erp-table">
//             <thead>
//               <tr>
//                 <th>Product</th>
//                 <th>Type</th>
//                 {lotView && <th>Lot #</th>}
//                 {lotView && <th>Location</th>}
//                 {!lotView && <th>Lots</th>}
//                 <th>Quantity</th>
//                 {lotView && <th>{isChemical ? 'Chemical Code' : 'Shade/Code'}</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {(lotView ? filteredInventory : groupedInventory).map(item => (
//                 <tr key={lotView ? item.id : item.product_id}
//                   className={item.quantity === 0 ? 'opacity-40' : ''}>
//                   <td className="text-slate-200">{item.product_name}</td>
//                   <td><span className="badge-neutral">{item.product_type}</span></td>
//                   {lotView && <td className="text-amber-400 font-mono text-xs">{item.lot_number}</td>}
//                   {lotView && <td><span className="badge-info">{item.location}</span></td>}
//                   {!lotView && (
//                     <td className="text-slate-500 font-mono text-xs">{item._lotCount} lot{item._lotCount !== 1 ? 's' : ''}</td>
//                   )}
//                   <td className={`font-mono font-bold ${item.quantity === 0 ? 'text-slate-500' : 'text-white'}`}>
//                     {item.quantity} {item.unit}
//                     {item.quantity === 0 && <span className="ml-1 text-[10px] text-slate-600 font-normal">(depleted)</span>}
//                   </td>
//                   {lotView && <td className="text-slate-400 font-mono text-xs">{getCode(item)}</td>}
//                 </tr>
//               ))}
//               {filteredInventory.length === 0 && (
//                 <tr><td colSpan={6} className="text-center text-slate-500 py-8">No inventory items found</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="industrial-card" data-testid="summary-table">
//           <table className="w-full erp-table">
//             <thead>
//               <tr>
//                 <th>Product</th><th>Type</th><th>Total Qty</th>
//                 <th>Min Level</th><th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSummary.map(item => (
//                 <tr key={item.id}>
//                   <td className="text-slate-200">{item.name}</td>
//                   <td><span className="badge-neutral">{item.type}</span></td>
//                   <td className="text-white font-mono font-bold">{item.total_quantity || 0} {item.unit}</td>
//                   <td className="font-mono text-slate-500">{item.min_stock_level}</td>
//                   <td>
//                     {item.min_stock_level > 0 && (item.total_quantity || 0) <= item.min_stock_level
//                       ? <span className="badge-error">LOW</span>
//                       : <span className="badge-success">OK</span>}
//                   </td>
//                 </tr>
//               ))}
//               {filteredSummary.length === 0 && (
//                 <tr><td colSpan={5} className="text-center text-slate-500 py-8">No products found</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
// import { useState, useEffect } from "react";
// import { inventoryAPI, categoriesAPI } from "@/lib/api";
// import { MapPin, FileDown, FileSpreadsheet, Search, X, Layers, List } from "lucide-react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";

// export default function InventoryPage() {
//   const [inventory, setInventory] = useState([]);
//   const [summary, setSummary] = useState([]);
//   const [lowStock, setLowStock] = useState([]);
//   const [tab, setTab] = useState("stock");
//   const [locFilter, setLocFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [search, setSearch] = useState("");
//   const [categories, setCategories] = useState([]);
//  const [lotView, setLotView] = useState(true); // true = show by lot, false = grouped by product

//   useEffect(() => {
//     inventoryAPI.list({ location: locFilter || undefined }).then(r => setInventory(r.data));
//     inventoryAPI.summary().then(r => setSummary(r.data));
//     inventoryAPI.lowStock().then(r => setLowStock(r.data));
//   }, [locFilter]);

//   useEffect(() => {
//     categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
//   }, []);

//   const locations = ['STORE', 'DYEING', 'FINISHED_STORE', 'CHEMICAL_STORE'];
//   const now = new Date().toLocaleString();
//   const dateStamp = new Date().toISOString().slice(0, 10);

//   const applyFilters = (rows, nameKey = 'product_name', shadeKey = 'shade_code') => {
//     const q = search.toLowerCase().trim();
//     return rows.filter(i => {
//       const matchCat = !categoryFilter || String(i.category_id) === String(categoryFilter);
//       const matchSearch = !q ||
//         i[nameKey]?.toLowerCase().includes(q) ||
//         i[shadeKey]?.toLowerCase().includes(q) ||
//         i.chemical_code?.toLowerCase().includes(q);
//       return matchCat && matchSearch;
//     });
//   };

//   const filteredInventory = applyFilters(inventory, 'product_name', 'shade_code');
//   // summary rows use 'name' and 'shade_code'
//   const filteredSummary = applyFilters(summary, 'name', 'shade_code');

//   // ─── PDF EXPORT ───────────────────────────────────────────────
//   const exportPDF = () => {
//     const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
//     const pageW = doc.internal.pageSize.getWidth();
//     doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageW, 22, "F");
//     doc.setTextColor(251, 191, 36); doc.setFontSize(16); doc.setFont("helvetica", "bold");
//     doc.text("YARNCHEM INDUSTRIES", 14, 10);
//     doc.setFontSize(9); doc.setTextColor(148, 163, 184);
//     doc.text(tab === "stock" ? "STOCK DETAIL REPORT" : "PRODUCT SUMMARY REPORT", 14, 16);
//     doc.setTextColor(100, 116, 139); doc.setFontSize(8);
//     doc.text(`Generated: ${now}${locFilter ? `  |  Location: ${locFilter}` : "  |  All Locations"}`, pageW - 14, 16, { align: "right" });
//     let y = 30;

//     if (tab === "stock") {
//       doc.setTextColor(251, 191, 36); doc.setFontSize(10); doc.setFont("helvetica", "bold");
//       doc.text(`STOCK DETAIL  (${filteredInventory.length} items)`, 14, y); y += 4;
//       autoTable(doc, {
//         startY: y,
//         head: [["Product", "Type", "Lot #", "Location", "Quantity", "Unit", "Shade / Code"]],
//         body: filteredInventory.map(i => [i.product_name, i.product_type, i.lot_number, i.location, i.quantity, i.unit, i.shade_code || i.chemical_code || "-"]),
//         headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
//         bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
//         alternateRowStyles: { fillColor: [245, 247, 250] },
//         styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
//         columnStyles: { 4: { halign: "right" } }, margin: { left: 14, right: 14 },
//       });
//     } else {
//       doc.setTextColor(251, 191, 36); doc.setFontSize(10); doc.setFont("helvetica", "bold");
//       doc.text(`SUMMARY BY PRODUCT  (${filteredSummary.length} products)`, 14, y); y += 4;
//       autoTable(doc, {
//         startY: y,
//         head: [["Product", "Type", "Total Qty", "Unit", "Lots", "Locations", "Min Level", "Status"]],
//         body: filteredSummary.map(i => [i.name, i.type, i.total_quantity || 0, i.unit, i.lot_count, i.locations || "-", i.min_stock_level, i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? "LOW" : "OK"]),
//         headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
//         bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
//         alternateRowStyles: { fillColor: [245, 247, 250] },
//         styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
//         columnStyles: { 2: { halign: "right" }, 7: { fontStyle: "bold" } },
//         didParseCell(data) { if (data.column.index === 7 && data.section === "body") data.cell.styles.textColor = data.cell.raw === "LOW" ? [192, 57, 43] : [39, 174, 96]; },
//         margin: { left: 14, right: 14 },
//       });
//     }

//     const totalPages = doc.internal.getNumberOfPages();
//     for (let p = 1; p <= totalPages; p++) {
//       doc.setPage(p); doc.setFontSize(7); doc.setTextColor(150, 160, 175);
//       doc.text(`YarnChem Industries — Inventory Report — ${dateStamp}`, 14, doc.internal.pageSize.getHeight() - 6);
//       doc.text(`Page ${p} of ${totalPages}`, pageW - 14, doc.internal.pageSize.getHeight() - 6, { align: "right" });
//     }
//     doc.save(`inventory-${tab}-${dateStamp}.pdf`);
//   };

//   // ─── EXCEL EXPORT ─────────────────────────────────────────────
//   const exportExcel = () => {
//     const wb = XLSX.utils.book_new();
//     if (tab === "stock") {
//       const ws = XLSX.utils.aoa_to_sheet([
//         ["YARNCHEM INDUSTRIES — STOCK DETAIL REPORT"],
//         [`Generated: ${now}${locFilter ? `  |  Location: ${locFilter}` : "  |  All Locations"}`],
//         [],
//         ["Product", "Type", "Lot #", "Location", "Quantity", "Unit", "Shade / Code"],
//         ...filteredInventory.map(i => [i.product_name, i.product_type, i.lot_number, i.location, i.quantity, i.unit, i.shade_code || i.chemical_code || "-"]),
//       ]);
//       ws["!cols"] = [{ wch: 28 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 16 }];
//       XLSX.utils.book_append_sheet(wb, ws, "Stock Detail");
//     } else {
//       const ws = XLSX.utils.aoa_to_sheet([
//         ["YARNCHEM INDUSTRIES — PRODUCT SUMMARY REPORT"],
//         [`Generated: ${now}`],
//         [],
//         ["Product", "Type", "Total Qty", "Unit", "Lots", "Locations", "Min Level", "Status"],
//         ...filteredSummary.map(i => [i.name, i.type, i.total_quantity || 0, i.unit, i.lot_count, i.locations || "-", i.min_stock_level, i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? "LOW" : "OK"]),
//       ]);
//       ws["!cols"] = [{ wch: 28 }, { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 10 }];
//       XLSX.utils.book_append_sheet(wb, ws, "Summary");
//     }
//     XLSX.writeFile(wb, `inventory-${tab}-${dateStamp}.xlsx`);
//   };

//   // ─── UI ───────────────────────────────────────────────────────
//   return (
//     <div data-testid="inventory-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Inventory</h1>
//           <p className="text-sm text-slate-500 mt-1">Stock levels across all locations</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={exportExcel}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-emerald-400 hover:text-emerald-300 hover:bg-[#2a3547] border border-emerald-700 hover:border-emerald-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: 'Barlow Condensed' }}>
//             <FileSpreadsheet size={14} /> Export Excel
//           </button>
//           <button onClick={exportPDF}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-amber-400 hover:text-amber-300 hover:bg-[#2a3547] border border-amber-700 hover:border-amber-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: 'Barlow Condensed' }}>
//             <FileDown size={14} /> Export PDF
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-2">
//         {['stock', 'summary'].map(t => (
//           <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)}
//             className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
//             style={{ fontFamily: 'Barlow Condensed' }}>{t}</button>
//         ))}
//       </div>

//       {/* Location Filter */}
//       <div className="flex gap-2 flex-wrap items-center">
//         <span className="text-xs text-slate-500 uppercase tracking-wider w-20" style={{ fontFamily: 'Barlow Condensed' }}>Location:</span>
//         <button onClick={() => setLocFilter("")} className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${!locFilter ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
//           All
//         </button>
//         {locations.map(loc => (
//           <button key={loc} onClick={() => setLocFilter(loc)} className={`px-3 py-1.5 text-xs rounded-sm transition-colors font-mono ${locFilter === loc ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
//             <MapPin size={12} className="inline mr-1" />{loc}
//           </button>
//         ))}
//       </div>

//       {/* Category + Search Filters */}
//       <div className="flex gap-3 items-center flex-wrap">
//         {/* Category dropdown */}
//         <div className="flex items-center gap-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Category:</span>
//           <select
//             value={categoryFilter}
//             onChange={e => setCategoryFilter(e.target.value)}
//             className="px-3 py-1.5 text-xs rounded-sm bg-[#1E2738] text-slate-300 border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
//             style={{ fontFamily: 'Barlow Condensed', minWidth: '160px' }}>
//             <option value="">All Categories</option>
//             {categories.map(cat => (
//               <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
//             ))}
//           </select>
//           {categoryFilter && (
//             <button onClick={() => setCategoryFilter("")}
//               className="px-2 py-1.5 text-xs rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">
//               ✕ Clear
//             </button>
//           )}
//         </div>

//         {/* Search field */}
//         <div className="relative">
//           <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
//           <input
//             type="text"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search product or shade…"
//             className="bg-[#1E2738] border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 text-slate-200 rounded-sm pl-7 pr-8 py-1.5 text-xs outline-none transition-colors placeholder:text-slate-600 w-56"
//           />
//           {search && (
//             <button onClick={() => setSearch('')}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
//               <X size={11} />
//             </button>
//           )}
//         </div>

//         {/* Active filter count badge */}
//         {(categoryFilter || search) && (
//           <span className="text-[10px] text-slate-500 font-mono">
//             {tab === 'stock' ? filteredInventory.length : filteredSummary.length} result{(tab === 'stock' ? filteredInventory.length : filteredSummary.length) !== 1 ? 's' : ''}
//           </span>
//         )}
//       </div>

//       {/* Low Stock Banner */}
//       {lowStock.length > 0 && (
//         <div className="flex items-center gap-3 px-4 py-2.5 bg-red-900/20 border border-red-700/40 rounded-sm">
//           <span className="text-red-400 text-xs font-bold uppercase tracking-wider">⚠ Low Stock Alert</span>
//           <span className="text-red-300 text-xs">{lowStock.length} product{lowStock.length !== 1 ? "s" : ""} below minimum level</span>
//         </div>
//       )}

//       {tab === 'stock' ? (
//         <div className="industrial-card" data-testid="inventory-table">
//           <table className="w-full erp-table">
//             <thead><tr><th>Product</th><th>Type</th><th>Lot #</th><th>Location</th><th>Quantity</th><th>Shade/Code</th></tr></thead>
//             <tbody>
//               {filteredInventory.map(item => (
//                 <tr key={item.id}>
//                   <td className="text-slate-200">{item.product_name}</td>
//                   <td><span className="badge-neutral">{item.product_type}</span></td>
//                   <td className="text-amber-400 font-mono text-xs">{item.lot_number}</td>
//                   <td><span className="badge-info">{item.location}</span></td>
//                   <td className="text-white font-mono font-bold">{item.quantity} {item.unit}</td>
//                   <td className="text-slate-400 font-mono text-xs">{item.shade_code || item.chemical_code || '-'}</td>
//                 </tr>
//               ))}
//               {filteredInventory.length === 0 && (
//                 <tr><td colSpan={6} className="text-center text-slate-500 py-8">No inventory items found</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="industrial-card" data-testid="summary-table">
//           <table className="w-full erp-table">
//             <thead><tr><th>Product</th><th>Type</th><th>Total Qty</th><th>Lots</th><th>Locations</th><th>Min Level</th><th>Status</th></tr></thead>
//             <tbody>
//               {filteredSummary.map(item => (
//                 <tr key={item.id}>
//                   <td className="text-slate-200">{item.name}</td>
//                   <td><span className="badge-neutral">{item.type}</span></td>
//                   <td className="text-white font-mono font-bold">{item.total_quantity || 0} {item.unit}</td>
//                   <td className="font-mono text-slate-400">{item.lot_count}</td>
//                   <td className="text-xs text-slate-400 font-mono">{item.locations || '-'}</td>
//                   <td className="font-mono text-slate-500">{item.min_stock_level}</td>
//                   <td>
//                     {item.min_stock_level > 0 && (item.total_quantity || 0) <= item.min_stock_level
//                       ? <span className="badge-error">LOW</span>
//                       : <span className="badge-success">OK</span>}
//                   </td>
//                 </tr>
//               ))}
//               {filteredSummary.length === 0 && (
//                 <tr><td colSpan={7} className="text-center text-slate-500 py-8">No products found</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { inventoryAPI, categoriesAPI } from "@/lib/api";
import { MapPin, FileDown, FileSpreadsheet, Search, X, Layers, List } from "lucide-react";
import { useBusinessMode } from "../context/BusinessModeContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function InventoryPage() {
  const { businessMode } = useBusinessMode();
  const isChemical = businessMode === 'CHEMICAL';

  const [inventory, setInventory] = useState([]);
  const [summary,   setSummary]   = useState([]);
  const [lowStock,  setLowStock]  = useState([]);
  const [tab,       setTab]       = useState("stock");
  const [locFilter, setLocFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search,    setSearch]    = useState("");
  const [categories, setCategories] = useState([]);
  const [lotView, setLotView] = useState(true); // true = show by lot, false = grouped by product

  useEffect(() => {
    inventoryAPI.list({
      location:    locFilter    || undefined,
      category_id: categoryFilter || undefined,
    }).then(r => setInventory(r.data));
    inventoryAPI.summary().then(r => setSummary(r.data));
    inventoryAPI.lowStock().then(r => setLowStock(r.data));
  }, [locFilter, categoryFilter]);

  useEffect(() => {
    // Only load yarn categories — chemical workspace has no categories
    if (!isChemical) {
      categoriesAPI.list().then(r => setCategories(r.data)).catch(() => {});
    }
  }, []);

  // Relevant locations per workspace
  const locations = isChemical
    ? ['CHEMICAL_STORE']
    : ['STORE', 'DYEING', 'FINISHED_STORE'];

  const now       = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().slice(0, 10);

  // Helper to get the display code for a row
  const getCode = (item) => item.chemical_code || item.shade_code || '-';

  const applyFilters = (rows, nameKey = 'product_name', useCatFilter = false) => {
    const q = search.toLowerCase().trim();
    return rows.filter(i => {
      // For summary tab, filter client-side; for stock tab the backend already filtered by category
      const matchCat    = !useCatFilter || !categoryFilter || String(i.category_id) === String(categoryFilter);
      const matchSearch = !q ||
        i[nameKey]?.toLowerCase().includes(q) ||
        i.shade_code?.toLowerCase().includes(q) ||
        i.chemical_code?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  };

  // Stock tab: backend already handles category filter — only apply search client-side
  const filteredInventory = applyFilters(inventory, 'product_name', false);
  // Summary tab: filter client-side since it's a separate endpoint
  const filteredSummary   = applyFilters(summary, 'name', true);

  // ── Grouped (no-lot) view: collapse rows with same product_id ──────────────
  const groupedInventory = (() => {
    const map = new Map();
    filteredInventory.forEach(item => {
      const key = item.product_id;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += item.quantity;
        existing._lotCount = (existing._lotCount || 1) + 1;
      } else {
        map.set(key, { ...item, _lotCount: 1 });
      }
    });
    return Array.from(map.values());
  })();

  // ─── PDF EXPORT ───────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageW, 22, "F");
    doc.setTextColor(251, 191, 36); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("GH & Sons Enterprises", 14, 10);
    doc.setFontSize(9); doc.setTextColor(148, 163, 184);
    doc.text(tab === "stock" ? "STOCK DETAIL REPORT" : "PRODUCT SUMMARY REPORT", 14, 16);
    doc.setTextColor(100, 116, 139); doc.setFontSize(8);
    doc.text(`Generated: ${now}${locFilter ? `  |  Location: ${locFilter}` : "  |  All Locations"}`, pageW - 14, 16, { align: "right" });

    const codeLabel = isChemical ? 'Chemical Code' : 'Shade/Code';

    if (tab === "stock") {
      const rows = lotView ? filteredInventory : groupedInventory;
      const head = lotView
        ? [[...(!isChemical ? ["Category"] : []), "Product", "Type", "Lot #", "Location", "Quantity", codeLabel]]
        : [[...(!isChemical ? ["Category"] : []), "Product", "Type", "Lots", "Total Quantity"]];
      const body = lotView
        ? rows.map(i => [...(!isChemical ? [i.category_name || '—'] : []), i.product_name, i.product_type, i.lot_number, i.location, `${i.quantity} ${i.unit}`, getCode(i)])
        : rows.map(i => [...(!isChemical ? [i.category_name || '—'] : []), i.product_name, i.product_type, `${i._lotCount}`, `${i.quantity} ${i.unit}`]);
      autoTable(doc, {
        startY: 30,
        head,
        body,
        headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
        margin: { left: 14, right: 14 },
      });
    } else {
      autoTable(doc, {
        startY: 30,
        head: [[...(!isChemical ? ["Category"] : []), "Product", "Type", "Total Qty", "Min Level", "Status"]],
        body: filteredSummary.map(i => [
          ...(!isChemical ? [i.category_name || '—'] : []),
          i.name, i.type,
          `${i.total_quantity || 0} ${i.unit}`,
          i.min_stock_level,
          i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? 'LOW' : 'OK'
        ]),
        headStyles: { fillColor: [30, 39, 56], textColor: [251, 191, 36], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
        margin: { left: 14, right: 14 },
      });
    }
    doc.save(`inventory-${tab}-${dateStamp}.pdf`);
  };

  // ─── EXCEL EXPORT ─────────────────────────────────────────────
  const exportExcel = () => {
    const wb   = XLSX.utils.book_new();
    const codeLabel = isChemical ? 'Chemical Code' : 'Shade/Code';

    if (tab === "stock") {
      const rows = lotView ? filteredInventory : groupedInventory;
      const headers = lotView
        ? [...(!isChemical ? ["Category"] : []), "Product", "Type", "Lot #", "Location", "Quantity", "Unit", codeLabel]
        : [...(!isChemical ? ["Category"] : []), "Product", "Type", "Lots", "Total Quantity", "Unit"];
      const data = lotView
        ? rows.map(i => [...(!isChemical ? [i.category_name || '—'] : []), i.product_name, i.product_type, i.lot_number, i.location, i.quantity, i.unit, getCode(i)])
        : rows.map(i => [...(!isChemical ? [i.category_name || '—'] : []), i.product_name, i.product_type, i._lotCount, i.quantity, i.unit]);
      const ws = XLSX.utils.aoa_to_sheet([
        ["GH & Sons Enterprises — STOCK DETAIL"], [`Generated: ${now}`], [],
        headers, ...data,
      ]);
      ws["!cols"] = lotView
        ? [...(!isChemical ? [{ wch: 16 }] : []), { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 14 }]
        : [...(!isChemical ? [{ wch: 16 }] : []), { wch: 24 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, "Stock Detail");
    } else {
      const ws = XLSX.utils.aoa_to_sheet([
        ["GH & Sons Enterprises — PRODUCT SUMMARY"], [`Generated: ${now}`], [],
        [...(!isChemical ? ["Category"] : []), "Product", "Type", "Total Qty", "Unit", "Min Level", "Status"],
        ...filteredSummary.map(i => [
          ...(!isChemical ? [i.category_name || '—'] : []),
          i.name, i.type, i.total_quantity || 0, i.unit, i.min_stock_level,
          i.min_stock_level > 0 && (i.total_quantity || 0) <= i.min_stock_level ? 'LOW' : 'OK'
        ]),
      ]);
      ws["!cols"] = [...(!isChemical ? [{ wch: 16 }] : []), { wch: 24 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
    }
    XLSX.writeFile(wb, `inventory-${tab}-${dateStamp}.xlsx`);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: 'Barlow Condensed' }}>Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Stock levels across all locations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-emerald-400 hover:text-emerald-300 hover:bg-[#2a3547] border border-emerald-700 hover:border-emerald-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
            style={{ fontFamily: 'Barlow Condensed' }}>
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-amber-400 hover:text-amber-300 hover:bg-[#2a3547] border border-amber-700 hover:border-amber-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
            style={{ fontFamily: 'Barlow Condensed' }}>
            <FileDown size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs + Lot Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['stock', 'summary'].map(t => (
            <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors
                ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
              style={{ fontFamily: 'Barlow Condensed' }}>{t}
            </button>
          ))}
        </div>
        {tab === 'stock' && (
          <div className="flex items-center gap-1 bg-[#1E2738] border border-slate-600 rounded-sm p-0.5">
            <button
              onClick={() => setLotView(true)}
              title="View by Lot"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors
                ${lotView ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              style={{ fontFamily: 'Barlow Condensed' }}>
              <List size={12} /> By Lot
            </button>
            <button
              onClick={() => setLotView(false)}
              title="View by Product (grouped)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors
                ${!lotView ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              style={{ fontFamily: 'Barlow Condensed' }}>
              <Layers size={12} /> By Product
            </button>
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-slate-500 uppercase tracking-wider w-20"
          style={{ fontFamily: 'Barlow Condensed' }}>Location:</span>
        <button onClick={() => setLocFilter("")}
          className={`px-3 py-1.5 text-xs rounded-sm transition-colors
            ${!locFilter ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
          All
        </button>
        {locations.map(loc => (
          <button key={loc} onClick={() => setLocFilter(loc)}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors font-mono
              ${locFilter === loc ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1E2738] text-slate-400 hover:text-white border border-transparent'}`}>
            <MapPin size={12} className="inline mr-1" />{loc}
          </button>
        ))}
      </div>

      {/* Category + Search Filters — category hidden in chemical workspace */}
      <div className="flex gap-3 items-center flex-wrap">
        {!isChemical && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed' }}>Category:</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-sm bg-[#1E2738] text-slate-300 border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
              style={{ fontFamily: 'Barlow Condensed', minWidth: '160px' }}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
              ))}
            </select>
            {categoryFilter && (
              <button onClick={() => setCategoryFilter("")}
                className="px-2 py-1.5 text-xs rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors">
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isChemical ? "Search product or code…" : "Search product or shade…"}
            className="bg-[#1E2738] border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 text-slate-200 rounded-sm pl-7 pr-8 py-1.5 text-xs outline-none transition-colors placeholder:text-slate-600 w-56" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={11} />
            </button>
          )}
        </div>

        {(categoryFilter || search) && (
          <span className="text-[10px] text-slate-500 font-mono">
            {tab === 'stock' ? filteredInventory.length : filteredSummary.length} result{(tab === 'stock' ? filteredInventory.length : filteredSummary.length) !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Low Stock Banner */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-red-900/20 border border-red-700/40 rounded-sm">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">⚠ Low Stock Alert</span>
          <span className="text-red-300 text-xs">{lowStock.length} product{lowStock.length !== 1 ? "s" : ""} below minimum level</span>
        </div>
      )}

      {/* Stock Table */}
      {tab === 'stock' ? (
        <div className="industrial-card" data-testid="inventory-table">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Product</th>
                {!isChemical && <th>Category</th>}
                <th>Type</th>
                {lotView && <th>Lot #</th>}
                {lotView && <th>Location</th>}
                {!lotView && <th>Lots</th>}
                <th>Quantity</th>
                {lotView && <th>{isChemical ? 'Chemical Code' : 'Shade/Code'}</th>}
              </tr>
            </thead>
            <tbody>
              {(lotView ? filteredInventory : groupedInventory).map(item => (
                <tr key={lotView ? item.id : item.product_id}
                  className={item.quantity === 0 ? 'opacity-40' : ''}>
                  <td className="text-slate-200">{item.product_name}</td>
                  {!isChemical && <td className="text-slate-400 text-xs">{item.category_name || <span className="text-slate-600">—</span>}</td>}
                  <td><span className="badge-neutral">{item.product_type}</span></td>
                  {lotView && <td className="text-amber-400 font-mono text-xs">{item.lot_number}</td>}
                  {lotView && <td><span className="badge-info">{item.location}</span></td>}
                  {!lotView && (
                    <td className="text-slate-500 font-mono text-xs">{item._lotCount} lot{item._lotCount !== 1 ? 's' : ''}</td>
                  )}
                  <td className={`font-mono font-bold ${item.quantity === 0 ? 'text-slate-500' : 'text-white'}`}>
                    {item.quantity} {item.unit}
                    {item.quantity === 0 && <span className="ml-1 text-[10px] text-slate-600 font-normal">(depleted)</span>}
                  </td>
                  {lotView && <td className="text-slate-400 font-mono text-xs">{getCode(item)}</td>}
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr><td colSpan={isChemical ? 6 : 7} className="text-center text-slate-500 py-8">No inventory items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="industrial-card" data-testid="summary-table">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Product</th>{!isChemical && <th>Category</th>}<th>Type</th><th>Total Qty</th>
                <th>Min Level</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map(item => (
                <tr key={item.id}>
                  <td className="text-slate-200">{item.name}</td>
                  {!isChemical && <td className="text-slate-400 text-xs">{item.category_name || <span className="text-slate-600">—</span>}</td>}
                  <td><span className="badge-neutral">{item.type}</span></td>
                  <td className="text-white font-mono font-bold">{item.total_quantity || 0} {item.unit}</td>
                  <td className="font-mono text-slate-500">{item.min_stock_level}</td>
                  <td>
                    {item.min_stock_level > 0 && (item.total_quantity || 0) <= item.min_stock_level
                      ? <span className="badge-error">LOW</span>
                      : <span className="badge-success">OK</span>}
                  </td>
                </tr>
              ))}
              {filteredSummary.length === 0 && (
                <tr><td colSpan={isChemical ? 5 : 6} className="text-center text-slate-500 py-8">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}