// import { useState, useEffect } from "react";
// import { manufacturingAPI, lotsAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { Factory, FlaskConical, Droplets } from "lucide-react";

// export default function ManufacturingPage() {
//   const [processes, setProcesses] = useState([]);
//   const [tab, setTab] = useState("list");
//   const [lots, setLots] = useState([]);
//   const [dyeForm, setDyeForm] = useState({ lot_id: '', input_weight: '', expected_output: '', notes: '' });
//   const [completeDyeForm, setCompleteDyeForm] = useState({ manufacturing_id: '', actual_output: '', shade_code: '' });
//   const [chemForm, setChemForm] = useState({ lot_id: '', input_weight: '', expected_output: '' });
//   const [completeChemForm, setCompleteChemForm] = useState({ manufacturing_id: '', actual_output: '', chemical_code: '', drum_count: '' });

//   const load = () => {
//     manufacturingAPI.list().then(r => setProcesses(r.data));
//     lotsAPI.list().then(r => setLots(r.data));
//   };
//   useEffect(() => { load(); }, []);

//   const rawYarnLots = lots.filter(l => l.product_type === 'RAW_YARN' && l.status === 'IN_STORE');
//   const chemRawLots = lots.filter(l => l.product_type === 'CHEMICAL_RAW' && l.status === 'IN_STORE');
//   const inProgressDyeing = processes.filter(p => p.process_type === 'DYEING' && p.status === 'IN_PROGRESS');
//   const inProgressChem = processes.filter(p => p.process_type === 'CHEMICAL_MANUFACTURING' && p.status === 'IN_PROGRESS');

//   const handleStartDyeing = async (e) => {
//     e.preventDefault();
//     try {
//       await manufacturingAPI.startDyeing({ ...dyeForm, lot_id: parseInt(dyeForm.lot_id), input_weight: parseFloat(dyeForm.input_weight), expected_output: parseFloat(dyeForm.expected_output) });
//       toast.success("Dyeing process started");
//       setDyeForm({ lot_id: '', input_weight: '', expected_output: '', notes: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleCompleteDyeing = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await manufacturingAPI.completeDyeing({ ...completeDyeForm, manufacturing_id: parseInt(completeDyeForm.manufacturing_id), actual_output: parseFloat(completeDyeForm.actual_output) });
//       const w = res.data.wastage;
//       toast.success(w ? `Dyeing completed. Wastage: ${w.wastageAmount} No Of Cones` : "Dyeing completed. No wastage!");
//       setCompleteDyeForm({ manufacturing_id: '', actual_output: '', shade_code: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleStartChem = async (e) => {
//     e.preventDefault();
//     try {
//       await manufacturingAPI.startChemical({ ...chemForm, lot_id: parseInt(chemForm.lot_id), input_weight: parseFloat(chemForm.input_weight), expected_output: parseFloat(chemForm.expected_output) });
//       toast.success("Chemical manufacturing started");
//       setChemForm({ lot_id: '', input_weight: '', expected_output: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleCompleteChem = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await manufacturingAPI.completeChemical({ ...completeChemForm, manufacturing_id: parseInt(completeChemForm.manufacturing_id), actual_output: parseFloat(completeChemForm.actual_output), drum_count: parseInt(completeChemForm.drum_count) || 0 });
//       const w = res.data.wastage;
//       toast.success(w ? `Chemical mfg completed. Wastage: ${w.wastageAmount} No Of Cones` : "Chemical mfg completed. No wastage!");
//       setCompleteChemForm({ manufacturing_id: '', actual_output: '', chemical_code: '', drum_count: '' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   return (
//     <div data-testid="manufacturing-page" className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Manufacturing</h1>
//         <p className="text-sm text-slate-500 mt-1">Dyeing & Chemical production with waste tracking</p>
//       </div>

//       <div className="flex gap-2">
//         {['list', 'dyeing', 'chemical'].map(t => (
//           <button key={t} onClick={() => setTab(t)} data-testid={`mfg-tab-${t}`}
//             className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === t ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
//             style={{ fontFamily: 'Barlow Condensed' }}>
//             {t === 'list' ? 'All Processes' : t === 'dyeing' ? 'Yarn Dyeing' : 'Chemical Mfg'}
//           </button>
//         ))}
//       </div>

//       {tab === 'list' && (
//         <div className="industrial-card" data-testid="mfg-list">
//           <table className="w-full erp-table">
//             <thead><tr><th>Lot #</th><th>Product</th><th>Process</th><th>Input</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead>
//             <tbody>
//               {processes.map(p => (
//                 <tr key={p.id}>
//                   <td className="text-amber-400 font-mono text-xs">{p.lot_number}</td>
//                   <td className="text-slate-200 text-sm">{p.product_name}</td>
//                   <td><span className={p.process_type === 'DYEING' ? 'badge-info' : 'badge-warning'}>{p.process_type}</span></td>
//                   <td className="font-mono text-white">{p.input_weight} No Of Cones</td>
//                   <td className="font-mono text-slate-400">{p.expected_output} No Of Cones</td>
//                   <td className="font-mono text-white">{p.actual_output || '-'} No Of Cones</td>
//                   <td><span className={p.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}>{p.status}</span></td>
//                 </tr>
//               ))}
//               {processes.length === 0 && <tr><td colSpan={7} className="text-center text-slate-500 py-8">No manufacturing processes</td></tr>}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {tab === 'dyeing' && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           <form onSubmit={handleStartDyeing} className="industrial-card p-5" data-testid="start-dyeing-form">
//             <div className="flex items-center gap-2 mb-4">
//               <Droplets className="w-5 h-5 text-blue-400" />
//               <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Start Dyeing</h3>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-slate-400 uppercase mb-1">Raw Yarn Lot</label>
//                 <select data-testid="dye-lot" value={dyeForm.lot_id} onChange={e => setDyeForm({...dyeForm, lot_id: e.target.value})} required
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                   <option value="">Select lot</option>
//                   {rawYarnLots.map(l => <option key={l.id} value={l.id}>{l.lot_number} - {l.product_name} ({l.current_quantity} No Of Cones)</option>)}
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Input Weight (No Of Cones)</label>
//                   <input data-testid="dye-input" type="number" value={dyeForm.input_weight} onChange={e => setDyeForm({...dyeForm, input_weight: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Expected Output (No Of Cones)</label>
//                   <input data-testid="dye-expected" type="number" value={dyeForm.expected_output} onChange={e => setDyeForm({...dyeForm, expected_output: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//               </div>
//               <button type="submit" data-testid="submit-start-dyeing" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all" style={{ fontFamily: 'Barlow Condensed' }}>
//                 Start Dyeing Process
//               </button>
//             </div>
//           </form>

//           <form onSubmit={handleCompleteDyeing} className="industrial-card p-5" data-testid="complete-dyeing-form">
//             <div className="flex items-center gap-2 mb-4">
//               <Droplets className="w-5 h-5 text-emerald-400" />
//               <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Complete Dyeing</h3>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-slate-400 uppercase mb-1">In-Progress Batch</label>
//                 <select data-testid="complete-dye-batch" value={completeDyeForm.manufacturing_id} onChange={e => setCompleteDyeForm({...completeDyeForm, manufacturing_id: e.target.value})} required
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                   <option value="">Select batch</option>
//                   {inProgressDyeing.map(p => <option key={p.id} value={p.id}>{p.lot_number} - {p.input_weight} No Of Cones (Expected: {p.expected_output} No Of Cones)</option>)}
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Actual Output (No Of Cones)</label>
//                   <input data-testid="complete-dye-output" type="number" value={completeDyeForm.actual_output} onChange={e => setCompleteDyeForm({...completeDyeForm, actual_output: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Shade Code</label>
//                   <input data-testid="complete-dye-shade" value={completeDyeForm.shade_code} onChange={e => setCompleteDyeForm({...completeDyeForm, shade_code: e.target.value})} required placeholder="e.g. RX-101"
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//               </div>
//               <button type="submit" data-testid="submit-complete-dyeing" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all" style={{ fontFamily: 'Barlow Condensed' }}>
//                 Complete & Record Wastage
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {tab === 'chemical' && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           <form onSubmit={handleStartChem} className="industrial-card p-5" data-testid="start-chemical-form">
//             <div className="flex items-center gap-2 mb-4">
//               <FlaskConical className="w-5 h-5 text-purple-400" />
//               <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Start Chemical Manufacturing</h3>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-slate-400 uppercase mb-1">Chemical Raw Lot</label>
//                 <select data-testid="chem-lot" value={chemForm.lot_id} onChange={e => setChemForm({...chemForm, lot_id: e.target.value})} required
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                   <option value="">Select lot</option>
//                   {chemRawLots.map(l => <option key={l.id} value={l.id}>{l.lot_number} - {l.product_name} ({l.current_quantity} No Of Cones)</option>)}
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Input Qty (No Of Cones)</label>
//                   <input data-testid="chem-input" type="number" value={chemForm.input_weight} onChange={e => setChemForm({...chemForm, input_weight: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Expected Output</label>
//                   <input data-testid="chem-expected" type="number" value={chemForm.expected_output} onChange={e => setChemForm({...chemForm, expected_output: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//               </div>
//               <button type="submit" data-testid="submit-start-chem" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all" style={{ fontFamily: 'Barlow Condensed' }}>Start Chemical Process</button>
//             </div>
//           </form>

//           <form onSubmit={handleCompleteChem} className="industrial-card p-5" data-testid="complete-chemical-form">
//             <div className="flex items-center gap-2 mb-4">
//               <FlaskConical className="w-5 h-5 text-emerald-400" />
//               <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Complete Chemical Mfg</h3>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs text-slate-400 uppercase mb-1">In-Progress Batch</label>
//                 <select data-testid="complete-chem-batch" value={completeChemForm.manufacturing_id} onChange={e => setCompleteChemForm({...completeChemForm, manufacturing_id: e.target.value})} required
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
//                   <option value="">Select batch</option>
//                   {inProgressChem.map(p => <option key={p.id} value={p.id}>{p.lot_number} - {p.input_weight} No Of Cones</option>)}
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Actual Output</label>
//                   <input data-testid="complete-chem-output" type="number" value={completeChemForm.actual_output} onChange={e => setCompleteChemForm({...completeChemForm, actual_output: e.target.value})} required
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-slate-400 uppercase mb-1">Chemical Code</label>
//                   <input data-testid="complete-chem-code" value={completeChemForm.chemical_code} onChange={e => setCompleteChemForm({...completeChemForm, chemical_code: e.target.value})} required placeholder="e.g. FA-300"
//                     className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs text-slate-400 uppercase mb-1">Drum Count</label>
//                 <input data-testid="complete-chem-drums" type="number" value={completeChemForm.drum_count} onChange={e => setCompleteChemForm({...completeChemForm, drum_count: e.target.value})}
//                   className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//               </div>
//               <button type="submit" data-testid="submit-complete-chem" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all" style={{ fontFamily: 'Barlow Condensed' }}>
//                 Complete & Record Wastage
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { manufacturingAPI, lotsAPI } from "@/lib/api";
import { toast } from "sonner";
import { FlaskConical, Droplets } from "lucide-react";
import { useBusinessMode } from "../context/BusinessModeContext";

export default function ManufacturingPage() {
  const { businessMode } = useBusinessMode();
  const isChemical = businessMode === 'CHEMICAL';
  const isYarn     = businessMode === 'YARN';
  const defaultUnit = isChemical ? 'Kg' : 'No Of Cones';

  const [processes, setProcesses] = useState([]);
  // Default tab: show the relevant tab for the workspace, hide irrelevant one
  const [tab, setTab] = useState(isChemical ? "chemical" : "dyeing");
  const [lots, setLots] = useState([]);
  const [dyeForm, setDyeForm] = useState({ lot_id: '', input_weight: '', expected_output: '', notes: '' });
  const [completeDyeForm, setCompleteDyeForm] = useState({ manufacturing_id: '', actual_output: '', shade_code: '' });
  const [chemForm, setChemForm] = useState({ lot_id: '', input_weight: '', expected_output: '' });
  const [completeChemForm, setCompleteChemForm] = useState({ manufacturing_id: '', actual_output: '', chemical_code: '', drum_count: '' });

  const load = () => {
    manufacturingAPI.list().then(r => setProcesses(r.data));
    lotsAPI.list().then(r => setLots(r.data));
  };
  useEffect(() => { load(); }, []);

  const rawYarnLots    = lots.filter(l => l.product_type === 'RAW_YARN'    && l.status === 'IN_STORE');
  const chemRawLots    = lots.filter(l => l.product_type === 'CHEMICAL_RAW' && l.status === 'IN_STORE');
  const inProgressDyeing = processes.filter(p => p.process_type === 'DYEING'                && p.status === 'IN_PROGRESS');
  const inProgressChem   = processes.filter(p => p.process_type === 'CHEMICAL_MANUFACTURING' && p.status === 'IN_PROGRESS');

  const dyeLot = rawYarnLots.find(l => String(l.id) === String(dyeForm.lot_id));
  const dyeUnit = dyeLot?.unit || defaultUnit;
  const chemLot = chemRawLots.find(l => String(l.id) === String(chemForm.lot_id));
  const chemUnit = chemLot?.unit || defaultUnit;

  const handleStartDyeing = async (e) => {
    e.preventDefault();
    try {
      await manufacturingAPI.startDyeing({ ...dyeForm, lot_id: parseInt(dyeForm.lot_id), input_weight: parseFloat(dyeForm.input_weight), expected_output: parseFloat(dyeForm.expected_output) });
      toast.success("Dyeing process started");
      setDyeForm({ lot_id: '', input_weight: '', expected_output: '', notes: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handleCompleteDyeing = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingAPI.completeDyeing({ ...completeDyeForm, manufacturing_id: parseInt(completeDyeForm.manufacturing_id), actual_output: parseFloat(completeDyeForm.actual_output) });
      const w = res.data.wastage;
      toast.success(w ? `Dyeing completed. Wastage: ${w.wastageAmount} ${defaultUnit}` : "Dyeing completed. No wastage!");
      setCompleteDyeForm({ manufacturing_id: '', actual_output: '', shade_code: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handleStartChem = async (e) => {
    e.preventDefault();
    try {
      await manufacturingAPI.startChemical({ ...chemForm, lot_id: parseInt(chemForm.lot_id), input_weight: parseFloat(chemForm.input_weight), expected_output: parseFloat(chemForm.expected_output) });
      toast.success("Chemical manufacturing started");
      setChemForm({ lot_id: '', input_weight: '', expected_output: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  const handleCompleteChem = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingAPI.completeChemical({ ...completeChemForm, manufacturing_id: parseInt(completeChemForm.manufacturing_id), actual_output: parseFloat(completeChemForm.actual_output), drum_count: parseInt(completeChemForm.drum_count) || 0 });
      const w = res.data.wastage;
      toast.success(w ? `Chemical mfg completed. Wastage: ${w.wastageAmount} ${defaultUnit}` : "Chemical mfg completed. No wastage!");
      setCompleteChemForm({ manufacturing_id: '', actual_output: '', chemical_code: '', drum_count: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || "Error"); }
  };

  return (
    <div data-testid="manufacturing-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Manufacturing</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isChemical ? 'Chemical production with waste tracking' : 'Dyeing & Chemical production with waste tracking'}
        </p>
      </div>

      {/* ── Tabs — only show relevant tabs per workspace ── */}
      <div className="flex gap-2">
        <button onClick={() => setTab("list")} data-testid="mfg-tab-list"
          className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === 'list' ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
          style={{ fontFamily: 'Barlow Condensed' }}>
          All Processes
        </button>

        {/* Only show Yarn Dyeing tab in YARN workspace */}
        {isYarn && (
          <button onClick={() => setTab("dyeing")} data-testid="mfg-tab-dyeing"
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === 'dyeing' ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'Barlow Condensed' }}>
            Yarn Dyeing
          </button>
        )}

        {/* Only show Chemical Mfg tab in CHEMICAL workspace */}
        {isChemical && (
          <button onClick={() => setTab("chemical")} data-testid="mfg-tab-chemical"
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors ${tab === 'chemical' ? 'bg-amber-500 text-black' : 'bg-[#1E2738] text-slate-400 hover:text-white'}`}
            style={{ fontFamily: 'Barlow Condensed' }}>
            Chemical Mfg
          </button>
        )}
      </div>

      {/* ── All Processes List ── */}
      {tab === 'list' && (
        <div className="industrial-card" data-testid="mfg-list">
          <table className="w-full erp-table">
            <thead>
              <tr>
                <th>Lot #</th><th>Product</th><th>Process</th>
                <th>Input</th><th>Expected</th><th>Actual</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.id}>
                  <td className="text-amber-400 font-mono text-xs">{p.lot_number}</td>
                  <td className="text-slate-200 text-sm">{p.product_name}</td>
                  <td><span className={p.process_type === 'DYEING' ? 'badge-info' : 'badge-warning'}>{p.process_type}</span></td>
                  <td className="font-mono text-white">{p.input_weight} {p.unit || defaultUnit}</td>
                  <td className="font-mono text-slate-400">{p.expected_output} {p.unit || defaultUnit}</td>
                  <td className="font-mono text-white">{p.actual_output ?? '-'} {p.actual_output ? (p.unit || defaultUnit) : ''}</td>
                  <td><span className={p.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}>{p.status}</span></td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr><td colSpan={7} className="text-center text-slate-500 py-8">No manufacturing processes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Yarn Dyeing (YARN workspace only) ── */}
      {tab === 'dyeing' && isYarn && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleStartDyeing} className="industrial-card p-5" data-testid="start-dyeing-form">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Start Dyeing</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Raw Yarn Lot</label>
                <select data-testid="dye-lot" value={dyeForm.lot_id} onChange={e => setDyeForm({...dyeForm, lot_id: e.target.value})} required
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                  <option value="">Select lot</option>
                  {rawYarnLots.map(l => <option key={l.id} value={l.id}>{l.lot_number} - {l.product_name} ({l.current_quantity} {l.unit || defaultUnit})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Input Weight ({dyeUnit})</label>
                  <input data-testid="dye-input" type="number" value={dyeForm.input_weight} onChange={e => setDyeForm({...dyeForm, input_weight: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Expected Output ({dyeUnit})</label>
                  <input data-testid="dye-expected" type="number" value={dyeForm.expected_output} onChange={e => setDyeForm({...dyeForm, expected_output: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
              </div>
              <button type="submit" data-testid="submit-start-dyeing"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Start Dyeing Process
              </button>
            </div>
          </form>

          <form onSubmit={handleCompleteDyeing} className="industrial-card p-5" data-testid="complete-dyeing-form">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Complete Dyeing</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">In-Progress Batch</label>
                <select data-testid="complete-dye-batch" value={completeDyeForm.manufacturing_id} onChange={e => setCompleteDyeForm({...completeDyeForm, manufacturing_id: e.target.value})} required
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                  <option value="">Select batch</option>
                  {inProgressDyeing.map(p => <option key={p.id} value={p.id}>{p.lot_number} - {p.input_weight} {p.unit || defaultUnit} (Expected: {p.expected_output})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Actual Output ({inProgressDyeing.find(p => String(p.id) === String(completeDyeForm.manufacturing_id))?.unit || defaultUnit})</label>
                  <input data-testid="complete-dye-output" type="number" value={completeDyeForm.actual_output} onChange={e => setCompleteDyeForm({...completeDyeForm, actual_output: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Shade Code</label>
                  <input data-testid="complete-dye-shade" value={completeDyeForm.shade_code} onChange={e => setCompleteDyeForm({...completeDyeForm, shade_code: e.target.value})} required placeholder="e.g. RX-101"
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
              </div>
              <button type="submit" data-testid="submit-complete-dyeing"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Complete & Record Wastage
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Chemical Manufacturing (CHEMICAL workspace only) ── */}
      {tab === 'chemical' && isChemical && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleStartChem} className="industrial-card p-5" data-testid="start-chemical-form">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Start Chemical Manufacturing</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Chemical Raw Lot</label>
                <select data-testid="chem-lot" value={chemForm.lot_id} onChange={e => setChemForm({...chemForm, lot_id: e.target.value})} required
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                  <option value="">Select lot</option>
                  {chemRawLots.map(l => <option key={l.id} value={l.id}>{l.lot_number} - {l.product_name} ({l.current_quantity} {l.unit || defaultUnit})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Input Qty ({chemUnit})</label>
                  <input data-testid="chem-input" type="number" value={chemForm.input_weight} onChange={e => setChemForm({...chemForm, input_weight: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Expected Output ({chemUnit})</label>
                  <input data-testid="chem-expected" type="number" value={chemForm.expected_output} onChange={e => setChemForm({...chemForm, expected_output: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
              </div>
              <button type="submit" data-testid="submit-start-chem"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Start Chemical Process
              </button>
            </div>
          </form>

          <form onSubmit={handleCompleteChem} className="industrial-card p-5" data-testid="complete-chemical-form">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Complete Chemical Mfg</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">In-Progress Batch</label>
                <select data-testid="complete-chem-batch" value={completeChemForm.manufacturing_id} onChange={e => setCompleteChemForm({...completeChemForm, manufacturing_id: e.target.value})} required
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none">
                  <option value="">Select batch</option>
                  {inProgressChem.map(p => <option key={p.id} value={p.id}>{p.lot_number} - {p.input_weight} {p.unit || defaultUnit}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Actual Output ({inProgressChem.find(p => String(p.id) === String(completeChemForm.manufacturing_id))?.unit || defaultUnit})</label>
                  <input data-testid="complete-chem-output" type="number" value={completeChemForm.actual_output} onChange={e => setCompleteChemForm({...completeChemForm, actual_output: e.target.value})} required
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Chemical Code</label>
                  <input data-testid="complete-chem-code" value={completeChemForm.chemical_code} onChange={e => setCompleteChemForm({...completeChemForm, chemical_code: e.target.value})} required placeholder="e.g. FA-300"
                    className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">Drum Count</label>
                <input data-testid="complete-chem-drums" type="number" value={completeChemForm.drum_count} onChange={e => setCompleteChemForm({...completeChemForm, drum_count: e.target.value})}
                  className="w-full bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
              </div>
              <button type="submit" data-testid="submit-complete-chem"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-10 text-xs transition-all"
                style={{ fontFamily: 'Barlow Condensed' }}>
                Complete & Record Wastage
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}