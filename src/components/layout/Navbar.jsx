import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiGrid } from "react-icons/fi";
import { useAuthStore, useCartStore, useUIStore } from "../../store";
import toast from "react-hot-toast";
import "./Navbar.css";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isRTL = i18n.language === "ar";

  const switchLang = () => {
    const next = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    toast.success(t("auth.logout_success"));
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍕</span>
          <span className="logo-text">TastyBite</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/menu" className={`nav-link me-2 ${isActive("/menu") ? "active" : ""}`}>
            {t("nav.menu")}
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className={`nav-link me-2 ${isActive("/orders") ? "active" : ""}`}>
              {t("nav.orders")}
            </Link>
          )}
          {user?.role.en === "admin" && (
            <Link
              to="/admin"
              className={`nav-link nav-link-admin me-2 ${isActive("/admin") ? "active" : ""}`}
            >
              <FiGrid size={14} />
              {t("nav.admin")}
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {/* Language toggle */}
          <button className="lang-btn" onClick={switchLang} title="Switch language">
            {isRTL ? "EN" : "Ar"}
          </button>

          {/* Cart */}
          <button className="cart-btn" onClick={toggleCart} aria-label={t("nav.cart")}>
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen((v) => !v)}>
                <div className="user-avatar">
                  <FiUser size={15} />
                </div>
                <span className="user-name">{user?.firstName[isRTL ? "ar" : "en"]}</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiPackage size={15} /> {t("nav.orders")}
                  </Link>
                  {user?.role.en === "admin" && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiGrid size={15} /> {t("nav.admin")}
                    </Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <FiLogOut size={15} /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <FiUser size={15} /> {t("nav.login")}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/menu" className="mobile-link" onClick={() => setMobileOpen(false)}>
            {t("nav.menu")}
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>
              {t("nav.orders")}
            </Link>
          )}
          {user?.role.en === "admin" && (
            <Link to="/admin" className="mobile-link" onClick={() => setMobileOpen(false)}>
              {t("nav.admin")}
            </Link>
          )}
          <div className="mobile-divider" />
          <button
            className="mobile-link"
            onClick={() => {
              switchLang();
              setMobileOpen(false);
            }}
          >
            {isRTL ? "🇬🇧 English" : "🇸🇦 العربية"}
          </button>
          {isAuthenticated ? (
            <button className="mobile-link mobile-link-danger" onClick={handleLogout}>
              {t("nav.logout")}
            </button>
          ) : (
            <Link to="/login" className="mobile-link" onClick={() => setMobileOpen(false)}>
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
