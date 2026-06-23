import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPackage, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { orderService } from "../services/api";
import { useAuthStore } from "../store";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

const STATUS_STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

const STATUS_ICONS = {
  pending: "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  out_for_delivery: "🛵",
  delivered: "🎉",
  cancelled: "❌",
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const isRTL = i18n.language === "ar";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(searchParams.get("new") || null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    orderService.getMyOrders().then((data) => {
      setOrders(data.data);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const toggle = (id) => setExpanded((v) => (v === id ? null : id));

  const stepIndex = (status) => STATUS_STEPS.indexOf(status);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(isRTL ? "ar-EG" : "en-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
    <main className="page orders-page">
      <div className="container">
        <h1 className="orders-title">
          <FiPackage /> {t("orders.title")}
        </h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>{t("orders.empty")}</h3>
            <p>{t("orders.empty_sub")}</p>
            <button className="btn btn-primary" onClick={() => navigate("/menu")}>
              {t("cart.browse")}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isOpen = expanded === order._id;
              const isCancelled = order.status === "cancelled";
              const sIdx = isCancelled ? -1 : stepIndex(order.status);

              return (
                <div key={order._id} className={`order-card card ${isOpen ? "open" : ""}`}>
                  {/* Order header */}
                  <button className="order-header" onClick={() => toggle(order._id)}>
                    <div className="order-header-left">
                      <span className="order-id">{t("orders.order_id", { id: order._id })}</span>
                      <span
                        className={`badge ${isCancelled ? "badge-error" : order.status === "delivered" ? "badge-success" : "badge-warning"}`}
                      >
                        {STATUS_ICONS[order.status]} {t(`orders.statuses.${order.status}`)}
                      </span>
                    </div>
                    <div className="order-header-right">
                      <span className="order-total">
                        {t("common.egp")} {order.total}
                      </span>
                      <span className="order-date">{fmtDate(order.createdAt)}</span>
                      {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="order-body">
                      {/* Tracking */}
                      {!isCancelled && (
                        <div className="tracking-section">
                          <h3 className="section-sm-title">{t("orders.track")}</h3>
                          <div className="tracker-steps">
                            {STATUS_STEPS.map((step, i) => (
                              <div
                                key={step}
                                className={`tracker-step ${i < sIdx ? "done" : i === sIdx ? "active" : ""}`}
                              >
                                <div className="tracker-dot">{i < sIdx ? "✓" : i + 1}</div>
                                <p className="tracker-label">{t(`orders.statuses.${step}`)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="order-items-section">
                        <h3 className="section-sm-title">Items</h3>
                        <ul className="order-items-list">
                          {order.items.map(({ product, quantity }) => (
                            <li key={product._id} className="order-item">
                              <img
                                src={import.meta.env.VITE_SERVER_URL + product.image}
                                alt={product.name[isRTL ? "ar" : "en"]}
                                className="order-item-img"
                              />
                              <span className="order-item-name">
                                {product.name[isRTL ? "ar" : "en"]}
                              </span>
                              <span className="order-item-qty">× {quantity}</span>
                              <span className="order-item-price">
                                {t("common.egp")} {product.price * quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Meta */}
                      <div className="order-meta">
                        <div className="meta-item">
                          <span className="meta-label">📍 {t("checkout.address")}</span>
                          <span className="meta-value">{order.address}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">💳 {t("checkout.payment_method")}</span>
                          <span className="meta-value">
                            {order.paymentMethod === "cod"
                              ? t("checkout.cod")
                              : t("checkout.online")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
