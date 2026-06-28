import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { productService, orderService, categoryService } from "../services/api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";
import "./Admin.css";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const EMPTY_PRODUCT = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  category: "burgers",
  image: "",
  available: true,
};

export default function Admin() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const isRTL = i18n.language === "ar";

  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role.en !== "admin") {
      navigate("/");
      return;
    }
    Promise.all([
      productService.getAll(),
      orderService.getAllOrders(),
      categoryService.getAll(),
    ]).then(([prods, ords, cats]) => {
      setProducts(prods.data);
      setOrders(ords.data);
      setCategories(cats.data.filter((c) => c.name.en.toLowerCase() !== "all"));
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    if (modal === "edit" && editProduct) {
      setValue("name", editProduct.name || "");
      setValue("description", editProduct.description || "");
      setValue("price", editProduct.price || "");
      setValue("category", editProduct.category._id || "");
      setValue("rating", editProduct.rating || "");
      setValue("available", editProduct.available ?? true);
    }

    if (modal === "add") {
      reset();
    }
  }, [modal, editProduct]);

  const stats = {
    totalOrders: orders.length,
    revenue: orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => o.status === "pending").length,
    products: products.length,
  };

  // Product CRUD
  const openAdd = () => {
    setEditProduct(EMPTY_PRODUCT);
    setModal("add");
  };
  const openEdit = (p) => {
    setEditProduct({ ...p, price: String(p.price) });
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditProduct(EMPTY_PRODUCT);
  };

  const handleSave = async (data) => {
    let formData = { ...data };
    setSaving((prev) => true);

    if (typeof data.image != "string" && data.image[0]) {
      formData = new FormData();
      formData.append("name", JSON.stringify({ en: data.name.en, ar: data.name.ar }));
      formData.append(
        "description",
        JSON.stringify({ en: data.description.en, ar: data.description.ar }),
      );
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("rating", data.rating);
      formData.append("available", data.available);
      formData.append("image", data.image[0]);
    }
    delete data.image;

    try {
      if (modal === "add") {
        await productService.create(formData);
      } else {
        await productService.update(editProduct._id, formData);
      }

      setSaving((prev) => false);
      closeModal();
      toast.success(modal === "add" ? "Product added!" : "Product updated!");
    } finally {
      setRefresh(!refresh);
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await productService.remove(id);
    setProducts((p) => p.filter((x) => x._id !== id));
    setConfirmDelete(null);
    toast.success("Product deleted.");
  };

  // Order status
  const handleStatusChange = async (id, status) => {
    const updated = await orderService.updateStatus(id, status);
    setOrders((o) => o.map((x) => (x._id === id ? updated : x)));
    toast.success("Order status updated!");
    setRefresh(!refresh);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o?._id?.includes(orderSearch) ||
      o?.user?.email?.includes(orderSearch) ||
      o?.status?.includes(orderSearch) ||
      o?.phone?.includes(orderSearch) ||
      o?.name?.includes(orderSearch) ||
      o?.address?.includes(orderSearch),
  );

  const STATUS_BADGE = {
    pending: "badge-warning",
    confirmed: "badge-info",
    preparing: "badge-info",
    out_for_delivery: "badge-primary",
    delivered: "badge-success",
    cancelled: "badge-error",
  };

  if (loading)
    return (
      <main className="page">
        <div
          className="container"
          style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}
        >
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </main>
    );

  return (
    <main className="page admin-page">
      <div className="container">
        <h1 className="admin-title">{t("admin.dashboard")}</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: "overview", label: t("admin.overview"), icon: <FiGrid /> },
            { id: "products", label: t("admin.products"), icon: <FiShoppingBag /> },
            { id: "orders", label: t("admin.orders"), icon: <FiPackage /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${tab.id === tab.id ? "" : ""}`}
              onClick={() => setTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Nav override — simple approach */}
        <div className="admin-tab-bar">
          {["overview", "products", "orders"].map((id) => (
            <button
              key={id}
              className={`a-tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {id === "overview" ? (
                <>
                  <FiGrid /> {t("admin.overview")}
                </>
              ) : id === "products" ? (
                <>
                  <FiShoppingBag /> {t("admin.products")}
                </>
              ) : (
                <>
                  <FiPackage /> {t("admin.orders")}
                </>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="overview-section">
            <div className="stats-grid">
              {[
                {
                  label: t("admin.total_orders"),
                  value: stats.totalOrders,
                  icon: "📦",
                  color: "var(--clr-info)",
                },
                {
                  label: t("admin.total_revenue"),
                  value: `${t("common.egp")} ${stats.revenue}`,
                  icon: "💰",
                  color: "var(--clr-success)",
                },
                {
                  label: t("admin.pending_orders"),
                  value: stats.pending,
                  icon: "⏳",
                  color: "var(--clr-warning)",
                },
                {
                  label: t("admin.total_products"),
                  value: stats.products,
                  icon: "🍽️",
                  color: "var(--clr-primary)",
                },
              ].map((s, i) => (
                <div key={i} className="stat-card card">
                  <div className="stat-icon" style={{ background: s.color + "22", color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="stat-value">{s.value}</p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="section-2-title">{t("admin.today")}</h2>
            <div className="recent-orders">
              {orders.slice(0, 5).map((o) => (
                <div key={o._id} className="recent-order-row">
                  <div className="ro-id d-flex flex-column">
                    <span>{o.user?.email}</span>
                    <span>#{o._id}</span>
                  </div>

                  <div className={`ro-status badge ${STATUS_BADGE[o.status]}`}>
                    {t(`orders.statuses.${o.status}`)}
                  </div>

                  <div className="ro-total">
                    {t("common.egp")} {o.total}
                  </div>

                  <div className="ro-actions">
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t(`orders.statuses.${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div className="products-section">
            <div className="section-bar">
              <h2 className="section-2-title">{t("admin.products")}</h2>
              <button className="btn btn-primary btn-sm" onClick={openAdd}>
                <FiPlus /> {t("admin.add_product")}
              </button>
            </div>

            <div className="admin-products-grid">
              {products?.map((p) => (
                <div key={p._id} className="admin-product-card card">
                  <img
                    src={p.image}
                    alt={p.name.en}
                    className="admin-product-img"
                  />
                  <div className="admin-product-info">
                    <p className="admin-product-name">{p.name[isRTL ? "ar" : "en"]}</p>
                    <p className="admin-product-cat badge badge-primary">
                      {p.category.name[isRTL ? "ar" : "en"]}
                    </p>
                    <p className="admin-product-price">
                      {t("common.egp")} {p.price}
                    </p>
                  </div>
                  <div className="admin-product-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDelete(p._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="orders-section">
            <div className="section-bar">
              <h2 className="section-2-title">{t("admin.orders")}</h2>
              <div className="search-wrap" style={{ maxWidth: 280, flex: 1 }}>
                <FiSearch className="search-icon" size={16} />
                <input
                  className="form-input search-input"
                  placeholder={t("admin.search_orders")}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="orders-table-wrap card">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o._id}>
                      <td className="td-id">
                        <span className="d-block">Name: {o.name}</span>
                        <span className="d-block">Location: {o.address}</span>
                        <span className="d-block">Tel: {o.phone}</span>
                        <span className="d-block">ID: {o._id}</span>
                        <span className="d-block">Email: {o.user?.email}</span>
                      </td>
                      <td>
                        {o.items.reduce((cumm, curr) => {
                          return (cumm += curr.quantity);
                        }, 0)}
                        item
                        {(o.items.length === 1 ? o.items.length : o.items[0].quantity) > 1
                          ? "s"
                          : ""}
                      </td>
                      <td className="td-total">
                        {t("common.egp")} {o.total}
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {o.paymentMethod === "cod" ? "COD" : "Online"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status]}`}>
                          {t(`orders.statuses.${o.status}`)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {t(`orders.statuses.${s}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? t("admin.add_product") : t("admin.edit_product")}</h2>

              <button className="drawer-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit(handleSave)}>
              {/* NAME EN */}
              <div className="form-group">
                <label className="form-label">{t("admin.product_name")} (EN)</label>

                <input
                  className="form-input"
                  {...register("name.en", { required: "English name can't be empty" })}
                />
                {errors.name?.en && <p>{errors.name.en.message}</p>}
              </div>

              {/* NAME AR */}
              <div className="form-group">
                <label className="form-label">اسم المنتج (Ar)</label>

                <input
                  className="form-input"
                  dir="rtl"
                  {...register("name.ar", { required: "Arabic name can't be empty" })}
                />
                {errors.name?.ar && <p>{errors.name.ar.message}</p>}
              </div>

              {/* DESCRIPTION EN */}
              <div className="form-group">
                <label className="form-label">{t("admin.description")} (EN)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  {...register("description.en", {
                    required: "English description can't be empty",
                  })}
                />
                {errors.description?.en && <p>{errors.description.en.message}</p>}
              </div>

              {/* DESCRIPTION EN */}
              <div className="form-group">
                <label className="form-label">الوصف (Ar)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  {...register("description.ar", {
                    required: "Arabic description can't be empty",
                  })}
                />
                {errors.description?.ar && <p>{errors.description.ar.message}</p>}
              </div>

              {/* PRICE + CATEGORY */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t("admin.price")}</label>

                  <input
                    type="number"
                    className="form-input"
                    {...register("price", {
                      valueAsNumber: true,
                      required: "Price can't be empty",
                    })}
                  />
                  {errors.price && <p>{errors.price.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">{t("admin.category")}</label>

                  <select className="form-input" {...register("category")}>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name[isRTL ? "ar" : "en"]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue="0"
                  className="form-input"
                  {...register("rating", {
                    valueAsNumber: true,
                    step: 0.1,
                    min: 0,
                    max: 5,
                  })}
                />

                {errors.rating && <p>{errors.rating.message}</p>}
              </div>
              {/* IMAGE */}
              <div className="form-group">
                <label className="form-label">{t("admin.image_url")}</label>

                <input
                  type="file"
                  className="form-input"
                  {...register("image", {
                    required: modal === "add" ? "Provide product image" : false,
                  })}
                />
                {errors.image && <p>{errors.image.message}</p>}
              </div>

              {/* AVAILABLE */}
              <label className="available-toggle">
                <input type="checkbox" {...register("available")} />
                {t("admin.available")}
              </label>

              {/* FOOTER */}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  {t("common.cancel")}
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}

                  {t("admin.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "var(--sp-lg)" }}>⚠️ {t("admin.confirm_delete")}</h3>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>
                {t("common.cancel")}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
