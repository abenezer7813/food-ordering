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
    addNewManager: (data: { first_name: string; last_name: string; email: string; password: string }) =>
    fetcher<{ message: string }>(`/lounges/managers`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
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

export interface MyLounge {
  id: string;
  name: string;
  is_active: boolean;
}

export const staffApi = {
  getAll: (loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ staff: Staff[] }>(`/staff${params}`);
  },
  getAllmanager: () => fetcher<{ managers: Staff[] }>("/staff/managers"),
  getMyLounge: () => fetcher<{ lounge_id: string; lounge_name: string }>("/staff/my-lounge"),
  getMyLounges: () => fetcher<{ lounges: MyLounge[] }>("/staff/my-lounges"),

  createStaff: (
    data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      role: "cashier" | "cook";
    },
    loungeId?: string
  ) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ cook: Staff }>(`/staff${params}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deactivate: (staffId: string, loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ message: string }>(`/staff/${staffId}/deactivate${params}`, {
      method: "PATCH",
    });
  },
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
  category: "food" | "drink" | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "all_day" | null;
  drink_type: "juice" | "coffee" | "tea" | "water" | "soda" | "smoothie" | "other" | null;
}

export const menuApi = {
  getByLounge: (loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ menuItems: MenuItem[] }>(`/menu/manage${params}`);
  },

  create: (data: {
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    estimated_preparation_time: number;
    category?: "food" | "drink";
    meal_type?: "breakfast" | "lunch" | "dinner" | "all_day";
    drink_type?: "juice" | "coffee" | "tea" | "water" | "soda" | "smoothie" | "other";
  }, loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ item: MenuItem }>(`/menu${params}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleAvailability: (itemId: string, isAvailable: boolean, loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ item: MenuItem }>(`/menu/${itemId}/availability${params}`, {
      method: "PATCH",
      body: JSON.stringify({ is_available: isAvailable }),
    });
  },

  update: (
    itemId: string,
    data: {
      name?: string;
      price?: number;
      description?: string;
      estimated_preparation_time?: number;
      category?: "food" | "drink" | null;
      meal_type?: "breakfast" | "lunch" | "dinner" | "all_day" | null;
      drink_type?: "juice" | "coffee" | "tea" | "water" | "soda" | "smoothie" | "other" | null;
    },
    loungeId?: string
  ) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ item: MenuItem }>(`/menu/${itemId}${params}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ============ ORDERS ============
export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  status: "pending" | "preparing" | "ready" | "collected" | "confirmed";
  order_type: "online" | "walk_in";
  total_amount: string;
  estimated_ready_time?: number;
  created_at: string;
  order_items?: {
    id?: string;
    quantity: number;
    unit_price?: string;
    special_instructions?: string;
    menu_item?: {
      id: string;
      name: string;
      price: string;
    };
  }[];
}

export const orderApi = {
  getAll: (status?: string, loungeId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (loungeId) params.append("lounge_id", loungeId);
    const queryString = params.toString();
    return fetcher<{ orders: Order[] }>(`/order${queryString ? `?${queryString}` : ""}`);
  },

  updateStatus: (orderId: string, status: "preparing" | "ready", loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ order: Order }>(`/order/${orderId}/status${params}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  markCollected: (orderId: string, loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ order: Order }>(`/order/${orderId}/collect${params}`, {
      method: "PATCH",
    });
  },

  createWalkIn: (data: { items: OrderItem[]; payment_method: string }, loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ order: Order }>(`/order/walk-in${params}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
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
  getSales: (period: "daily" | "weekly" | "monthly", loungeId?: string, date?: string) => {
    const params = new URLSearchParams({ period });
    if (date) params.append("date", date);
    if (loungeId) params.append("lounge_id", loungeId);
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
  getAll: (loungeId?: string) => {
    const params = loungeId ? `?lounge_id=${loungeId}` : "";
    return fetcher<{ feedback: Feedback[] }>(`/feedback${params}`);
  },
};

// ============ WALLET TOP-UP REQUESTS ============
export interface TopUpRequest {
  id: string;
  customer_id: string;
  lounge_id: string;
  amount: string;
  payment_method: "cash" | "bank_transfer";
  receipt_image_url: string | null;
  status: "pending" | "cashier_approved" | "manager_approved" | "rejected";
  cashier_id: string | null;
  manager_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const walletApi = {
  getTopUpRequests: (loungeId: string) =>
    fetcher<{ requests: TopUpRequest[] }>(`/wallet/${loungeId}/topup-requests`),

  cashierApprove: (loungeId: string, requestId: string) =>
    fetcher<{ request: TopUpRequest }>(`/wallet/${loungeId}/topup-requests/${requestId}/cashier-approve`, {
      method: "PATCH",
    }),

  managerApprove: (loungeId: string, requestId: string) =>
    fetcher<{ message: string }>(`/wallet/${loungeId}/topup-requests/${requestId}/manager-approve`, {
      method: "PATCH",
    }),

  reject: (loungeId: string, requestId: string, rejection_reason: string) =>
    fetcher<{ request: TopUpRequest }>(`/wallet/${loungeId}/topup-requests/${requestId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejection_reason }),
    }),
};


export const api = {
  get: <T>(endpoint: string) => fetcher<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: any) =>
    fetcher<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any) =>
    fetcher<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => fetcher<T>(endpoint, { method: "DELETE" }),
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