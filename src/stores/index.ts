import { create } from "zustand";
import { api } from "../api";
import type {
  CompanyProfile,
  Product,
  Party,
  Invoice,
  ShipmentRecord,
  Route,
  ProfitTarget,
  DashboardStats,
} from "../types";

interface AuthStore {
  userId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUserId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkExistingAccount: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  isLoggedIn: false,
  isLoading: false,
  setUserId: (id) => set({ userId: id, isLoggedIn: !!id }),
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const id = await api.login(email, password);
      set({ userId: id, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },
  signup: async (email, password) => {
    set({ isLoading: true });
    try {
      const id = await api.signup(email, password);
      set({ userId: id, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => set({ userId: null, isLoggedIn: false }),
  checkExistingAccount: async () => {
    try {
      return await api.hasAccount();
    } catch {
      return false;
    }
  },
}));

interface ProfileStore {
  profile: CompanyProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  saveProfile: (profile: CompanyProfile) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await api.getCompanyProfile();
      set({ profile });
    } catch {
      set({ profile: null });
    } finally {
      set({ isLoading: false });
    }
  },
  saveProfile: async (profile) => {
    set({ isLoading: true });
    try {
      await api.saveCompanyProfile(profile);
      set({ profile });
    } finally {
      set({ isLoading: false });
    }
  },
}));

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<string>;
  editProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await api.getProducts();
      set({ products });
    } finally {
      set({ isLoading: false });
    }
  },
  addProduct: async (product) => {
    const id = await api.createProduct(product);
    await get().fetchProducts();
    return id;
  },
  editProduct: async (product) => {
    await api.updateProduct(product);
    await get().fetchProducts();
  },
  removeProduct: async (id) => {
    await api.deleteProduct(id);
    await get().fetchProducts();
  },
}));

interface PartyStore {
  parties: Party[];
  isLoading: boolean;
  fetchParties: (type?: string) => Promise<void>;
  addParty: (party: Party) => Promise<string>;
  editParty: (party: Party) => Promise<void>;
  removeParty: (id: string) => Promise<void>;
}

export const usePartyStore = create<PartyStore>((set, get) => ({
  parties: [],
  isLoading: false,
  fetchParties: async (type) => {
    set({ isLoading: true });
    try {
      const parties = await api.getParties(type);
      set({ parties });
    } finally {
      set({ isLoading: false });
    }
  },
  addParty: async (party) => {
    const id = await api.createParty(party);
    await get().fetchParties();
    return id;
  },
  editParty: async (party) => {
    await api.updateParty(party);
    await get().fetchParties();
  },
  removeParty: async (id) => {
    await api.deleteParty(id);
    await get().fetchParties();
  },
}));

interface InvoiceStore {
  invoices: Invoice[];
  isLoading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (
    invoice: Invoice,
    items: import("../types").InvoiceItem[]
  ) => Promise<string>;
  updateStatus: (id: string, status: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  isLoading: false,
  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const invoices = await api.getInvoices();
      set({ invoices });
    } finally {
      set({ isLoading: false });
    }
  },
  addInvoice: async (invoice, items) => {
    const id = await api.createInvoice(invoice, items);
    await get().fetchInvoices();
    return id;
  },
  updateStatus: async (id, status) => {
    await api.updateInvoiceStatus(id, status);
    await get().fetchInvoices();
  },
}));

interface ShipmentStore {
  records: ShipmentRecord[];
  isLoading: boolean;
  fetchRecords: () => Promise<void>;
  saveRecord: (record: ShipmentRecord) => Promise<string>;
  removeRecord: (id: string) => Promise<void>;
}

export const useShipmentStore = create<ShipmentStore>((set, get) => ({
  records: [],
  isLoading: false,
  fetchRecords: async () => {
    set({ isLoading: true });
    try {
      const records = await api.getShipmentRecords();
      set({ records });
    } finally {
      set({ isLoading: false });
    }
  },
  saveRecord: async (record) => {
    const id = await api.saveShipmentRecord(record);
    await get().fetchRecords();
    return id;
  },
  removeRecord: async (id) => {
    await api.deleteShipmentRecord(id);
    await get().fetchRecords();
  },
}));

interface RouteStore {
  routes: Route[];
  isLoading: boolean;
  fetchRoutes: () => Promise<void>;
  saveRoute: (route: Route) => Promise<string>;
  removeRoute: (id: string) => Promise<void>;
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  routes: [],
  isLoading: false,
  fetchRoutes: async () => {
    set({ isLoading: true });
    try {
      const routes = await api.getRoutes();
      set({ routes });
    } finally {
      set({ isLoading: false });
    }
  },
  saveRoute: async (route) => {
    const id = await api.saveRoute(route);
    await get().fetchRoutes();
    return id;
  },
  removeRoute: async (id) => {
    await api.deleteRoute(id);
    await get().fetchRoutes();
  },
}));

interface ProfitTargetStore {
  targets: ProfitTarget[];
  isLoading: boolean;
  fetchTargets: () => Promise<void>;
  saveTarget: (target: ProfitTarget) => Promise<string>;
}

export const useProfitTargetStore = create<ProfitTargetStore>((set, get) => ({
  targets: [],
  isLoading: false,
  fetchTargets: async () => {
    set({ isLoading: true });
    try {
      const targets = await api.getProfitTargets();
      set({ targets });
    } finally {
      set({ isLoading: false });
    }
  },
  saveTarget: async (target) => {
    const id = await api.saveProfitTarget(target);
    await get().fetchTargets();
    return id;
  },
}));

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await api.getDashboardStats();
      set({ stats });
    } finally {
      set({ isLoading: false });
    }
  },
}));

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
