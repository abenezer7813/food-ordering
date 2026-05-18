//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_LOCAL|| "http://localhost:4001";

// Helper to get token
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Generic fetch wrapper with auth
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle non-JSON responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

// ============ AUTH ============
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    is_first_login: boolean;
    created_at: string;
    updated_at: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    fetcher<LoginResponse>("/auth/staff/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    fetcher<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    fetcher<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password }),
    }),

changePassword: (new_password: string) =>
  fetcher<{ success: boolean }>("/auth/staff/change-password", {
    method: "PATCH",
    body: JSON.stringify({ new_password }),
  }),
    verifyAdminOtp: (email: string, otp: string) =>
  fetcher<LoginResponse>("/auth/admin/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  }),
  firstTimeChangePassword: (new_password: string) =>
  fetcher<{ success: boolean; message: string }>("/auth/staff/change-password", {
    method: "PATCH",
    body: JSON.stringify({ new_password }),
  }),
};

// ============ LOUNGES ============
export interface Lounge {
  id: string;
  name: string;
  is_active: boolean;
  manager: {
    id: string,
    first_name: string,
    last_name: string
  };
}

export const loungeApi = {
  getAll: () => fetcher<{ lounges: Lounge[] }>("/lounges"),

  getAllAdmin: () => fetcher<{ lounges: Lounge[] }>("/lounges/admin"),

  create: (name: string) =>
    fetcher<{ lounge: Lounge }>("/lounges", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  assignManager: (loungeId: string, managerId: string) =>
    fetcher<{ lounge: Lounge }>(`/lounges/${loungeId}/assign-manager`, {
      method: "PATCH",
      body: JSON.stringify({ manager_id: managerId }),
    }),

  deactivate: (loungeId: string) =>
    fetcher<{ message: string }>(`/lounges/${loungeId}`, {
      method: "PATCH",
    }),
    addNewManager:(data:{first_name:string,last_name:string,email:string,password:string})=>{
      fetcher<{message:string}>(`/lounges/managers`,{
        method:"POST",
        body:JSON.stringify(data)
      
    })
  }
};

// ============ STAFF ============
export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "cashier" | "cook" | "lounge_manager";
  is_active: boolean;
}

export const staffApi = {
  getAll: () => fetcher<{ staff: Staff[] }>("/staff"),
  getAllmanager: () => fetcher<{ managers: Staff[] }>("/staff/managers"),

  

  createStaff: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role:"cashier"|"cook"
  }) =>
    fetcher<{ cook: Staff }>("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deactivate: (staffId: string) =>
    fetcher<{ message: string }>(`/staff/${staffId}/deactivate`, {
      method: "PATCH",
    }),
};

// ============ MENU ============
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  is_available: boolean;
  estimated_preparation_time: number;
}

export const menuApi = {
  getByLounge: () =>
    fetcher<{ menuItems: MenuItem[] }>(`/menu/manage`),

  create: (data: {
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    estimated_preparation_time: number;
  }) =>
    fetcher<{ item: MenuItem }>("/menu", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  toggleAvailability: (itemId: string, isAvailable: boolean) =>
    fetcher<{ item: MenuItem }>(`/menu/${itemId}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ is_available: isAvailable }),
    }),

  update: (
    itemId: string,
    data: {
      name?: string;
      price?: number;
      description?: string;
      estimated_preparation_time?: number;
    }
  ) =>
    fetcher<{ item: MenuItem }>(`/menu/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ============ ORDERS ============
export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  status: "pending" | "preparing" | "ready" | "collected"|"confirmed";
  order_type: "online" | "walk_in";
  total_amount: string;
  estimated_ready_time?: number;
  created_at: string;
  items?: any[];
}

export const orderApi = {
  getAll: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return fetcher<{ orders: Order[] }>(`/order${params}`);
  },

  updateStatus: (orderId: string, status: "preparing" | "ready") =>
    fetcher<{ order: Order }>(`/order/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  markCollected: (orderId: string) =>
    fetcher<{ order: Order }>(`/order/${orderId}/collect`, {
      method: "PATCH",
    }),

  createWalkIn: (data: { items: OrderItem[]; payment_method: string }) =>
    fetcher<{ order: Order }>("/order/walk-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============ REPORTS ============
export interface SalesReport {
  period_type: "daily" | "weekly" | "monthly";
  period_start: string;
  period_end: string;
  total_sales: string;
  total_orders: number;
}

export const reportApi = {
  getSales: (period: "daily" | "weekly" | "monthly", date?: string) => {
    const params = new URLSearchParams({ period });
    if (date) params.append("date", date);
    return fetcher<{ data: SalesReport }>(`/reports?${params}`);
  },
};

// ============ FEEDBACK ============
export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  lounge_id: string;
  order_id:string;
  customer_id: string;
  created_at: string;
}

export const feedbackApi = {
  getAll: () => fetcher<{ feedback: Feedback[] }>("/feedback"),
};

// ============ LEGACY (for backward compatibility) ============
export const api = {
  login: authApi.login,
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getToken,
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};