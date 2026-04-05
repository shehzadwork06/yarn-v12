// import { useNavigate } from "react-router-dom";
// import { useBusinessMode } from "@/context/BusinessModeContext";
// import { toast } from "sonner";
// import logo from "./../assets/logo.png";

// export default function ModeSelectPage() {
//   const { setBusinessMode } = useBusinessMode();
//   const navigate = useNavigate();

//   const handleSelect = (mode) => {
//     setBusinessMode(mode);
//     toast.success(`Entered ${mode === "YARN" ? "Yarn" : "Chemical"} workspace`);
//     navigate("/");
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("erp_token");
//     localStorage.removeItem("erp_user");
//     localStorage.removeItem("erp_business_mode");
//     navigate("/login");
//   };

//   const user = JSON.parse(localStorage.getItem("erp_user") || "{}");

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-[#020408] relative overflow-hidden">
//       {/* Grid background */}
//       <div
//         className="absolute inset-0 opacity-5"
//         style={{
//           backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px),
//             repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px)`,
//         }}
//       />

//       <div className="relative z-10 w-full max-w-2xl mx-4">
//         {/* Header */}
//         <div className="flex flex-col items-center mb-12">
//           <div className="flex items-center gap-4 mb-4">
//             <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
//             <div>
//               <h1
//                 className="text-3xl font-bold text-white tracking-wider uppercase"
//                 style={{ fontFamily: "Barlow Condensed" }}
//               >
//                 GH & Sons Enterprises
//               </h1>
//               <p
//                 className="text-xs text-slate-500 tracking-widest uppercase"
//                 style={{ fontFamily: "JetBrains Mono" }}
//               >
//                 Industrial Control System
//               </p>
//             </div>
//           </div>

//           <div className="mt-4 text-center">
//             <p className="text-slate-400 text-sm">
//               Welcome back,{" "}
//               <span className="text-amber-400 font-semibold">
//                 {user.full_name || user.username}
//               </span>
//             </p>
//             <p
//               className="text-2xl font-bold text-white mt-2 uppercase tracking-widest"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               Select Your Workspace
//             </p>
//             <p className="text-slate-500 text-sm mt-1">
//               Choose a business unit to enter
//             </p>
//           </div>
//         </div>

//         {/* Two Workspace Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* YARN Workspace */}
//           <button
//             onClick={() => handleSelect("YARN")}
//             className="group relative industrial-card p-8 text-left border-2 border-[#2D3648] hover:border-amber-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-all duration-300" />

//             <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
//               <span className="text-3xl">🧵</span>
//             </div>

//             <h2
//               className="text-2xl font-bold text-white uppercase tracking-wider mb-2 group-hover:text-amber-400 transition-colors"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               Yarn
//             </h2>
//             <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-4">
//               Raw yarn, dyeing production, dyed yarn sales and lot management
//             </p>

//             <div className="space-y-1.5">
//               {[
//                 "Raw Yarn & Dyed Yarn",
//                 "Store, Dyeing, Finished Store",
//                 "Dyeing Manufacturing",
//                 "Yarn Purchases & Sales",
//               ].map((item) => (
//                 <div key={item} className="flex items-center gap-2 text-xs text-slate-600 group-hover:text-slate-500">
//                   <div className="w-1 h-1 bg-amber-500/50 rounded-full flex-shrink-0" />
//                   {item}
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
//               <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
//                 Enter Workspace →
//               </span>
//             </div>
//           </button>

//           {/* CHEMICAL Workspace */}
//           <button
//             onClick={() => handleSelect("CHEMICAL")}
//             className="group relative industrial-card p-8 text-left border-2 border-[#2D3648] hover:border-blue-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300" />

//             <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-sm flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-all duration-300">
//               <span className="text-3xl">🧪</span>
//             </div>

//             <h2
//               className="text-2xl font-bold text-white uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors"
//               style={{ fontFamily: "Barlow Condensed" }}
//             >
//               Chemical
//             </h2>
//             <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-4">
//               Chemical raw materials, manufacturing, finished product sales and chemical store
//             </p>

//             <div className="space-y-1.5">
//               {[
//                 "Chemical Raw & Finished",
//                 "Chemical Store",
//                 "Chemical Manufacturing",
//                 "Chemical Purchases & Sales",
//               ].map((item) => (
//                 <div key={item} className="flex items-center gap-2 text-xs text-slate-600 group-hover:text-slate-500">
//                   <div className="w-1 h-1 bg-blue-500/50 rounded-full flex-shrink-0" />
//                   {item}
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
//               <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
//                 Enter Workspace →
//               </span>
//             </div>
//           </button>
//         </div>

//         {/* Logout */}
//         <div className="mt-8 text-center">
//           <button
//             onClick={handleLogout}
//             className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import { useBusinessMode } from "../context/BusinessModeContext";
import { toast } from "sonner";
import logo from "./../assets/logo.png";

export default function ModeSelectPage() {
  const { setBusinessMode } = useBusinessMode();
  const navigate = useNavigate();

  const handleSelect = (mode) => {
    setBusinessMode(mode);
    const labels = { YARN: "Yarn", CHEMICAL: "Chemical", OPERATIONS: "Operations" };
    toast.success(`Entered ${labels[mode]} workspace`);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    localStorage.removeItem("erp_business_mode");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("erp_user") || "{}");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020408] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(245,158,11,0.1) 50px, rgba(245,158,11,0.1) 51px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-4 mb-4">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1
                className="text-3xl font-bold text-white tracking-wider uppercase"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                GH & Sons Enterprises
              </h1>
              <p
                className="text-xs text-slate-500 tracking-widest uppercase"
                style={{ fontFamily: "JetBrains Mono" }}
              >
                Industrial Control System
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Welcome back,{" "}
              <span className="text-amber-400 font-semibold">
                {user.full_name || user.username}
              </span>
            </p>
            <p
              className="text-2xl font-bold text-white mt-2 uppercase tracking-widest"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Select Your Workspace
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Choose a business unit to enter
            </p>
          </div>
        </div>

        {/* Three Workspace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* YARN Workspace */}
          <button
            onClick={() => handleSelect("YARN")}
            className="group relative industrial-card p-8 text-left border-2 border-[#2D3648] hover:border-amber-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-all duration-300" />

            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-sm flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all duration-300">
              <span className="text-3xl">🧵</span>
            </div>

            <h2
              className="text-2xl font-bold text-white uppercase tracking-wider mb-2 group-hover:text-amber-400 transition-colors"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Yarn
            </h2>
            <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-4">
              Raw yarn, dyeing production, dyed yarn sales and lot management
            </p>

            <div className="space-y-1.5">
              {[
                "Raw Yarn & Dyed Yarn",
                "Dyeing Manufacturing",
                "Yarn Purchases & Sales",
                "Yarn Suppliers & Customers",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600 group-hover:text-slate-500">
                  <div className="w-1 h-1 bg-amber-500/50 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
                Enter Workspace →
              </span>
            </div>
          </button>

          {/* CHEMICAL Workspace */}
          <button
            onClick={() => handleSelect("CHEMICAL")}
            className="group relative industrial-card p-8 text-left border-2 border-[#2D3648] hover:border-blue-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300" />

            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-sm flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-all duration-300">
              <span className="text-3xl">🧪</span>
            </div>

            <h2
              className="text-2xl font-bold text-white uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Chemical
            </h2>
            <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-4">
              Chemical raw materials, manufacturing and finished product sales
            </p>

            <div className="space-y-1.5">
              {[
                "Chemical Raw & Finished",
                "Chemical Manufacturing",
                "Chemical Purchases & Sales",
                "Chemical Suppliers & Customers",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600 group-hover:text-slate-500">
                  <div className="w-1 h-1 bg-blue-500/50 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
                Enter Workspace →
              </span>
            </div>
          </button>

          {/* OPERATIONS Workspace */}
          <button
            onClick={() => handleSelect("OPERATIONS")}
            className="group relative industrial-card p-8 text-left border-2 border-[#2D3648] hover:border-green-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-all duration-300" />

            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-sm flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-all duration-300">
              <span className="text-3xl">⚙️</span>
            </div>

            <h2
              className="text-2xl font-bold text-white uppercase tracking-wider mb-2 group-hover:text-green-400 transition-colors"
              style={{ fontFamily: "Barlow Condensed" }}
            >
              Operations
            </h2>
            <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-4">
              HR management, attendance, payroll, expenses and daily operations
            </p>

            <div className="space-y-1.5">
              {[
                "Employee Management",
                "Attendance Tracking",
                "Payroll & Salary",
                "Daily Expenses",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600 group-hover:text-slate-500">
                  <div className="w-1 h-1 bg-green-500/50 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
                Enter Workspace →
              </span>
            </div>
          </button>
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}