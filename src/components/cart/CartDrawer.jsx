import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FiX, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCartStore, useUIStore } from "../../store";
import "./CartDrawer.css";

const DELIVERY_FEE = 25;

export default function CartDrawer() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  if (!cartOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer">
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">
            <FiShoppingBag size={20} />
            {t("cart.title")}
            {items.length > 0 && (
              <span className="badge badge-primary">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>
          <button className="drawer-close" onClick={() => setCartOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3>{t("cart.empty")}</h3>
              <p>{t("cart.empty_sub")}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigate("/menu");
                  setCartOpen(false);
                }}
              >
                {t("cart.browse")}
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="cart-item">
                  <img
                    src={product.image}
                    alt={product.name[i18n.language]}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{product.name[i18n.language]}</p>
                    <p className="cart-item-price">
                      {t("common.egp")} {product.price}
                    </p>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(product._id)}
                        aria-label={t("cart.remove")}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="cart-item-subtotal">
                    {t("common.egp")} {product.price * quantity}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="drawer-footer">
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
            <Link
              to="/checkout"
              className="btn btn-primary btn-full"
              onClick={() => setCartOpen(false)}
            >
              {t("cart.checkout")} →
            </Link>
            <button className="btn btn-ghost btn-full btn-sm clear-btn" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
