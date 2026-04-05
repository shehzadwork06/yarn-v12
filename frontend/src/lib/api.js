// import axios from 'axios';
 
// const API_URL =
//   typeof window !== 'undefined' && window.electronAPI?.isElectron
//     ? `http://localhost:${window.electronAPI.backendPort || 8002}`
//     : process.env.REACT_APP_BACKEND_URL;
 
// const api = axios.create({
//   baseURL: `${API_URL}/api`,
//   headers: { 'Content-Type': 'application/json' },
// });
 
// // ── REQUEST interceptor ───────────────────────────────────────────────────────
// // Attaches JWT token AND X-Business-Mode header to every request.
// // The business mode is stored in localStorage as 'erp_business_mode'.
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('erp_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
 
//   // Inject workspace header — this is what makes YARN and CHEMICAL separate
//   const mode = localStorage.getItem('erp_business_mode');
//   if (mode) config.headers['X-Business-Mode'] = mode;  // 'YARN' or 'CHEMICAL'
 
//   return config;
// });
 
// // ── RESPONSE interceptor ──────────────────────────────────────────────────────
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('erp_token');
//       localStorage.removeItem('erp_user');
//       localStorage.removeItem('erp_business_mode');
// window.location.href = '#/login';
//     }
//     return Promise.reject(err);
//   }
// );
 
// // ── API modules ───────────────────────────────────────────────────────────────
 
// export const authAPI = {
//   login: (data) => api.post('/auth/login', data),
//   me:    ()     => api.get('/auth/me'),
// };
 
// export const dashboardAPI = {
//   get: () => api.get('/dashboard'),
// };
 
// export const categoriesAPI = {
//   list:   (params)     => api.get('/categories', { params }),
//   get:    (id)         => api.get(`/categories/${id}`),
//   create: (data)       => api.post('/categories', data),
//   update: (id, data)   => api.put(`/categories/${id}`, data),
//   remove: (id)         => api.delete(`/categories/${id}`),
// };
 
// // Products — backend returns only types valid for current workspace
// export const productsAPI = {
//   list:   (params)   => api.get('/products', { params }),
//   get:    (id)       => api.get(`/products/${id}`),
//   create: (data)     => api.post('/products', data),
//   update: (id, data) => api.put(`/products/${id}`, data),
// };
 
// // Lots — backend returns only lots from current workspace tables
// export const lotsAPI = {
//   list:    (params) => api.get('/lots', { params }),
//   get:     (id)     => api.get(`/lots/${id}`),
//   history: (id)     => api.get(`/lots/${id}/history`),
// };
 
// export const inventoryAPI = {
//   list:       (params) => api.get('/inventory', { params }),
//   summary:    ()       => api.get('/inventory/summary'),
//   lowStock:   ()       => api.get('/inventory/low-stock'),
//   byLocation: ()       => api.get('/inventory/by-location'),
// };
 
// export const suppliersAPI = {
//   list:    (params)   => api.get('/suppliers', { params }),
//   get:     (id)       => api.get(`/suppliers/${id}`),
//   create:  (data)     => api.post('/suppliers', data),
//   update:  (id, data) => api.put(`/suppliers/${id}`, data),
//   ledger:  (id)       => api.get(`/suppliers/${id}/ledger`),
//   payment: (id, data) => api.post(`/suppliers/${id}/payment`, data),
// };
 
// export const customersAPI = {
//   list:    (params)   => api.get('/customers', { params }),
//   get:     (id)       => api.get(`/customers/${id}`),
//   create:  (data)     => api.post('/customers', data),
//   update:  (id, data) => api.put(`/customers/${id}`, data),
//   ledger:  (id)       => api.get(`/customers/${id}/ledger`),
//   payment: (id, data) => api.post(`/customers/${id}/payment`, data),
// };
 
// // Purchases — backend uses yarn_purchases or chem_purchases based on header
// export const purchasesAPI = {
//   list:   (params)   => api.get('/purchases', { params }),
//   get:    (id)       => api.get(`/purchases/${id}`),
//   create: (data)     => api.post('/purchases', data),
//   update: (id, data) => api.put(`/purchases/${id}`, data),
// };
 
// export const manufacturingAPI = {
//   list:            (params) => api.get('/manufacturing', { params }),
//   get:             (id)     => api.get(`/manufacturing/${id}`),
//   startDyeing:     (data)   => api.post('/manufacturing/start-dyeing', data),
//   completeDyeing:  (data)   => api.post('/manufacturing/complete-dyeing', data),
//   startChemical:   (data)   => api.post('/manufacturing/start-chemical', data),
//   completeChemical:(data)   => api.post('/manufacturing/complete-chemical', data),
// };
 
// export const wastageAPI = {
//   list:    (params) => api.get('/wastage', { params }),
//   summary: (params) => api.get('/wastage/summary', { params }),
// };
 
// export const salesAPI = {
//   list:   (params) => api.get('/sales', { params }),
//   get:    (id)     => api.get(`/sales/${id}`),
//   create: (data)   => api.post('/sales', data),
//   update: (id, data) => api.put(`/sales/${id}`, data),
// };
 
// export const gatePassAPI = {
//   list:   (params)   => api.get('/gate-passes', { params }),
//   get:    (id)       => api.get(`/gate-passes/${id}`),
//   verify: (id, data) => api.put(`/gate-passes/${id}/verify`, data),
// };
 
// export const employeesAPI = {
//   list:    (params)   => api.get('/employees', { params }),
//   get:     (id)       => api.get(`/employees/${id}`),
//   create:  (data)     => api.post('/employees', data),
//   update:  (id, data) => api.put(`/employees/${id}`, data),
//   addLoan: (id, data) => api.post(`/employees/${id}/loan`, data),
// };
 
// export const attendanceAPI = {
//   list:       (params) => api.get('/attendance', { params }),
//   timeIn:     (data)   => api.post('/attendance/time-in', data),
//   timeOut:    (data)   => api.post('/attendance/time-out', data),
//   markAbsent: (data)   => api.post('/attendance/mark-absent', data),
//   summary:    (params) => api.get('/attendance/summary', { params }),
// };
 
// export const payrollAPI = {
//   list:     (params) => api.get('/payroll', { params }),
//   generate: (data)   => api.post('/payroll/generate', data),
//   confirm:  (id)     => api.put(`/payroll/${id}/confirm`),
//   pay:      (id)     => api.put(`/payroll/${id}/pay`),
// };
 
// export const financeAPI = {
//   dailyProfit:   (params) => api.get('/finance/profit/daily',   { params }),
//   monthlyProfit: (params) => api.get('/finance/profit/monthly', { params }),
//   rangeProfit:   (params) => api.get('/finance/profit/range',   { params }),
//   lotProfit:     (params) => api.get('/finance/profit/lot-wise', { params }),
//   expenses:      (params) => api.get('/finance/expenses', { params }),
//   addExpense:    (data)   => api.post('/finance/expenses', data),
// };
 
// export const purchaseReturnsAPI = {
//   list:   (params) => api.get('/purchase-returns', { params }),
//   get:    (id)     => api.get(`/purchase-returns/${id}`),
//   create: (data)   => api.post('/purchase-returns', data),
//   update: (id, data) => api.put(`/purchase-returns/${id}`, data),
// };
 
// export const saleReturnsAPI = {
//   list:   (params) => api.get('/sale-returns', { params }),
//   get:    (id)     => api.get(`/sale-returns/${id}`),
//   create: (data)   => api.post('/sale-returns', data),
//   update: (id, data) => api.put(`/sale-returns/${id}`, data),
//   cancel: (id)     => api.put(`/sale-returns/${id}/cancel`),
// };
 
// export const auditLogsAPI = {
//   list:    (params) => api.get('/audit-logs', { params }),
//   modules: ()       => api.get('/audit-logs/modules'),
//   stats:   ()       => api.get('/audit-logs/stats'),
// };
 
// export default api;
import axios from 'axios';
 
const API_URL =
  typeof window !== 'undefined' && window.electronAPI?.isElectron
    ? `http://localhost:${window.electronAPI.backendPort || 8002}`
    : process.env.REACT_APP_BACKEND_URL;
 
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});
 
// ── REQUEST interceptor ───────────────────────────────────────────────────────
// Attaches JWT token AND X-Business-Mode header to every request.
// The business mode is stored in localStorage as 'erp_business_mode'.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
 
  // Inject workspace header — this is what makes YARN and CHEMICAL separate
  const mode = localStorage.getItem('erp_business_mode');
  if (mode) config.headers['X-Business-Mode'] = mode;  // 'YARN' or 'CHEMICAL'
 
  return config;
});
 
// ── RESPONSE interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erp_business_mode');
window.location.href = '#/login';
    }
    return Promise.reject(err);
  }
);
 
// ── API modules ───────────────────────────────────────────────────────────────
 
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me:    ()     => api.get('/auth/me'),
};
 
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};
 
export const categoriesAPI = {
  list:   (params)     => api.get('/categories', { params }),
  get:    (id)         => api.get(`/categories/${id}`),
  create: (data)       => api.post('/categories', data),
  update: (id, data)   => api.put(`/categories/${id}`, data),
  remove: (id)         => api.delete(`/categories/${id}`),
};
 
// Products — backend returns only types valid for current workspace
export const productsAPI = {
  list:   (params)   => api.get('/products', { params }),
  get:    (id)       => api.get(`/products/${id}`),
  create: (data)     => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
};
 
// Lots — backend returns only lots from current workspace tables
export const lotsAPI = {
  list:    (params) => api.get('/lots', { params }),
  get:     (id)     => api.get(`/lots/${id}`),
  history: (id)     => api.get(`/lots/${id}/history`),
};
 
export const inventoryAPI = {
  list:       (params) => api.get('/inventory', { params }),
  summary:    ()       => api.get('/inventory/summary'),
  lowStock:   ()       => api.get('/inventory/low-stock'),
  byLocation: ()       => api.get('/inventory/by-location'),
};
 
export const suppliersAPI = {
  list:    (params)   => api.get('/suppliers', { params }),
  get:     (id)       => api.get(`/suppliers/${id}`),
  create:  (data)     => api.post('/suppliers', data),
  update:  (id, data) => api.put(`/suppliers/${id}`, data),
  ledger:  (id)       => api.get(`/suppliers/${id}/ledger`),
  payment: (id, data) => api.post(`/suppliers/${id}/payment`, data),
};
 
export const customersAPI = {
  list:    (params)   => api.get('/customers', { params }),
  get:     (id)       => api.get(`/customers/${id}`),
  create:  (data)     => api.post('/customers', data),
  update:  (id, data) => api.put(`/customers/${id}`, data),
  ledger:  (id)       => api.get(`/customers/${id}/ledger`),
  payment: (id, data) => api.post(`/customers/${id}/payment`, data),
};
 
// Purchases — backend uses yarn_purchases or chem_purchases based on header
export const purchasesAPI = {
  list:   (params)   => api.get('/purchases', { params }),
  get:    (id)       => api.get(`/purchases/${id}`),
  create: (data)     => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
};
 
export const manufacturingAPI = {
  list:            (params) => api.get('/manufacturing', { params }),
  get:             (id)     => api.get(`/manufacturing/${id}`),
  startDyeing:     (data)   => api.post('/manufacturing/start-dyeing', data),
  completeDyeing:  (data)   => api.post('/manufacturing/complete-dyeing', data),
  startChemical:   (data)   => api.post('/manufacturing/start-chemical', data),
  completeChemical:(data)   => api.post('/manufacturing/complete-chemical', data),
};
 
export const wastageAPI = {
  list:    (params) => api.get('/wastage', { params }),
  summary: (params) => api.get('/wastage/summary', { params }),
};
 
export const salesAPI = {
  list:   (params) => api.get('/sales', { params }),
  get:    (id)     => api.get(`/sales/${id}`),
  create: (data)   => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
};
 
export const gatePassAPI = {
  list:   (params)   => api.get('/gate-passes', { params }),
  get:    (id)       => api.get(`/gate-passes/${id}`),
  verify: (id, data) => api.put(`/gate-passes/${id}/verify`, data),
};
 
export const employeesAPI = {
  list:    (params)   => api.get('/employees', { params }),
  get:     (id)       => api.get(`/employees/${id}`),
  create:  (data)     => api.post('/employees', data),
  update:  (id, data) => api.put(`/employees/${id}`, data),
  addLoan: (id, data) => api.post(`/employees/${id}/loan`, data),
};
 
export const attendanceAPI = {
  list:       (params)   => api.get('/attendance', { params }),
  timeIn:     (data)     => api.post('/attendance/time-in', data),
  timeOut:    (data)     => api.post('/attendance/time-out', data),
  markAbsent: (data)     => api.post('/attendance/mark-absent', data),
  markAll:    (data)     => api.post('/attendance/mark-all', data),
  update:     (id, data) => api.put(`/attendance/${id}`, data),
  summary:    (params)   => api.get('/attendance/summary', { params }),
};
 
export const payrollAPI = {
  list:        (params)   => api.get('/payroll', { params }),
  generate:    (data)     => api.post('/payroll/generate', data),
  update:      (id, data) => api.put(`/payroll/${id}`, data),
  confirm:     (id)       => api.put(`/payroll/${id}/confirm`),
  pay:         (id)       => api.put(`/payroll/${id}/pay`),
  deleteOne:   (id)       => api.delete(`/payroll/${id}`),
  deleteMonth: (month, year) => api.delete(`/payroll/month/${month}/${year}`),
};
 
export const financeAPI = {
  dailyProfit:   (params)   => api.get('/finance/profit/daily',   { params }),
  monthlyProfit: (params)   => api.get('/finance/profit/monthly', { params }),
  rangeProfit:   (params)   => api.get('/finance/profit/range',   { params }),
  lotProfit:     (params)   => api.get('/finance/profit/lot-wise', { params }),
  expenses:      (params)   => api.get('/finance/expenses', { params }),
  addExpense:    (data)     => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id)       => api.delete(`/finance/expenses/${id}`),
};
 
export const purchaseReturnsAPI = {
  list:   (params) => api.get('/purchase-returns', { params }),
  get:    (id)     => api.get(`/purchase-returns/${id}`),
  create: (data)   => api.post('/purchase-returns', data),
  update: (id, data) => api.put(`/purchase-returns/${id}`, data),
};
 
export const saleReturnsAPI = {
  list:   (params) => api.get('/sale-returns', { params }),
  get:    (id)     => api.get(`/sale-returns/${id}`),
  create: (data)   => api.post('/sale-returns', data),
  update: (id, data) => api.put(`/sale-returns/${id}`, data),
  cancel: (id)     => api.put(`/sale-returns/${id}/cancel`),
};
 
export const auditLogsAPI = {
  list:    (params) => api.get('/audit-logs', { params }),
  modules: ()       => api.get('/audit-logs/modules'),
  stats:   ()       => api.get('/audit-logs/stats'),
};
 
export default api;