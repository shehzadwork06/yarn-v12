import React, { useState, useEffect, useCallback } from "react";
import { auditLogsAPI } from "@/lib/api";
import { ScrollText, Search, Shield, ChevronLeft, ChevronRight, Activity, Lock } from "lucide-react";

const actionColors = {
  POST: 'badge-success',
  PUT: 'badge-info',
  DELETE: 'badge-error',
  PATCH: 'badge-warning',
  LOGIN: 'badge-success',
  LOGIN_FAILED: 'badge-error',
};

const moduleIcons = {
  AUTH: 'text-blue-400',
  PRODUCTS: 'text-amber-400',
  LOTS: 'text-amber-400',
  INVENTORY: 'text-emerald-400',
  SUPPLIERS: 'text-purple-400',
  CUSTOMERS: 'text-purple-400',
  PURCHASES: 'text-blue-400',
  MANUFACTURING: 'text-amber-400',
  WASTAGE: 'text-red-400',
  SALES: 'text-emerald-400',
  'GATE-PASSES': 'text-slate-400',
  EMPLOYEES: 'text-blue-400',
  ATTENDANCE: 'text-blue-400',
  PAYROLL: 'text-emerald-400',
  FINANCE: 'text-amber-400',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ module: '', action: '', search: '', from_date: '', to_date: '' });
  const [expandedRow, setExpandedRow] = useState(null);

  const loadLogs = useCallback(() => {
    const params = { page, limit: 30 };
    if (filters.module) params.module = filters.module;
    if (filters.action) params.action = filters.action;
    if (filters.search) params.search = filters.search;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;

    auditLogsAPI.list(params).then(r => {
      setLogs(r.data.data);
      setTotal(r.data.total);
      setTotalPages(r.data.totalPages);
    });
  }, [page, filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => {
    auditLogsAPI.stats().then(r => setStats(r.data));
    auditLogsAPI.modules().then(r => setModules(r.data));
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ module: '', action: '', search: '', from_date: '', to_date: '' });
    setPage(1);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts + 'Z');
    return d.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'medium' });
  };

  const parseDetails = (details) => {
    if (!details) return null;
    try { return JSON.parse(details); } catch { return null; }
  };

  return (
    <div data-testid="audit-logs-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Barlow Condensed' }}>
            Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">Immutable system activity trail — every action is permanently recorded</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-sm" data-testid="immutable-badge">
          <Lock size={14} className="text-red-400" />
          <span className="text-xs text-red-400 font-mono uppercase tracking-wider">Immutable — Cannot be deleted or modified</span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="industrial-card p-4">
            <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Total Logs</p>
            <p className="text-2xl font-bold text-white font-mono mt-1" data-testid="total-logs">{stats.totalLogs.toLocaleString()}</p>
          </div>
          <div className="industrial-card p-4">
            <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Today's Activity</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1" data-testid="today-logs">{stats.todayLogs.toLocaleString()}</p>
          </div>
          <div className="industrial-card p-4">
            <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Top Module</p>
            <p className="text-2xl font-bold text-blue-400 font-mono mt-1">{stats.byModule?.[0]?.module || '-'}</p>
            <p className="text-xs text-slate-500">{stats.byModule?.[0]?.count || 0} actions</p>
          </div>
          <div className="industrial-card p-4">
            <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: 'Barlow Condensed' }}>Active Users</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.recentUsers?.length || 0}</p>
            <p className="text-xs text-slate-500">{stats.recentUsers?.join(', ') || '-'}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="industrial-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-600" />
              <input data-testid="log-search" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search logs..."
                className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm pl-9 pr-4 h-9 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none w-56"
                onKeyDown={e => e.key === 'Enter' && loadLogs()} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Module</label>
            <select data-testid="log-module-filter" value={filters.module} onChange={e => handleFilterChange('module', e.target.value)}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none w-40">
              <option value="">All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>Action</label>
            <select data-testid="log-action-filter" value={filters.action} onChange={e => handleFilterChange('action', e.target.value)}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none w-32">
              <option value="">All Actions</option>
              <option value="POST">CREATE</option>
              <option value="PUT">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGIN_FAILED">LOGIN FAILED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>From</label>
            <input type="date" value={filters.from_date} onChange={e => handleFilterChange('from_date', e.target.value)}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase mb-1" style={{ fontFamily: 'Barlow Condensed' }}>To</label>
            <input type="date" value={filters.to_date} onChange={e => handleFilterChange('to_date', e.target.value)}
              className="bg-[#0A0F1C] border border-[#2D3648] text-slate-200 rounded-sm px-3 h-9 text-sm outline-none" />
          </div>
          <button onClick={clearFilters} data-testid="clear-filters" className="bg-[#1E2738] text-slate-400 hover:text-white rounded-sm h-9 px-4 text-xs uppercase tracking-wider transition-colors"
            style={{ fontFamily: 'Barlow Condensed' }}>Clear</button>
        </div>
      </div>

      {/* Log count and pagination info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="text-white font-mono">{logs.length}</span> of <span className="text-white font-mono">{total}</span> logs
        </p>
      </div>

      {/* Logs Table */}
      <div className="industrial-card" data-testid="audit-logs-table">
        <table className="w-full erp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th style={{ width: '40px' }}>Info</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const details = parseDetails(log.details);
              const isExpanded = expandedRow === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr onClick={() => setExpandedRow(isExpanded ? null : log.id)} className="cursor-pointer">
                    <td className="text-slate-600 font-mono text-xs">{log.id}</td>
                    <td className="text-slate-400 font-mono text-xs whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span className={`text-sm ${log.username === 'SYSTEM' ? 'text-slate-600' : 'text-blue-400'}`}>{log.username}</span>
                    </td>
                    <td>
                      <span className={actionColors[log.action] || 'badge-neutral'}>{log.action}</span>
                    </td>
                    <td>
                      <span className={`text-xs font-mono uppercase ${moduleIcons[log.module] || 'text-slate-400'}`}>{log.module}</span>
                    </td>
                    <td className="text-slate-200 text-sm max-w-xs truncate">{log.description}</td>
                    <td>
                      <Activity size={14} className={`${isExpanded ? 'text-amber-400' : 'text-slate-600'} transition-colors`} />
                    </td>
                  </tr>
                  {isExpanded && details && (
                    <tr>
                      <td colSpan={7} className="!bg-[#0A0F1C] !border-amber-500/20 !border-l-2">
                        <div className="p-4 space-y-2 animate-fade-in">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            {details.path && (
                              <div>
                                <span className="text-slate-600 uppercase">Path</span>
                                <p className="text-amber-400 font-mono mt-0.5">{details.path}</p>
                              </div>
                            )}
                            {log.entity_type && (
                              <div>
                                <span className="text-slate-600 uppercase">Entity</span>
                                <p className="text-slate-300 font-mono mt-0.5">{log.entity_type} #{log.entity_id || '-'}</p>
                              </div>
                            )}
                            {log.ip_address && (
                              <div>
                                <span className="text-slate-600 uppercase">IP Address</span>
                                <p className="text-slate-400 font-mono mt-0.5">{log.ip_address}</p>
                              </div>
                            )}
                            {details.responseId && (
                              <div>
                                <span className="text-slate-600 uppercase">Response ID</span>
                                <p className="text-slate-300 font-mono mt-0.5">{details.responseId}</p>
                              </div>
                            )}
                          </div>
                          {details.body && Object.keys(details.body).length > 0 && (
                            <div>
                              <span className="text-slate-600 uppercase text-xs">Request Data</span>
                              <pre className="bg-[#050810] border border-[#2D3648] rounded-sm p-3 mt-1 text-xs text-slate-400 font-mono overflow-x-auto max-h-40">
                                {JSON.stringify(details.body, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {logs.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-500 py-12">
                <ScrollText className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                No audit logs found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3" data-testid="pagination">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="bg-[#1E2738] text-slate-400 hover:text-white disabled:opacity-30 rounded-sm h-9 w-9 flex items-center justify-center transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400 font-mono">
            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
          </span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="bg-[#1E2738] text-slate-400 hover:text-white disabled:opacity-30 rounded-sm h-9 w-9 flex items-center justify-center transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Module breakdown */}
      {stats?.byModule?.length > 0 && (
        <div className="industrial-card p-5" data-testid="module-breakdown">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4" style={{ fontFamily: 'Barlow Condensed' }}>Activity by Module</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.byModule.map(m => (
              <button key={m.module} onClick={() => handleFilterChange('module', m.module)}
                className="bg-[#0A0F1C] border border-[#2D3648] hover:border-amber-500/30 p-3 rounded-sm text-left transition-all group">
                <p className={`text-xs font-mono uppercase ${moduleIcons[m.module] || 'text-slate-400'} group-hover:text-amber-400 transition-colors`}>{m.module}</p>
                <p className="text-lg font-bold text-white font-mono mt-1">{m.count}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
