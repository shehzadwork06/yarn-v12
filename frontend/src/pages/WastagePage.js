// import { useState, useEffect } from "react";
// import { wastageAPI } from "@/lib/api";
// import { Trash2 } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// export default function WastagePage() {
//   const [wastage, setWastage] = useState([]);
//   const [summary, setSummary] = useState(null);

//   useEffect(() => {
//     wastageAPI.list().then(r => setWastage(r.data));
//     wastageAPI.summary().then(r => setSummary(r.data));
//   }, []);

//   const chartData = summary?.by_stage?.map(s => ({
//     name: s.process_stage,
//     wastage: s.total_wastage,
//     cost: s.total_cost,
//   })) || [];

//   return (
//     <div data-testid="wastage-page" className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Wastage Report</h1>
//         <p className="text-sm text-slate-500 mt-1">Manufacturing waste tracking by lot and process</p>
//       </div>

//       {summary && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="industrial-card p-5">
//             <p className="text-xs text-slate-500 uppercase">Total Wastage</p>
//             <p className="text-2xl font-bold text-red-400 font-mono mt-1">{summary.total?.total_wastage?.toFixed(2) || 0} No Of Cones</p>
//           </div>
//           <div className="industrial-card p-5">
//             <p className="text-xs text-slate-500 uppercase">Total Cost Impact</p>
//             <p className="text-2xl font-bold text-red-400 font-mono mt-1">Rs {summary.total?.total_cost?.toLocaleString() || 0}</p>
//           </div>
//           <div className="industrial-card p-5">
//             <p className="text-xs text-slate-500 uppercase">Avg. Waste %</p>
//             <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{summary.total?.avg_percentage?.toFixed(2) || 0}%</p>
//           </div>
//         </div>
//       )}

//       {chartData.length > 0 && (
//         <div className="industrial-card p-5">
//           <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Wastage by Process Stage</h3>
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
//               <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
//               <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
//               <Tooltip contentStyle={{ background: '#0F1623', border: '1px solid #2D3648', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
//               <Bar dataKey="wastage" fill="#EF4444" name="Wastage (No Of Cones)" radius={[2, 2, 0, 0]} />
//               <Bar dataKey="cost" fill="#F59E0B" name="Cost (Rs)" radius={[2, 2, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}

//       <div className="industrial-card" data-testid="wastage-table">
//         <table className="w-full erp-table">
//           <thead><tr><th>Lot #</th><th>Product</th><th>Stage</th><th>Input</th><th>Expected</th><th>Actual</th><th>Waste</th><th>Waste %</th><th>Cost</th></tr></thead>
//           <tbody>
//             {wastage.map(w => (
//               <tr key={w.id}>
//                 <td className="text-amber-400 font-mono text-xs">{w.lot_number}</td>
//                 <td className="text-slate-200 text-sm">{w.product_name}</td>
//                 <td><span className={w.process_stage === 'DYEING' ? 'badge-info' : 'badge-warning'}>{w.process_stage}</span></td>
//                 <td className="font-mono text-white">{w.input_weight} No Of Cones</td>
//                 <td className="font-mono text-slate-400">{w.expected_output} No Of Cones</td>
//                 <td className="font-mono text-white">{w.actual_output} No Of Cones</td>
//                 <td className="font-mono text-red-400 font-bold">{w.wastage_amount} No Of Cones</td>
//                 <td className="font-mono text-amber-400">{w.wastage_percentage?.toFixed(1)}%</td>
//                 <td className="font-mono text-red-400">{w.wastage_cost?.toLocaleString()}</td>
//               </tr>
//             ))}
//             {wastage.length === 0 && <tr><td colSpan={9} className="text-center text-slate-500 py-8">No wastage records</td></tr>}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { wastageAPI } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBusinessMode } from "../context/BusinessModeContext";

export default function WastagePage() {
  const { businessMode } = useBusinessMode();
  const [wastage, setWastage] = useState([]);
  const [summary, setSummary] = useState(null);
  const defaultUnit = businessMode === "CHEMICAL" ? "Kg" : "No Of Cones";
  const summaryUnit = summary?.unit || wastage[0]?.unit || defaultUnit;

  useEffect(() => {
    wastageAPI.list().then(r => setWastage(r.data));
    wastageAPI.summary().then(r => setSummary(r.data));
  }, []);

  const chartData = summary?.by_stage?.map(s => ({
    name: s.process_stage,
    wastage: s.total_wastage,
    cost: s.total_cost,
  })) || [];

  return (
    <div data-testid="wastage-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Wastage Report</h1>
        <p className="text-sm text-slate-500 mt-1">Manufacturing waste tracking by lot and process</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="industrial-card p-5">
            <p className="text-xs text-slate-500 uppercase">Total Wastage</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{summary.total?.total_wastage?.toFixed(2) || 0} {summaryUnit}</p>
          </div>
          <div className="industrial-card p-5">
            <p className="text-xs text-slate-500 uppercase">Total Cost Impact</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">Rs {summary.total?.total_cost?.toLocaleString() || 0}</p>
          </div>
          <div className="industrial-card p-5">
            <p className="text-xs text-slate-500 uppercase">Avg. Waste %</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{summary.total?.avg_percentage?.toFixed(2) || 0}%</p>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="industrial-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Wastage by Process Stage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', color: 'var(--tooltip-text)', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              <Bar dataKey="wastage" fill="#EF4444" name={`Wastage (${summaryUnit})`} radius={[2, 2, 0, 0]} />
              <Bar dataKey="cost" fill="#F59E0B" name="Cost (Rs)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="industrial-card" data-testid="wastage-table">
        <table className="w-full erp-table">
          <thead><tr><th>Lot #</th><th>Product</th><th>Stage</th><th>Input</th><th>Expected</th><th>Actual</th><th>Waste</th><th>Waste %</th><th>Cost</th></tr></thead>
          <tbody>
            {wastage.map(w => (
              <tr key={w.id}>
                {(() => {
                  const unit = w.unit || defaultUnit;
                  return (
                    <>
                <td className="text-amber-400 font-mono text-xs">{w.lot_number}</td>
                <td className="text-slate-200 text-sm">{w.product_name}</td>
                <td><span className={w.process_stage === 'DYEING' ? 'badge-info' : 'badge-warning'}>{w.process_stage}</span></td>
                <td className="font-mono text-white">{w.input_weight} {unit}</td>
                <td className="font-mono text-slate-400">{w.expected_output} {unit}</td>
                <td className="font-mono text-white">{w.actual_output} {unit}</td>
                <td className="font-mono text-red-400 font-bold">{w.wastage_amount} {unit}</td>
                <td className="font-mono text-amber-400">{w.wastage_percentage?.toFixed(1)}%</td>
                <td className="font-mono text-red-400">{w.wastage_cost?.toLocaleString()}</td>
                    </>
                  );
                })()}
              </tr>
            ))}
            {wastage.length === 0 && <tr><td colSpan={9} className="text-center text-slate-500 py-8">No wastage records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}