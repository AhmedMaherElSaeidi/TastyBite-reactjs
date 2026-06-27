import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCreditCard, FiTruck, FiCheck } from "react-icons/fi";
import { useCartStore, useAuthStore } from "../store";
import { orderService } from "../services/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import "./Checkout.css";

const DELIVERY_FEE = 25;

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, token, isAuthenticated } = useAuthStore();
  const isRTL = i18n.language === "ar";
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: token ? user?.firstName[i18n.language] + " " + user?.lastName[i18n.language] : "",
      phone: user?.phone || "",
      address: user?.location || "",
      notes: "",
      payment: "cod",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const payment = watch("payment");

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!token) {
      toast.error("You need to login first");
      return;
    }

    setLoading(true);
    const submitData = {
      ...data,
      items: items.map((i) => ({
        id: i.product._id,
        price: i.product.price,
        quantity: i.quantity,
      })),
    };
    delete submitData.expiry;
    delete submitData.cvv;
    delete submitData.cardNumber;

    try {
      const order = await orderService.place(submitData);

      clearCart();

      toast.success("Order placed successfully! 🎉");

      navigate(`/orders?new=${order.id}`);
    } catch {
      toast.error("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const formatCard = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  if (items.length === 0) {
    return (
      <main className="page">
        <div className="container empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>{t("cart.empty")}</h3>
          <button className="btn btn-primary" onClick={() => navigate("/menu")}>
            {t("cart.browse")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page checkout-page">
      <div className="container">
        <h1 className="checkout-title">{t("checkout.title")}</h1>

        <form className="checkout-layout" onSubmit={handleSubmit(onSubmit)}>
          {/* Left – Form */}
          <div className="checkout-form-col">
            {/* Delivery Info */}
            <div className="card checkout-card">
              <h2 className="card-section-title">
                <FiTruck /> {t("checkout.delivery_info")}
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t("checkout.name")}</label>
                  <input
                    className="form-input"
                    placeholder="e.g. John Smith"
                    {...register("name", {
                      required: "Name is required",
                    })}
                  />

                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">{t("checkout.phone")}</label>
                  <input
                    className="form-input"
                    placeholder="+20 1xx xxx xxxx"
                    {...register("phone", {
                      required: "Phone is required",
                    })}
                  />

                  {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                </div>
                <div className="form-group span-2">
                  <label className="form-label">{t("checkout.address")}</label>
                  <input
                    className="form-input"
                    placeholder="Street, Building, City"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />

                  {errors.address && <p className="form-error">{errors.address.message}</p>}
                </div>
                <div className="form-group span-2">
                  <label className="form-label">{t("checkout.notes")}</label>
                  <textarea rows={2} className="form-input" {...register("notes")} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card checkout-card">
              <h2 className="card-section-title">
                <FiCreditCard /> {t("checkout.payment_method")}
              </h2>
              <div className="payment-options">
                <label className={`payment-option ${payment === "online" ? "selected" : ""}`}>
                  <input type="radio" value="online" {...register("payment")} />
                  <span className="payment-icon">💳</span>
                  <div>
                    <p className="payment-label">{t("checkout.online")}</p>
                    <p className="payment-sub">Visa, Mastercard, Meeza</p>
                  </div>
                </label>
                <label className={`payment-option ${payment === "cod" ? "selected" : ""}`}>
                  <input type="radio" value="cod" {...register("payment")} />
                  <span className="payment-icon">💵</span>
                  <div>
                    <p className="payment-label">{t("checkout.cod")}</p>
                    <p className="payment-sub">Pay when you receive</p>
                  </div>
                </label>
              </div>

              {payment === "online" && (
                <div className="card-fields form-grid">
                  <div className="form-group span-2">
                    <label className="form-label">{t("checkout.card_number")}</label>
                    <input
                      className="form-input"
                      placeholder="1234 5678 9012 3456"
                      {...register("cardNumber", {
                        validate: (value) =>
                          payment !== "online" ||
                          value.replace(/\s/g, "").length === 16 ||
                          "Enter a valid card number",
                        onChange: (e) => {
                          e.target.value = formatCard(e.target.value);
                        },
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("checkout.expiry")}</label>
                    <input
                      className="form-input"
                      placeholder="MM/YY"
                      {...register("expiry", {
                        validate: (value) =>
                          payment !== "online" || /^\d{2}\/\d{2}$/.test(value) || "Use MM/YY",
                        onChange: (e) => {
                          e.target.value = formatExpiry(e.target.value);
                        },
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("checkout.cvv")}</label>
                    <input
                      className="form-input"
                      placeholder="123"
                      {...register("cvv", {
                        validate: (value) =>
                          payment !== "online" || value.length === 3 || "Invalid CVV",
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
                        },
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right – Summary */}
          <div className="checkout-summary-col">
            <div className="card checkout-card sticky-summary">
              <h2 className="card-section-title">{t("checkout.order_summary")}</h2>
              <ul className="summary-items">
                {items.map(({ product, quantity }) => (
                  <li key={product._id} className="summary-item">
                    <img
                      src={import.meta.env.VITE_SERVER_URL + product.image}
                      alt={product.name[i18n.language]}
                      className="summary-img"
                    />
                    <div className="summary-item-info">
                      <p className="summary-item-name">{product.name[i18n.language]}</p>
                      <p className="summary-item-qty">× {quantity}</p>
                    </div>
                    <p className="summary-item-total">
                      {t("common.egp")} {product.price * quantity}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="summary-totals">
                <div className="price-row">
                  <span>{t("cart.subtotal")}</span>
                  <span>
                    {t("common.egp")} {subtotal}
                  </span>
                </div>
                <div className="price-row">
                  <span>{t("cart.delivery")}</span>
                  <span>
                    {t("common.egp")} {DELIVERY_FEE}
                  </span>
                </div>
                <div className="price-row price-total">
                  <span>{t("cart.total")}</span>
                  <span>
                    {t("common.egp")} {total}
                  </span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18 }} /> Placing order…
                  </>
                ) : (
                  <>
                    <FiCheck /> {t("checkout.place_order")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
