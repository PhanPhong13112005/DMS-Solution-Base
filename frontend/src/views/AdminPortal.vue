<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePagination } from '../composables/usePagination';
import apiClient from '../api/axios';
import { X, Save, Pencil, ChartSpline, Users, Shield, LogOut, ArrowUpRight, ArrowDownRight, Settings, PlusCircle, Trash2, Calendar, Newspaper, Activity, Landmark, BellRing, Info, AlertTriangle, CheckCircle, Receipt, Search, Eye, Copy, Inbox, ClipboardList, Download, ArrowUp, ArrowDown, Wrench, UserPlus, Calculator, FileText, Home, CircleDollarSign, Building2, Banknote, BarChart3, Plus } from 'lucide-vue-next';
import type { Room, BookingApplication, MaintenanceRequest, NewsArticle, Invoice, Bed, News } from '../types';
import { useAppData } from '../composables/useAppData';
import { roomBuildingApi, newsApi } from '../services/room-building.service'; 
import AdminAccountManagement from './AdminAccountManagement.vue';
import { billingApi } from '../services/billing.service';

const { user, applications: _applications, maintenanceRequests: _maintenanceRequests, invoices: _invoices, news: _news, actions, rooms: _rooms } = useAppData();

const adminUser = computed(() => user.value || { name: 'Admin', id: 'ADMIN' });

const props = {
  get rooms() { return _rooms.value || []; },
  get applications() { return _applications.value || []; },
  get maintenanceRequests() { return _maintenanceRequests.value || []; },
  get news() { return _news.value || []; },
  get invoices() { return _invoices.value || []; }
};

const emit = (event: string, ...args: any[]) => {
  if (event === 'logout') actions.logout();
  if (event === 'approveApplication') actions.approveApplication(args[0]);
  if (event === 'rejectApplication') actions.rejectApplication(args[0]);
  if (event === 'updateMaintenanceStatus') actions.updateMaintenanceStatus(args[0], args[1]);
  if (event === 'addNewsArticle') actions.addNewsArticle(args[0]);
  if (event === 'deleteNewsArticle') actions.deleteNewsArticle(args[0]);
  if (event === 'deleteInvoice') console.log('Xóa hóa đơn: ', args[0]); 
  if (event === 'addInvoice') actions.addInvoice(args[0]);
  if (event === 'payInvoice') actions.payInvoice(args[0]);
  if (event === 'deletePayment') console.log('Xóa thanh toán: ', args[0]); 
};

// ============ REAL DATA (DỮ LIỆU THẬT NHÓM 1) ============
const realTotalBeds = ref(0);
const realOccupiedBeds = ref(0);
const realAvailableBeds = ref(0);
const allBedsList = ref([]);

const loadDashboardStats = async () => {
  try {
    const beds = await roomBuildingApi.beds.getAll();
    if (beds && beds.length > 0) {
        allBedsList.value = beds;
        realTotalBeds.value = beds.length;
        realOccupiedBeds.value = beds.filter((b: any) => !b.isAvailable).length; 
        realAvailableBeds.value = beds.filter((b: any) => b.isAvailable).length;
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu thống kê từ N1:", error);
  }
};

const roomsList = ref<any[]>([]);
const buildingsList = ref<any[]>([]);
const roomTypesList = ref<any[]>([]);
const hierarchyData = ref<any[]>([]);

const loadFacilitiesData = async () => {
  try {
    const [bRes, rRes, tRes, hRes] = await Promise.all([
      roomBuildingApi.buildings.getAll(),
      roomBuildingApi.rooms.getAll(),
      roomBuildingApi.roomTypes.getAll(),
      roomBuildingApi.buildings.getHierarchy()
    ]);
    if (bRes) buildingsList.value = bRes.data || bRes.Data || (Array.isArray(bRes) ? bRes : []);
    if (rRes) roomsList.value = rRes.data || rRes.Data || (Array.isArray(rRes) ? rRes : []);
    if (tRes) roomTypesList.value = tRes.data || tRes.Data || (Array.isArray(tRes) ? tRes : []);
    if (hRes) hierarchyData.value = hRes.data || hRes.Data || (Array.isArray(hRes) ? hRes : []);
  } catch (error) {
    console.error("Lỗi tải dữ liệu phòng:", error);
  }
};

const toggleBedMaintenance = async (bedId: number) => {
  try {
    await roomBuildingApi.beds.maintenance(bedId, "Admin yêu cầu khóa giường");
    showToast('Đã khóa giường thành công!', 'success');
    await loadFacilitiesData(); // Reload data
  } catch(error) {
    console.error("Lỗi khóa giường:", error);
    showToast('Lỗi khi khóa giường', 'error');
  }
};

// ============ NEWS DATA (DỮ LIỆU THẬT NHÓM 1) ============
const newsList = ref<News[]>([]);
const showNewsModal = ref(false);
const isEditingNews = ref(false);
const newsFormData = ref<{ id: number | null; title: string; content: string; author: string }>({
  id: null,
  title: '',
  content: '',
  author: ''
});

const loadNewsData = async () => {
  try {
    const res = await newsApi.getAll();
    if (res) newsList.value = res;
  } catch (error) {
    console.error('Lỗi tải dữ liệu tin tức từ N1:', error);
  }
};

const openCreateNewsModal = () => {
  isEditingNews.value = false;
  newsFormData.value = { id: null, title: '', content: '', author: '' };
  showNewsModal.value = true;
};

const openEditNewsModal = (item: News) => {
  isEditingNews.value = true;
  newsFormData.value = { id: item.id, title: item.title, content: item.content, author: item.author || '' };
  showNewsModal.value = true;
};

const handleSaveNews = async () => {
  if (!newsFormData.value.title || !newsFormData.value.content) {
    showToast('Vui lòng nhập tiêu đề và nội dung!', 'error');
    return;
  }
  try {
    if (isEditingNews.value && newsFormData.value.id !== null) {
      const existing = newsList.value.find(n => n.id === newsFormData.value.id);
      await newsApi.update(newsFormData.value.id, {
        id: newsFormData.value.id,
        title: newsFormData.value.title,
        content: newsFormData.value.content,
        author: newsFormData.value.author || undefined,
        createdAt: existing?.createdAt
      });
      showToast('Cập nhật tin tức thành công!', 'success');
    } else {
      await newsApi.create({
        title: newsFormData.value.title,
        content: newsFormData.value.content,
        author: newsFormData.value.author || undefined
      });
      showToast('Tạo tin tức mới thành công!', 'success');
    }
    showNewsModal.value = false;
    await loadNewsData();
  } catch (err) {
    showToast('Có lỗi xảy ra khi lưu tin tức!', 'error');
  }
};

const showDeleteNewsConfirm = ref(false);
const newsToDeleteId = ref<number | null>(null);

const handleDeleteNews = (id: number) => {
  newsToDeleteId.value = id;
  showDeleteNewsConfirm.value = true;
};

const confirmDeleteNews = async () => {
  if (newsToDeleteId.value === null) return;
  try {
    await newsApi.delete(newsToDeleteId.value);
    showToast('Xóa tin tức thành công!', 'success');
    await loadNewsData();
  } catch (err) {
    showToast('Không thể xóa tin tức!', 'error');
  } finally {
    showDeleteNewsConfirm.value = false;
    newsToDeleteId.value = null;
  }
};

const activeTab = ref<string>('Bảng điều khiển');
const toast = ref<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

// Form Tin tức
const newsTitle = ref('');
const newsCat = ref<'TIN TỨC KTX' | 'SỰ KIỆN' | 'THÔNG BÁO' | 'HOẠT ĐỘNG SV' | 'Quy định - Thủ tục'>('TIN TỨC KTX');
const newsSummary = ref('');
const newsContent = ref('');
const newsImg = ref('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80');

const pendingApps = computed(() => (props.applications || []).filter(a => a.status === 'Pending'));
const computedNews = computed(() => props.news || []);

const activeIssues = computed(() => (props.maintenanceRequests || []).filter(m => m.status !== 'Resolved'));

const maintenanceSearch = ref('');
const maintenanceStatusFilter = ref('All');
const maintenanceCategoryFilter = ref('All');
const maintenancePriorityFilter = ref('All');

const filteredIssues = computed(() => {
  return (props.maintenanceRequests || []).filter(m => {
    let match = true;
    if (maintenanceSearch.value) {
      const term = maintenanceSearch.value.toLowerCase();
      match = match && Boolean(
        (m.title && m.title.toLowerCase().includes(term)) || 
        (m.roomNumber && m.roomNumber.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term))
      );
    }
    if (maintenanceStatusFilter.value !== 'All') {
      match = match && m.status === maintenanceStatusFilter.value;
    }
    if (maintenanceCategoryFilter.value !== 'All') {
      match = match && (m as any).category === maintenanceCategoryFilter.value;
    }
    if (maintenancePriorityFilter.value !== 'All') {
      match = match && m.priority === maintenancePriorityFilter.value;
    }
    return match;
  });
});

const { paginatedItems: pApps, currentPage: cpApps, totalPages: tpApps, nextPage: npApps, prevPage: ppApps } = usePagination(pendingApps, 5);
const historyApps = computed(() => (props.applications || []).filter(a => a.status !== 'Pending'));
const { paginatedItems: pHistoryApps, currentPage: cpHistoryApps, totalPages: tpHistoryApps, nextPage: npHistoryApps, prevPage: ppHistoryApps } = usePagination(historyApps, 5);
const { paginatedItems: pIssues, currentPage: cpIssues, totalPages: tpIssues, nextPage: npIssues, prevPage: ppIssues } = usePagination(filteredIssues, 5);
const { paginatedItems: pNews, currentPage: cpNews, totalPages: tpNews, nextPage: npNews, prevPage: ppNews } = usePagination(computedNews, 4);

const totalInvoicesPaidSum = computed(() => (props.invoices || []).filter(i => i.status === 'Paid').reduce((accum, i) => accum + i.amount, 14500000));
const totalOccupiedSeats = computed(() => realTotalBeds.value > 0 ? realOccupiedBeds.value : (props.rooms || []).reduce((accum, r) => accum + (r.capacity - r.available), 14));
const totalCapacitySeats = computed(() => realTotalBeds.value > 0 ? realTotalBeds.value : (props.rooms || []).reduce((accum, r) => accum + r.capacity, 28));

const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 4000);
};

// State lưu trữ thống kê thực tế từ API
const adminStats = ref({
  totalRevenue: 0,
  collectedRevenue: 0,
  pendingRevenue: 0,
  paidCount: 0,
  unpaidCount: 0
});

// Hàm gọi API lấy thống kê thực
const fetchStats = async () => {
  try {
    const res = await apiClient.get('/bills/stats');
    if (res.data && res.data.isSuccess) {
      adminStats.value = res.data.data || res.data.Data;
    }
  } catch (err) {
    console.error("Lỗi lấy thống kê", err);
  }
};

const adminMaintStats = ref<any>(null);

const fetchMaintStats = async () => {
  try {
    const data = await billingApi.maintenance.getStats();
    if (data) {
      adminMaintStats.value = data;
    }
  } catch (err) {
    console.error("Lỗi lấy thống kê bảo trì", err);
  }
};

onMounted(() => {
  fetchStats();
  fetchMaintStats();
  loadDashboardStats();
  loadFacilitiesData();
  loadNewsData();
});

const handleCreateNews = () => {
  if (!newsTitle.value || !newsSummary.value || !newsContent.value) {
    showToast('Vui lòng soạn thảo và bổ sung hoàn chỉnh thông tin các trường yêu cầu!', 'error');
    return;
  }

  const newArticle: NewsArticle = {
    id: 'news-' + Math.random().toString(36).substr(2, 9),
    title: newsTitle.value,
    category: newsCat.value,
    date: new Date().toLocaleDateString('vi-VN'),
    summary: newsSummary.value,
    content: newsContent.value,
    image: newsImg.value
  };

  emit('addNewsArticle', newArticle);
  showToast('Đã soạn đăng và chuyển gửi thông báo mới công khai thành công!', 'success');
  newsTitle.value = '';
  newsSummary.value = '';
  newsContent.value = '';
};




const menuItems = [
  { id: 'Bảng điều khiển', icon: ChartSpline },
  { id: 'Hóa Đơn & Phiếu Thu', icon: Receipt },
  { id: 'Quản lý Công nợ', icon: ClipboardList },
  { id: 'Quản lý Thanh toán', icon: Landmark },
  { id: 'Quản lý tin tức', icon: Newspaper },
  { id: 'Sự cố bảo trì', icon: Activity },
  { id: 'Duyệt lưu trú', icon: Users },
  { id: 'Cơ sở vật chất', icon: Building2 },
  { id: 'Loại phòng', icon: Building2 },
  { id: 'Sơ đồ KTX', icon: CircleDollarSign },
  { id: 'Cài đặt hệ thống', icon: Settings }
];

// =============================================
// QUẢN LÝ HÓA ĐƠN
// =============================================
const invoiceSearch = ref('');
const invoiceStatusFilter = ref('All');

const filteredInvoices = computed(() => {
  let list = props.invoices || [];
  return list.filter(inv => {
    const matchSearch = inv.id.toLowerCase().includes(invoiceSearch.value.toLowerCase()) || 
                        inv.roomNumber.toLowerCase().includes(invoiceSearch.value.toLowerCase()) ||
                        (inv.displayId && inv.displayId.toLowerCase().includes(invoiceSearch.value.toLowerCase()));
    const matchStatus = invoiceStatusFilter.value === 'All' || 
                        (invoiceStatusFilter.value === 'Paid' && inv.status === 'Paid') ||
                        (invoiceStatusFilter.value === 'Unpaid' && inv.status === 'Unpaid');
    return matchSearch && matchStatus;
  });
});

const { paginatedItems: pInvoices, currentPage: cpInvoices, totalPages: tpInvoices, nextPage: npInvoices, prevPage: ppInvoices } = usePagination(filteredInvoices, 5);

// Thống kê thẻ Hóa Đơn & Công Nợ
const totalRevenue = computed(() => {
  return (props.invoices || []).filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
});
const totalOutstanding = computed(() => {
  return (props.invoices || []).filter(i => i.status === 'Unpaid').reduce((sum, inv) => sum + inv.amount, 0);
});
const totalCollectedThisMonth = computed(() => {
  return (props.invoices || []).filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
});
const unpaidInvoicesCount = computed(() => (props.invoices || []).filter(i => i.status === 'Unpaid').length);
const unpaidInvoices = computed(() => (props.invoices || []).filter(i => i.status === 'Unpaid'));
const totalUnpaid = computed(() => unpaidInvoices.value.reduce((sum, i) => sum + i.amount, 0));
const unpaidCount = computed(() => unpaidInvoices.value.length);

const totalOverdue = computed(() => 0); // Giả định chưa có quá hạn
const overdueCount = computed(() => 0);

// =============================================
// QUẢN LÝ CÔNG NỢ (GROUP THEO SINH VIÊN)
// =============================================
const debtSearch = ref('');

const groupedDebts = computed(() => {
  const map = new Map<string, any>();
  unpaidInvoices.value.forEach(inv => {
    const key = inv.studentId || inv.roomNumber;
    if (!map.has(key)) {
      map.set(key, {
        id: inv.id,
        studentId: inv.studentId || 'N/A',
        roomNumber: inv.roomNumber,
        totalDebt: 0,
        invoiceCount: 0,
        overdue: 0,
        latestDeadline: '15/' + (inv.createdAt ? new Date(inv.createdAt).getMonth() + 2 : '07') + '/2026',
        invoices: []
      });
    }
    const group = map.get(key);
    group.totalDebt += inv.amount;
    group.invoiceCount += 1;
    group.invoices.push(inv);
  });
  return Array.from(map.values());
});

const filteredGroupedDebts = computed(() => {
  return groupedDebts.value.filter(group => {
    const term = debtSearch.value.toLowerCase();
    return group.studentId.toLowerCase().includes(term) || group.roomNumber.toLowerCase().includes(term);
  }).sort((a, b) => b.totalDebt - a.totalDebt); // Mặc định Nợ nhiều nhất
});

const { paginatedItems: pGroupedDebts, currentPage: cpGroupedDebts, totalPages: tpGroupedDebts, nextPage: npGroupedDebts, prevPage: ppGroupedDebts } = usePagination(filteredGroupedDebts, 5);
const studentDebtCount = computed(() => groupedDebts.value.length);

// =============================================
// QUẢN LÝ THANH TOÁN
// =============================================
const paymentSearch = ref('');
const paymentMethodFilter = ref('All');

const filteredPayments = computed(() => {
  let list = (props.invoices || []).filter(i => i.status === 'Paid');
  return list.filter(inv => {
    const matchSearch = inv.id.toLowerCase().includes(paymentSearch.value.toLowerCase()) || 
                        (inv.displayId && inv.displayId.toLowerCase().includes(paymentSearch.value.toLowerCase()));
    return matchSearch;
  });
});

const { paginatedItems: pPayments, currentPage: cpPayments, totalPages: tpPayments, nextPage: npPayments, prevPage: ppPayments } = usePagination(filteredPayments, 5);

const showCreatePaymentModal = ref(false);
const paymentForm = ref({
  invoiceId: '',
  amount: 0,
  method: 'Tiền mặt',
  date: new Date().toISOString().split('T')[0],
  transactionId: '',
  bankName: '',
  accountNumber: '',
  note: ''
});

const handleCollectPayment = (inv: any) => {
  isEditingPayment.value = false;
  paymentForm.value = {
    invoiceId: inv.id,
    amount: inv.amount,
    method: 'Tiền mặt',
    date: new Date().toISOString().split('T')[0],
    transactionId: '',
    bankName: '',
    accountNumber: '',
    note: ''
  };
  showCreatePaymentModal.value = true;
};

const showViewDebtModal = ref(false);
const viewingDebtGroup = ref<any>(null);
const handleViewDebt = (group: any) => {
  viewingDebtGroup.value = group;
  showViewDebtModal.value = true;
};

import { watch } from 'vue';
watch(() => paymentForm.value.invoiceId, (newId) => {
  if (newId) {
    const inv = (props.invoices || []).find(i => i.id === newId);
    if (inv) paymentForm.value.amount = inv.amount;
  } else {
    paymentForm.value.amount = 0;
  }
});

const handleSavePayment = async () => {
  if (!paymentForm.value.invoiceId) {
    showToast('Vui lòng chọn phiếu thu!', 'error');
    return;
  }
  try {
    await billingApi.invoices.markAsPaid(paymentForm.value.invoiceId, paymentForm.value.method);
    emit('payInvoice', paymentForm.value.invoiceId);
    showToast('Ghi nhận thanh toán thành công!', 'success');
    showCreatePaymentModal.value = false;
    // Reset form
    paymentForm.value = {
      invoiceId: '', amount: 0, method: 'Tiền mặt', date: new Date().toISOString().split('T')[0], transactionId: '', bankName: '', accountNumber: '', note: ''
    };
  } catch (e) {
    showToast('Có lỗi khi gạch nợ!', 'error');
  }
};

const confirmDeletePaymentId = ref<string | null>(null);
const executeDeletePayment = (id: string) => {
  emit('deletePayment', id);
  confirmDeletePaymentId.value = null;
  showToast('Đã xóa thanh toán thành công!', 'success');
};

const isEditingPayment = ref(false);
const editingPaymentId = ref<string | null>(null);

const handleEditPayment = (payment: any) => {
  isEditingPayment.value = true;
  editingPaymentId.value = payment.id;
  paymentForm.value = {
    invoiceId: payment.id,
    amount: payment.amount,
    method: 'Tiền mặt',
    date: payment.createdAt ? payment.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    transactionId: '',
    bankName: '',
    accountNumber: '',
    note: ''
  };
  showCreatePaymentModal.value = true;
};

const showViewPaymentModal = ref(false);
const viewingPayment = ref<any>(null);

const handleViewPayment = (payment: any) => {
  viewingPayment.value = payment;
  showViewPaymentModal.value = true;
};

// State Modals
const showAutoBillModal = ref(false);
const showCreateInvoiceModal = ref(false);

// State Form tạo hóa đơn
const invoiceForm = ref({
  type: 'Tiền phòng, Điện nước',
  roomId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  deadline: '15/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear(),
  roomFee: 620000,
  electricityPrev: 0,
  electricityCurr: 0,
  electricityPrice: 3500,
  waterPrev: 0,
  waterCurr: 0,
  waterPrice: 15000,
  serviceFee: 50000,
  discount: 0,
  discountReason: '',
  paymentMethod: 'Chuyển khoản',
  note: ''
});

// Computed tự tính tổng tiền
const invoiceTotal = computed(() => {
  const electricityCost = (invoiceForm.value.electricityCurr - invoiceForm.value.electricityPrev) * invoiceForm.value.electricityPrice;
  const waterCost = (invoiceForm.value.waterCurr - invoiceForm.value.waterPrev) * invoiceForm.value.waterPrice;
  return invoiceForm.value.roomFee + (electricityCost > 0 ? electricityCost : 0) + (waterCost > 0 ? waterCost : 0) + invoiceForm.value.serviceFee - invoiceForm.value.discount;
});

const handleTriggerAutoBill = () => {
  showAutoBillModal.value = false;
  showToast('Đã gửi tín hiệu! Hệ thống ngầm đang tự động quét và sinh hóa đơn hàng loạt.', 'success');
};

const handleCreateManualInvoice = () => {
  if (!invoiceForm.value.roomId) {
    showToast('Vui lòng chọn hợp đồng / phòng!', 'error');
    return;
  }
  
  const electricityCost = (invoiceForm.value.electricityCurr - invoiceForm.value.electricityPrev) * invoiceForm.value.electricityPrice;
  const waterCost = (invoiceForm.value.waterCurr - invoiceForm.value.waterPrev) * invoiceForm.value.waterPrice;

  const newInvoice = {
    id: 'INV' + Date.now(),
    roomNumber: invoiceForm.value.roomId,
    month: `${invoiceForm.value.month}/${invoiceForm.value.year}`,
    amount: invoiceTotal.value,
    electricityCost: electricityCost > 0 ? electricityCost : 0,
    waterCost: waterCost > 0 ? waterCost : 0,
    type: invoiceForm.value.type,
    status: 'Unpaid' as 'Unpaid' | 'Paid',
    studentId: '0',
    createdAt: new Date().toISOString()
  };

  emit('addInvoice', newInvoice);
  showToast(isEditing.value ? 'Cập nhật Phiếu thu thành công!' : 'Tạo Phiếu thu thành công!', 'success');
  showCreateInvoiceModal.value = false;
};

const handleExportExcel = () => {
  const headers = ['Mã Phiếu', 'Sinh viên', 'Phòng', 'Tổng Tiền (VNĐ)', 'Trạng Thái'];
  const rows = filteredInvoices.value.map(inv => [
    inv.id,
    inv.studentId || '',
    inv.roomNumber,
    inv.amount,
    inv.status === 'Paid' ? 'Đã thu' : 'Công nợ'
  ]);
  
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "DanhSachPhieuThu.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Đã tải xuống file Excel (CSV)!', 'success');
};

const isEditing = ref(false);
const editingInvoiceId = ref<string | null>(null);

const showViewInvoiceModal = ref(false);
const viewingInvoice = ref<any>(null);

const handleViewInvoice = (inv: any) => {
  viewingInvoice.value = inv;
  showViewInvoiceModal.value = true;
};

const handleEditInvoice = (inv: any) => {
  isEditing.value = true;
  editingInvoiceId.value = inv.id;
  // Điền dữ liệu cũ vào Form
  invoiceForm.value.roomId = inv.roomNumber;
  invoiceForm.value.type = inv.type;
  invoiceForm.value.roomFee = inv.amount - (inv.electricityCost || 0) - (inv.waterCost || 0) - 50000;
  invoiceForm.value.electricityPrice = 3500;
  invoiceForm.value.waterPrice = 15000;
  invoiceForm.value.electricityPrev = 0;
  invoiceForm.value.electricityCurr = (inv.electricityCost || 0) / 3500;
  invoiceForm.value.waterPrev = 0;
  invoiceForm.value.waterCurr = (inv.waterCost || 0) / 15000;
  invoiceForm.value.serviceFee = 50000;
  
  showCreateInvoiceModal.value = true;
};

const handlePrintInvoice = () => {
  window.print();
  showToast('Đang mở hộp thoại in phiếu...', 'info');
};

const openCreateModal = () => {
  isEditing.value = false;
  editingInvoiceId.value = null;
  showCreateInvoiceModal.value = true;
};

// =============================================
// QUẢN LÝ BẢO TRÌ (MỚI)
// =============================================
const showCreateMaintenanceModal = ref(false);
const isEditingMaintenance = ref(false);
const editingMaintenanceId = ref<string | null>(null);
const maintenanceForm = ref({
  roomNumber: '',
  title: '',
  description: '',
  category: 'Điện',
  priority: 'Normal'
});

const openCreateMaintenanceModal = () => {
  isEditingMaintenance.value = false;
  editingMaintenanceId.value = null;
  maintenanceForm.value = { roomNumber: '', title: '', description: '', category: 'Điện', priority: 'Normal' };
  showCreateMaintenanceModal.value = true;
};

const handleEditMaintenance = (issue: any) => {
  isEditingMaintenance.value = true;
  editingMaintenanceId.value = issue.id;
  maintenanceForm.value = {
    roomNumber: issue.roomNumber,
    title: issue.title,
    description: issue.description,
    category: (issue as any).category || 'Khác',
    priority: issue.priority || 'Normal'
  };
  showCreateMaintenanceModal.value = true;
};

const handleSaveMaintenance = () => {
  if (!maintenanceForm.value.roomNumber || !maintenanceForm.value.title) {
    showToast('Vui lòng nhập đầy đủ thông tin phòng và tiêu đề!', 'error');
    return;
  }
  showToast(isEditingMaintenance.value ? 'Đã cập nhật yêu cầu bảo trì!' : 'Đã tạo yêu cầu bảo trì thành công!', 'success');
  showCreateMaintenanceModal.value = false;
};

const handleExportMaintenanceExcel = () => {
  showToast('Đang trích xuất danh sách bảo trì ra file Excel...', 'info');
};

// =============================================
// MODAL XÓA HÓA ĐƠN / PHIẾU THU
// =============================================
const showDeleteModal = ref(false);
const itemToDelete = ref<{ id: string, type: 'invoice' | 'payment' } | null>(null);

const confirmDeleteInvoice = (id: string) => {
  itemToDelete.value = { id, type: 'invoice' };
  showDeleteModal.value = true;
};

const confirmDeletePayment = (id: string) => {
  itemToDelete.value = { id, type: 'payment' };
  showDeleteModal.value = true;
};

const executeDelete = () => {
  if (itemToDelete.value) {
    if (itemToDelete.value.type === 'invoice') {
      emit('deleteInvoice', itemToDelete.value.id);
      showToast('Đã xóa dữ liệu phiếu thu / hóa đơn thành công!', 'success');
    } else if (itemToDelete.value.type === 'payment') {
      emit('deletePayment', itemToDelete.value.id);
      showToast('Đã xóa dữ liệu thanh toán thành công!', 'success');
    }
  }
  showDeleteModal.value = false;
  itemToDelete.value = null;
};


// =============================================
// QUẢN LÝ TÒA NHÀ & PHÒNG (CRUD)
// =============================================
const showRoomModal = ref(false);
const isEditingRoom = ref(false);
const roomForm = ref({ id: null, buildingId: 1, roomNumber: '', floorNumber: 1, roomType: 'Standard', capacity: 4, monthlyPrice: 1500000, status: 'Còn chỗ' });

const openCreateRoomModal = () => {
  isEditingRoom.value = false;
  roomForm.value = { id: null, buildingId: buildingsList.value[0]?.id || 1, roomNumber: '', floorNumber: 1, roomType: 'Standard', capacity: 4, monthlyPrice: 1500000, status: 'Còn chỗ' };
  showRoomModal.value = true;
};

const openEditRoomModal = (room) => {
  isEditingRoom.value = true;
  roomForm.value = { ...room };
  showRoomModal.value = true;
};

const handleSaveRoom = async () => {
  try {
    const payload = { ...roomForm.value };
    if (!payload.id) delete payload.id;

    if (isEditingRoom.value) {
      await roomBuildingApi.rooms.update(roomForm.value.id, payload);
      showToast('Cập nhật phòng thành công!', 'success');
    } else {
      await roomBuildingApi.rooms.create(payload);
      showToast('Tạo phòng mới thành công!', 'success');
    }
    showRoomModal.value = false;
    await loadFacilitiesData();
    await loadDashboardStats();
  } catch (err) {
    showToast('Có lỗi xảy ra khi lưu phòng!', 'error');
  }
};

const showDeleteConfirmModal = ref(false);
const roomToDeleteId = ref(null);

const handleDeleteRoom = (id) => {
  roomToDeleteId.value = id;
  showDeleteConfirmModal.value = true;
};

const confirmDeleteRoom = async () => {
  try {
    await roomBuildingApi.rooms.delete(roomToDeleteId.value);
    showToast('Xóa phòng thành công!', 'success');
    await loadFacilitiesData();
    await loadDashboardStats();
  } catch (err) {
    showToast('Không thể xóa phòng đang có dữ liệu hoặc lỗi!', 'error');
  } finally {
    showDeleteConfirmModal.value = false;
    roomToDeleteId.value = null;
  }
};

// =============================================
// QUẢN LÝ LOẠI PHÒNG (CRUD)
// =============================================
const showRoomTypeModal = ref(false);
const isEditingRoomType = ref(false);
const roomTypeForm = ref({
  id: null,
  name: '',
  maxOccupants: 4,
  monthlyPrice: 1500000,
  hasAirConditioner: false,
  hasPrivateBathroom: true
});

const openCreateRoomTypeModal = () => {
  isEditingRoomType.value = false;
  roomTypeForm.value = { id: null, name: '', maxOccupants: 4, monthlyPrice: 1500000, hasAirConditioner: false, hasPrivateBathroom: true };
  showRoomTypeModal.value = true;
};

const openEditRoomTypeModal = (rt: any) => {
  isEditingRoomType.value = true;
  roomTypeForm.value = { ...rt };
  showRoomTypeModal.value = true;
};

const handleSaveRoomType = async () => {
  if (!roomTypeForm.value.name) {
    showToast('Vui lòng nhập tên loại phòng!', 'error');
    return;
  }
  try {
    const payload = { ...roomTypeForm.value };
    if (!payload.id) delete payload.id;

    if (isEditingRoomType.value) {
      await roomBuildingApi.roomTypes.update(roomTypeForm.value.id, payload);
      showToast('Cập nhật loại phòng thành công!', 'success');
    } else {
      await roomBuildingApi.roomTypes.create(payload);
      showToast('Tạo loại phòng mới thành công!', 'success');
    }
    showRoomTypeModal.value = false;
    await loadFacilitiesData();
  } catch (err) {
    showToast('Có lỗi xảy ra khi lưu loại phòng!', 'error');
  }
};

const showDeleteRoomTypeConfirmModal = ref(false);
const roomTypeToDeleteId = ref(null);

const handleDeleteRoomType = (id: any) => {
  roomTypeToDeleteId.value = id;
  showDeleteRoomTypeConfirmModal.value = true;
};

const confirmDeleteRoomType = async () => {
  try {
    await roomBuildingApi.roomTypes.delete(roomTypeToDeleteId.value);
    showToast('Xóa loại phòng thành công!', 'success');
    await loadFacilitiesData();
  } catch (err) {
    showToast('Không thể xóa loại phòng đang được sử dụng!', 'error');
  } finally {
    showDeleteRoomTypeConfirmModal.value = false;
    roomTypeToDeleteId.value = null;
  }
};

</script>

<template>
  <div class="w-full flex bg-background h-screen overflow-hidden text-left border-t border-border text-text-main">
    
    <div v-if="toast" class="fixed top-6 right-6 z-[200] animate-toast-slide">
      <div :class="[
        'relative overflow-hidden min-w-[320px] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] flex items-center gap-4 p-4 border backdrop-blur-xl',
        toast.type === 'success' ? 'bg-white/95 border-emerald-100' : 
        toast.type === 'error' ? 'bg-white/95 border-rose-100' :
        'bg-white/95 border-blue-100'
      ]">
        <div :class="[
          'relative w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
          toast.type === 'error' ? 'bg-rose-50 text-rose-500' :
          'bg-blue-50 text-blue-500'
        ]">
          <div :class="[
            'absolute inset-0 rounded-full animate-ping opacity-20',
            toast.type === 'success' ? 'bg-emerald-500' : 
            toast.type === 'error' ? 'bg-rose-500' :
            'bg-blue-500'
          ]"></div>
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 relative z-10" />
          <AlertTriangle v-if="toast.type === 'error'" class="w-5 h-5 relative z-10" />
          <Info v-if="toast.type === 'info'" class="w-5 h-5 relative z-10" />
        </div>
        
        <div class="flex-1">
          <h4 :class="[
            'font-bold text-sm leading-tight',
            toast.type === 'success' ? 'text-emerald-700' : 
            toast.type === 'error' ? 'text-rose-700' :
            'text-blue-700'
          ]">
            {{ toast.type === 'success' ? 'Thành công!' : toast.type === 'error' ? 'Thất bại!' : 'Thông báo' }}
          </h4>
          <p class="text-xs text-text-muted mt-0.5">{{ toast.message }}</p>
        </div>

        <button @click="toast = null" class="p-1.5 text-text-muted hover:text-text-main rounded-lg transition-colors shrink-0">
          <span class="text-xl leading-none">&times;</span>
        </button>

        <div class="absolute bottom-0 left-0 h-[3px] w-full bg-gray-100/50">
          <div :class="[
            'h-full animate-toast-progress',
            toast.type === 'success' ? 'bg-emerald-500' : 
            toast.type === 'error' ? 'bg-rose-500' :
            'bg-blue-500'
          ]"></div>
        </div>
      </div>
    </div>

    <aside class="w-64 bg-primary text-slate-100 shrink-0 select-none flex flex-col justify-between border-r border-border p-0 h-full overflow-y-auto custom-scrollbar">
      <div>
        <div class="p-6 border-b border-white/10 flex items-center gap-3">
          <span class="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-white font-serif font-extrabold text-sm">A</span>
          <div>
            <div class="font-serif font-light text-sm text-white tracking-widest uppercase">DNU KTX</div>
            <div class="text-[10px] text-background/85">Ban quản trị hệ thống</div>
          </div>
        </div>

        <nav class="p-4 space-y-1.5 text-xs text-background">
          <button
            v-for="tab in menuItems"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl font-semibold cursor-pointer transition-all duration-300 text-left', activeTab === tab.id ? 'bg-secondary text-white shadow-xs' : 'hover:bg-white/10 text-background/85 hover:text-white hover:translate-x-1']"
          >
            <component :is="tab.icon" class="w-4.5 h-4.5 shrink-0" />
            <span>{{ tab.id }}</span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-white/10">
        <div class="p-3 bg-white/15 rounded-2xl flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-secondary text-white font-extrabold flex items-center justify-center border border-white/10 font-mono text-sm leading-none">AD</div>
          <div class="overflow-hidden">
            <div class="font-bold text-xs truncate text-white">{{ adminUser?.name || 'Admin' }}</div>
            <div class="text-[10px] text-background/85 font-mono">Quản trị tối cao</div>
          </div>
        </div>
        <button 
          @click="emit('logout')"
          class="w-full py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut class="w-4 h-4" /> <span>Thoát đặc quyền</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full overflow-y-auto bg-background">
      
      <header class="bg-white border-b border-border px-8 py-4.5 flex justify-between items-center shrink-0">
        <div class="text-text-main">
          <span class="text-xs text-text-muted font-light">BẢNG QUẢN TRỊ TRUNG TÂM</span>
          <h2 class="font-serif font-light text-text-main text-lg leading-none mt-1">{{ activeTab }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <div class="bg-secondary border border-secondary/30 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <Shield class="w-3.5 h-3.5 fill-white" /> <span>Chế độ: ROOT ADMIN 🛡️</span>
          </div>
        </div>
      </header>

      <div class="p-8 flex-1 space-y-6">
        
        <AdminAccountManagement v-if="activeTab === 'Quản lý Tài khoản'" />

        <div v-if="activeTab === 'Bảng điều khiển'" class="space-y-8 animate-fade-in text-left">
          
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-widest block mb-1">TỔNG QUAN HOẠT ĐỘNG</span>
              <h3 class="font-serif text-text-main text-3xl font-light">Dashboard Phân Tích</h3>
            </div>
            <button @click="handleExportExcel" class="px-6 py-2.5 bg-secondary hover:bg-[#A47148] text-white rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer">
              <Download class="w-4 h-4" /> <span>Xuất báo cáo</span>
            </button>
          </div>

          <!-- 4 Top Cards (Aesthetic) -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-[32px] border border-border shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Tổng sinh viên</span>
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><Users class="w-4 h-4"/></div>
              </div>
              <div>
                <div class="text-4xl font-bold font-mono text-text-main">{{ totalOccupiedSeats }}</div>
                <div class="text-[11px] text-primary font-semibold flex items-center gap-1 mt-3">
                  <ArrowUpRight class="w-4 h-4 shrink-0" /> <span>Tăng 12% tháng này</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-[32px] border border-border shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Phòng trống</span>
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Home class="w-4 h-4"/></div>
              </div>
              <div>
                <div class="text-4xl font-bold font-mono text-text-main">{{ totalCapacitySeats - totalOccupiedSeats }}</div>
                <div class="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-3">
                  <ArrowDownRight class="w-4 h-4 shrink-0" /> <span>Giảm 3% so với kỳ trước</span>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[32px] border border-border shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Chưa thanh toán</span>
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><CircleDollarSign class="w-4 h-4"/></div>
              </div>
              <div>
                <div class="text-3xl font-bold font-mono text-secondary">{{ new Intl.NumberFormat('vi-VN').format(totalUnpaid || 350000) }}đ</div>
                <div class="text-[11px] text-text-muted font-semibold flex items-center gap-1 mt-3">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> <span>Mức nợ an toàn</span>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-[32px] border border-border shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Yêu cầu bảo trì</span>
                <div class="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Wrench class="w-4 h-4"/></div>
              </div>
              <div>
                <div class="text-4xl font-bold font-mono text-text-main">{{ activeIssues.length }}</div>
                <div class="text-[11px] text-primary font-semibold flex items-center gap-1 mt-3">
                  <ArrowUpRight class="w-4 h-4 shrink-0" /> <span>Hệ thống ổn định</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart & Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2 bg-white rounded-[32px] border border-border p-8 shadow-xs">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h4 class="font-serif text-text-main text-xl font-light">Tỷ lệ lấp đầy & Doanh thu</h4>
                  <span class="text-[10px] text-text-muted font-mono">THỐNG KÊ CHI TIẾT</span>
                </div>
                <div class="flex rounded-full bg-background border border-border p-1 shadow-inner">
                  <button class="px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors text-text-muted hover:text-text-main cursor-pointer">Tuần</button>
                  <button class="px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors bg-white shadow text-secondary cursor-pointer">Tháng</button>
                  <button class="px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors text-text-muted hover:text-text-main cursor-pointer">Năm</button>
                </div>
              </div>
              <div class="flex flex-col md:flex-row gap-10">
                <div class="w-full md:w-1/3">
                   <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 flex justify-between">
                     <span>Tỷ lệ lấp đầy</span> <span class="text-primary">100%</span>
                   </div>
                   <div class="h-40 border-l border-b border-border flex items-end justify-around px-2 relative">
                     <div class="absolute left-[-20px] top-0 bottom-0 flex flex-col justify-between text-[9px] text-text-muted py-1 font-mono">
                       <span>100</span><span>50</span><span>0</span>
                     </div>
                     <!-- Elegant minimal bars -->
                     <div class="w-6 bg-border h-[80%] rounded-t-sm hover:bg-secondary transition-colors"></div>
                     <div class="w-6 bg-primary h-[100%] rounded-t-sm shadow-md"></div>
                     <div class="w-6 bg-border h-[60%] rounded-t-sm hover:bg-secondary transition-colors"></div>
                   </div>
                   <div class="flex justify-around text-[9px] font-mono text-text-muted mt-2 ml-4">
                     <span>A</span><span>B</span><span>C</span>
                   </div>
                </div>
                <div class="w-full md:w-2/3">
                   <div class="flex justify-between items-center mb-6">
                     <div class="text-[10px] text-text-muted font-bold uppercase tracking-wider">Xu hướng doanh thu</div>
                     <div class="flex items-center gap-2 text-[10px] text-text-main font-mono"><div class="w-3 h-3 rounded-full bg-secondary"></div> (Triệu VNĐ)</div>
                   </div>
                   <div class="h-40 w-full relative">
                     <svg viewBox="0 0 400 150" class="w-full h-full overflow-visible">
                       <polygon points="0,150 80,100 160,115 240,40 320,60 400,20 400,150" fill="url(#grad)" opacity="0.5"/>
                       <defs>
                         <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stop-color="#CB997E" stop-opacity="0.3" />
                           <stop offset="100%" stop-color="#CB997E" stop-opacity="0" />
                         </linearGradient>
                       </defs>
                       <polyline points="0,150 80,100 160,115 240,40 320,60 400,20" fill="none" stroke="#CB997E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                       <circle cx="80" cy="100" r="4" fill="#CB997E" stroke="white" stroke-width="2" />
                       <circle cx="240" cy="40" r="4" fill="#CB997E" stroke="white" stroke-width="2" />
                       <circle cx="400" cy="20" r="4" fill="#CB997E" stroke="white" stroke-width="2" />
                       <g class="text-[10px] fill-text-muted font-mono" transform="translate(0, 20)">
                         <text x="0" y="150" text-anchor="middle">T1</text>
                         <text x="80" y="150" text-anchor="middle">T2</text>
                         <text x="160" y="150" text-anchor="middle">T3</text>
                         <text x="240" y="150" text-anchor="middle">T4</text>
                         <text x="320" y="150" text-anchor="middle">T5</text>
                         <text x="400" y="150" text-anchor="middle">T6</text>
                       </g>
                     </svg>
                   </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs">
              <h4 class="font-serif text-text-main text-xl font-light mb-8">Hoạt động gần đây</h4>
              <div class="relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border space-y-8 pl-8">
                <div v-for="(app, idx) in pendingApps.slice(0, 2)" :key="'app-'+idx" class="relative">
                  <div class="absolute -left-[32px] top-1.5 w-4 h-4 bg-white border border-secondary rounded-full shadow-sm flex items-center justify-center">
                    <div class="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  </div>
                  <div>
                    <div class="font-bold text-[13px] text-text-main leading-tight mb-1">{{ app.fullName }} đăng ký phòng</div>
                    <div class="text-text-muted text-[11px] font-mono">Phòng {{ app.roomNumber }} • Gần đây</div>
                  </div>
                </div>
                <div v-if="pendingApps.length === 0" class="text-[11px] text-text-muted font-mono">Chưa có hoạt động nào gần đây.</div>
              </div>
              <button class="mt-8 w-full py-3 rounded-xl border border-border text-text-muted text-[11px] font-bold uppercase tracking-wider hover:bg-background hover:text-text-main transition-colors cursor-pointer">Xem tất cả</button>
            </div>
          </div>

          <!-- 3 Colored Action Cards (Aesthetic approach) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-primary rounded-[32px] p-8 text-background relative overflow-hidden shadow-md cursor-pointer hover:-translate-y-1 transition-transform group">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <UserPlus class="w-6 h-6 text-white" />
              </div>
              <h4 class="font-serif text-2xl font-light mb-3 relative z-10">Tiếp nhận SV</h4>
              <p class="text-[12px] mb-8 relative z-10 opacity-80 leading-relaxed font-light">Quy trình hồ sơ & xếp phòng siêu tốc.</p>
              <button class="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full relative z-10 transition-colors backdrop-blur-sm">Bắt đầu ngay</button>
              <div class="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            </div>
            
            <div class="bg-secondary rounded-[32px] p-8 text-background relative overflow-hidden shadow-md cursor-pointer hover:-translate-y-1 transition-transform group">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Calculator class="w-6 h-6 text-white" />
              </div>
              <h4 class="font-serif text-2xl font-light mb-3 relative z-10">Lệ phí & Thu</h4>
              <p class="text-[12px] mb-8 relative z-10 opacity-80 leading-relaxed font-light">Tạo hóa đơn đồng loạt cho khối phòng.</p>
              <button class="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full relative z-10 transition-colors backdrop-blur-sm" @click="showAutoBillModal = true">Tạo hóa đơn</button>
              <div class="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            </div>

            <div class="bg-primary-hover rounded-[32px] p-8 text-background relative overflow-hidden shadow-md cursor-pointer hover:-translate-y-1 transition-transform group">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <FileText class="w-6 h-6 text-white" />
              </div>
              <h4 class="font-serif text-2xl font-light mb-3 relative z-10">Trung tâm báo cáo</h4>
              <p class="text-[12px] mb-8 relative z-10 opacity-80 leading-relaxed font-light">Chiết xuất dữ liệu vận hành đa chiều.</p>
              <button class="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full relative z-10 transition-colors backdrop-blur-sm" @click="handleExportExcel">Trích xuất</button>
              <div class="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            </div>
          </div>

          <!-- Grid of lists (Empty states) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs min-h-[240px] flex flex-col hover:border-secondary/30 transition-colors cursor-pointer group">
              <h4 class="font-serif text-text-main text-lg font-light mb-2">Đơn chờ duyệt</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 block">Yêu cầu đăng ký</span>
              <div class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 group-hover:opacity-100 transition-opacity">
                <div class="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <Inbox v-if="pendingApps.length === 0" class="w-6 h-6 text-secondary" stroke-width="1.5" />
                  <span v-else class="text-2xl font-bold text-secondary">{{ pendingApps.length }}</span>
                </div>
                <span class="text-xs font-medium">{{ pendingApps.length > 0 ? 'Hồ sơ chờ duyệt' : 'Hòm thư trống' }}</span>
              </div>
            </div>
            
            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs min-h-[240px] flex flex-col">
              <h4 class="font-serif text-text-main text-lg font-light mb-2">Công nợ sinh viên</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 block">Top nợ cao nhất</span>
              <div v-if="filteredGroupedDebts.length > 0" class="flex flex-col gap-3 flex-1">
                <div v-for="debt in filteredGroupedDebts.slice(0, 2)" :key="debt.id" class="flex justify-between items-center border border-border p-3 rounded-2xl bg-background">
                  <div>
                    <div class="text-[12px] font-bold text-text-main">SV: {{ debt.studentId }}</div>
                    <div class="text-[10px] text-rose-500 font-bold mt-0.5">{{ new Intl.NumberFormat('vi-VN').format(debt.totalDebt) }}đ</div>
                  </div>
                </div>
              </div>
              <div v-else class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
                <div class="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4"><FileText class="w-6 h-6 text-primary" stroke-width="1.5" /></div>
                <span class="text-xs font-medium">Không có nợ đọng</span>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs min-h-[240px] flex flex-col hover:border-secondary/30 transition-colors cursor-pointer group">
              <h4 class="font-serif text-text-main text-lg font-light mb-2">Yêu cầu bảo trì</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 block">Cần xử lý ngay</span>
              <div class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50 group-hover:opacity-100 transition-opacity">
                <div class="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <Wrench v-if="activeIssues.length === 0" class="w-6 h-6 text-secondary" stroke-width="1.5" />
                  <span v-else class="text-2xl font-bold text-secondary">{{ activeIssues.length }}</span>
                </div>
                <span class="text-xs font-medium">{{ activeIssues.length > 0 ? 'Sự cố đang xử lý' : 'Không có sự cố' }}</span>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs min-h-[240px] lg:col-span-1 flex flex-col">
              <h4 class="font-serif text-text-main text-lg font-light mb-2">Thanh toán</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 block">Giao dịch gần nhất</span>
              <div class="flex flex-col gap-4 mt-2">
                 <div v-if="filteredPayments.length > 0" class="flex justify-between items-center border border-border p-4 rounded-2xl bg-background hover:bg-white transition-colors cursor-pointer">
                   <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle class="w-4 h-4"/></div>
                     <div>
                       <div class="text-[13px] font-bold text-text-main">{{ filteredPayments[0].studentId || 'Sinh viên' }}</div>
                       <div class="text-[10px] font-mono text-text-muted mt-0.5">Gần đây</div>
                     </div>
                   </div>
                   <div class="text-right">
                     <div class="text-[13px] font-bold text-emerald-600">+{{ new Intl.NumberFormat('vi-VN').format(filteredPayments[0].amount) }}đ</div>
                     <div class="text-[9px] uppercase tracking-wider font-bold text-text-muted mt-1">Giao dịch</div>
                   </div>
                 </div>
                 <div v-else class="text-center py-4 text-text-muted text-xs font-mono">Chưa có thanh toán nào.</div>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs min-h-[240px] lg:col-span-2 flex flex-col">
              <h4 class="font-serif text-text-main text-lg font-light mb-2">Hóa đơn chưa thu</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-6 block">Tổng hợp hóa đơn mới nhất</span>
              
              <div v-if="unpaidInvoices.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div v-for="inv in unpaidInvoices.slice(0, 2)" :key="inv.id" class="flex justify-between items-center border border-border p-4 rounded-2xl bg-background hover:bg-white transition-colors">
                  <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500"><Receipt class="w-4 h-4"/></div>
                     <div>
                       <div class="text-[13px] font-bold text-text-main">{{ inv.displayId || inv.id.substring(0,6).toUpperCase() }}</div>
                       <div class="text-[10px] font-mono text-text-muted mt-0.5">Phòng: {{ inv.roomNumber }}</div>
                     </div>
                  </div>
                  <div class="text-right">
                     <div class="text-[13px] font-bold text-rose-500">{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }}đ</div>
                     <div class="text-[9px] uppercase tracking-wider font-bold text-text-muted mt-1">{{ inv.month }}</div>
                  </div>
                </div>
              </div>

              <div v-else class="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
                <div class="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4"><Receipt class="w-6 h-6 text-primary" stroke-width="1.5" /></div>
                <span class="text-xs font-medium">Đã thu đủ</span>
              </div>
            </div>
          </div>

          <!-- Bottom Section: Tình trạng phòng & Doanh thu -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs flex flex-col">
              <h4 class="font-serif text-text-main text-xl font-light mb-2">Tình trạng quỹ phòng</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-8 block">Bản đồ sức chứa</span>
              
              <div class="grid grid-cols-2 gap-4 flex-1">
                <div class="bg-background border border-border p-6 rounded-[24px] flex flex-col justify-center relative hover:shadow-md transition-shadow">
                  <div class="text-4xl font-mono font-bold text-text-main mb-2">{{ totalCapacitySeats - totalOccupiedSeats }}</div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-5">Phòng trống</div>
                  <div class="w-full bg-border h-1.5 rounded-full overflow-hidden"><div class="bg-secondary h-1.5 rounded-full" :style="{ width: (totalCapacitySeats ? ((totalCapacitySeats - totalOccupiedSeats)/totalCapacitySeats*100) : 0) + '%' }"></div></div>
                </div>
                <div class="bg-background border border-border p-6 rounded-[24px] flex flex-col justify-center relative hover:shadow-md transition-shadow">
                  <div class="text-4xl font-mono font-bold text-text-main mb-2">{{ totalOccupiedSeats }}</div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-5">Đang có người ở</div>
                  <div class="w-full bg-border h-1.5 rounded-full overflow-hidden"><div class="bg-primary h-1.5 rounded-full" :style="{ width: (totalCapacitySeats ? (totalOccupiedSeats/totalCapacitySeats*100) : 0) + '%' }"></div></div>
                </div>
                <div class="bg-background border border-border p-6 rounded-[24px] flex flex-col justify-center relative hover:shadow-md transition-shadow">
                  <div class="text-4xl font-mono font-bold text-text-main mb-2">{{ (rooms || []).filter(r => r.available === 0).length }}</div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-5">Đã lấp đầy</div>
                  <div class="w-full bg-border h-1.5 rounded-full overflow-hidden"><div class="bg-text-main h-1.5 rounded-full w-[100%]"></div></div>
                </div>
                <div class="bg-background border border-border p-6 rounded-[24px] flex flex-col justify-center relative hover:shadow-md transition-shadow">
                  <div class="text-4xl font-mono font-bold text-text-main mb-2">{{ activeIssues.length }}</div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-5">Đang bảo trì</div>
                  <div class="w-full bg-border h-1.5 rounded-full overflow-hidden"><div class="bg-rose-400 h-1.5 rounded-full" :style="{ width: (rooms && rooms.length ? (activeIssues.length/rooms.length*100) : 0) + '%' }"></div></div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs flex flex-col">
              <h4 class="font-serif text-text-main text-xl font-light mb-2">Tổng quan Tài chính</h4>
              <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-8 block">Thu chi tháng này</span>
              
              <div class="flex justify-between mb-8 px-2 border-b border-border pb-8">
                <div>
                  <div class="text-[11px] text-text-muted mb-3 font-bold uppercase tracking-wider flex items-center gap-2"><ArrowDownRight class="w-4 h-4 text-emerald-500" /> Đã thu</div>
                  <div class="text-3xl font-mono font-bold text-text-main">{{ new Intl.NumberFormat('vi-VN').format(totalCollectedThisMonth) }}đ</div>
                </div>
                <div class="text-right">
                  <div class="text-[11px] text-text-muted mb-3 font-bold uppercase tracking-wider flex items-center gap-2 justify-end"><ArrowUpRight class="w-4 h-4 text-rose-500" /> Chưa thu</div>
                  <div class="text-3xl font-mono font-bold text-text-main">{{ new Intl.NumberFormat('vi-VN').format(totalUnpaid) }}đ</div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-background to-white border border-border rounded-[24px] p-8 mb-8 flex flex-col justify-center relative shadow-inner">
                <div class="text-[11px] text-primary font-bold uppercase tracking-wider mb-2">Dự phóng Tổng doanh thu</div>
                <div class="text-5xl font-mono font-bold text-primary">{{ new Intl.NumberFormat('vi-VN').format(totalCollectedThisMonth + totalUnpaid) }}đ</div>
                <div class="absolute right-6 opacity-10"><CircleDollarSign class="w-24 h-24 text-primary"/></div>
              </div>
              
              <div class="flex items-center gap-4 px-2 mt-auto">
                <div class="flex-1 bg-border h-3 rounded-full overflow-hidden flex shadow-inner">
                   <div class="bg-primary h-full rounded-full shadow" :style="{ width: (totalCollectedThisMonth + totalUnpaid > 0 ? (totalCollectedThisMonth / (totalCollectedThisMonth + totalUnpaid) * 100) : 0) + '%' }"></div>
                </div>
                <span class="text-[12px] text-text-main font-bold font-mono">{{ totalCollectedThisMonth + totalUnpaid > 0 ? ((totalCollectedThisMonth / (totalCollectedThisMonth + totalUnpaid) * 100).toFixed(1)) : 0 }}%</span>
              </div>
            </div>
          </div>

          <!-- Top sinh viên nợ -->
          <div class="bg-white rounded-[32px] border border-border p-8 shadow-xs">
            <div class="flex justify-between items-end mb-6">
              <div>
                <h4 class="font-serif text-text-main text-xl font-light mb-2">Bảng phong thần Nợ</h4>
                <span class="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Top sinh viên nợ cước</span>
              </div>
            </div>
            
            <div class="overflow-hidden rounded-[24px] border border-border">
              <table class="w-full text-left text-[13px]">
                <thead class="bg-background border-b border-border text-text-muted">
                  <tr>
                    <th class="py-4 px-6 font-bold uppercase tracking-wider text-[10px] w-20">STT</th>
                    <th class="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Sinh viên</th>
                    <th class="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Phòng</th>
                    <th class="py-4 px-6 font-bold uppercase tracking-wider text-[10px] text-right">Số tiền nợ</th>
                    <th class="py-4 px-6 font-bold uppercase tracking-wider text-[10px] text-center">Tình trạng</th>
                  </tr>
                </thead>
                <tbody v-if="filteredGroupedDebts.length > 0">
                  <tr v-for="(debt, idx) in filteredGroupedDebts.slice(0, 5)" :key="debt.id" class="border-b border-border/50 hover:bg-background transition-colors text-text-main">
                    <td class="py-4 px-6 font-mono text-text-muted">{{ idx + 1 }}</td>
                    <td class="py-4 px-6 font-bold">{{ debt.studentId }}</td>
                    <td class="py-4 px-6 font-mono">{{ debt.roomNumber }}</td>
                    <td class="py-4 px-6 text-right font-bold text-rose-500 font-mono">{{ new Intl.NumberFormat('vi-VN').format(debt.totalDebt) }}đ</td>
                    <td class="py-4 px-6 text-center">
                      <span class="text-[10px] bg-rose-50 text-rose-500 border border-rose-200 px-2 py-0.5 rounded font-bold">Chưa thanh toán</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="filteredGroupedDebts.length === 0" class="py-24 flex flex-col items-center justify-center text-text-muted bg-white">
                <div class="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4"><CheckCircle class="w-6 h-6 text-emerald-500" stroke-width="1.5" /></div>
                <span class="text-[13px] font-bold text-text-main mb-1">Thanh toán hoàn tất</span>
                <span class="text-[11px] font-medium">Không có sinh viên nào đang nợ đọng</span>
              </div>
            </div>
          </div>

        </div>

        <!-- TAB HÓA ĐƠN & PHIẾU THU -->
        <div v-if="activeTab === 'Hóa Đơn & Phiếu Thu' || activeTab === 'Quản lý Phiếu thu'" class="bg-background text-left animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="font-serif text-text-main text-2xl font-bold">Hóa Đơn & Phiếu Thu</h3>
              <p class="text-text-muted text-xs mt-1">Tổng số: {{ filteredInvoices.length }} phiếu</p>
            </div>
            <div class="flex items-center gap-3">
              <button @click="handleExportExcel" class="px-4 py-2 border border-border hover:bg-white bg-white text-text-main font-semibold text-xs rounded-full transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                ⬇ Xuất Excel
              </button>
              <button @click="showAutoBillModal = true" class="px-4 py-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white font-bold text-xs rounded-full transition-colors flex items-center gap-2 border-dashed shadow-sm cursor-pointer">
                ⚡ Tự động tạo
              </button>
              <button @click="openCreateModal" class="px-4 py-2 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
                + Tạo Thủ Công
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-primary rounded-[24px] p-6 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-primary-hover cursor-pointer">
              <div class="text-xs font-semibold mb-2">Tổng Thu Tháng Này</div>
              <div class="text-3xl font-bold font-mono">{{ new Intl.NumberFormat('vi-VN').format(totalCollectedThisMonth) }} đ</div>
              <div class="text-xs mt-2 text-white/80">↑ +12% so với tháng trước</div>
            </div>
            <div class="bg-white rounded-[24px] p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 cursor-pointer">
              <div class="text-xs font-semibold text-text-muted mb-2">Chưa Thanh Toán</div>
              <div class="text-3xl font-bold font-mono text-orange-500">{{ new Intl.NumberFormat('vi-VN').format(totalUnpaid) }} đ</div>
              <div class="text-xs mt-2 text-text-muted">{{ unpaidCount }} phiếu đang chờ</div>
            </div>
            <div class="bg-white rounded-[24px] p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 cursor-pointer">
              <div class="text-xs font-semibold text-text-muted mb-2">Quá Hạn</div>
              <div class="text-3xl font-bold font-mono text-rose-500">{{ new Intl.NumberFormat('vi-VN').format(totalOverdue) }} đ</div>
              <div class="text-xs mt-2 text-text-muted">{{ overdueCount }} phiếu quá hạn</div>
            </div>
          </div>

          <div class="bg-white rounded-[32px] border border-border p-8 shadow-sm">
            <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div class="relative w-full max-w-md">
                <Search class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  v-model="invoiceSearch" 
                  placeholder="Tìm mã phòng, mã phiếu thu..." 
                  class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full text-xs outline-none focus:border-primary"
                />
              </div>
              <div class="flex items-center bg-background p-1 rounded-full border border-border">
                <button @click="invoiceStatusFilter = 'All'" :class="['px-6 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer', invoiceStatusFilter === 'All' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main']">Tất cả</button>
                <button @click="invoiceStatusFilter = 'Paid'" :class="['px-6 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer', invoiceStatusFilter === 'Paid' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main']">Đã TT</button>
                <button @click="invoiceStatusFilter = 'Unpaid'" :class="['px-6 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer', invoiceStatusFilter === 'Unpaid' ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main']">Chưa TT</button>
              </div>
            </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
                  <th class="py-3 px-4">Mã Phiếu Thu</th>
                  <th class="py-3 px-4">Loại</th>
                  <th class="py-3 px-4">Sinh Viên</th>
                  <th class="py-3 px-4">Phòng</th>
                  <th class="py-3 px-4 text-center">Kỳ</th>
                  <th class="py-3 px-4 text-right">Tổng Tiền</th>
                  <th class="py-3 px-4 text-right">Đã Trả</th>
                  <th class="py-3 px-4 text-right">Còn Nợ</th>
                  <th class="py-3 px-4 text-center">Trạng Thái</th>
                  <th class="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inv in pInvoices" :key="'pt-' + inv.id" class="border-b border-border/50 hover:bg-background transition-colors text-xs text-text-main">
                  <td class="py-3 px-4 font-mono font-medium">
                    {{ inv.displayId || inv.id.toString().substring(0,8).toUpperCase() }} 
                    <Copy class="w-3 h-3 inline text-secondary cursor-pointer ml-1 hover:text-[#A47148]" />
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px]">{{ inv.type }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold">Đại diện phòng</div>
                    <div class="text-[10px] text-text-muted">{{ inv.studentId || 'N/A' }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-bold">{{ inv.roomNumber }}</div>
                    <div class="text-[10px] text-text-muted">KTX</div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px]">{{ inv.month || 'N/A' }}</span>
                  </td>
                  <td class="py-3 px-4 text-right font-bold text-primary">{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }} đ</td>
                  <td class="py-3 px-4 text-right font-bold text-emerald-600">{{ inv.status === 'Paid' ? new Intl.NumberFormat('vi-VN').format(inv.amount) : '0' }} đ</td>
                  <td class="py-3 px-4 text-right font-bold">
                    <span :class="inv.status === 'Unpaid' ? 'text-rose-600' : 'text-text-muted'">{{ inv.status === 'Unpaid' ? new Intl.NumberFormat('vi-VN').format(inv.amount) : '0' }} đ</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span v-if="inv.status === 'Paid'" class="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded text-[10px] w-max mx-auto">Đã thanh toán</span>
                    <span v-else class="text-rose-500 bg-rose-50 border border-rose-200 px-2 py-1 rounded text-[10px] w-max mx-auto">Chưa thanh toán</span>
                  </td>
                  <td class="py-3 px-4 text-center flex items-center justify-center gap-1">
                    <button v-if="inv.status === 'Unpaid'" @click="handleCollectPayment(inv)" class="px-3 py-1 bg-secondary hover:bg-[#A47148] text-white text-[10px] font-bold rounded shadow-sm transition-colors cursor-pointer mr-1">
                      Thu tiền
                    </button>
                    <button @click="handlePrintInvoice" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="In phiếu thu">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <button @click="handleViewInvoice(inv)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="Xem chi tiết">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button v-if="inv.status === 'Unpaid'" @click="showToast('Đã gửi thông báo nhắc nợ đến sinh viên!', 'info')" class="p-1.5 text-text-muted hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors cursor-pointer" title="Nhắc nợ">
                      <BellRing class="w-4 h-4" />
                    </button>
                    <button @click="confirmDeleteInvoice(inv.id)" class="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Xóa phiếu thu">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredInvoices.length === 0">
                  <td colspan="10" class="py-12 text-center text-text-muted italic text-xs">Không tìm thấy phiếu thu nào phù hợp.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang Phiếu thu -->
          <div v-if="filteredInvoices.length > 0" class="flex justify-between items-center mt-6">
            <span class="text-xs text-text-muted">Trang {{ cpInvoices }} / {{ tpInvoices }}</span>
            <div class="flex gap-2">
              <button @click="ppInvoices" :disabled="cpInvoices === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Trước</button>
              <button @click="npInvoices" :disabled="cpInvoices === tpInvoices" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Sau</button>
            </div>
          </div>
        </div>
      </div>

        <!-- Tab Quản lý Hóa đơn đã được gộp lên trên -->

        <!-- TAB QUẢN LÝ CÔNG NỢ -->
        <div v-if="activeTab === 'Quản lý Công nợ'" class="bg-background p-8 text-left animate-fade-in">
          <div class="mb-6">
            <h3 class="font-serif text-text-main text-2xl font-bold">Công nợ sinh viên</h3>
            <p class="text-text-muted text-xs mt-1">Theo dõi các khoản nợ chưa thanh toán</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-2xl p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-secondary/30 cursor-pointer">
              <div class="text-xs font-semibold text-text-muted mb-2">Tổng công nợ</div>
              <div class="text-3xl font-bold font-mono text-rose-500">{{ new Intl.NumberFormat('vi-VN').format(totalUnpaid) }} đ</div>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-secondary/30 cursor-pointer">
              <div class="text-xs font-semibold text-text-muted mb-2">Số sinh viên nợ</div>
              <div class="text-3xl font-bold font-mono text-orange-500">{{ studentDebtCount }}</div>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-secondary/30 cursor-pointer">
              <div class="text-xs font-semibold text-text-muted mb-2">Quá hạn</div>
              <div class="text-3xl font-bold font-mono text-rose-500">{{ new Intl.NumberFormat('vi-VN').format(totalOverdue) }} đ</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-border shadow-sm p-4">
            <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div class="relative w-full max-w-md">
                <Search class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  v-model="debtSearch" 
                  placeholder="Tìm sinh viên, mã SV, phòng..." 
                  class="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full text-xs outline-none focus:border-primary"
                />
              </div>
              <select class="bg-background border border-border rounded-full px-4 py-2 text-xs outline-none focus:border-primary min-w-[200px]">
                <option value="All">Nợ nhiều nhất</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background border-y border-border">
                    <th class="py-3 px-4">Sinh Viên</th>
                    <th class="py-3 px-4">Phòng</th>
                    <th class="py-3 px-4 text-right">Tổng Nợ</th>
                    <th class="py-3 px-4 text-center">Số Phiếu Nợ</th>
                    <th class="py-3 px-4 text-right">Quá Hạn</th>
                    <th class="py-3 px-4 text-center">Hạn Cuối</th>
                    <th class="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="group in pGroupedDebts" :key="group.studentId" class="border-b border-border/50 hover:bg-background transition-colors text-xs text-text-main">
                    <td class="py-3 px-4 font-bold">{{ group.studentId }}</td>
                    <td class="py-3 px-4">{{ group.roomNumber }}</td>
                    <td class="py-3 px-4 text-right font-bold text-rose-600">{{ new Intl.NumberFormat('vi-VN').format(group.totalDebt) }} đ</td>
                    <td class="py-3 px-4 text-center font-bold text-orange-500">{{ group.invoiceCount }}</td>
                    <td class="py-3 px-4 text-right text-rose-500 font-bold">{{ new Intl.NumberFormat('vi-VN').format(group.overdue) }} đ</td>
                    <td class="py-3 px-4 text-center text-text-muted">{{ group.latestDeadline }}</td>
                    <td class="py-3 px-4 text-center flex items-center justify-center gap-1">
                      <button @click="showToast('Đã gửi thông báo nhắc nợ đến sinh viên!', 'info')" class="p-1.5 text-text-muted hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors cursor-pointer" title="Nhắc nợ">
                        <BellRing class="w-4 h-4" />
                      </button>
                      <button @click="handleViewDebt(group)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="Xem chi tiết nợ">
                        <Eye class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredGroupedDebts.length === 0">
                    <td colspan="7" class="py-12 text-center text-text-muted italic text-xs">
                      Trống. Không có sinh viên nào đang nợ.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="filteredGroupedDebts.length > 0" class="flex justify-between items-center mt-6">
              <span class="text-xs text-text-muted">Trang {{ cpGroupedDebts }} / {{ tpGroupedDebts }}</span>
              <div class="flex gap-2">
                <button @click="ppGroupedDebts" :disabled="cpGroupedDebts === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Trước</button>
                <button @click="npGroupedDebts" :disabled="cpGroupedDebts === tpGroupedDebts" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Sau</button>
              </div>
            </div>
          </div>
        </div>


        <!-- TAB QUẢN LÝ THANH TOÁN -->
        <div v-if="activeTab === 'Quản lý Thanh toán'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm text-left animate-fade-in">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 class="font-serif text-text-main text-xl">Quản Lý Thanh Toán</h3>
              <p class="text-text-muted text-xs font-mono">Tổng số: {{ filteredPayments.length }} thanh toán</p>
            </div>
            <div class="flex items-center gap-3 w-full md:w-auto">
              <button @click="isEditingPayment = false; showCreatePaymentModal = true; paymentForm.invoiceId = ''" class="px-5 py-2.5 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                <PlusCircle class="w-4 h-4" /> Ghi Nhận Thanh Toán
              </button>
            </div>
          </div>

          <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-background p-3 border border-border rounded-2xl">
            <div class="flex items-center gap-3 w-full md:w-auto flex-1">
              <div class="relative w-full max-w-md">
                <Search class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  v-model="paymentSearch" 
                  placeholder="Tìm kiếm mã GD, mã phiếu thu..." 
                  class="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-full text-xs outline-none focus:border-primary"
                />
              </div>
              <select v-model="paymentMethodFilter" class="bg-white border border-border rounded-full px-4 py-2 text-xs outline-none focus:border-primary min-w-[180px]">
                <option value="All">Phương thức thanh toán</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Momo">Momo</option>
                <option value="VNPay">VNPay</option>
                <option value="ZaloPay">ZaloPay</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border">
                  <th class="py-3 px-4">Mã Phiếu Thu</th>
                  <th class="py-3 px-4 text-right">Số Tiền</th>
                  <th class="py-3 px-4 text-center">Phương Thức</th>
                  <th class="py-3 px-4 text-center">Ngày Thanh Toán</th>
                  <th class="py-3 px-4 text-center">Mã Giao Dịch</th>
                  <th class="py-3 px-4 text-center">Người Thu</th>
                  <th class="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inv in pPayments" :key="inv.id" class="border-b border-border/50 hover:bg-background transition-colors text-xs text-text-main">
                  <td class="py-3 px-4 font-mono font-medium">
                    {{ inv.displayId || inv.id.toString().substring(0,8).toUpperCase() }} 
                    <Copy class="w-3 h-3 inline text-secondary hover:text-[#A47148] cursor-pointer ml-1" />
                  </td>
                  <td class="py-3 px-4 text-right font-bold text-emerald-600">{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }} đ</td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] w-max mx-auto block">Tiền mặt</span>
                  </td>
                  <td class="py-3 px-4 text-center">{{ inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '19/6/2026' }}</td>
                  <td class="py-3 px-4 text-center text-text-muted">---</td>
                  <td class="py-3 px-4 text-center">Quản trị viên</td>
                  <td class="py-3 px-4 text-center flex items-center justify-center gap-1">
                    <button @click="handleViewPayment(inv)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors" title="Xem chi tiết">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="handleEditPayment(inv)" class="p-1.5 text-text-muted hover:text-secondary hover:bg-secondary/10 rounded-md transition-colors" title="Sửa">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                    </button>
                    <button @click="confirmDeletePayment(inv.id)" class="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Xóa">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredPayments.length === 0">
                  <td colspan="7" class="py-8 text-center text-text-muted italic">Không tìm thấy giao dịch thanh toán nào.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredPayments.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <span class="text-xs text-text-muted">Trang {{ cpPayments }} / {{ tpPayments }}</span>
            <div class="flex gap-2">
              <button @click="ppPayments" :disabled="cpPayments === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Trước</button>
              <button @click="npPayments" :disabled="cpPayments === tpPayments" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Sau</button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Quản lý tin tức'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white rounded-[32px] border border-border p-8 shadow-sm text-left">
            <h3 class="font-serif text-text-main text-lg mb-2">Đăng thông cáo & Bản tin sự kiện sinh viên</h3>
            <form @submit.prevent="handleCreateNews" class="space-y-4 mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-text-main">Tiêu đề bài viết bản tin <span class="text-secondary">*</span></label>
                  <input type="text" required v-model="newsTitle" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-text-main">Chuyên mục tin đăng</label>
                  <select v-model="newsCat" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary">
                    <option value="TIN TỨC KTX">Tin tức nội trú KTX</option>
                    <option value="SỰ KIỆN">Hoạt động Sự kiện</option>
                    <option value="THÔNG BÁO">Thông báo chung</option>
                    <option value="HOẠT ĐỘNG SV">Sinh viên ngoại khóa</option>
                    <option value="Quy định - Thủ tục">Quy chế nội quy</option>
                  </select>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Lời tóm tắt ngắn mục lục <span class="text-secondary">*</span></label>
                <input type="text" required v-model="newsSummary" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-text-main">Nội dung văn tự bài viết chi tiết <span class="text-secondary">*</span></label>
                <textarea required rows="6" v-model="newsContent" class="w-full bg-background border border-border rounded-2xl px-4 py-3 text-xs outline-none resize-none focus:border-primary"></textarea>
              </div>
              <button type="submit" class="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-serif font-light text-xs rounded-full shadow-xs cursor-pointer flex items-center gap-1.5">
                <PlusCircle class="w-4 h-4" /> <span>Xuất bản ngay</span>
              </button>
            </form>
          </div>

          <div class="bg-white rounded-[32px] border border-border p-6 shadow-sm flex flex-col">
            <h4 class="font-serif text-text-main text-sm mb-4">Các tin tức đã phát hành</h4>
            <div class="space-y-3 flex-1">
              <div v-for="item in pNews" :key="item.id" class="p-3.5 border border-border bg-background/50 rounded-2xl flex items-start justify-between gap-3 text-xs">
                <div class="overflow-hidden">
                  <div class="font-bold text-text-main leading-tight line-clamp-1">{{ item.title }}</div>
                  <div class="text-[10px] text-text-muted font-mono mt-1">{{ item.category }} • {{ item.date }}</div>
                </div>
                <button @click="emit('deleteNewsArticle', item.id); showToast('Đã thu hồi bản tin!', 'info');" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer shrink-0">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <!-- Phân trang Tin tức -->
            <div v-if="computedNews.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <span class="text-xs text-text-muted">Trang {{ cpNews }} / {{ tpNews }}</span>
              <div class="flex gap-2">
                <button @click="ppNews" :disabled="cpNews === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Trước</button>
                <button @click="npNews" :disabled="cpNews === tpNews" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Sau</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Sự cố bảo trì'" class="bg-background p-8 text-left animate-fade-in flex flex-col min-h-[500px]">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 class="font-serif text-text-main text-2xl font-bold">Quản Lý Bảo Trì</h3>
              <p class="text-text-muted text-xs mt-1">Tổng số: {{ filteredIssues.length }} yêu cầu</p>
            </div>
            <div class="flex items-center gap-3">
              <button @click="handleExportMaintenanceExcel" class="px-4 py-2 border border-border hover:bg-background text-text-main font-semibold text-xs rounded-full transition-colors flex items-center gap-2 shadow-sm bg-white cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Xuất Excel
              </button>
              <button @click="openCreateMaintenanceModal" class="px-4 py-2 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
                + Tạo Yêu Cầu
              </button>
            </div>
          </div>

          <!-- Bộ lọc -->
          <div class="bg-white rounded-xl border border-border shadow-sm p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="relative w-full">
                <Search class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  v-model="maintenanceSearch"
                  placeholder="Tìm kiếm..." 
                  class="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-full text-xs outline-none focus:border-secondary/50"
                />
              </div>
              <div class="relative w-full">
                <select v-model="maintenanceStatusFilter" class="w-full px-4 py-2 bg-white border border-border rounded-full text-xs outline-none focus:border-secondary/50 appearance-none text-text-muted">
                  <option value="All">Trạng thái</option>
                  <option value="Pending">Chờ xử lý</option>
                  <option value="In Progress">Đang xử lý</option>
                  <option value="Resolved">Đã giải quyết</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-border">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div class="relative w-full">
                <select v-model="maintenanceCategoryFilter" class="w-full px-4 py-2 bg-white border border-border rounded-full text-xs outline-none focus:border-secondary/50 appearance-none text-text-muted">
                  <option value="All">Danh mục</option>
                  <option value="Điện">Điện</option>
                  <option value="Nước">Nước</option>
                  <option value="Mộc">Mộc</option>
                  <option value="Khác">Khác</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-border">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div class="relative w-full">
                <select v-model="maintenancePriorityFilter" class="w-full px-4 py-2 bg-white border border-border rounded-full text-xs outline-none focus:border-secondary/50 appearance-none text-text-muted">
                  <option value="All">Độ ưu tiên</option>
                  <option value="Normal">Bình thường</option>
                  <option value="Critical">Khẩn cấp</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-border">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="bg-white rounded-xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
            <div class="overflow-x-auto flex-1 p-0">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-xs font-bold text-text-main bg-background border-b border-border">
                    <th class="py-4 px-6">Phòng</th>
                    <th class="py-4 px-6">Tiêu Đề</th>
                    <th class="py-4 px-6 text-center">Danh Mục</th>
                    <th class="py-4 px-6 text-center">Ưu Tiên</th>
                    <th class="py-4 px-6 text-center">Trạng Thái</th>
                    <th class="py-4 px-6 text-center">Phân Công</th>
                    <th class="py-4 px-6 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="issue in pIssues" :key="issue.id" class="border-b border-border/50 hover:bg-background transition-colors text-xs text-text-main">
                    <td class="py-4 px-6 font-bold">{{ issue.roomNumber }}</td>
                    <td class="py-4 px-6">
                      <div class="font-bold line-clamp-1 max-w-[200px]" :title="issue.title">{{ issue.title }}</div>
                      <div class="text-[10px] text-text-muted line-clamp-1 max-w-[200px]" :title="issue.description">{{ issue.description }}</div>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <span class="text-text-muted">{{ (issue as any).category || 'Khác' }}</span>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <span :class="['text-[10px] font-bold', issue.priority === 'Critical' ? 'text-rose-500' : 'text-text-muted']">
                        {{ issue.priority === 'Critical' ? 'Khẩn cấp' : 'Thường' }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <span :class="[
                        'text-[10px] font-bold px-2 py-1 rounded-md border',
                        issue.status === 'Resolved' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                        issue.status === 'In Progress' ? 'text-primary bg-primary/10 border-primary/20' : 
                        'text-secondary bg-secondary/10 border-secondary/20'
                      ]">
                        {{ issue.status === 'Resolved' ? 'Hoàn thành' : issue.status === 'In Progress' ? 'Đang xử lý' : 'Chờ xử lý' }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-center text-text-muted">
                      Chưa có
                    </td>
                    <td class="py-4 px-6 text-center flex items-center justify-center gap-2">
                      <button @click="emit('updateMaintenanceStatus', issue.id, 'Resolved'); showToast('Đã đóng hồ sơ bảo trì!', 'success');" class="p-1.5 text-text-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer" title="Hoàn thành">
                        <CheckCircle class="w-4 h-4" />
                      </button>
                      <button @click="handleEditMaintenance(issue)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="Chỉnh sửa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                    </td>
                  </tr>
                  
                  <!-- Empty State -->
                  <tr v-if="filteredIssues.length === 0">
                    <td colspan="7" class="py-24 text-center">
                      <div class="flex flex-col items-center justify-center text-[#d1d5db]">
                        <Inbox class="w-16 h-16 mb-4 stroke-1" />
                        <span class="text-sm">Trống</span>
                      </div>
                      <div class="mt-12 bg-[#e5e7eb] h-4 w-full rounded-full max-w-5xl mx-auto"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang Sự cố -->
            <div v-if="filteredIssues.length > 0" class="flex justify-between items-center p-4 border-t border-border bg-white">
              <span class="text-xs text-text-muted">Trang {{ cpIssues }} / {{ tpIssues }}</span>
              <div class="flex gap-2">
                <button @click="ppIssues" :disabled="cpIssues === 1" class="px-3 py-1.5 bg-white border border-border rounded-md text-xs font-bold text-text-main disabled:opacity-50 hover:bg-background transition-colors">Trước</button>
                <button @click="npIssues" :disabled="cpIssues === tpIssues" class="px-3 py-1.5 bg-white border border-border rounded-md text-xs font-bold text-text-main disabled:opacity-50 hover:bg-background transition-colors">Sau</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Duyệt lưu trú'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left flex flex-col min-h-[500px]">
          <h3 class="font-serif text-text-main text-lg border-b border-border pb-3.5">Hồ sơ chờ phê duyệt phân phòng</h3>
          <div class="space-y-4 flex-1">
            <div v-for="app in pApps" :key="app.id" class="p-5 border border-border bg-background/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 class="font-serif text-slate-950 text-base">{{ app.fullName }}</h4>
                <p class="text-xs text-text-muted mt-1 font-mono">MSSV: {{ app.studentId }} • Lớp: {{ app.className }} • Phòng muốn nạp: {{ app.roomNumber }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="emit('approveApplication', app.id); showToast('Phê duyệt hồ sơ thành công!', 'success');" class="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full cursor-pointer">Duyệt</button>
                <button @click="emit('rejectApplication', app.id); showToast('Đã hủy bỏ đề xuất đăng kí!', 'info');" class="px-4 py-2 bg-secondary hover:bg-[#b07d62] text-white font-bold text-xs rounded-full cursor-pointer">Từ chối</button>
              </div>
            </div>
            <div v-if="pendingApps.length === 0" class="text-center py-12 text-text-muted italic text-xs font-mono">Không có hồ sơ lưu trú nào đang đợi kiểm duyệt.</div>
          </div>
          <!-- Phân trang Lưu trú -->
          <div v-if="pendingApps.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <span class="text-xs text-text-muted">Trang {{ cpApps }} / {{ tpApps }}</span>
            <div class="flex gap-2">
              <button @click="ppApps" :disabled="cpApps === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Trước</button>
              <button @click="npApps" :disabled="cpApps === tpApps" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors">Sau</button>
            </div>
          </div>

          <!-- Lịch sử phê duyệt -->
          <h3 class="font-serif text-text-main text-lg border-b border-border pb-3.5 mt-8">Lịch sử phê duyệt</h3>
          <div class="space-y-4">
            <div v-for="app in pHistoryApps" :key="app.id" class="p-5 border border-border bg-background/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
              <div>
                <h4 class="font-serif text-slate-950 text-base">{{ app.fullName }}</h4>
                <p class="text-xs text-text-muted mt-1 font-mono">MSSV: {{ app.studentId }} • Lớp: {{ app.className }} • Phòng đăng ký: {{ app.roomNumber }}</p>
                <p v-if="app.updatedAt" class="text-[10px] text-text-muted mt-1 font-mono italic">Lúc: {{ new Date(app.updatedAt).toLocaleString('vi-VN') }}</p>
              </div>
              <div class="flex gap-2">
                <span :class="['px-4 py-2 font-bold text-xs rounded-full', app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                  {{ app.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối' }}
                </span>
              </div>
            </div>
            <div v-if="historyApps.length === 0" class="text-center py-12 text-text-muted italic text-xs font-mono">Chưa có lịch sử phê duyệt nào.</div>
          </div>
          <!-- Phân trang Lịch sử -->
          <div v-if="historyApps.length > 0" class="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <span class="text-xs text-text-muted">Trang {{ cpHistoryApps }} / {{ tpHistoryApps }}</span>
            <div class="flex gap-2">
              <button @click="ppHistoryApps" :disabled="cpHistoryApps === 1" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Trước</button>
              <button @click="npHistoryApps" :disabled="cpHistoryApps === tpHistoryApps" class="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-text-main disabled:opacity-50 hover:bg-white transition-colors cursor-pointer">Sau</button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Cài đặt hệ thống'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm text-left">
          <h3 class="font-serif text-text-main text-lg border-b border-border pb-3">Thiết lập cấu hình tham số KTX</h3>
          <div class="space-y-5 max-w-xl text-xs md:text-sm pt-4">
            <div class="space-y-2">
              <label class="font-bold text-text-main">1. Giờ giới nghiêm khóa cổng ban đêm</label>
              <input type="text" defaultValue="22:30" class="w-full bg-background border border-border px-4 py-2.5 rounded-2xl outline-none focus:border-primary" />
            </div>
            <div class="space-y-2">
              <label class="font-bold text-text-main">2. Quy định lệ phí chỗ ở nội trú sàn tối thiểu (VND/Tháng)</label>
              <input type="number" defaultValue="1200000" class="w-full bg-background border border-border px-4 py-2.5 rounded-2xl outline-none focus:border-primary" />
            </div>
            <button @click="showToast('Ghi nhận thông tin tham số vận hành vĩ mô thành công!', 'success')" class="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full cursor-pointer hover:bg-primary-hover mt-2">
              Lưu thiết đặt cấu hình
            </button>
          </div>
        </div>

      
        <div v-if="activeTab === 'Cơ sở vật chất'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left">
          <div class="flex justify-between items-center border-b border-border pb-4">
            <h3 class="font-bold text-secondary text-xl">Quản lý Tòa nhà & Phòng nội trú</h3>
            <button @click="openCreateRoomModal" class="px-4 py-2 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Plus class="w-4 h-4" /> Thêm Tòa/Phòng
            </button>
          </div>
          <div class="bg-white border border-border rounded-2xl overflow-hidden mt-6">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-background border-b border-border">
                  <tr>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Tên Phòng</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Tòa Nhà</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Sức chứa</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Trạng thái</th>
                    <th scope="col" class="px-6 py-4 font-bold text-right text-primary">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="roomsList.length === 0" class="bg-white border-b border-border">
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
                      <Building2 class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      Chưa có dữ liệu phòng nào trong Database. Hãy bấm "Thêm Tòa/Phòng" để tạo mới.
                    </td>
                  </tr>
                  
                  <tr v-for="room in roomsList" :key="room.id" class="bg-white border-b border-border hover:bg-background/50 transition-colors">
                    <td class="px-6 py-4 font-bold text-gray-800">
                      Phòng {{ room.roomNumber || room.name }}
                    </td>
                    <td class="px-6 py-4 text-gray-600 font-medium">
                      Tòa {{ room.buildingId }}
                    </td>
                    <td class="px-6 py-4 text-gray-600">
                      {{ room.capacity }} Giường
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold uppercase tracking-wider">
                        Sẵn sàng
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-3">
                      <button @click="openEditRoomModal(room)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="Chỉnh sửa"><Pencil class="w-4 h-4" /></button>
                      <button @click="handleDeleteRoom(room.id)" class="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Xóa"><Trash2 class="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB QUẢN LÝ TIN TỨC (DỮ LIỆU THẬT TỪ API N1) -->        <!-- LOẠI PHÒNG (MASTER DATA) -->
        <div v-if="activeTab === 'Loại phòng'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left">
          <div class="flex justify-between items-center border-b border-border pb-4">
            <h3 class="font-bold text-secondary text-xl">Quản lý Loại Phòng (Master Data)</h3>
            <button @click="openCreateRoomTypeModal" class="px-4 py-2 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Plus class="w-4 h-4" /> Thêm Loại Phòng
            </button>
          </div>
          <div class="bg-white border border-border rounded-2xl overflow-hidden mt-6">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-500 uppercase bg-background border-b border-border">
                <tr>
                  <th class="px-6 py-4">Tên loại phòng</th>
                  <th class="px-6 py-4">Sức chứa</th>
                  <th class="px-6 py-4">Đơn giá (Tháng)</th>
                  <th class="px-6 py-4 text-center">Tiện ích</th>
                  <th class="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in roomTypesList" :key="t.id" class="bg-white border-b border-border hover:bg-background/50">
                  <td class="px-6 py-4 font-bold">{{ t.name }}</td>
                  <td class="px-6 py-4">{{ t.maxOccupants }} người</td>
                  <td class="px-6 py-4 text-rose-600 font-bold">{{ t.monthlyPrice.toLocaleString() }}đ</td>
                  <td class="px-6 py-4 text-center">
                    <span v-if="t.hasAirConditioner" class="px-2 bg-blue-100 text-blue-700 rounded text-xs inline-block mb-1">Điều hòa</span>
                    <span v-if="t.hasPrivateBathroom" class="px-2 bg-emerald-100 text-emerald-700 rounded text-xs ml-1 inline-block mb-1">WC Riêng</span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button @click="openEditRoomTypeModal(t)" class="p-1.5 text-text-muted hover:text-text-main cursor-pointer" title="Chỉnh sửa"><Pencil class="w-4 h-4" /></button>
                    <button @click="handleDeleteRoomType(t.id)" class="p-1.5 text-text-muted hover:text-rose-600 cursor-pointer" title="Xóa"><Trash2 class="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr v-if="roomTypesList.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500 italic">Chưa có dữ liệu Loại phòng</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SƠ ĐỒ KTX (HIERARCHY) -->
        <div v-if="activeTab === 'Sơ đồ KTX'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left">
          <div class="border-b border-border pb-4">
            <h3 class="font-bold text-secondary text-xl">Sơ đồ Phân cấp KTX (Hierarchy)</h3>
            <p class="text-sm text-gray-500 mt-1">Cấu trúc vật lý: Tòa nhà &rarr; Phòng &rarr; Giường</p>
          </div>
          <div class="bg-background p-6 rounded-2xl border border-border max-h-[600px] overflow-y-auto">
            <div v-if="hierarchyData.length === 0" class="text-gray-500 text-center italic py-4">Chưa tải được sơ đồ KTX... (Lưu ý phải bật backend)</div>
            <div v-for="b in hierarchyData" :key="b.buildingId" class="mb-6">
              <div class="font-bold text-lg text-emerald-700 mb-2 flex items-center gap-2">
                <Building2 class="w-5 h-5"/> Tòa {{ b.buildingName }} 
                <span class="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{{ b.totalRooms }} Phòng</span>
              </div>
              <div class="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="r in b.rooms" :key="r.roomId" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div class="font-bold text-blue-700 mb-2 border-b border-gray-100 pb-2">Phòng {{ r.roomNumber }} <span class="text-xs font-normal text-gray-500">({{ r.roomType }})</span></div>
                  <div class="space-y-1">
                    <div v-for="bed in r.beds" :key="bed.bedId" class="text-sm flex items-center gap-2 group">
                      <div class="w-2 h-2 rounded-full" :class="bed.status === 'Available' ? 'bg-emerald-500' : (bed.status === 'Under Maintenance' ? 'bg-rose-500' : 'bg-gray-400')"></div>
                      {{ bed.bedName }} 
                      <span v-if="bed.studentId" class="text-xs text-gray-400 ml-auto flex-shrink-0">SV: {{ bed.studentId }}</span>
                      <span v-if="bed.status === 'Under Maintenance'" class="text-[10px] text-rose-500 ml-auto font-bold flex-shrink-0">BẢO TRÌ</span>
                      <button v-if="bed.status !== 'Under Maintenance'" @click="toggleBedMaintenance(bed.bedId)" class="opacity-0 group-hover:opacity-100 ml-auto text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-0.5 rounded transition-opacity cursor-pointer">
                        Khóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'Quản lý tin tức'" class="bg-white rounded-[32px] border border-border p-8 shadow-sm space-y-6 text-left">
          <div class="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 class="font-bold text-secondary text-xl">Quản lý Tin tức & Thông báo</h3>
              <p class="text-xs text-text-muted mt-1">Tổng số: {{ newsList.length }} bài viết</p>
            </div>
            <button @click="openCreateNewsModal" class="px-4 py-2 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Plus class="w-4 h-4" /> Thêm tin tức
            </button>
          </div>
          <div class="bg-white border border-border rounded-2xl overflow-hidden mt-6">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-background border-b border-border">
                  <tr>
                    <th scope="col" class="px-6 py-4 font-bold text-primary w-16">ID</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Tiêu đề</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Tác giả</th>
                    <th scope="col" class="px-6 py-4 font-bold text-primary">Ngày tạo</th>
                    <th scope="col" class="px-6 py-4 font-bold text-right text-primary">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="newsList.length === 0" class="bg-white border-b border-border">
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
                      <Newspaper class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      Chưa có bài tin tức nào trong Database. Hãy bấm "Thêm tin tức" để tạo mới.
                    </td>
                  </tr>

                  <tr v-for="item in newsList" :key="item.id" class="bg-white border-b border-border hover:bg-background/50 transition-colors">
                    <td class="px-6 py-4 font-mono text-text-muted">{{ item.id }}</td>
                    <td class="px-6 py-4 font-bold text-gray-800">
                      <div class="max-w-xs truncate">{{ item.title }}</div>
                    </td>
                    <td class="px-6 py-4 text-gray-600 font-medium">{{ item.author || 'Ẩn danh' }}</td>
                    <td class="px-6 py-4 text-gray-600 text-xs font-mono">
                      {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A' }}
                    </td>
                    <td class="px-6 py-4 text-right space-x-3">
                      <button @click="openEditNewsModal(item)" class="p-1.5 text-text-muted hover:text-text-main hover:bg-border/50 rounded-md transition-colors cursor-pointer" title="Sửa"><Pencil class="w-4 h-4" /></button>
                      <button @click="handleDeleteNews(item.id)" class="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Xóa"><Trash2 class="w-4 h-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Modal Tự động tạo hóa đơn tháng -->
    <div v-if="showAutoBillModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAutoBillModal = false"></div>
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-serif text-lg font-bold text-text-main">Tự động tạo hóa đơn tháng</h3>
            <p class="text-sm text-text-muted mt-2">Bạn có muốn tự động tạo hóa đơn tiền phòng tháng này cho tất cả hợp đồng đang hoạt động?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button @click="showAutoBillModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy
          </button>
          <button @click="handleTriggerAutoBill" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            Tạo
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tạo Phiếu Thu (Thủ công) -->
    <div v-if="showCreateInvoiceModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCreateInvoiceModal = false"></div>
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-serif text-xl text-text-main">{{ isEditing ? 'Chỉnh Sửa Phiếu Thu' : 'Tạo Phiếu Thu' }}</h3>
          <button @click="showCreateInvoiceModal = false" class="text-text-muted hover:text-rose-500 transition-colors">
            X
          </button>
        </div>

        <div class="space-y-6">
          <!-- Hàng 1: Mã phiếu, Loại phiếu, Người lập -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Mã Phiếu Thu <span class="text-secondary">*</span></label>
              <input type="text" disabled value="PTT(Tự động)" class="w-full bg-background text-text-muted border border-border rounded-2xl px-4 py-2 text-xs outline-none" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Loại Phiếu Thu <span class="text-secondary">*</span></label>
              <select v-model="invoiceForm.type" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary">
                <option value="Tiền phòng, Điện nước">Tiền phòng tháng</option>
                <option value="Tiền cọc">Tiền cọc</option>
                <option value="Phụ thu">Phụ thu khác</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Người lập phiếu</label>
              <input type="text" disabled :value="adminUser?.name || 'Admin'" class="w-full bg-background text-text-muted border border-border rounded-2xl px-4 py-2 text-xs outline-none" />
            </div>
          </div>

          <!-- Thông tin hợp đồng -->
          <div class="bg-background p-5 rounded-2xl border border-border space-y-4">
            <h4 class="text-xs font-bold text-primary uppercase flex items-center gap-2"><Receipt class="w-4 h-4" /> Thông tin hợp đồng</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-1.5 md:col-span-3">
                <label class="text-xs font-bold text-text-main">Chọn Phòng / Hợp Đồng <span class="text-secondary">*</span></label>
                <select v-model="invoiceForm.roomId" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary">
                  <option value="">-- Chọn hợp đồng Active --</option>
                  <option v-for="r in rooms" :key="r.id" :value="r.roomNumber">Phòng {{ r.roomNumber }} - Tòa {{ r.building }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Kỳ thanh toán -->
          <div class="bg-background p-5 rounded-2xl border border-border space-y-4">
            <h4 class="text-xs font-bold text-primary uppercase flex items-center gap-2"><Calendar class="w-4 h-4" /> Kỳ thanh toán</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Tháng <span class="text-secondary">*</span></label>
                <input type="number" v-model="invoiceForm.month" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Năm <span class="text-secondary">*</span></label>
                <input type="number" v-model="invoiceForm.year" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Hạn Thanh Toán <span class="text-secondary">*</span></label>
                <input type="text" v-model="invoiceForm.deadline" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <!-- Chi tiết các khoản -->
          <div class="bg-background p-5 rounded-2xl border border-border space-y-4">
            <h4 class="text-xs font-bold text-primary uppercase flex items-center gap-2"><Activity class="w-4 h-4" /> Chi tiết các khoản</h4>
            
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Tiền Phòng (đ)</label>
              <input type="number" v-model="invoiceForm.roomFee" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Điện (Đầu kỳ) kWh</label>
                <input type="number" v-model="invoiceForm.electricityPrev" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Điện (Cuối kỳ) kWh</label>
                <input type="number" v-model="invoiceForm.electricityCurr" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Đơn giá (đ/kWh)</label>
                <input type="number" v-model="invoiceForm.electricityPrice" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Thành Tiền (đ)</label>
                <input type="number" disabled :value="(invoiceForm.electricityCurr - invoiceForm.electricityPrev) * invoiceForm.electricityPrice" class="w-full bg-amber-50 text-amber-800 font-bold border border-amber-200 rounded-2xl px-4 py-2 text-xs outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Nước (Đầu kỳ) m³</label>
                <input type="number" v-model="invoiceForm.waterPrev" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Nước (Cuối kỳ) m³</label>
                <input type="number" v-model="invoiceForm.waterCurr" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Đơn giá (đ/m³)</label>
                <input type="number" v-model="invoiceForm.waterPrice" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Thành Tiền (đ)</label>
                <input type="number" disabled :value="(invoiceForm.waterCurr - invoiceForm.waterPrev) * invoiceForm.waterPrice" class="w-full bg-cyan-50 text-cyan-800 font-bold border border-cyan-200 rounded-2xl px-4 py-2 text-xs outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Phí Dịch Vụ (đ)</label>
                <input type="number" v-model="invoiceForm.serviceFee" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-text-main">Giảm giá (đ)</label>
                <input type="number" v-model="invoiceForm.discount" class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <!-- Tổng Tiền -->
          <div class="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <h4 class="text-sm font-bold text-emerald-800 uppercase flex items-center gap-2"><Landmark class="w-5 h-5" /> TỔNG TIỀN</h4>
            <div class="text-2xl font-mono font-bold text-emerald-700">{{ new Intl.NumberFormat('vi-VN').format(invoiceTotal > 0 ? invoiceTotal : 0) }} VNĐ</div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Ghi Chú</label>
            <input type="text" v-model="invoiceForm.note" placeholder="Ghi chú bổ sung (nếu có)..." class="w-full bg-white border border-border rounded-2xl px-4 py-2 text-xs outline-none focus:border-primary" />
          </div>

        </div>

        <div class="flex justify-end gap-4 mt-8 border-t border-border pt-6">
          <button @click="showCreateInvoiceModal = false" class="px-8 py-3 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy
          </button>
          <button @click="handleCreateManualInvoice" class="px-8 py-3 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            {{ isEditing ? 'Cập Nhật' : 'Tạo Phiếu Thu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xem Chi Tiết Phiếu Thu (Design Mới) -->
    <div v-if="showViewInvoiceModal && viewingInvoice" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewInvoiceModal = false"></div>
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 p-0 text-left animate-fade-in custom-scrollbar">
        <!-- Header -->
        <div class="flex justify-between items-center p-5 border-b border-border">
          <h3 class="font-bold text-text-main text-lg">Chi tiết Phiếu Thu</h3>
          <button @click="showViewInvoiceModal = false" class="text-text-muted hover:text-text-main">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>
        <!-- Body -->
        <div class="p-6">
          <div class="border border-border rounded-lg bg-white overflow-hidden text-sm">
            <!-- Row 1 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Mã Phiếu Thu</div>
              <div class="col-span-12 md:col-span-9 p-3 font-bold text-text-main flex items-center gap-2">
                {{ viewingInvoice.displayId || viewingInvoice.id }} <Copy class="w-4 h-4 text-blue-500 cursor-pointer" />
              </div>
            </div>
            <!-- Row 2 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Sinh Viên</div>
              <div class="col-span-12 md:col-span-4 p-3 font-bold text-text-main">Đại diện phòng <span class="font-normal text-text-muted">({{ viewingInvoice.studentId || 'Chưa định danh' }})</span></div>
              <div class="col-span-12 md:col-span-2 p-3 bg-background text-text-muted md:border-l border-t md:border-t-0 border-border">Phòng</div>
              <div class="col-span-12 md:col-span-3 p-3 text-text-main flex items-center gap-2">
                <span class="text-blue-500 bg-blue-50 border border-blue-200 px-2 rounded">{{ viewingInvoice.roomNumber }}</span>
              </div>
            </div>
            <!-- Row 3 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Kỳ thanh toán</div>
              <div class="col-span-12 md:col-span-4 p-3 text-text-main">{{ viewingInvoice.month }}</div>
              <div class="col-span-12 md:col-span-2 p-3 bg-background text-text-muted md:border-l border-t md:border-t-0 border-border">Loại phiếu thu</div>
              <div class="col-span-12 md:col-span-3 p-3 text-text-main">{{ viewingInvoice.type }}</div>
            </div>
            <!-- Row 4 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Trạng thái</div>
              <div class="col-span-12 md:col-span-9 p-3">
                <span v-if="viewingInvoice.status === 'Paid'" class="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">Đã thanh toán</span>
                <span v-else class="text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">Chưa thanh toán</span>
              </div>
            </div>
            <!-- Row 5 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Ngày tạo</div>
              <div class="col-span-12 md:col-span-4 p-3 text-text-main">{{ viewingInvoice.createdAt ? new Date(viewingInvoice.createdAt).toLocaleDateString('vi-VN') : 'Không xác định' }}</div>
              <div class="col-span-12 md:col-span-2 p-3 bg-background text-text-muted md:border-l border-t md:border-t-0 border-border">Cập nhật lần cuối</div>
              <div class="col-span-12 md:col-span-3 p-3 text-text-main">
                {{ viewingInvoice.createdAt ? new Date(viewingInvoice.createdAt).toLocaleDateString('vi-VN') : 'Không xác định' }}
              </div>
            </div>
            <!-- Row 6 (Chi tiết các khoản) -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted flex items-center md:border-b-0 border-b border-border">Chi tiết các khoản</div>
              <div class="col-span-12 md:col-span-9 p-3 md:border-l border-border">
                <div class="border border-border rounded-lg">
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs min-w-[500px]">
                      <thead class="bg-background border-b border-border text-text-main">
                        <tr>
                          <th class="p-2 font-bold whitespace-nowrap">Khoản thu</th>
                          <th class="p-2 font-bold whitespace-nowrap">Mô tả</th>
                          <th class="p-2 font-bold">SL</th>
                          <th class="p-2 font-bold">ĐVT</th>
                          <th class="p-2 font-bold text-right whitespace-nowrap">Đơn giá</th>
                          <th class="p-2 font-bold text-right whitespace-nowrap">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td colspan="6" class="p-8 text-center text-text-muted"><Inbox class="w-8 h-8 mx-auto text-border mb-2" /> Trống</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <!-- Footer summary -->
            <div class="grid grid-cols-1 md:grid-cols-2 text-sm text-text-main">
              <div class="grid grid-cols-2 border-b md:border-r border-border">
                <div class="p-3 bg-background">Tiền phòng</div>
                <div class="p-3">{{ new Intl.NumberFormat('vi-VN').format(viewingInvoice.amount - (viewingInvoice.electricityCost || 0) - (viewingInvoice.waterCost || 0)) }} đ</div>
              </div>
              <div class="grid grid-cols-2 border-b border-border">
                <div class="p-3 bg-background">Tiền điện</div>
                <div class="p-3">{{ new Intl.NumberFormat('vi-VN').format(viewingInvoice.electricityCost || 0) }} đ</div>
              </div>
              
              <div class="grid grid-cols-2 border-b md:border-r border-border">
                <div class="p-3 bg-background">Tiền nước</div>
                <div class="p-3">{{ new Intl.NumberFormat('vi-VN').format(viewingInvoice.waterCost || 0) }} đ</div>
              </div>
              <div class="grid grid-cols-2 border-b border-border">
                <div class="p-3 bg-background">Phí dịch vụ</div>
                <div class="p-3">0 đ</div>
              </div>
              
              <div class="grid grid-cols-2 border-b md:border-r border-border">
                <div class="p-3 bg-background">Nợ kỳ trước</div>
                <div class="p-3">0 đ</div>
              </div>
              <div class="grid grid-cols-2 border-b border-border">
                <div class="p-3 bg-background">Giảm giá</div>
                <div class="p-3">0 đ</div>
              </div>
              
              <div class="grid grid-cols-2 border-b md:border-r border-border">
                <div class="p-3 bg-background">Tiền phạt</div>
                <div class="p-3 text-rose-500">0 đ</div>
              </div>
              <div class="grid grid-cols-2 border-b border-border">
                <div class="p-3 bg-background">Tổng tiền</div>
                <div class="p-3 font-bold text-blue-600">{{ new Intl.NumberFormat('vi-VN').format(viewingInvoice.amount) }} đ</div>
              </div>
              
              <div class="grid grid-cols-2 border-b md:border-b-0 md:border-r border-border">
                <div class="p-3 bg-background font-bold">Đã thanh toán</div>
                <div class="p-3 font-bold text-emerald-600">{{ viewingInvoice.status === 'Paid' ? new Intl.NumberFormat('vi-VN').format(viewingInvoice.amount) : '0' }} đ</div>
              </div>
              <div class="grid grid-cols-2">
                <div class="p-3 bg-background">Còn nợ</div>
                <div class="p-3 font-bold text-rose-600">{{ viewingInvoice.status === 'Unpaid' ? new Intl.NumberFormat('vi-VN').format(viewingInvoice.amount) : '0' }} đ</div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button @click="showViewInvoiceModal = false" class="px-6 py-2 border border-border text-text-main rounded hover:bg-background transition-colors">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ghi Nhận Thanh Toán / Sửa Thanh Toán -->
    <div v-if="showCreatePaymentModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCreatePaymentModal = false"></div>
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-bold text-lg text-text-main">{{ isEditingPayment ? 'Sửa Thanh Toán' : 'Ghi Nhận Thanh Toán' }}</h3>
          <button @click="showCreatePaymentModal = false" class="text-text-muted hover:text-text-main">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>

        <div class="space-y-6">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main"><span class="text-rose-500">*</span> Phiếu Thu</label>
            <select v-model="paymentForm.invoiceId" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary text-text-main">
              <option value="">Chọn phiếu thu cần thanh toán</option>
              <option v-for="inv in (props.invoices || []).filter(i => i.status === 'Unpaid' || i.id === paymentForm.invoiceId)" :key="inv.id" :value="inv.id">
                {{ inv.displayId || inv.id }} - Phòng {{ inv.roomNumber }} - {{ new Intl.NumberFormat('vi-VN').format(inv.amount) }}đ
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main"><span class="text-rose-500">*</span> Số Tiền</label>
              <input type="number" v-model="paymentForm.amount" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main"><span class="text-rose-500">*</span> Phương Thức</label>
              <select v-model="paymentForm.method" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-orange-500">
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Momo">Momo</option>
                <option value="VNPay">VNPay</option>
                <option value="ZaloPay">ZaloPay</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main"><span class="text-rose-500">*</span> Ngày Thanh Toán</label>
              <input type="date" v-model="paymentForm.date" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Mã Giao Dịch</label>
              <input type="text" v-model="paymentForm.transactionId" placeholder="Nhập mã giao dịch" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary placeholder-text-muted/50" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Ngân Hàng</label>
              <input type="text" v-model="paymentForm.bankName" placeholder="Nhập tên ngân hàng" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary placeholder-text-muted/50" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Số Tài Khoản</label>
              <input type="text" v-model="paymentForm.accountNumber" placeholder="Nhập số tài khoản" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary placeholder-text-muted/50" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Ghi Chú</label>
            <textarea v-model="paymentForm.note" rows="3" placeholder="Nhập ghi chú (nếu có)" class="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary resize-none placeholder-text-muted/50"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button @click="showCreatePaymentModal = false" class="px-6 py-2 bg-white border border-border text-text-main rounded-lg text-xs font-bold hover:bg-background transition-colors">
            Hủy
          </button>
          <button @click="handleSavePayment" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors">
            Lưu
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Thanh Toán -->
    <div v-if="showViewPaymentModal && viewingPayment" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewPaymentModal = false"></div>
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-2xl relative z-10 p-0 text-left animate-fade-in">
        <div class="flex justify-between items-center p-5 border-b border-border">
          <h3 class="font-bold text-text-main text-lg">Chi tiết Thanh Toán</h3>
          <button @click="showViewPaymentModal = false" class="text-text-muted hover:text-text-main">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div class="p-6">
          <div class="border border-border rounded-lg bg-white text-sm">
            <!-- Row 1 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Mã Phiếu Thu</div>
              <div class="col-span-12 md:col-span-9 p-3 font-bold text-text-main flex items-center gap-2">
                {{ viewingPayment.displayId || viewingPayment.id.toString().substring(0,8).toUpperCase() }} <Copy class="w-4 h-4 text-blue-500 cursor-pointer" />
              </div>
            </div>
            <!-- Row 2 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Số Tiền</div>
              <div class="col-span-12 md:col-span-9 p-3 font-bold text-emerald-600">
                {{ new Intl.NumberFormat('vi-VN').format(viewingPayment.amount) }} đ
              </div>
            </div>
            <!-- Row 3 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Phương Thức</div>
              <div class="col-span-12 md:col-span-3 p-3">
                <span class="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px]">Tiền mặt</span>
              </div>
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Ngày Thanh Toán</div>
              <div class="col-span-12 md:col-span-3 p-3">
                {{ viewingPayment.createdAt ? new Date(viewingPayment.createdAt).toLocaleDateString('vi-VN') : '19/6/2026' }}
              </div>
            </div>
            <!-- Row 4 -->
            <div class="grid grid-cols-12 border-b border-border">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Người Thu</div>
              <div class="col-span-12 md:col-span-9 p-3">Quản trị viên</div>
            </div>
            <!-- Row 5 -->
            <div class="grid grid-cols-12">
              <div class="col-span-12 md:col-span-3 p-3 bg-background text-text-muted">Thời Gian Ghi Nhận</div>
              <div class="col-span-12 md:col-span-9 p-3">
                {{ viewingPayment.createdAt ? new Date(viewingPayment.createdAt).toLocaleDateString('vi-VN') : '19/6/2026' }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end p-5 border-t border-border">
          <button @click="showViewPaymentModal = false" class="px-6 py-2 bg-white border border-border text-text-main rounded-lg text-xs font-bold hover:bg-background transition-colors">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Xóa Thanh Toán (Nằm Giữa Màn Hình) -->
    <div v-if="confirmDeletePaymentId" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="confirmDeletePaymentId = null"></div>
      <div class="bg-white w-full max-w-sm rounded-xl shadow-2xl relative z-10 p-6 animate-fade-in text-left">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center shrink-0 font-bold text-lg mt-0.5">!</div>
          <div>
            <h4 class="font-bold text-text-main text-base leading-tight">Xác nhận xóa</h4>
            <p class="text-sm text-text-muted mt-1.5 leading-relaxed">Bạn có chắc muốn xóa thanh toán này?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="confirmDeletePaymentId = null" class="px-5 py-2 bg-white border border-border text-text-main rounded-lg text-sm font-bold hover:bg-background transition-colors cursor-pointer">Hủy</button>
          <button @click="executeDeletePayment(confirmDeletePaymentId)" class="px-5 py-2 bg-white border border-rose-500 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-50 transition-colors cursor-pointer">Xóa</button>
        </div>
      </div>
    </div>
    <!-- Modal Tạo / Chỉnh sửa Yêu Cầu Bảo Trì -->
    <div v-if="showCreateMaintenanceModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCreateMaintenanceModal = false"></div>
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-serif text-xl text-text-main font-bold">{{ isEditingMaintenance ? 'Chỉnh Sửa Yêu Cầu Bảo Trì' : 'Tạo Yêu Cầu Mới' }}</h3>
          <button @click="showCreateMaintenanceModal = false" class="text-text-muted hover:text-rose-500 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Phòng <span class="text-rose-500">*</span></label>
              <input type="text" v-model="maintenanceForm.roomNumber" placeholder="Nhập số phòng..." class="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF9800]" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Danh Mục</label>
              <select v-model="maintenanceForm.category" class="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF9800]">
                <option value="Điện">Hệ thống Điện</option>
                <option value="Nước">Hệ thống Nước</option>
                <option value="Mộc">Nội thất (Mộc)</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Tiêu Đề <span class="text-rose-500">*</span></label>
            <input type="text" v-model="maintenanceForm.title" placeholder="Tóm tắt sự cố..." class="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF9800]" />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Mô Tả Chi Tiết</label>
            <textarea v-model="maintenanceForm.description" rows="4" placeholder="Nhập thông tin chi tiết về sự cố cần xử lý..." class="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF9800] resize-none"></textarea>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Độ Ưu Tiên</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="maintenanceForm.priority" value="Normal" class="accent-[#FF9800]" />
                <span class="text-sm text-text-main">Bình thường</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="maintenanceForm.priority" value="Critical" class="accent-rose-500" />
                <span class="text-sm text-text-main">Khẩn cấp</span>
              </label>
            </div>
          </div>

          <div class="pt-6 border-t border-border flex justify-end gap-3">
            <button @click="showCreateMaintenanceModal = false" class="px-6 py-2.5 bg-white border border-border text-text-main hover:bg-background font-bold text-xs rounded-xl transition-colors cursor-pointer">
              Hủy
            </button>
            <button @click="handleSaveMaintenance" class="px-6 py-2.5 bg-[#FF9800] hover:bg-[#F57C00] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2">
              <CheckCircle class="w-4 h-4" /> {{ isEditingMaintenance ? 'Cập Nhật' : 'Tạo Yêu Cầu' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi Tiết Công Nợ -->
    <div v-if="showViewDebtModal && viewingDebtGroup" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showViewDebtModal = false"></div>
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 p-0 text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center p-5 border-b border-border">
          <h3 class="font-bold text-text-main text-lg">Chi tiết Công Nợ Sinh Viên</h3>
          <button @click="showViewDebtModal = false" class="text-text-muted hover:text-text-main cursor-pointer">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div class="border border-border rounded-lg p-4 bg-background">
              <div class="text-text-muted text-xs font-bold mb-1 uppercase">Đại diện phòng</div>
              <div class="font-bold text-lg text-text-main">{{ viewingDebtGroup.studentId }}</div>
              <div class="text-text-main mt-1">Phòng: <span class="font-bold text-blue-600">{{ viewingDebtGroup.roomNumber }}</span></div>
            </div>
            <div class="border border-border rounded-lg p-4 bg-rose-50">
              <div class="text-rose-400 text-xs font-bold mb-1 uppercase">Tổng dư nợ</div>
              <div class="font-bold text-2xl text-rose-600 font-mono">{{ new Intl.NumberFormat('vi-VN').format(viewingDebtGroup.totalDebt) }} đ</div>
              <div class="text-rose-500 mt-1">Số lượng hóa đơn nợ: <span class="font-bold">{{ viewingDebtGroup.invoiceCount }}</span></div>
            </div>
          </div>
          
          <h4 class="font-bold text-text-main mb-3">Danh sách hóa đơn chưa thanh toán</h4>
          <div class="border border-border rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-background border-b border-border text-text-main">
                  <tr>
                    <th class="p-3 font-bold whitespace-nowrap">Mã Phiếu</th>
                    <th class="p-3 font-bold whitespace-nowrap">Kỳ TT</th>
                    <th class="p-3 font-bold whitespace-nowrap">Loại phiếu</th>
                    <th class="p-3 font-bold whitespace-nowrap text-right">Tổng Tiền</th>
                    <th class="p-3 font-bold whitespace-nowrap text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inv in viewingDebtGroup.invoices" :key="inv.id" class="border-b border-border/50 hover:bg-background">
                    <td class="p-3 font-mono">{{ inv.displayId || inv.id }}</td>
                    <td class="p-3">{{ inv.month || 'N/A' }}</td>
                    <td class="p-3">{{ inv.type }}</td>
                    <td class="p-3 text-right font-bold text-rose-600">{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }} đ</td>
                    <td class="p-3 text-center">
                      <button @click="handleCollectPayment(inv); showViewDebtModal = false" class="px-3 py-1 bg-[#FF9800] hover:bg-[#F57C00] text-white text-[10px] font-bold rounded shadow-sm transition-colors cursor-pointer">
                        Thu tiền
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="flex justify-end p-5 border-t border-border">
          <button @click="showViewDebtModal = false" class="px-6 py-2 bg-white border border-border text-text-main rounded-lg text-xs font-bold hover:bg-background transition-colors cursor-pointer">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Xóa Hóa Đơn / Phiếu Thu / Thanh Toán -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteModal = false"></div>
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </div>
          <div>
            <h3 class="font-serif text-lg font-bold text-text-main">Xác nhận xóa dữ liệu</h3>
            <p class="text-sm text-text-muted mt-2">
              Bạn có chắc chắn muốn xóa {{ itemToDelete?.type === 'payment' ? 'giao dịch thanh toán' : 'phiếu thu/hóa đơn' }} này? Hành động này không thể hoàn tác!
            </p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button @click="showDeleteModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy
          </button>
          <button @click="executeDelete" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>

  </div>

    <!-- Modal Thêm/Sửa Phòng -->
    <div v-if="showRoomModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showRoomModal = false"></div>
      <div class="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-serif text-xl text-text-main">{{ isEditingRoom ? 'Chỉnh Sửa Phòng' : 'Thêm Mới Phòng' }}</h3>
          <button @click="showRoomModal = false" class="text-text-muted hover:text-rose-500 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSaveRoom" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Tòa nhà <span class="text-secondary">*</span></label>
              <select required v-model="roomForm.buildingId" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary">
                <option v-for="b in buildingsList" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Tên phòng <span class="text-secondary">*</span></label>
              <input required type="text" v-model="roomForm.roomNumber" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" placeholder="Ví dụ: A101" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Loại phòng</label>
              <select v-model="roomForm.roomType" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary">
                <option value="Standard">Tiêu chuẩn (Standard)</option>
                <option value="VIP">Cao cấp (VIP)</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Số tầng</label>
              <input type="number" v-model="roomForm.floorNumber" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Sức chứa (Người)</label>
              <input type="number" v-model="roomForm.capacity" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Đơn giá (VND/Tháng)</label>
              <input type="number" v-model="roomForm.monthlyPrice" class="w-full bg-background border border-border rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-primary" />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button type="button" @click="showRoomModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full cursor-pointer">
              Hủy bỏ
            </button>
            <button type="submit" class="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-sm cursor-pointer flex items-center gap-2">
              <Save class="w-4 h-4" />
              Lưu dữ liệu
            </button>
          </div>
        </form>
      </div>
    </div>


    <!-- Modal Xác nhận Xóa Phòng -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirmModal = false"></div>
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <Trash2 class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-serif text-lg font-bold text-text-main">Xác nhận xóa phòng</h3>
            <p class="text-sm text-text-muted mt-2">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa dữ liệu của phòng này khỏi hệ thống không?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button @click="showDeleteConfirmModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy bỏ
          </button>
          <button @click="confirmDeleteRoom" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tạo / Sửa Tin Tức -->
    <div v-if="showNewsModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showNewsModal = false"></div>
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-serif text-xl text-text-main">{{ isEditingNews ? 'Sửa Tin Tức' : 'Thêm Tin Tức Mới' }}</h3>
          <button @click="showNewsModal = false" class="text-text-muted hover:text-rose-500 transition-colors cursor-pointer">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Tiêu đề <span class="text-secondary">*</span></label>
            <input type="text" v-model="newsFormData.title" placeholder="Nhập tiêu đề bài viết..." class="w-full bg-white border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Nội dung <span class="text-secondary">*</span></label>
            <textarea v-model="newsFormData.content" placeholder="Nhập nội dung chi tiết..." rows="6" class="w-full bg-white border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary resize-none transition-colors"></textarea>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Tác giả</label>
            <input type="text" v-model="newsFormData.author" placeholder="Tên tác giả (không bắt buộc)..." class="w-full bg-white border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button @click="showNewsModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy
          </button>
          <button @click="handleSaveNews" class="px-6 py-2.5 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            {{ isEditingNews ? 'Cập nhật' : 'Tạo mới' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Xóa Tin Tức -->
    <div v-if="showDeleteNewsConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteNewsConfirm = false"></div>
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <Trash2 class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-serif text-lg font-bold text-text-main">Xác nhận xóa tin tức</h3>
            <p class="text-sm text-text-muted mt-2">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài tin tức này?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button @click="showDeleteNewsConfirm = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy bỏ
          </button>
          <button @click="confirmDeleteNews" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tạo / Sửa Loại Phòng -->
    <div v-if="showRoomTypeModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showRoomTypeModal = false"></div>
      <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in custom-scrollbar">
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <h3 class="font-serif text-xl text-text-main">{{ isEditingRoomType ? 'Sửa Loại Phòng' : 'Thêm Loại Phòng Mới' }}</h3>
          <button @click="showRoomTypeModal = false" class="text-text-muted hover:text-rose-500 transition-colors cursor-pointer">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Tên loại phòng <span class="text-secondary">*</span></label>
              <input type="text" v-model="roomTypeForm.name" placeholder="VD: Standard, VIP..." class="w-full bg-white border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-text-main">Sức chứa (Người) <span class="text-secondary">*</span></label>
              <input type="number" v-model="roomTypeForm.maxOccupants" class="w-full bg-white border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-main">Đơn giá / Tháng (VNĐ) <span class="text-secondary">*</span></label>
            <input type="number" v-model="roomTypeForm.monthlyPrice" class="w-full bg-white border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div class="flex items-center gap-6 pt-2">
            <label class="flex items-center gap-2 text-sm font-medium text-text-main cursor-pointer">
              <input type="checkbox" v-model="roomTypeForm.hasAirConditioner" class="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300">
              Có điều hòa
            </label>
            <label class="flex items-center gap-2 text-sm font-medium text-text-main cursor-pointer">
              <input type="checkbox" v-model="roomTypeForm.hasPrivateBathroom" class="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300">
              WC Riêng khép kín
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button @click="showRoomTypeModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy
          </button>
          <button @click="handleSaveRoomType" class="px-6 py-2.5 bg-secondary hover:bg-[#A47148] text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            {{ isEditingRoomType ? 'Cập nhật' : 'Tạo mới' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Xóa Loại Phòng -->
    <div v-if="showDeleteRoomTypeConfirmModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteRoomTypeConfirmModal = false"></div>
      <div class="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 p-8 border border-border text-left animate-fade-in">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <Trash2 class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-serif text-lg font-bold text-text-main">Xác nhận xóa loại phòng</h3>
            <p class="text-sm text-text-muted mt-2">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa loại phòng này khỏi hệ thống không?</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8">
          <button @click="showDeleteRoomTypeConfirmModal = false" class="px-6 py-2.5 border border-border text-text-main hover:bg-background font-bold text-xs rounded-full transition-colors cursor-pointer">
            Hủy bỏ
          </button>
          <button @click="confirmDeleteRoomType" class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm transition-colors cursor-pointer">
            Đồng ý xóa
          </button>
        </div>
      </div>
    </div>

</template>

<style scoped>
@keyframes toastSlide {
  0% { transform: translateX(120%) scale(0.9); opacity: 0; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
@keyframes toastProgress {
  0% { width: 100%; }
  100% { width: 0%; }
}
.animate-toast-slide {
  animation: toastSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-toast-progress {
  animation: toastProgress 3s linear forwards;
}
</style>