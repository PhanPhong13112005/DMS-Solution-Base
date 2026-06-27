import { inject, computed, Ref } from 'vue';
import type {
  User,
  Room,
  Building,
  Bed,
  RoomAmenity,
  Invoice,
  MaintenanceRequest,
  BookingApplication,
  TransferRequest,
  NewsArticle,
} from '../types';

/**
 * Type-safe AppData interface - Defined at provide level
 * Ensures all views have consistent, typed access to global data
 */
export interface AppData {
  // State
  isLoading: Ref<boolean>;
  apiError: Ref<string | null>;

  // User & Auth
  user: Ref<User | null>;

  // Room Building Service (N1)
  buildings: Ref<Building[]>;
  rooms: Ref<Room[]>;
  beds: Ref<Bed[]>;
  amenities: Ref<RoomAmenity[]>;

  // Contract & Student Service (N2)
  applications: Ref<BookingApplication[]>;
  transfers: Ref<TransferRequest[]>;

  // Billing & Maintenance Service (N3)
  invoices: Ref<Invoice[]>;
  maintenanceRequests: Ref<MaintenanceRequest[]>;

  // News & Communications
  news: Ref<NewsArticle[]>;
}

/**
 * Type-safe AppActions interface
 */
export interface AppActions {
  // Navigation & Auth
  logout: () => void;
  navigate: (screenName: string) => void;

  // Student Portal
  addMaintenance: (req: MaintenanceRequest) => Promise<void> | void;
  updateMaintenanceStatus: (id: string, status: MaintenanceRequest['status']) => Promise<void> | void;
  payInvoice: (invoiceId: string) => Promise<void> | void;
  addTransfer: (req: TransferRequest) => Promise<void> | void;

  // Admin Portal
  approveApplication: (appId: string) => Promise<void> | void;
  rejectApplication: (appId: string) => Promise<void> | void;
  addNewsArticle: (article: NewsArticle) => Promise<void> | void;
  deleteNewsArticle: (id: string) => Promise<void> | void;

  // Staff Portal
  addInvoice: (invoice: Invoice) => Promise<void> | void;

  // Data Management
  loadData: () => Promise<void>;
}

/**
 * Composable hook để truy cập global app data và actions
 * Type-safe alternative to inject<any>
 *
 * Usage:
 * ```ts
 * const { isLoading, apiError, rooms, actions } = useAppData();
 * // or
 * const appData = useAppData();
 * ```
 */
export const useAppData = () => {
  // Retrieve provided data with type safety fallback
  const appData = inject<AppData | null>('appData');
  const appActions = inject<AppActions | null>('appActions');

  if (!appData) {
    console.warn('⚠️ appData not provided - using empty defaults. Check App.vue provide()');
  }
  if (!appActions) {
    console.warn('⚠️ appActions not provided - using no-op defaults. Check App.vue provide()');
  }

  // ============ STATE COMPUTED ============
  const isLoading = computed(() => appData?.isLoading?.value ?? false);
  const apiError = computed(() => appData?.apiError?.value ?? null);
  const hasError = computed(() => !!apiError.value);

  // ============ USER DATA ============
  const user = computed(() => appData?.user?.value ?? null);

  // ============ ROOM BUILDING DATA (N1) ============
  const buildings = computed(() => appData?.buildings?.value ?? []);
  const rooms = computed(() => appData?.rooms?.value ?? []);
  const beds = computed(() => appData?.beds?.value ?? []);
  const amenities = computed(() => appData?.amenities?.value ?? []);

  // ============ CONTRACT DATA (N2) ============
  const applications = computed(() => appData?.applications?.value ?? []);
  const transfers = computed(() => appData?.transfers?.value ?? []);

  // ============ BILLING DATA (N3) ============
  const invoices = computed(() => appData?.invoices?.value ?? []);
  const maintenanceRequests = computed(() => appData?.maintenanceRequests?.value ?? []);

  // ============ NEWS DATA ============
  const news = computed(() => appData?.news?.value ?? []);

  // ============ DERIVED STATE ============
  const totalInvoiceAmount = computed(() =>
    invoices.value.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  );

  const unpaidInvoices = computed(() =>
    invoices.value.filter((inv) => inv.status === 'Unpaid')
  );

  const pendingRequests = computed(() =>
    maintenanceRequests.value.filter((req) => req.status === 'Pending')
  );

  const pendingApplications = computed(() =>
    applications.value.filter((app) => app.status === 'Pending')
  );

  // ============ ACTIONS WRAPPER ============
  const actions: AppActions = {
    // Navigation & Auth
    logout: () => appActions?.logout?.(),
    navigate: (screenName: string) => appActions?.navigate?.(screenName),

    // Student Portal
    addMaintenance: async (req: MaintenanceRequest) => { await appActions?.addMaintenance?.(req); },
    updateMaintenanceStatus: async (id: string, status: MaintenanceRequest['status']) => {
      await appActions?.updateMaintenanceStatus?.(id, status);
    },
    payInvoice: async (invoiceId: string) => { await appActions?.payInvoice?.(invoiceId); },
    addTransfer: async (req: TransferRequest) => { await appActions?.addTransfer?.(req); },

    // Admin Portal
    approveApplication: async (appId: string) => { await appActions?.approveApplication?.(appId); },
    rejectApplication: async (appId: string) => { await appActions?.rejectApplication?.(appId); },
    addNewsArticle: async (article: NewsArticle) => { await appActions?.addNewsArticle?.(article); },
    deleteNewsArticle: async (id: string) => { await appActions?.deleteNewsArticle?.(id); },

    // Staff Portal
    addInvoice: async (invoice: Invoice) => { await appActions?.addInvoice?.(invoice); },

    // Data Management
    loadData: async () => {
      return appActions?.loadData?.() ?? Promise.resolve();
    },
  };

  return {
    // ============ STATE ============
    isLoading,
    apiError,
    hasError,

    // ============ USER ============
    user,

    // ============ DATA (Room Building - N1) ============
    buildings,
    rooms,
    beds,
    amenities,

    // ============ DATA (Contract - N2) ============
    applications,
    transfers,

    // ============ DATA (Billing - N3) ============
    invoices,
    maintenanceRequests,

    // ============ DATA (News) ============
    news,

    // ============ DERIVED STATE ============
    totalInvoiceAmount,
    unpaidInvoices,
    pendingRequests,
    pendingApplications,

    // ============ ACTIONS ============
    actions,
  };
};

// ============ RE-EXPORT TYPES FOR EXTERNAL USE ============
export type { AppData, AppActions };

export default useAppData;