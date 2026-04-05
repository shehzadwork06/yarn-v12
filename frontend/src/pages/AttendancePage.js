// import { useState, useEffect } from "react";
// import { attendanceAPI, employeesAPI } from "@/lib/api";
// import { toast } from "sonner";
// import { Clock, CheckCircle, XCircle } from "lucide-react";

// export default function AttendancePage() {
//   const [attendance, setAttendance] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [timeInForm, setTimeInForm] = useState({ employee_id: '', time_in: '09:00' });
//   const [timeOutForm, setTimeOutForm] = useState({ employee_id: '', time_out: '17:00' });

//   const load = () => {
//     attendanceAPI.list({ date }).then(r => setAttendance(r.data));
//     employeesAPI.list({ active: 'true' }).then(r => setEmployees(r.data));
//   };
//   useEffect(() => { load(); }, [date]);

//   const handleTimeIn = async (e) => {
//     e.preventDefault();
//     try {
//       await attendanceAPI.timeIn({ ...timeInForm, employee_id: parseInt(timeInForm.employee_id), date });
//       toast.success("Time-in recorded");
//       setTimeInForm({ employee_id: '', time_in: '09:00' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleTimeOut = async (e) => {
//     e.preventDefault();
//     try {
//       await attendanceAPI.timeOut({ ...timeOutForm, employee_id: parseInt(timeOutForm.employee_id), date });
//       toast.success("Time-out recorded");
//       setTimeOutForm({ employee_id: '', time_out: '17:00' });
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const handleAbsent = async (empId) => {
//     try {
//       await attendanceAPI.markAbsent({ employee_id: empId, date });
//       toast.success("Marked absent");
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || "Error"); }
//   };

//   const statusColors = { PRESENT: 'badge-success', HALF_DAY: 'badge-warning', ABSENT: 'badge-error', OVERTIME: 'badge-info', LEAVE: 'badge-neutral' };

//   return (
//     <div data-testid="attendance-page" className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>Attendance</h1>
//           <p className="text-sm text-slate-500 mt-1">Time tracking and overtime management</p>
//         </div>
//         <input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="attendance-date"
//           className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none" />
//       </div>

//       {/* Time In / Out forms */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <form onSubmit={handleTimeIn} className="industrial-card p-5" data-testid="time-in-form">
//           <div className="flex items-center gap-2 mb-3">
//             <CheckCircle className="w-4 h-4 text-emerald-400" />
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Record Time In</h3>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <select data-testid="timein-employee" value={timeInForm.employee_id} onChange={e => setTimeInForm({...timeInForm, employee_id: e.target.value})} required
//               className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none">
//               <option value="">Employee</option>
//               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
//             </select>
//             <input data-testid="timein-time" type="time" value={timeInForm.time_in} onChange={e => setTimeInForm({...timeInForm, time_in: e.target.value})} required
//               className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none" />
//           </div>
//           <button type="submit" data-testid="submit-timein" className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs w-full" style={{ fontFamily: 'Barlow Condensed' }}>Clock In</button>
//         </form>

//         <form onSubmit={handleTimeOut} className="industrial-card p-5" data-testid="time-out-form">
//           <div className="flex items-center gap-2 mb-3">
//             <XCircle className="w-4 h-4 text-red-400" />
//             <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider" style={{ fontFamily: 'Barlow Condensed' }}>Record Time Out</h3>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <select data-testid="timeout-employee" value={timeOutForm.employee_id} onChange={e => setTimeOutForm({...timeOutForm, employee_id: e.target.value})} required
//               className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none">
//               <option value="">Employee</option>
//               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
//             </select>
//             <input data-testid="timeout-time" type="time" value={timeOutForm.time_out} onChange={e => setTimeOutForm({...timeOutForm, time_out: e.target.value})} required
//               className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none" />
//           </div>
//           <button type="submit" data-testid="submit-timeout" className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs w-full" style={{ fontFamily: 'Barlow Condensed' }}>Clock Out</button>
//         </form>
//       </div>

//       <div className="industrial-card" data-testid="attendance-table">
//         <table className="w-full erp-table">
//           <thead><tr><th>Code</th><th>Employee</th><th>Time In</th><th>Time Out</th><th>Hours</th><th>OT</th><th>Status</th><th>Action</th></tr></thead>
//           <tbody>
//             {attendance.map(a => (
//               <tr key={a.id}>
//                 <td className="text-amber-400 font-mono text-xs">{a.employee_code}</td>
//                 <td className="text-slate-200">{a.employee_name}</td>
//                 <td className="font-mono text-emerald-400">{a.time_in || '-'}</td>
//                 <td className="font-mono text-red-400">{a.time_out || '-'}</td>
//                 <td className="font-mono text-white">{a.working_hours?.toFixed(1) || '-'}</td>
//                 <td className="font-mono text-blue-400">{a.overtime_hours > 0 ? a.overtime_hours.toFixed(1) : '-'}</td>
//                 <td><span className={statusColors[a.status] || 'badge-neutral'}>{a.status}</span></td>
//                 <td>-</td>
//               </tr>
//             ))}
//             {attendance.length === 0 && (
//               <tr><td colSpan={8} className="text-center text-slate-500 py-4">
//                 No attendance records for {date}
//                 <div className="mt-2 flex gap-2 justify-center">
//                   {employees.slice(0, 3).map(e => (
//                     <button key={e.id} onClick={() => handleAbsent(e.id)} className="text-xs text-red-400 hover:text-red-300">Mark {e.name} absent</button>
//                   ))}
//                 </div>
//               </td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { attendanceAPI, employeesAPI } from "@/lib/api";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle, Edit2, Users, X } from "lucide-react";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeInForm, setTimeInForm] = useState({ employee_id: "", time_in: "09:00" });
  const [timeOutForm, setTimeOutForm] = useState({ employee_id: "", time_out: "17:00" });
  const [editRecord, setEditRecord] = useState(null); // attendance row being edited
  const [editForm, setEditForm] = useState({});

  const load = () => {
    attendanceAPI.list({ date }).then((r) => setAttendance(r.data));
    employeesAPI.list({ active: "true" }).then((r) => setEmployees(r.data));
  };
  useEffect(() => { load(); }, [date]);

  // ── Time In ──────────────────────────────────────────────────────────────────
  const handleTimeIn = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.timeIn({
        ...timeInForm,
        employee_id: parseInt(timeInForm.employee_id),
        date,
      });
      toast.success("Time-in recorded");
      setTimeInForm({ employee_id: "", time_in: "09:00" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  // ── Time Out ─────────────────────────────────────────────────────────────────
  const handleTimeOut = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.timeOut({
        ...timeOutForm,
        employee_id: parseInt(timeOutForm.employee_id),
        date,
      });
      toast.success("Time-out recorded");
      setTimeOutForm({ employee_id: "", time_out: "17:00" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  // ── Mark Absent (single) ─────────────────────────────────────────────────────
  const handleAbsent = async (empId) => {
    try {
      await attendanceAPI.markAbsent({ employee_id: empId, date });
      toast.success("Marked absent");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  // ── Bulk Mark All ────────────────────────────────────────────────────────────
  const handleMarkAll = async (status) => {
    try {
      const { data } = await attendanceAPI.markAll({
        date,
        status,
        time_in: status === "PRESENT" ? "09:00" : undefined,
      });
      toast.success(`Marked ${data.marked} employees as ${status}. ${data.skipped} already recorded.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  // ── Edit Attendance ───────────────────────────────────────────────────────────
  const openEdit = (record) => {
    setEditRecord(record);
    setEditForm({
      time_in:  record.time_in  || "",
      time_out: record.time_out || "",
      status:   record.status   || "PRESENT",
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.update(editRecord.id, editForm);
      toast.success("Attendance updated");
      setEditRecord(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  const statusColors = {
    PRESENT:  "badge-success",
    HALF_DAY: "badge-warning",
    ABSENT:   "badge-error",
    OVERTIME: "badge-info",
    LEAVE:    "badge-neutral",
  };

  return (
    <div data-testid="attendance-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-3xl font-bold text-white uppercase tracking-tight"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Time tracking and overtime management
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk mark buttons */}
          <button
            onClick={() => handleMarkAll("PRESENT")}
            className="flex items-center gap-1.5 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/30 font-bold uppercase tracking-wider rounded-sm h-9 px-4 text-xs transition-all"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <Users size={14} /> Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll("ABSENT")}
            className="flex items-center gap-1.5 bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 font-bold uppercase tracking-wider rounded-sm h-9 px-4 text-xs transition-all"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            <Users size={14} /> Mark All Absent
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="attendance-date"
            className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none"
          />
        </div>
      </div>

      {/* Time In / Out forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form
          onSubmit={handleTimeIn}
          className="industrial-card p-5"
          data-testid="time-in-form"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3
              className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Record Time In
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              data-testid="timein-employee"
              value={timeInForm.employee_id}
              onChange={(e) =>
                setTimeInForm({ ...timeInForm, employee_id: e.target.value })
              }
              required
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none"
            >
              <option value="">Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <input
              data-testid="timein-time"
              type="time"
              value={timeInForm.time_in}
              onChange={(e) =>
                setTimeInForm({ ...timeInForm, time_in: e.target.value })
              }
              required
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            data-testid="submit-timein"
            className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs w-full"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Clock In
          </button>
        </form>

        <form
          onSubmit={handleTimeOut}
          className="industrial-card p-5"
          data-testid="time-out-form"
        >
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3
              className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Record Time Out
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              data-testid="timeout-employee"
              value={timeOutForm.employee_id}
              onChange={(e) =>
                setTimeOutForm({ ...timeOutForm, employee_id: e.target.value })
              }
              required
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none"
            >
              <option value="">Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <input
              data-testid="timeout-time"
              type="time"
              value={timeOutForm.time_out}
              onChange={(e) =>
                setTimeOutForm({ ...timeOutForm, time_out: e.target.value })
              }
              required
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            data-testid="submit-timeout"
            className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs w-full"
            style={{ fontFamily: "Barlow Condensed" }}
          >
            Clock Out
          </button>
        </form>
      </div>

      {/* Attendance Table */}
      <div className="industrial-card" data-testid="attendance-table">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Employee</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Hours</th>
              <th>OT</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td className="text-amber-400 font-mono text-xs">{a.employee_code}</td>
                <td className="text-slate-200">{a.employee_name}</td>
                <td className="font-mono text-emerald-400">{a.time_in || "-"}</td>
                <td className="font-mono text-red-400">{a.time_out || "-"}</td>
                <td className="font-mono text-white">
                  {a.working_hours?.toFixed(1) || "-"}
                </td>
                <td className="font-mono text-blue-400">
                  {a.overtime_hours > 0 ? a.overtime_hours.toFixed(1) : "-"}
                </td>
                <td>
                  <span className={statusColors[a.status] || "badge-neutral"}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => openEdit(a)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono uppercase"
                    title="Edit attendance"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </td>
              </tr>
            ))}

            {/* Employees with no record today */}
            {employees
              .filter((emp) => !attendance.find((a) => a.employee_id === emp.id))
              .map((emp) => (
                <tr key={`unrecorded-${emp.id}`} className="opacity-50">
                  <td className="text-amber-400 font-mono text-xs">{emp.employee_code}</td>
                  <td className="text-slate-400 italic">{emp.name}</td>
                  <td className="text-slate-600">—</td>
                  <td className="text-slate-600">—</td>
                  <td className="text-slate-600">—</td>
                  <td className="text-slate-600">—</td>
                  <td>
                    <span className="badge-neutral">Not Recorded</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAbsent(emp.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-mono uppercase"
                    >
                      Mark Absent
                    </button>
                  </td>
                </tr>
              ))}

            {attendance.length === 0 && employees.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-slate-500 py-6">
                  No records for {date}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Attendance Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form
            onSubmit={handleEdit}
            className="bg-[#0A0F1C] border border-[#2D3648] rounded-sm p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Edit Attendance — {editRecord.employee_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs text-slate-400 uppercase mb-1"
                    style={{ fontFamily: "Barlow Condensed" }}
                  >
                    Time In
                  </label>
                  <input
                    type="time"
                    value={editForm.time_in}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time_in: e.target.value })
                    }
                    className="w-full bg-[#050810] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-400 uppercase mb-1"
                    style={{ fontFamily: "Barlow Condensed" }}
                  >
                    Time Out
                  </label>
                  <input
                    type="time"
                    value={editForm.time_out}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time_out: e.target.value })
                    }
                    className="w-full bg-[#050810] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs text-slate-400 uppercase mb-1"
                  style={{ fontFamily: "Barlow Condensed" }}
                >
                  Status Override (leave blank to auto-calculate)
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-[#050810] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-10 text-sm outline-none"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="HALF_DAY">HALF_DAY</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="OVERTIME">OVERTIME</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>

              <p className="text-xs text-slate-600">
                If both time-in and time-out are filled, hours and status will
                be recalculated automatically unless you explicitly set a status.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-sm h-9 px-5 text-xs flex-1"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-sm h-9 px-4 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}