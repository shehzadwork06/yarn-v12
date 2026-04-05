
// import { useState, useEffect, useRef } from "react";
// import { salesAPI, customersAPI, lotsAPI, categoriesAPI, productsAPI } from "@/lib/api";
// import { toast } from "sonner";
// import {
//   Plus,
//   FileDown,
//   FileSpreadsheet,
//   Search,
//   X,
//   ChevronDown,
//   Package,
//   Printer,
//   Receipt,
// } from "lucide-react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";
// import { useBusinessMode } from "../context/BusinessModeContext"; // ← ADD THIS LINE
// // ─── Sale Receipt Modal ───────────────────────────────────────────────────────
// function SaleReceipt({ sale, onClose }) {
//   if (!sale) return null;

//   const printReceipt = () => {
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a5",
//     });
//     const pageW = doc.internal.pageSize.getWidth();

//     // Header bar
//     doc.setFillColor(15, 23, 42);
//     doc.rect(0, 0, pageW, 28, "F");
//     doc.setTextColor(251, 191, 36);
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("GH & Sons Enterprises", pageW / 2, 10, { align: "center" });
//     doc.setFontSize(7);
//     doc.setTextColor(148, 163, 184);
//     doc.text("Sale Receipt / Invoice", pageW / 2, 16, { align: "center" });
//     doc.setTextColor(100, 116, 139);
//     doc.setFontSize(6.5);
//     doc.text(
//       "Industrial Area, Lahore  |  Tel: +92-XXX-XXXXXXX",
//       pageW / 2,
//       21,
//       { align: "center" },
//     );

//     let y = 34;

//     // Meta strip
//     doc.setFillColor(30, 39, 56);
//     doc.rect(10, y, pageW - 20, 18, "F");

//     doc.setTextColor(148, 163, 184);
//     doc.setFontSize(7);
//     doc.setFont("helvetica", "normal");
//     doc.text("SALE #", 13, y + 5);
//     doc.setTextColor(251, 191, 36);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(9);
//     doc.text(sale.sale_number, 13, y + 12);

//     doc.setTextColor(148, 163, 184);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(7);
//     doc.text("CUSTOMER", pageW / 2, y + 5, { align: "center" });
//     doc.setTextColor(255, 255, 255);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(8);
//     doc.text(sale.customer_name, pageW / 2, y + 12, { align: "center" });

//     doc.setTextColor(148, 163, 184);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(7);
//     doc.text("DATE", pageW - 13, y + 5, { align: "right" });
//     doc.setTextColor(255, 255, 255);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(8);
//     doc.text(sale.date, pageW - 13, y + 12, { align: "right" });

//     y += 24;

//     // Items table — now includes Rate and Amount columns
//     autoTable(doc, {
//       startY: y,
//       head: [[`Lot #`, `Product`, `Qty (${sale.items?.[0]?.unit || "units"})`, `Rate / unit`, `Amount (PKR)`]],
//       body: (sale.items || []).map((item) => [
//         item.lot_number || "-",
//         item.product_name,
//         item.quantity?.toLocaleString(),
//         item.rate?.toLocaleString(),
//         ((item.quantity || 0) * (item.rate || 0)).toLocaleString(),
//       ]),
//       headStyles: {
//         fillColor: [30, 39, 56],
//         textColor: [251, 191, 36],
//         fontStyle: "bold",
//         fontSize: 7,
//       },
//       bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
//       alternateRowStyles: { fillColor: [245, 247, 250] },
//       styles: { cellPadding: 2, lineColor: [200, 210, 220], lineWidth: 0.1 },
//       columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right", fontStyle: "bold" } },
//       margin: { left: 10, right: 10 },
//     });

//     // Totals block
//     let tY = doc.lastAutoTable.finalY + 5;
//     const rX = pageW - 10;
//     const lX = pageW / 2 + 5;

//     const addRow = (label, value, highlight = false, valueColor = [50, 50, 50]) => {
//       if (highlight) {
//         doc.setFillColor(15, 23, 42);
//         doc.rect(lX - 2, tY - 4, rX - lX + 4, 8, "F");
//       }
//       doc.setFont("helvetica", highlight ? "bold" : "normal");
//       doc.setFontSize(highlight ? 8.5 : 7.5);
//       doc.setTextColor(highlight ? 148 : 100, highlight ? 163 : 116, highlight ? 184 : 139);
//       doc.text(label, lX, tY);
//       doc.setTextColor(...(highlight ? [251, 191, 36] : valueColor));
//       doc.text(value, rX, tY, { align: "right" });
//       tY += 6;
//     };

//     const totalQtyGP = (sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0);

//     // Qty row
//     doc.setFillColor(30, 39, 56);
//     doc.rect(lX - 2, tY - 4, rX - lX + 4, 8, "F");
//     doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
//     doc.setTextColor(148, 163, 184);
//     doc.text(`TOTAL QTY (${sale.items?.[0]?.unit || "units"})`, lX, tY);
//     doc.setTextColor(200, 200, 200);
//     doc.text(totalQtyGP.toLocaleString(), rX, tY, { align: "right" });
//     tY += 7;

//     // Subtotal row
//     doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
//     doc.setTextColor(100, 116, 139);
//     doc.text("SUBTOTAL", lX, tY);
//     doc.setTextColor(50, 50, 50);
//     doc.text(`PKR ${sale.total_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
//     tY += 6;

//     // Discount row (only if applicable)
//     if (sale.discount_amount > 0) {
//       doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
//       doc.setTextColor(100, 116, 139);
//       doc.text(`DISCOUNT${sale.discount_percentage > 0 ? ` (${sale.discount_percentage?.toFixed(1)}%)` : ""}`, lX, tY);
//       doc.setTextColor(192, 57, 43);
//       doc.text(`- PKR ${sale.discount_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
//       tY += 6;
//     }

//     // Net Amount — highlighted
//     doc.setFillColor(15, 23, 42);
//     doc.rect(lX - 2, tY - 4, rX - lX + 4, 9, "F");
//     doc.setFont("helvetica", "bold"); doc.setFontSize(9);
//     doc.setTextColor(148, 163, 184);
//     doc.text("NET AMOUNT", lX, tY);
//     doc.setTextColor(251, 191, 36);
//     doc.text(`PKR ${sale.net_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
//     tY += 8;

//     // Gate pass badge
//     if (sale.gate_pass) {
//       tY += 4;
//       doc.setFillColor(30, 39, 56);
//       doc.rect(10, tY, pageW - 20, 10, "F");
//       doc.setTextColor(148, 163, 184);
//       doc.setFontSize(6.5);
//       doc.setFont("helvetica", "normal");
//       doc.text("GATE PASS", 13, tY + 4);
//       doc.setTextColor(251, 191, 36);
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(7.5);
//       doc.text(sale.gate_pass.gate_pass_number, 13, tY + 8.5);
//       doc.setTextColor(148, 163, 184);
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(6.5);
//       doc.text(
//         `Total Qty: ${sale.gate_pass.total_quantity?.toLocaleString()} {sale.items?.[0]?.unit || "units"}`,
//         pageW - 13,
//         tY + 8.5,
//         { align: "right" },
//       );
//     }

//     // Notes
//     if (sale.notes) {
//       doc.setTextColor(120, 130, 145);
//       doc.setFontSize(6.5);
//       doc.setFont("helvetica", "italic");
//       doc.text(
//         `Note: ${sale.notes}`,
//         10,
//         doc.internal.pageSize.getHeight() - 12,
//       );
//     }

//     // Footer
//     doc.setFontSize(6);
//     doc.setTextColor(100, 116, 139);
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Thank you for your business — GH & Sons Enterprises",
//       pageW / 2,
//       doc.internal.pageSize.getHeight() - 6,
//       { align: "center" },
//     );

//     doc.save(`receipt-${sale.sale_number}.pdf`);
//   };

//   const items = sale.items || [];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         className="bg-[#0D1424] border border-[#2D3648] rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal header */}
//         <div className="bg-[#0A0F1C] px-5 py-4 border-b border-[#1E2738] flex items-center justify-between shrink-0">
//           <div className="flex items-center gap-2">
//             <Receipt size={15} className="text-amber-400" />
//             <span
//               className="text-sm font-bold text-white uppercase tracking-wider"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               Sale Receipt
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-slate-500 hover:text-slate-300 transition-colors"
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Scrollable receipt body */}
//         <div className="p-5 overflow-y-auto">
//           {/* Company */}
//           <div className="text-center mb-5 pb-4 border-b border-[#1E2738]">
//             <p
//               className="text-amber-400 font-bold text-lg tracking-widest uppercase"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               GH & Sons Enterprises
//             </p>
//             <p className="text-slate-500 text-xs mt-0.5">
//               Sale Receipt / Invoice
//             </p>
//           </div>

//           {/* Meta */}
//           <div className="grid grid-cols-3 gap-3 mb-5">
//             {[
//               {
//                 label: "Sale #",
//                 value: sale.sale_number,
//                 cls: "text-amber-400 font-mono font-bold",
//               },
//               {
//                 label: "Customer",
//                 value: sale.customer_name,
//                 cls: "text-slate-200 font-semibold truncate",
//               },
//               {
//                 label: "Date",
//                 value: sale.date,
//                 cls: "text-slate-200 font-mono",
//               },
//             ].map(({ label, value, cls }) => (
//               <div
//                 key={label}
//                 className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]"
//               >
//                 <p
//                   className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5"
//                   style={{ fontFamily: "Barlow Condensed" }}
//                 >
//                   {label}
//                 </p>
//                 <p className={`text-xs ${cls}`}>{value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Items */}
//           <div className="mb-4">
//             <div className="grid grid-cols-[72px_1fr_60px_60px_80px] gap-x-2 px-2 mb-1">
//               {["Lot #", "Product", "Qty", "Rate", "Amount"].map((h) => (
//                 <p
//                   key={h}
//                   className="text-[9px] text-slate-500 uppercase tracking-wider"
//                   style={{ fontFamily: "Barlow Condensed" }}
//                 >
//                   {h}
//                 </p>
//               ))}
//             </div>
//             <div className="border border-[#1E2738] rounded-sm overflow-hidden">
//               {items.length > 0 ? (
//                 items.map((item, i) => (
//                   <div
//                     key={i}
//                     className={`grid grid-cols-[72px_1fr_60px_60px_80px] gap-x-2 px-3 py-2 items-center border-b border-[#1E2738] last:border-0 ${i % 2 === 0 ? "bg-[#0A0F1C]" : "bg-[#0D1424]"}`}
//                   >
//                     <span className="text-amber-400/80 font-mono text-[10px]">
//                       {item.lot_number || "—"}
//                     </span>
//                     <span className="text-slate-300 text-xs truncate">
//                       {item.product_name}
//                     </span>
//                     <span className="text-slate-400 text-xs text-right font-mono">
//                       {item.quantity?.toLocaleString()}
//                     </span>
//                     <span className="text-slate-400 text-xs text-right font-mono">
//                       {item.rate?.toLocaleString()}
//                     </span>
//                     <span className="text-white text-xs text-right font-mono font-semibold">
//                       {((item.quantity || 0) * (item.rate || 0)).toLocaleString()}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="px-3 py-4 text-center text-slate-600 text-xs">
//                   No items
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Totals block */}
//           <div className="bg-[#0A0F1C] border border-[#2D3648] rounded-sm px-3 py-2 mb-4 space-y-1.5">
//             <div className="flex justify-between items-center">
//               <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Total Qty</span>
//               <span className="text-slate-300 font-mono text-xs">
//                 {(sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0).toLocaleString()} {sale.items?.[0]?.unit || "units"}
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Subtotal</span>
//               <span className="text-slate-300 font-mono text-xs">PKR {sale.total_amount?.toLocaleString()}</span>
//             </div>
//             {sale.discount_amount > 0 && (
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
//                   Discount {sale.discount_percentage > 0 ? `(${sale.discount_percentage?.toFixed(1)}%)` : ""}
//                 </span>
//                 <span className="text-red-400 font-mono text-xs">- PKR {sale.discount_amount?.toLocaleString()}</span>
//               </div>
//             )}
//             <div className="flex justify-between items-center pt-1 border-t border-[#2D3648]">
//               <span className="text-amber-400 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Net Amount</span>
//               <span className="text-amber-400 font-mono font-bold">PKR {sale.net_amount?.toLocaleString()}</span>
//             </div>
//           </div>

//           {/* Gate pass */}
//           {sale.gate_pass && (
//             <div className="flex items-center justify-between bg-[#1E2738]/50 border border-[#2D3648] rounded-sm px-3 py-2 mb-4">
//               <div>
//                 <p
//                   className="text-[9px] text-slate-500 uppercase tracking-wider"
//                   style={{ fontFamily: "Barlow Condensed" }}
//                 >
//                   Gate Pass
//                 </p>
//                 <p className="text-slate-300 font-mono text-xs font-semibold">
//                   {sale.gate_pass.gate_pass_number}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p
//                   className="text-[9px] text-slate-500 uppercase tracking-wider"
//                   style={{ fontFamily: "Barlow Condensed" }}
//                 >
//                   Total Qty
//                 </p>
//                 <p className="text-slate-300 font-mono text-xs">
//                   {sale.gate_pass.total_quantity?.toLocaleString()} {sale.items?.[0]?.unit || "units"}
//                 </p>
//               </div>
//             </div>
//           )}

//           {sale.notes && (
//             <p className="text-xs text-slate-500 italic px-1">
//               Note: {sale.notes}
//             </p>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="px-5 pb-5 pt-3 border-t border-[#1E2738] flex gap-2 shrink-0">
//           <button
//             onClick={printReceipt}
//             className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 text-xs transition-all active:scale-95"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             <Printer size={14} /> Print / Download PDF
//           </button>
//           <button
//             onClick={onClose}
//             className="px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 text-xs transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Lot Search Picker ────────────────────────────────────────────────────────
// function LotPicker({ lots, categories, selectedLotId, onSelect }) {
//   const [catId, setCatId] = useState("");
//   const [search, setSearch] = useState("");
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filtered = lots.filter((l) => {
//     // category_id is now returned directly from the backend (p.category_id via JOIN)
//     const matchCat = !catId || String(l.category_id) === String(catId);
//     const q = search.toLowerCase().trim();
//     const matchSearch =
//       !q ||
//       l.lot_number?.toLowerCase().includes(q) ||
//       l.product_name?.toLowerCase().includes(q) ||
//       l.shade?.toLowerCase().includes(q) ||
//       l.product_shade?.toLowerCase().includes(q);
//     return matchCat && matchSearch;
//   });

//   const selected = lots.find((l) => l.id === parseInt(selectedLotId));
//   const handleSelect = (lot) => {
//     onSelect(lot);
//     setOpen(false);
//     setSearch("");
//   };
//   const handleClear = (e) => {
//     e.stopPropagation();
//     onSelect(null);
//     setCatId("");
//     setSearch("");
//   };

//   return (
//     <div className="relative col-span-2" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className={`w-full flex items-center justify-between bg-[#0A0F1C] border rounded-sm px-3 h-9 text-xs outline-none transition-colors ${open ? "border-amber-500" : "border-[#2D3648] hover:border-slate-500"}`}
//       >
//         {selected ? (
//           <span className="flex items-center gap-2 min-w-0">
//             <span className="text-amber-400 font-mono shrink-0">
//               {selected.lot_number}
//             </span>
//             <span className="text-slate-300 truncate">
//               {selected.product_name}
//             </span>
//             {(selected.shade || selected.product_shade) && (
//               <span className="text-slate-500 truncate">
//                 · {selected.shade || selected.product_shade}
//               </span>
//             )}
//             <span className="text-slate-500 shrink-0">
//               ({selected.current_quantity} {selected.unit || "units"})
//             </span>
//           </span>
//         ) : (
//           <span className="text-slate-500">Select Lot…</span>
//         )}
//         <span className="flex items-center gap-1 ml-2 shrink-0">
//           {selected && (
//             <span
//               onClick={handleClear}
//               className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
//             >
//               <X size={12} />
//             </span>
//           )}
//           <ChevronDown
//             size={12}
//             className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
//           />
//         </span>
//       </button>

//       {open && (
//         <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0D1424] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/60 overflow-hidden">
//           <div className="flex gap-2 p-2 border-b border-[#1E2738] bg-[#0A0F1C]">
//             {categories.length > 0 && (
//               <div className="relative shrink-0">
//                 <select
//                   value={catId}
//                   onChange={(e) => {
//                     setCatId(e.target.value);
//                     setSearch("");
//                   }}
//                   className="appearance-none bg-[#1E2738] border border-[#2D3648] text-slate-300 rounded-sm pl-3 pr-7 h-7 text-xs outline-none focus:border-amber-500 transition-colors cursor-pointer"
//                   style={{ fontFamily: "Barlow Condensed" }}
//                 >
//                   <option value="">All Categories</option>
//                   {categories.map((c) => (
//                     <option key={c.id} value={String(c.id)}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown
//                   size={10}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
//                 />
//               </div>
//             )}
//             <div className="relative flex-1">
//               <Search
//                 size={11}
//                 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
//               />
//               <input
//                 autoFocus
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by product name or shade…"
//                 className="w-full bg-[#1E2738] border border-[#2D3648] text-slate-200 rounded-sm pl-7 pr-3 h-7 text-xs outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
//               />
//               {search && (
//                 <button
//                   type="button"
//                   onClick={() => setSearch("")}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
//                 >
//                   <X size={10} />
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="max-h-52 overflow-y-auto">
//             {filtered.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-6 text-slate-600">
//                 <Package size={20} className="mb-1.5" />
//                 <span className="text-xs">No lots match your search</span>
//               </div>
//             ) : (
//               filtered.map((lot) => (
//                 <button
//                   key={lot.id}
//                   type="button"
//                   onClick={() => handleSelect(lot)}
//                   className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1E2738] transition-colors border-b border-[#1A2133]/50 last:border-0 group ${selectedLotId === lot.id ? "bg-amber-500/5" : ""}`}
//                 >
//                   <div className="flex items-center gap-2.5 min-w-0">
//                     <span className="text-amber-400/80 font-mono text-[10px] shrink-0 group-hover:text-amber-400 transition-colors">
//                       {lot.lot_number}
//                     </span>
//                     <span className="text-slate-300 text-xs truncate">
//                       {lot.product_name}
//                     </span>
//                     {(lot.shade || lot.product_shade) && (
//                       <span className="text-slate-500 text-[10px] truncate">
//                         · {lot.shade || lot.product_shade}
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 shrink-0 ml-2">
//                     <span className="text-[10px] text-slate-500 font-mono">
//                       {lot.current_quantity} {lot.unit || "units"}
//                     </span>
//                     <span
//                       className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-sm ${
//                         lot.status === "IN_STORE"
//                           ? "bg-blue-500/10 text-blue-400"
//                           : lot.status === "READY_FOR_SALE"
//                             ? "bg-emerald-500/10 text-emerald-400"
//                             : "bg-amber-500/10 text-amber-400"
//                       }`}
//                       style={{ fontFamily: "Barlow Condensed" }}
//                     >
//                       {lot.status.replace(/_/g, " ")}
//                     </span>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>

//           {filtered.length > 0 && (
//             <div
//               className="px-3 py-1.5 bg-[#0A0F1C] border-t border-[#1E2738] text-[10px] text-slate-600"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               {filtered.length} lot{filtered.length !== 1 ? "s" : ""} available
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function SalesPage() {
//   const [sales, setSales] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [customers, setCustomers] = useState([]);
//   const [lots, setLots] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [form, setForm] = useState({
//     customer_id: "",
//     date: new Date().toISOString().split("T")[0],
//     target_price: "",
//     notes: "",
//   });
//   const [items, setItems] = useState([
//     { lot_id: "", product_id: "", quantity: "", rate: "" },
//   ]);
//   const [receiptSale, setReceiptSale] = useState(null);
//   const [editModal,   setEditModal]   = useState(false);
//   const [editSale,    setEditSale]    = useState(null);
//   const [editForm,    setEditForm]    = useState({ customer_id: '', date: '', target_price: '', notes: '' });
//   const [editItems,   setEditItems]   = useState([]);
//   const { businessMode } = useBusinessMode();
//   const load = () =>
//     salesAPI
//       .list(categoryFilter ? { category_id: categoryFilter } : {})
//       .then((r) => setSales(r.data));

//   useEffect(() => {
//     load();
//     customersAPI.list().then((r) => setCustomers(r.data));
//     Promise.all([lotsAPI.list(), productsAPI.list()])
//       .then(([lotsRes, productsRes]) => {
//         const productMap = {};
//         for (const p of productsRes.data) productMap[p.id] = p;
//         const enriched = lotsRes.data.map((l) => ({
//           ...l,
//           category_id: productMap[l.product_id]?.category_id ?? null,
//           unit: productMap[l.product_id]?.unit ?? l.unit,
//         }));
//         setLots(enriched);
//       });
//     categoriesAPI
//       .list()
//       .then((r) => setCategories(r.data))
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     load();
//   }, [categoryFilter]);

//   const saleLots = lots.filter(
//     (l) =>
//       ["IN_STORE", "READY_FOR_SALE", "PARTIALLY_SOLD"].includes(l.status) &&
//       l.product_type !== "CHEMICAL_RAW",
//   );

//   const filteredSales = sales;

//   const addItem = () =>
//     setItems([
//       ...items,
//       { lot_id: "", product_id: "", quantity: "", rate: "" },
//     ]);
//   const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
//   const updateItem = (i, field, val) => {
//     const n = [...items];
//     n[i][field] = val;
//     setItems(n);
//   };

//   const handleLotSelect = (i, lot) => {
//     const n = [...items];
//     if (lot) {
//       n[i].lot_id = lot.id;
//       n[i].product_id = lot.product_id;
//     } else {
//       n[i].lot_id = "";
//       n[i].product_id = "";
//     }
//     setItems(n);
//   };

//   const calcTotal = () =>
//     items.reduce(
//       (sum, i) =>
//         sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
//       0,
//     );

//   const openReceipt = async (saleId) => {
//     try {
//       const r = await salesAPI.get(saleId);
//       setReceiptSale(r.data);
//     } catch {
//       toast.error("Could not load sale details");
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         customer_id: parseInt(form.customer_id),
//         date: form.date,
//         notes: form.notes,
//         target_price: form.target_price
//           ? parseFloat(form.target_price)
//           : undefined,
//         items: items.map((i) => ({
//           lot_id: parseInt(i.lot_id),
//           product_id: parseInt(i.product_id),
//           quantity: parseFloat(i.quantity),
//           rate: parseFloat(i.rate),
//         })),
//       };
//       const created = await salesAPI.create(payload);
//       toast.success("Sale created with gate pass");
//       setShowForm(false);
//       setItems([{ lot_id: "", product_id: "", quantity: "", rate: "" }]);
//       load();
//       if (created.data?.id) openReceipt(created.data.id);
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Error");
//     }
//   };

//   const openEditSale = async (saleId) => {
//     try {
//       const { data } = await salesAPI.get(saleId);
//       setEditSale(data);
//       setEditForm({
//         customer_id:  String(data.customer_id),
//         date:         data.date,
//         target_price: data.discount_amount > 0 ? String(data.net_amount) : '',
//         notes:        data.notes || '',
//       });
//       setEditItems((data.items || []).map(item => ({
//         lot_id:     item.lot_id,
//         product_id: item.product_id,
//         lot_number: item.lot_number,
//         product_name: item.product_name,
//         quantity:   String(item.quantity),
//         rate:       String(item.rate),
//       })));
//       setEditModal(true);
//     } catch { toast.error("Could not load sale for editing"); }
//   };

//   const handleSaleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         customer_id:         parseInt(editForm.customer_id),
//         date:                editForm.date,
//         notes:               editForm.notes,
//         target_price:        editForm.target_price ? parseFloat(editForm.target_price) : undefined,
//         items: editItems.map(i => ({
//           lot_id:     i.lot_id,
//           product_id: i.product_id,
//           quantity:   parseFloat(i.quantity),
//           rate:       parseFloat(i.rate),
//         })),
//       };
//       await salesAPI.update(editSale.id, payload);
//       toast.success("Sale updated successfully");
//       setEditModal(false);
//       load();
//       // Refresh receipt if it's currently open for this sale
//       if (receiptSale?.id === editSale.id) openReceipt(editSale.id);
//     } catch (err) { toast.error(err.response?.data?.error || "Error updating sale"); }
//   };

//   const now = new Date().toLocaleString();
//   const dateStamp = new Date().toISOString().slice(0, 10);
//   const totalSalesValue = filteredSales.reduce(
//     (s, r) => s + (r.net_amount || 0),
//     0,
//   );
//   const totalDiscount = filteredSales.reduce(
//     (s, r) => s + (r.discount_amount || 0),
//     0,
//   );

//   const exportPDF = () => {
//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: "a4",
//     });
//     const pageW = doc.internal.pageSize.getWidth();
//     doc.setFillColor(15, 23, 42);
//     doc.rect(0, 0, pageW, 22, "F");
//     doc.setTextColor(251, 191, 36);
//     doc.setFontSize(16);
//     doc.setFont("helvetica", "bold");
//     doc.text("GH & Sons Enterprises", 14, 10);
//     doc.setFontSize(9);
//     doc.setTextColor(148, 163, 184);
//     doc.text("SALES REPORT", 14, 16);
//     doc.setTextColor(100, 116, 139);
//     doc.setFontSize(8);
//     doc.text(
//       `Generated: ${now}  |  ${filteredSales.length} record${filteredSales.length !== 1 ? "s" : ""}`,
//       pageW - 14,
//       16,
//       { align: "right" },
//     );
//     let y = 30;
//     doc.setFillColor(30, 39, 56);
//     doc.rect(14, y, pageW - 28, 12, "F");
//     doc.setTextColor(148, 163, 184);
//     doc.setFontSize(7.5);
//     doc.setFont("helvetica", "normal");
//     doc.text("TOTAL SALES", 18, y + 5);
//     doc.setTextColor(251, 191, 36);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(9);
//     doc.text(`PKR ${totalSalesValue.toLocaleString()}`, 18, y + 10);
//     doc.setTextColor(148, 163, 184);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(7.5);
//     doc.text("TOTAL DISCOUNT", 90, y + 5);
//     doc.setTextColor(239, 68, 68);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(9);
//     doc.text(`PKR ${totalDiscount.toLocaleString()}`, 90, y + 10);
//     const dispatched = filteredSales.filter(
//       (s) => s.status === "DISPATCHED",
//     ).length;
//     doc.setTextColor(148, 163, 184);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(7.5);
//     doc.text("DISPATCHED", 170, y + 5);
//     doc.setTextColor(39, 174, 96);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(9);
//     doc.text(`${dispatched} / ${filteredSales.length}`, 170, y + 10);
//     y += 18;
//     doc.setTextColor(251, 191, 36);
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "bold");
//     doc.text(`ALL SALES  (${filteredSales.length} records)`, 14, y);
//     y += 4;
//     autoTable(doc, {
//       startY: y,
//       head: [
//         [
//           "Sale #",
//           "Customer",
//           "Date",
//           "Total (PKR)",
//           "Discount",
//           "Net (PKR)",
//           "Status",
//         ],
//       ],
//       body: filteredSales.map((s) => [
//         s.sale_number,
//         s.customer_name,
//         s.date,
//         s.total_amount?.toLocaleString(),
//         s.discount_percentage > 0
//           ? `${s.discount_percentage.toFixed(1)}%`
//           : "-",
//         s.net_amount?.toLocaleString(),
//         s.status,
//       ]),
//       headStyles: {
//         fillColor: [30, 39, 56],
//         textColor: [251, 191, 36],
//         fontStyle: "bold",
//         fontSize: 8,
//       },
//       bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
//       alternateRowStyles: { fillColor: [245, 247, 250] },
//       styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
//       columnStyles: {
//         3: { halign: "right" },
//         4: { halign: "right" },
//         5: { halign: "right", fontStyle: "bold" },
//         6: { halign: "center" },
//       },
//       didParseCell(data) {
//         if (data.column.index === 6 && data.section === "body") {
//           const v = data.cell.raw;
//           if (v === "DISPATCHED") data.cell.styles.textColor = [39, 174, 96];
//           else if (v === "CONFIRMED")
//             data.cell.styles.textColor = [59, 130, 246];
//           else data.cell.styles.textColor = [100, 116, 139];
//         }
//         if (
//           data.column.index === 4 &&
//           data.section === "body" &&
//           data.cell.raw !== "-"
//         )
//           data.cell.styles.textColor = [192, 57, 43];
//       },
//       margin: { left: 14, right: 14 },
//     });
//     const finalY = doc.lastAutoTable.finalY;
//     doc.setFillColor(15, 23, 42);
//     doc.rect(14, finalY, pageW - 28, 10, "F");
//     doc.setTextColor(148, 163, 184);
//     doc.setFontSize(8);
//     doc.setFont("helvetica", "normal");
//     doc.text("TOTAL NET AMOUNT", 18, finalY + 6.5);
//     doc.setTextColor(251, 191, 36);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(10);
//     doc.text(
//       `PKR ${totalSalesValue.toLocaleString()}`,
//       pageW - 18,
//       finalY + 6.5,
//       { align: "right" },
//     );
//     const totalPages = doc.internal.getNumberOfPages();
//     for (let p = 1; p <= totalPages; p++) {
//       doc.setPage(p);
//       doc.setFontSize(7);
//       doc.setTextColor(150, 160, 175);
//       doc.text(
//         `GH & Sons Enterprises — Sales Report — ${dateStamp}`,
//         14,
//         doc.internal.pageSize.getHeight() - 6,
//       );
//       doc.text(
//         `Page ${p} of ${totalPages}`,
//         pageW - 14,
//         doc.internal.pageSize.getHeight() - 6,
//         { align: "right" },
//       );
//     }
//     doc.save(`sales-report-${dateStamp}.pdf`);
//   };

//   const exportExcel = () => {
//     const wb = XLSX.utils.book_new();
//     const ws1 = XLSX.utils.aoa_to_sheet([
//       ["GH & Sons Enterprises — SALES REPORT"],
//       [`Generated: ${now}  |  ${filteredSales.length} records`],
//       [],
//       [
//         "Sale #",
//         "Customer",
//         "Date",
//         "Total Amount",
//         "Discount %",
//         "Discount Amount",
//         "Net Amount",
//         "Status",
//       ],
//       ...filteredSales.map((s) => [
//         s.sale_number,
//         s.customer_name,
//         s.date,
//         s.total_amount || 0,
//         s.discount_percentage || 0,
//         s.discount_amount || 0,
//         s.net_amount || 0,
//         s.status,
//       ]),
//       [],
//       ["", "", "", "", "", "TOTAL NET", totalSalesValue],
//     ]);
//     ws1["!cols"] = [
//       { wch: 16 },
//       { wch: 24 },
//       { wch: 12 },
//       { wch: 16 },
//       { wch: 12 },
//       { wch: 16 },
//       { wch: 16 },
//       { wch: 14 },
//     ];
//     XLSX.utils.book_append_sheet(wb, ws1, "Sales");
//     const byStatus = ["CONFIRMED", "DISPATCHED", "DRAFT", "CANCELLED"]
//       .map((status) => {
//         const group = filteredSales.filter((s) => s.status === status);
//         return [
//           status,
//           group.length,
//           group.reduce((sum, s) => sum + (s.net_amount || 0), 0),
//         ];
//       })
//       .filter((r) => r[1] > 0);
//     const ws2 = XLSX.utils.aoa_to_sheet([
//       ["GH & Sons Enterprises — SALES SUMMARY BY STATUS"],
//       [`Generated: ${now}`],
//       [],
//       ["Status", "Count", "Total Net Amount (PKR)"],
//       ...byStatus,
//       [],
//       ["TOTAL", filteredSales.length, totalSalesValue],
//     ]);
//     ws2["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 24 }];
//     XLSX.utils.book_append_sheet(wb, ws2, "Summary by Status");
//     XLSX.writeFile(wb, `sales-report-${dateStamp}.xlsx`);
//   };

//   return (
//     <div data-testid="sales-page" className="space-y-6">
//       {receiptSale && (
//         <SaleReceipt sale={receiptSale} onClose={() => setReceiptSale(null)} />
//       )}

//       <div className="flex items-center justify-between">
//         <div>
//           <h1
//             className="text-3xl font-bold text-white uppercase tracking-tight"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             Sales
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">
//             Lot-based sales with auto gate pass
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={exportExcel}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-emerald-400 hover:text-emerald-300 hover:bg-[#2a3547] border border-emerald-700 hover:border-emerald-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             <FileSpreadsheet size={14} /> Export Excel
//           </button>
//           <button
//             onClick={exportPDF}
//             className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-amber-400 hover:text-amber-300 hover:bg-[#2a3547] border border-amber-700 hover:border-amber-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             <FileDown size={14} /> Export PDF
//           </button>
//           <button
//             data-testid="new-sale-btn"
//             onClick={() => setShowForm(!showForm)}
//             className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             <Plus size={16} /> New Sale
//           </button>
//         </div>
//       </div>

//       {showForm && (
//         <form
//           onSubmit={handleCreate}
//           className="industrial-card p-5 animate-fade-in"
//           data-testid="sale-form"
//         >
//           <h3
//             className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             New Sale
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
//             <div>
//               <label
//                 className="block text-xs text-slate-400 uppercase mb-1"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Customer
//               </label>
//               <select
//                 data-testid="sale-customer"
//                 value={form.customer_id}
//                 onChange={(e) =>
//                   setForm({ ...form, customer_id: e.target.value })
//                 }
//                 required
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
//               >
//                 <option value="">Select customer</option>
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label
//                 className="block text-xs text-slate-400 uppercase mb-1"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => setForm({ ...form, date: e.target.value })}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-xs text-slate-400 uppercase mb-1"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Target Price (opt.)
//               </label>
//               <input
//                 data-testid="sale-target-price"
//                 type="number"
//                 value={form.target_price}
//                 onChange={(e) =>
//                   setForm({ ...form, target_price: e.target.value })
//                 }
//                 placeholder="System calculates discount"
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-xs text-slate-400 uppercase mb-1"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Notes
//               </label>
//               <input
//                 value={form.notes}
//                 onChange={(e) => setForm({ ...form, notes: e.target.value })}
//                 className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
//               />
//             </div>
//           </div>

//           <div className="mb-3">
//             <div className="flex items-center justify-between mb-2">
//               <h4
//                 className="text-xs text-slate-400 uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Sale Items
//               </h4>
//               <span
//                 className="text-[10px] text-slate-600 uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Select category → search by product or shade
//               </span>
//             </div>
//             <div className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 mb-1.5 px-0.5">
//               <div
//                 className="col-span-2 text-[10px] text-slate-600 uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Lot
//               </div>
//               <div
//                 className="text-[10px] text-slate-600 uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 {businessMode === "CHEMICAL" ? "Qty (Kg)" : "Qty (No Of Cones)"}
//               </div>
//               <div
//                 className="text-[10px] text-slate-600 uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 Rate / Cone
//               </div>
//               <div />
//             </div>
//             <div className="space-y-2">
//               {items.map((item, i) => (
//                 <div
//                   key={i}
//                   className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 items-start"
//                 >
//                   <LotPicker
//                     lots={saleLots}
//                     categories={categories}
//                     selectedLotId={item.lot_id}
//                     onSelect={(lot) => handleLotSelect(i, lot)}
//                   />
//                   <input
//                     type="number"
//                     placeholder={businessMode === "CHEMICAL" ? "Qty (Kg)" : "Qty (No Of Cones)"}
//                     value={item.quantity}
//                     onChange={(e) => updateItem(i, "quantity", e.target.value)}
//                     required
//                     className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Rate / unit"
//                     value={item.rate}
//                     onChange={(e) => updateItem(i, "rate", e.target.value)}
//                     required
//                     className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors"
//                   />
//                   <div className="flex items-center h-9">
//                     {items.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeItem(i)}
//                         className="text-slate-600 hover:text-red-400 transition-colors p-1"
//                       >
//                         <X size={14} />
//                       </button>
//                     )}
//                     {item.quantity && item.rate && (
//                       <span className="text-[10px] text-slate-500 font-mono ml-1">
//                         ={" "}
//                         {(
//                           parseFloat(item.quantity) * parseFloat(item.rate)
//                         ).toLocaleString()}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1E2738]">
//             <button
//               type="button"
//               onClick={addItem}
//               className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
//             >
//               <Plus size={12} /> Add Item
//             </button>
//             <p className="text-sm text-white font-mono">
//               Total:{" "}
//               <span className="text-amber-400 font-bold">
//                 {calcTotal().toLocaleString()}
//               </span>
//             </p>
//           </div>
//           <div className="flex gap-2 mt-4">
//             <button
//               type="submit"
//               data-testid="submit-sale"
//               className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs transition-all active:scale-95"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               Create Sale
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       {businessMode === "YARN" && categories.length > 0 && (
//         <div className="flex gap-2 items-center">
//           <span
//             className="text-xs text-slate-500 uppercase tracking-wider"
//             style={{ fontFamily: "Barlow Condensed" }}
//           >
//             Category:
//           </span>
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="px-3 py-1.5 text-xs rounded-sm bg-[#1E2738] text-slate-300 border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
//             style={{ fontFamily: "Barlow Condensed", minWidth: "160px" }}
//           >
//             <option value="">All Categories</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={String(cat.id)}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//           {categoryFilter && (
//             <button
//               onClick={() => setCategoryFilter("")}
//               className="px-2 py-1.5 text-xs rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
//             >
//               ✕ Clear
//             </button>
//           )}
//         </div>
//       )}

//       <div className="industrial-card" data-testid="sales-table">
//         <table className="w-full erp-table">
//           <thead>
//             <tr>
//               <th>Sale #</th>
//               <th>Customer</th>
//               <th>Date</th>
//               <th>Total</th>
//               <th>Discount</th>
//               <th>Net</th>
//               <th>Status</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredSales.map((s) => (
//               <tr key={s.id}>
//                 <td className="text-amber-400 font-mono text-xs">
//                   {s.sale_number}
//                 </td>
//                 <td className="text-slate-200">{s.customer_name}</td>
//                 <td className="text-slate-400 font-mono text-xs">{s.date}</td>
//                 <td className="font-mono text-slate-400">
//                   {s.total_amount?.toLocaleString()}
//                 </td>
//                 <td className="font-mono text-red-400">
//                   {s.discount_percentage > 0
//                     ? `${s.discount_percentage.toFixed(1)}%`
//                     : "-"}
//                 </td>
//                 <td className="font-mono text-white font-bold">
//                   {s.net_amount?.toLocaleString()}
//                 </td>
//                 <td>
//                   <span
//                     className={
//                       s.status === "DISPATCHED"
//                         ? "badge-success"
//                         : s.status === "CONFIRMED"
//                           ? "badge-info"
//                           : "badge-neutral"
//                     }
//                   >
//                     {s.status}
//                   </span>
//                 </td>
//                 <td>
//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => openEditSale(s.id)}
//                       className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider px-2 py-1 hover:bg-amber-500/5 rounded-sm"
//                       style={{ fontFamily: "Barlow Condensed" }}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => openReceipt(s.id)}
//                       className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors uppercase tracking-wider px-2 py-1 hover:bg-amber-500/5 rounded-sm"
//                       style={{ fontFamily: "Barlow Condensed" }}
//                     >
//                       <Receipt size={11} /> Receipt
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {filteredSales.length === 0 && (
//               <tr>
//                 <td colSpan={8} className="text-center text-slate-500 py-8">
//                   No sales found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ── Edit Sale Modal ──────────────────────────────────────────────────── */}
//       {editModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
//           <div className="bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3648]">
//               <h3 className="text-base font-bold text-white uppercase tracking-wider"
//                 style={{ fontFamily: "Barlow Condensed" }}>Edit Sale — {editSale?.sale_number}</h3>
//               <button type="button" onClick={() => setEditModal(false)}
//                 className="text-slate-500 hover:text-white transition-colors">
//                 <X size={18} />
//               </button>
//             </div>
//             <form onSubmit={handleSaleUpdate} className="p-6">
//               {/* Header fields */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Customer *</label>
//                   <select required value={editForm.customer_id}
//                     onChange={e => setEditForm({ ...editForm, customer_id: e.target.value })}
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60">
//                     <option value="">Select customer</option>
//                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Date</label>
//                   <input type="date" value={editForm.date}
//                     onChange={e => setEditForm({ ...editForm, date: e.target.value })}
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Target Price (opt.)</label>
//                   <input type="number" value={editForm.target_price}
//                     onChange={e => setEditForm({ ...editForm, target_price: e.target.value })}
//                     placeholder="Auto discount"
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Notes</label>
//                   <input value={editForm.notes}
//                     onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
//                 </div>
//               </div>

//               {/* Items — lot locked, only qty/rate editable */}
//               <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: "Barlow Condensed" }}>
//                 Items — lot numbers are locked, only qty / rate can change
//               </p>
//               <div className="grid grid-cols-[1fr_1fr_110px_110px_60px] gap-3 mb-1.5 px-0.5">
//                 {["Lot #", "Product", `Qty (${businessMode === "CHEMICAL" ? "Kg" : "No Of Cones"})`, "Rate / unit", ""].map(h => (
//                   <div key={h} className="text-[10px] text-slate-600 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>{h}</div>
//                 ))}
//               </div>
//               <div className="space-y-2 mb-4">
//                 {editItems.map((item, i) => (
//                   <div key={i} className="grid grid-cols-[1fr_1fr_110px_110px_60px] gap-3 items-center">
//                     {/* Lot — read-only */}
//                     <div className="bg-[#0A0F1C] border border-[#2D3648]/60 rounded-sm h-9 flex items-center px-3">
//                       <span className="text-amber-400/80 font-mono text-xs">{item.lot_number}</span>
//                     </div>
//                     <div className="bg-[#0A0F1C] border border-[#2D3648]/60 rounded-sm h-9 flex items-center px-3">
//                       <span className="text-slate-400 text-xs truncate">{item.product_name}</span>
//                     </div>
//                     <input type="number" required value={item.quantity}
//                       onChange={e => { const n=[...editItems]; n[i].quantity=e.target.value; setEditItems(n); }}
//                       className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
//                     <input type="number" required value={item.rate}
//                       onChange={e => { const n=[...editItems]; n[i].rate=e.target.value; setEditItems(n); }}
//                       className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
//                     <span className="text-[10px] text-slate-500 font-mono text-center">
//                       {item.quantity && item.rate
//                         ? (parseFloat(item.quantity) * parseFloat(item.rate)).toLocaleString()
//                         : "—"}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               {/* Live total preview */}
//               <div className="mt-3 pt-3 border-t border-[#2D3648]">
//                 <div className="flex justify-end gap-6 text-xs font-mono">
//                   <span className="text-slate-500 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Subtotal</span>
//                   <span className="text-slate-300 w-28 text-right">
//                     PKR {editItems.reduce((s,i) => s + (parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0), 0).toLocaleString()}
//                   </span>
//                 </div>
//                 {editForm.target_price && (
//                   <div className="flex justify-end gap-6 text-xs font-mono mt-1">
//                     <span className="text-slate-500 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Net (target)</span>
//                     <span className="text-amber-400 font-bold w-28 text-right">PKR {parseFloat(editForm.target_price).toLocaleString()}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="flex gap-2 mt-5">
//                 <button type="submit"
//                   className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-6 text-xs transition-all active:scale-95"
//                   style={{ fontFamily: "Barlow Condensed" }}>
//                   Save Changes
//                 </button>
//                 <button type="button" onClick={() => setEditModal(false)}
//                   className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs">
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from "react";
import { salesAPI, customersAPI, lotsAPI, categoriesAPI, productsAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  FileDown,
  FileSpreadsheet,
  Search,
  X,
  ChevronDown,
  Package,
  Printer,
  Receipt,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useBusinessMode } from "../context/BusinessModeContext"; // ← ADD THIS LINE
// ─── Sale Receipt Modal ───────────────────────────────────────────────────────
function SaleReceipt({ sale, onClose }) {
  const { businessMode } = useBusinessMode();
  const defaultUnit = businessMode === "CHEMICAL" ? "Kg" : "No Of Cones";
  if (!sale) return null;

  const printReceipt = () => {
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
    doc.text("Sale Receipt / Invoice", pageW / 2, 16, { align: "center" });
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
    doc.text("SALE #", 13, y + 5);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(sale.sale_number, 13, y + 12);

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("CUSTOMER", pageW / 2, y + 5, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(sale.customer_name, pageW / 2, y + 12, { align: "center" });

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("DATE", pageW - 13, y + 5, { align: "right" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(sale.date, pageW - 13, y + 12, { align: "right" });

    y += 24;

    // Items table — now includes Rate and Amount columns
    // For YARN products, append category if available
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
      body: (sale.items || []).map((item) => [
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

    const addRow = (label, value, highlight = false, valueColor = [50, 50, 50]) => {
      if (highlight) {
        doc.setFillColor(15, 23, 42);
        doc.rect(lX - 2, tY - 4, rX - lX + 4, 8, "F");
      }
      doc.setFont("helvetica", highlight ? "bold" : "normal");
      doc.setFontSize(highlight ? 8.5 : 7.5);
      doc.setTextColor(highlight ? 148 : 100, highlight ? 163 : 116, highlight ? 184 : 139);
      doc.text(label, lX, tY);
      doc.setTextColor(...(highlight ? [251, 191, 36] : valueColor));
      doc.text(value, rX, tY, { align: "right" });
      tY += 6;
    };

    const totalQtyGP = (sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
    const unitSet = [...new Set((sale.items || []).map((i) => i.unit || defaultUnit))];
    const totalQtyLabel = unitSet.length === 1 ? unitSet[0] : "";

    // Qty row
    doc.setFillColor(30, 39, 56);
    doc.rect(lX - 2, tY - 4, rX - lX + 4, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(totalQtyLabel ? `TOTAL QTY (${totalQtyLabel})` : "TOTAL QTY", lX, tY);
    doc.setTextColor(200, 200, 200);
    doc.text(totalQtyGP.toLocaleString(), rX, tY, { align: "right" });
    tY += 7;

    // Subtotal row
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("SUBTOTAL", lX, tY);
    doc.setTextColor(50, 50, 50);
    doc.text(`PKR ${sale.total_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
    tY += 6;

    // Discount row (only if applicable)
    if (sale.discount_amount > 0) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`DISCOUNT${sale.discount_percentage > 0 ? ` (${sale.discount_percentage?.toFixed(1)}%)` : ""}`, lX, tY);
      doc.setTextColor(192, 57, 43);
      doc.text(`- PKR ${sale.discount_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
      tY += 6;
    }

    // Net Amount — highlighted
    doc.setFillColor(15, 23, 42);
    doc.rect(lX - 2, tY - 4, rX - lX + 4, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("NET AMOUNT", lX, tY);
    doc.setTextColor(251, 191, 36);
    doc.text(`PKR ${sale.net_amount?.toLocaleString() || "0"}`, rX, tY, { align: "right" });
    tY += 8;

    // Gate pass badge
    if (sale.gate_pass) {
      tY += 4;
      doc.setFillColor(30, 39, 56);
      doc.rect(10, tY, pageW - 20, 10, "F");
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("GATE PASS", 13, tY + 4);
      doc.setTextColor(251, 191, 36);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(sale.gate_pass.gate_pass_number, 13, tY + 8.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(
        `Total Qty: ${sale.gate_pass.total_quantity?.toLocaleString()} ${sale.items?.[0]?.unit || "units"}`,
        pageW - 13,
        tY + 8.5,
        { align: "right" },
      );
    }

    // Notes
    if (sale.notes) {
      doc.setTextColor(120, 130, 145);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Note: ${sale.notes}`,
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

    doc.save(`receipt-${sale.sale_number}.pdf`);
  };

  const items = sale.items || [];
  const unitSet = [...new Set(items.map((i) => i.unit || defaultUnit))];
  const totalQtyUnitSuffix = unitSet.length === 1 ? unitSet[0] : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0D1424] border border-[#2D3648] rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-[#0A0F1C] px-5 py-4 border-b border-[#1E2738] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={15} className="text-amber-400" />
            <span
              className="text-sm font-bold text-white uppercase tracking-wider"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Sale Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable receipt body */}
        <div className="p-5 overflow-y-auto">
          {/* Company */}
          <div className="text-center mb-5 pb-4 border-b border-[#1E2738]">
            <p
              className="text-amber-400 font-bold text-lg tracking-widest uppercase"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              GH & Sons Enterprises
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              Sale Receipt / Invoice
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: "Sale #",
                value: sale.sale_number,
                cls: "text-amber-400 font-mono font-bold",
              },
              {
                label: "Customer",
                value: sale.customer_name,
                cls: "text-slate-200 font-semibold truncate",
              },
              {
                label: "Date",
                value: sale.date,
                cls: "text-slate-200 font-mono",
              },
            ].map(({ label, value, cls }) => (
              <div
                key={label}
                className="bg-[#0A0F1C] rounded-sm px-3 py-2 border border-[#1E2738]"
              >
                <p
                  className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  {label}
                </p>
                <p className={`text-xs ${cls}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="grid grid-cols-[72px_1fr_60px_60px_80px] gap-x-2 px-2 mb-1">
              {["Lot #", "Product", "Qty", "Rate", "Amount"].map((h) => (
                <p
                  key={h}
                  className="text-[9px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  {h}
                </p>
              ))}
            </div>
            <div className="border border-[#1E2738] rounded-sm overflow-hidden">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[72px_1fr_60px_60px_80px] gap-x-2 px-3 py-2 items-center border-b border-[#1E2738] last:border-0 ${i % 2 === 0 ? "bg-[#0A0F1C]" : "bg-[#0D1424]"}`}
                  >
                    <span className="text-amber-400/80 font-mono text-[10px]">
                      {item.lot_number || "—"}
                    </span>
                    <span className="text-slate-300 text-xs truncate">
                      {item.product_name}
                    </span>
                    <span className="text-slate-400 text-xs text-right font-mono">
                      {item.quantity?.toLocaleString()} {item.unit || defaultUnit}
                    </span>
                    <span className="text-slate-400 text-xs text-right font-mono">
                      {item.rate?.toLocaleString()}
                    </span>
                    <span className="text-white text-xs text-right font-mono font-semibold">
                      {((item.quantity || 0) * (item.rate || 0)).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-slate-600 text-xs">
                  No items
                </div>
              )}
            </div>
          </div>

          {/* Totals block */}
          <div className="bg-[#0A0F1C] border border-[#2D3648] rounded-sm px-3 py-2 mb-4 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Total Qty</span>
              <span className="text-slate-300 font-mono text-xs">
                {(sale.items || []).reduce((s, i) => s + (i.quantity || 0), 0).toLocaleString()}{totalQtyUnitSuffix ? ` ${totalQtyUnitSuffix}` : ""}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Subtotal</span>
              <span className="text-slate-300 font-mono text-xs">PKR {sale.total_amount?.toLocaleString()}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
                  Discount {sale.discount_percentage > 0 ? `(${sale.discount_percentage?.toFixed(1)}%)` : ""}
                </span>
                <span className="text-red-400 font-mono text-xs">- PKR {sale.discount_amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-[#2D3648]">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Net Amount</span>
              <span className="text-amber-400 font-mono font-bold">PKR {sale.net_amount?.toLocaleString()}</span>
            </div>
          </div>

          {/* Gate pass */}
          {sale.gate_pass && (
            <div className="flex items-center justify-between bg-[#1E2738]/50 border border-[#2D3648] rounded-sm px-3 py-2 mb-4">
              <div>
                <p
                  className="text-[9px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  Gate Pass
                </p>
                <p className="text-slate-300 font-mono text-xs font-semibold">
                  {sale.gate_pass.gate_pass_number}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[9px] text-slate-500 uppercase tracking-wider"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  Total Qty
                </p>
                <p className="text-slate-300 font-mono text-xs">
                  {sale.gate_pass.total_quantity?.toLocaleString()}{totalQtyUnitSuffix ? ` ${totalQtyUnitSuffix}` : ""}
                </p>
              </div>
            </div>
          )}

          {sale.notes && (
            <p className="text-xs text-slate-500 italic px-1">
              Note: {sale.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-3 border-t border-[#1E2738] flex gap-2 shrink-0">
          <button
            onClick={printReceipt}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 text-xs transition-all active:scale-95"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <Printer size={14} /> Print / Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lot Search Picker ────────────────────────────────────────────────────────
function LotPicker({ lots, categories, selectedLotId, onSelect }) {
  const [catId, setCatId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = lots.filter((l) => {
    // Yarn only: filter by product category. Chemical has no categories — never filter by catId.
    const matchCat =
      categories.length === 0
        ? true
        : !catId || String(l.category_id) === String(catId);
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      l.lot_number?.toLowerCase().includes(q) ||
      l.product_name?.toLowerCase().includes(q) ||
      l.shade?.toLowerCase().includes(q) ||
      l.product_shade?.toLowerCase().includes(q) ||
      l.lot_code?.toLowerCase().includes(q) ||
      l.chemical_code?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const selected = lots.find((l) => l.id === parseInt(selectedLotId));
  const handleSelect = (lot) => {
    onSelect(lot);
    setOpen(false);
    setSearch("");
  };
  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setCatId("");
    setSearch("");
  };

  return (
    <div className="relative col-span-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between bg-[#0A0F1C] border rounded-sm px-3 h-9 text-xs outline-none transition-colors ${open ? "border-amber-500" : "border-[#2D3648] hover:border-slate-500"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-amber-400 font-mono shrink-0">
              {selected.lot_number}
            </span>
            <span className="text-slate-300 truncate">
              {selected.product_name}
            </span>
            {(selected.shade || selected.product_shade) && (
              <span className="text-slate-500 truncate">
                · {selected.shade || selected.product_shade}
              </span>
            )}
            <span className="text-slate-500 shrink-0">
              ({selected.current_quantity} {selected.unit || "units"})
            </span>
            {selected.cost_per_unit != null && selected.cost_per_unit !== "" && (
              <span className="text-emerald-400/90 text-[10px] font-mono shrink-0 hidden sm:inline">
                · Pur. PKR {Number(selected.cost_per_unit).toLocaleString()}/{selected.unit || "unit"}
              </span>
            )}
          </span>
        ) : (
          <span className="text-slate-500">Select Lot…</span>
        )}
        <span className="flex items-center gap-1 ml-2 shrink-0">
          {selected && (
            <span
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={12}
            className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0D1424] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex gap-2 p-2 border-b border-[#1E2738] bg-[#0A0F1C]">
            {categories.length > 0 && (
              <div className="relative shrink-0">
                <select
                  value={catId}
                  onChange={(e) => {
                    setCatId(e.target.value);
                    setSearch("");
                  }}
                  className="appearance-none bg-[#1E2738] border border-[#2D3648] text-slate-300 rounded-sm pl-3 pr-7 h-7 text-xs outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            )}
            <div className="relative flex-1">
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  categories.length === 0
                    ? "Search by product name or code…"
                    : "Search by product name or shade…"
                }
                className="w-full bg-[#1E2738] border border-[#2D3648] text-slate-200 rounded-sm pl-7 pr-3 h-7 text-xs outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                <Package size={20} className="mb-1.5" />
                <span className="text-xs">No lots match your search</span>
              </div>
            ) : (
              filtered.map((lot) => (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => handleSelect(lot)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1E2738] transition-colors border-b border-[#1A2133]/50 last:border-0 group ${selectedLotId === lot.id ? "bg-amber-500/5" : ""}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-amber-400/80 font-mono text-[10px] shrink-0 group-hover:text-amber-400 transition-colors">
                      {lot.lot_number}
                    </span>
                    <span className="text-slate-300 text-xs truncate">
                      {lot.product_name}
                    </span>
                    {(lot.shade || lot.product_shade) && (
                      <span className="text-slate-500 text-[10px] truncate">
                        · {lot.shade || lot.product_shade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {lot.current_quantity} {lot.unit || "units"}
                    </span>
                    {lot.cost_per_unit != null && lot.cost_per_unit !== "" && (
                      <span className="text-[10px] text-emerald-500/80 font-mono hidden sm:inline">
                        PKR {Number(lot.cost_per_unit).toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-sm ${
                        lot.status === "IN_STORE"
                          ? "bg-blue-500/10 text-blue-400"
                          : lot.status === "READY_FOR_SALE"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                      style={{ fontFamily: "Barlow Condensed" }}
                    >
                      {lot.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div
              className="px-3 py-1.5 bg-[#0A0F1C] border-t border-[#1E2738] text-[10px] text-slate-600"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              {filtered.length} lot{filtered.length !== 1 ? "s" : ""} available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [lots, setLots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    customer_id: "",
    date: new Date().toISOString().split("T")[0],
    target_price: "",
    notes: "",
  });
  const [items, setItems] = useState([
    { lot_id: "", product_id: "", quantity: "", rate: "", unit: "", cost_per_unit: "" },
  ]);
  const [receiptSale, setReceiptSale] = useState(null);
  const [editModal,   setEditModal]   = useState(false);
  const [editSale,    setEditSale]    = useState(null);
  const [editForm,    setEditForm]    = useState({ customer_id: '', date: '', target_price: '', notes: '' });
  const [editItems,   setEditItems]   = useState([]);
  const { businessMode } = useBusinessMode();
  const isChemical = businessMode === "CHEMICAL";
  const defaultUnit = isChemical ? "Kg" : "No Of Cones";
  const load = () => {
    const params =
      businessMode === "YARN" && categoryFilter
        ? { category_id: categoryFilter }
        : {};
    return salesAPI.list(params).then((r) => setSales(r.data));
  };

  useEffect(() => {
    load();
    customersAPI.list().then((r) => setCustomers(r.data));
    Promise.all([lotsAPI.list(), productsAPI.list()])
      .then(([lotsRes, productsRes]) => {
        const productMap = {};
        for (const p of productsRes.data) productMap[p.id] = p;
        const enriched = lotsRes.data.map((l) => ({
          ...l,
          category_id: productMap[l.product_id]?.category_id ?? null,
          unit: productMap[l.product_id]?.unit ?? l.unit,
        }));
        setLots(enriched);
      });
    if (businessMode === "YARN") {
      categoriesAPI
        .list()
        .then((r) => setCategories(r.data))
        .catch(() => {});
    } else {
      setCategories([]);
    }
  }, [businessMode]);

  useEffect(() => {
    load();
  }, [categoryFilter]);

  useEffect(() => {
    if (businessMode === "CHEMICAL") setCategoryFilter("");
  }, [businessMode]);

  const saleLots = lots.filter(
    (l) =>
      ["IN_STORE", "READY_FOR_SALE", "PARTIALLY_SOLD"].includes(l.status) &&
      l.product_type !== "CHEMICAL_RAW",
  );

  const filteredSales = sales;

  const addItem = () =>
    setItems([
      ...items,
      { lot_id: "", product_id: "", quantity: "", rate: "", unit: "", cost_per_unit: "" },
    ]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const n = [...items];
    n[i][field] = val;
    setItems(n);
  };

  const handleLotSelect = (i, lot) => {
    const n = [...items];
    if (lot) {
      n[i].lot_id = lot.id;
      n[i].product_id = lot.product_id;
      n[i].unit = lot.unit || defaultUnit;
      n[i].cost_per_unit =
        lot.cost_per_unit != null && lot.cost_per_unit !== ""
          ? lot.cost_per_unit
          : "";
    } else {
      n[i].lot_id = "";
      n[i].product_id = "";
      n[i].unit = "";
      n[i].cost_per_unit = "";
    }
    setItems(n);
  };

  const calcTotal = () =>
    items.reduce(
      (sum, i) =>
        sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
      0,
    );

  const openReceipt = async (saleId) => {
    try {
      const r = await salesAPI.get(saleId);
      setReceiptSale(r.data);
    } catch {
      toast.error("Could not load sale details");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        date: form.date,
        notes: form.notes,
        target_price: form.target_price
          ? parseFloat(form.target_price)
          : undefined,
        items: items.map((i) => ({
          lot_id: parseInt(i.lot_id),
          product_id: parseInt(i.product_id),
          quantity: parseFloat(i.quantity),
          rate: parseFloat(i.rate),
        })),
      };
      const created = await salesAPI.create(payload);
      toast.success("Sale created with gate pass");
      setShowForm(false);
      setItems([{ lot_id: "", product_id: "", quantity: "", rate: "", unit: "", cost_per_unit: "" }]);
      load();
      if (created.data?.id) openReceipt(created.data.id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  const openEditSale = async (saleId) => {
    try {
      const { data } = await salesAPI.get(saleId);
      setEditSale(data);
      setEditForm({
        customer_id:  String(data.customer_id),
        date:         data.date,
        target_price: data.discount_amount > 0 ? String(data.net_amount) : '',
        notes:        data.notes || '',
      });
      setEditItems((data.items || []).map(item => ({
        lot_id:     item.lot_id,
        product_id: item.product_id,
        lot_number: item.lot_number,
        product_name: item.product_name,
        quantity:   String(item.quantity),
        rate:       String(item.rate),
        unit:       item.unit || defaultUnit,
        cost_per_unit: item.cost_per_unit != null && item.cost_per_unit !== "" ? item.cost_per_unit : "",
      })));
      setEditModal(true);
    } catch { toast.error("Could not load sale for editing"); }
  };

  const handleSaleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer_id:         parseInt(editForm.customer_id),
        date:                editForm.date,
        notes:               editForm.notes,
        target_price:        editForm.target_price ? parseFloat(editForm.target_price) : undefined,
        items: editItems.map(i => ({
          lot_id:     i.lot_id,
          product_id: i.product_id,
          quantity:   parseFloat(i.quantity),
          rate:       parseFloat(i.rate),
        })),
      };
      await salesAPI.update(editSale.id, payload);
      toast.success("Sale updated successfully");
      setEditModal(false);
      load();
      // Refresh receipt if it's currently open for this sale
      if (receiptSale?.id === editSale.id) openReceipt(editSale.id);
    } catch (err) { toast.error(err.response?.data?.error || "Error updating sale"); }
  };

  const now = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const totalSalesValue = filteredSales.reduce(
    (s, r) => s + (r.net_amount || 0),
    0,
  );
  const totalDiscount = filteredSales.reduce(
    (s, r) => s + (r.discount_amount || 0),
    0,
  );

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GH & Sons Enterprises", 14, 10);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("SALES REPORT", 14, 16);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(
      `Generated: ${now}  |  ${filteredSales.length} record${filteredSales.length !== 1 ? "s" : ""}`,
      pageW - 14,
      16,
      { align: "right" },
    );
    let y = 30;
    doc.setFillColor(30, 39, 56);
    doc.rect(14, y, pageW - 28, 12, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL SALES", 18, y + 5);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`PKR ${totalSalesValue.toLocaleString()}`, 18, y + 10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("TOTAL DISCOUNT", 90, y + 5);
    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`PKR ${totalDiscount.toLocaleString()}`, 90, y + 10);
    const dispatched = filteredSales.filter(
      (s) => s.status === "DISPATCHED",
    ).length;
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("DISPATCHED", 170, y + 5);
    doc.setTextColor(39, 174, 96);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${dispatched} / ${filteredSales.length}`, 170, y + 10);
    y += 18;
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`ALL SALES  (${filteredSales.length} records)`, 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Sale #",
          "Customer",
          "Date",
          "Total (PKR)",
          "Discount",
          "Net (PKR)",
          "Status",
        ],
      ],
      body: filteredSales.map((s) => [
        s.sale_number,
        s.customer_name,
        s.date,
        s.total_amount?.toLocaleString(),
        s.discount_percentage > 0
          ? `${s.discount_percentage.toFixed(1)}%`
          : "-",
        s.net_amount?.toLocaleString(),
        s.status,
      ]),
      headStyles: {
        fillColor: [30, 39, 56],
        textColor: [251, 191, 36],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2.5, lineColor: [200, 210, 220], lineWidth: 0.1 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right", fontStyle: "bold" },
        6: { halign: "center" },
      },
      didParseCell(data) {
        if (data.column.index === 6 && data.section === "body") {
          const v = data.cell.raw;
          if (v === "DISPATCHED") data.cell.styles.textColor = [39, 174, 96];
          else if (v === "CONFIRMED")
            data.cell.styles.textColor = [59, 130, 246];
          else data.cell.styles.textColor = [100, 116, 139];
        }
        if (
          data.column.index === 4 &&
          data.section === "body" &&
          data.cell.raw !== "-"
        )
          data.cell.styles.textColor = [192, 57, 43];
      },
      margin: { left: 14, right: 14 },
    });
    const finalY = doc.lastAutoTable.finalY;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, finalY, pageW - 28, 10, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL NET AMOUNT", 18, finalY + 6.5);
    doc.setTextColor(251, 191, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `PKR ${totalSalesValue.toLocaleString()}`,
      pageW - 18,
      finalY + 6.5,
      { align: "right" },
    );
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(150, 160, 175);
      doc.text(
        `GH & Sons Enterprises — Sales Report — ${dateStamp}`,
        14,
        doc.internal.pageSize.getHeight() - 6,
      );
      doc.text(
        `Page ${p} of ${totalPages}`,
        pageW - 14,
        doc.internal.pageSize.getHeight() - 6,
        { align: "right" },
      );
    }
    doc.save(`sales-report-${dateStamp}.pdf`);
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([
      ["GH & Sons Enterprises — SALES REPORT"],
      [`Generated: ${now}  |  ${filteredSales.length} records`],
      [],
      [
        "Sale #",
        "Customer",
        "Date",
        "Total Amount",
        "Discount %",
        "Discount Amount",
        "Net Amount",
        "Status",
      ],
      ...filteredSales.map((s) => [
        s.sale_number,
        s.customer_name,
        s.date,
        s.total_amount || 0,
        s.discount_percentage || 0,
        s.discount_amount || 0,
        s.net_amount || 0,
        s.status,
      ]),
      [],
      ["", "", "", "", "", "TOTAL NET", totalSalesValue],
    ]);
    ws1["!cols"] = [
      { wch: 16 },
      { wch: 24 },
      { wch: 12 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Sales");
    const byStatus = ["CONFIRMED", "DISPATCHED", "DRAFT", "CANCELLED"]
      .map((status) => {
        const group = filteredSales.filter((s) => s.status === status);
        return [
          status,
          group.length,
          group.reduce((sum, s) => sum + (s.net_amount || 0), 0),
        ];
      })
      .filter((r) => r[1] > 0);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ["GH & Sons Enterprises — SALES SUMMARY BY STATUS"],
      [`Generated: ${now}`],
      [],
      ["Status", "Count", "Total Net Amount (PKR)"],
      ...byStatus,
      [],
      ["TOTAL", filteredSales.length, totalSalesValue],
    ]);
    ws2["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Summary by Status");
    XLSX.writeFile(wb, `sales-report-${dateStamp}.xlsx`);
  };

  return (
    <div data-testid="sales-page" className="space-y-6">
      {receiptSale && (
        <SaleReceipt sale={receiptSale} onClose={() => setReceiptSale(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            {isChemical ? "Chemical Sales" : "Yarn Sales"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lot-based sales with auto gate pass
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-emerald-400 hover:text-emerald-300 hover:bg-[#2a3547] border border-emerald-700 hover:border-emerald-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2738] text-amber-400 hover:text-amber-300 hover:bg-[#2a3547] border border-amber-700 hover:border-amber-500 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <FileDown size={14} /> Export PDF
          </button>
          <button
            data-testid="new-sale-btn"
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-10 px-5 text-xs flex items-center gap-2 transition-all active:scale-95"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <Plus size={16} /> New Sale
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="industrial-card p-5 animate-fade-in"
          data-testid="sale-form"
        >
          <h3
            className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            New Sale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <div>
              <label
                className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Customer
              </label>
              <select
                data-testid="sale-customer"
                value={form.customer_id}
                onChange={(e) =>
                  setForm({ ...form, customer_id: e.target.value })
                }
                required
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label
                className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Target Price (opt.)
              </label>
              <input
                data-testid="sale-target-price"
                type="number"
                value={form.target_price}
                onChange={(e) =>
                  setForm({ ...form, target_price: e.target.value })
                }
                placeholder="System calculates discount"
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label
                className="block text-xs text-slate-400 uppercase mb-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Notes
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-xs text-slate-400 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Sale Items
              </h4>
              <span
                className="text-[10px] text-slate-600 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                {isChemical
                  ? "Search by product name or chemical code"
                  : "Select category → search by product or shade"}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 mb-1.5 px-0.5">
              <div
                className="col-span-2 text-[10px] text-slate-600 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Lot
              </div>
              <div
                className="text-[10px] text-slate-600 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Qty
              </div>
              <div
                className="text-[10px] text-slate-600 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Sale rate
              </div>
              <div />
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div
                    className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 items-start"
                  >
                    <LotPicker
                      lots={saleLots}
                      categories={isChemical ? [] : categories}
                      selectedLotId={item.lot_id}
                      onSelect={(lot) => handleLotSelect(i, lot)}
                    />
                    <input
                      type="number"
                      placeholder={`Qty (${item.unit || defaultUnit})`}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      required
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Sale rate / unit"
                      value={item.rate}
                      onChange={(e) => updateItem(i, "rate", e.target.value)}
                      required
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500 transition-colors"
                    />
                    <div className="flex items-center h-9">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {item.quantity && item.rate && (
                        <span className="text-[10px] text-slate-500 font-mono ml-1">
                          ={" "}
                          {(
                            parseFloat(item.quantity) * parseFloat(item.rate)
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.lot_id &&
                    item.cost_per_unit !== "" &&
                    item.cost_per_unit != null && (
                      <p
                        className="text-[10px] text-emerald-500/90 font-mono pl-0.5"
                        style={{ fontFamily: "JetBrains Mono" }}
                      >
                        Purchase (lot cost): PKR{" "}
                        {Number(item.cost_per_unit).toLocaleString()} per{" "}
                        {item.unit || defaultUnit}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1E2738]">
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add Item
            </button>
            <p className="text-sm text-white font-mono">
              Total:{" "}
              <span className="text-amber-400 font-bold">
                {calcTotal().toLocaleString()}
              </span>
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              data-testid="submit-sale"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs transition-all active:scale-95"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Create Sale
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-5 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {businessMode === "YARN" && categories.length > 0 && (
        <div className="flex gap-2 items-center">
          <span
            className="text-xs text-slate-500 uppercase tracking-wider"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-sm bg-[#1E2738] text-slate-300 border border-slate-600 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
            style={{ fontFamily: "Barlow Condensed", minWidth: "160px" }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter("")}
              className="px-2 py-1.5 text-xs rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      <div className="industrial-card" data-testid="sales-table">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th>Sale #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Discount</th>
              <th>Net</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s) => (
              <tr key={s.id}>
                <td className="text-amber-400 font-mono text-xs">
                  {s.sale_number}
                </td>
                <td className="text-slate-200">{s.customer_name}</td>
                <td className="text-slate-400 font-mono text-xs">{s.date}</td>
                <td className="font-mono text-slate-400">
                  {s.total_amount?.toLocaleString()}
                </td>
                <td className="font-mono text-red-400">
                  {s.discount_percentage > 0
                    ? `${s.discount_percentage.toFixed(1)}%`
                    : "-"}
                </td>
                <td className="font-mono text-white font-bold">
                  {s.net_amount?.toLocaleString()}
                </td>
                <td>
                  <span
                    className={
                      s.status === "DISPATCHED"
                        ? "badge-success"
                        : s.status === "CONFIRMED"
                          ? "badge-info"
                          : "badge-neutral"
                    }
                  >
                    {s.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSale(s.id)}
                      className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider px-2 py-1 hover:bg-amber-500/5 rounded-sm"
                      style={{ fontFamily: "Barlow Condensed" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openReceipt(s.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors uppercase tracking-wider px-2 py-1 hover:bg-amber-500/5 rounded-sm"
                      style={{ fontFamily: "Barlow Condensed" }}
                    >
                      <Receipt size={11} /> Receipt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-slate-500 py-8">
                  No sales found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Edit Sale Modal ──────────────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0D1423] border border-[#2D3648] rounded-sm shadow-2xl shadow-black/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3648]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}>Edit Sale — {editSale?.sale_number}</h3>
              <button type="button" onClick={() => setEditModal(false)}
                className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaleUpdate} className="p-6">
              {/* Header fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Customer *</label>
                  <select required value={editForm.customer_id}
                    onChange={e => setEditForm({ ...editForm, customer_id: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60">
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Date</label>
                  <input type="date" value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Target Price (opt.)</label>
                  <input type="number" value={editForm.target_price}
                    onChange={e => setEditForm({ ...editForm, target_price: e.target.value })}
                    placeholder="Auto discount"
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1" style={{ fontFamily: "Barlow Condensed" }}>Notes</label>
                  <input value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none focus:border-amber-500/60" />
                </div>
              </div>

              {/* Items — lot locked, only qty/rate editable */}
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: "Barlow Condensed" }}>
                Items — lot numbers are locked, only qty / rate can change
              </p>
              <div className="grid grid-cols-[1fr_1fr_110px_110px_60px] gap-3 mb-1.5 px-0.5">
                {["Lot #", "Product", "Qty", "Sale rate", ""].map(h => (
                  <div key={h} className="text-[10px] text-slate-600 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>{h}</div>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                {editItems.map((item, i) => (
                  <div key={i} className="space-y-1">
                  <div className="grid grid-cols-[1fr_1fr_110px_110px_60px] gap-3 items-center">
                    {/* Lot — read-only */}
                    <div className="bg-[#0A0F1C] border border-[#2D3648]/60 rounded-sm h-9 flex items-center px-3">
                      <span className="text-amber-400/80 font-mono text-xs">{item.lot_number}</span>
                    </div>
                    <div className="bg-[#0A0F1C] border border-[#2D3648]/60 rounded-sm h-9 flex items-center px-3">
                      <span className="text-slate-400 text-xs truncate">{item.product_name}</span>
                    </div>
                    <input type="number" required value={item.quantity}
                      placeholder={`Qty (${item.unit || defaultUnit})`}
                      onChange={e => { const n=[...editItems]; n[i].quantity=e.target.value; setEditItems(n); }}
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
                    <input type="number" required value={item.rate}
                      onChange={e => { const n=[...editItems]; n[i].rate=e.target.value; setEditItems(n); }}
                      className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-xs outline-none focus:border-amber-500/60 transition-colors" />
                    <span className="text-[10px] text-slate-500 font-mono text-center">
                      {item.quantity && item.rate
                        ? (parseFloat(item.quantity) * parseFloat(item.rate)).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  {item.cost_per_unit !== "" && item.cost_per_unit != null && (
                    <p className="text-[10px] text-emerald-500/90 font-mono pl-0.5" style={{ fontFamily: "JetBrains Mono" }}>
                      Purchase (lot cost): PKR {Number(item.cost_per_unit).toLocaleString()} per {item.unit || defaultUnit}
                    </p>
                  )}
                  </div>
                ))}
              </div>

              {/* Live total preview */}
              <div className="mt-3 pt-3 border-t border-[#2D3648]">
                <div className="flex justify-end gap-6 text-xs font-mono">
                  <span className="text-slate-500 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Subtotal</span>
                  <span className="text-slate-300 w-28 text-right">
                    PKR {editItems.reduce((s,i) => s + (parseFloat(i.quantity)||0)*(parseFloat(i.rate)||0), 0).toLocaleString()}
                  </span>
                </div>
                {editForm.target_price && (
                  <div className="flex justify-end gap-6 text-xs font-mono mt-1">
                    <span className="text-slate-500 uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>Net (target)</span>
                    <span className="text-amber-400 font-bold w-28 text-right">PKR {parseFloat(editForm.target_price).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-6 text-xs transition-all active:scale-95"
                  style={{ fontFamily: "Barlow Condensed" }}>
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