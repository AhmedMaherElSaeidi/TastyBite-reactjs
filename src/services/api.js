import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store";
import axios from "axios";

const token = () => {
  const token = useAuthStore.getState().token;
  if (!token) return "";

  try {
    const decoded = jwtDecode(token);

    // exp is in seconds → convert to ms
    if (!(decoded.exp * 1000 > Date.now())) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return "";
    }

    return token;
  } catch (e) {
    return "";
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data;
  },

  async register(registerData) {
    const res = await api.post("/api/auth/register", registerData);
    return res.data;
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoryService = {
  async getAll() {
    const res = await api.get("/api/categories");
    return res.data;
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productService = {
  async getAll(params = {}) {
    const res = await api.get("/api/products", { params });
    return res.data;
  },

  // data MUST be a FormData instance so Multer can parse it on the server
  async create(data) {
    const isFormData = data instanceof FormData;
    const res = await api.post("/api/products", data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  // data can be FormData (with new images) or plain object
  async update(id, data) {
    const isFormData = data instanceof FormData;
    const res = await api.put(`/api/products/${id}`, data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  async remove(id) {
    const res = await api.delete(`/api/products/${id}`, {
      headers: { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const orderService = {
  async getMyOrders() {
    return api
      .get("/api/orders/my-orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async getAllOrders() {
    return api
      .get("/api/orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async place(orderData) {
    return api
      .post("/api/orders", orderData, {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async updateStatus(id, status) {
    return api
      .patch(
        `/api/orders/${id}/status`,
        { status },
        {
          headers: { authorization: `Bearer ${token()}` },
        },
      )
      .then((r) => r.data);
  },
};
