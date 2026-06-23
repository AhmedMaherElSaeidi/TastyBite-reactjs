import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
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
    const res = await axios.post(BASE_URL + "/auth/login", { email, password });
    return res.data;
  },

  async register(registerData) {
    const res = await axios.post(BASE_URL + "/auth/register", registerData);
    return res.data;
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoryService = {
  async getAll() {
    const res = await axios.get(BASE_URL + "/categories");
    return res.data;
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productService = {
  async getAll(params = {}) {
    const res = await axios.get(BASE_URL + "/products", { params });
    return res.data;
  },

  // data MUST be a FormData instance so Multer can parse it on the server
  async create(data) {
    const isFormData = data instanceof FormData;
    const res = await axios.post(BASE_URL + "/products", data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  // data can be FormData (with new images) or plain object
  async update(id, data) {
    const isFormData = data instanceof FormData;
    const res = await axios.put(BASE_URL + `/products/${id}`, data, {
      headers: isFormData
        ? { authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" }
        : { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },

  async remove(id) {
    const res = await axios.delete(BASE_URL + `/products/${id}`, {
      headers: { authorization: `Bearer ${token()}` },
    });
    return res.data;
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const orderService = {
  async getMyOrders() {
    return axios
      .get(BASE_URL + "/orders/my-orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async getAllOrders() {
    return axios
      .get(BASE_URL + "/orders", {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async place(orderData) {
    return axios
      .post(BASE_URL + "/orders", orderData, {
        headers: { authorization: `Bearer ${token()}` },
      })
      .then((r) => r.data);
  },

  async updateStatus(id, status) {
    return axios
      .patch(
        BASE_URL + `/orders/${id}/status`,
        { status },
        {
          headers: { authorization: `Bearer ${token()}` },
        },
      )
      .then((r) => r.data);
  },
};
