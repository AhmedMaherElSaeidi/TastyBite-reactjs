import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store";

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

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    const res = await axios.post("/api/auth/login", { email, password });
    return res.data;
  },

  async register(registerData) {
    const res = await axios.post("/api/auth/register", registerData);
    return res.data;
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoryService = {
  async getAll() {
    const res = await axios.get("/api/categories");
    return res.data;
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productService = {
  async getAll(params = {}) {
    const res = await axios.get("/api/products", { params });
    return res.data;
  },

  // data MUST be a FormData instance so Multer can parse it on the server
  async create(data) {
    const isFormData = data instanceof FormData;
    const res = await axios.post("/api/products", data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  // data can be FormData (with new images) or plain object
  async update(id, data) {    
    const isFormData = data instanceof FormData;
    const res = await axios.put(`/api/products/${id}`, data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(`/api/products/${id}`, {
      headers: { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const orderService = {
  async getMyOrders() {
    return axios
      .get("/api/orders/my-orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async getAllOrders() {
    return axios
      .get("/api/orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async place(orderData) {
    return axios
      .post("/api/orders", orderData, {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async updateStatus(id, status) {
    return axios
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
