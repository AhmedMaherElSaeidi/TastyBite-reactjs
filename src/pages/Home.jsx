import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { useCartStore } from "../store";
import toast from "react-hot-toast";
import "./Home.css";
import { categoryService, productService } from "../services/api";

const HERO_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&auto=format&fit=crop",
    cat: "burgers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop",
    cat: "pizza",
  },
  {
    image:
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=1200&auto=format&fit=crop",
    cat: "sushi",
  },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [slide, setSlide] = useState(0);
  const isRTL = i18n.language === "ar";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4000);
    Promise.all([categoryService.getAll(), productService.getAll()]).then(([cats, prods]) => {
      setCategories(cats.data);
      setProducts(prods.data);
      setLoading(false);
    });
    return () => clearInterval(id);
  }, []);
  const featured = products?.slice(0, 6);

  const handleAdd = (product) => {
    addItem(product);
    toast.success(`${product.name[i18n.language]} added to cart! 🛒`);
  };

  return (
    <main className="home-page">
      {/* ── Hero ── */}
      <section className="hero">
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide ${i === slide ? "active" : ""}`}>
            <img src={s.image} alt="" className="hero-bg" />
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1 className="hero-title">
            {t("home.hero_title")
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
          </h1>
          <p className="hero-sub">{t("home.hero_subtitle")}</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary btn-lg">
              {t("home.cta")} <FiArrowRight />
            </Link>
          </div>
          {/* Slide dots */}
          <div className="hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === slide ? "active" : ""}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{t("home.categories")}</h2>
          <div className="categories-grid">
            {categories
              .filter((c) => c.name.en.toLowerCase() !== "all")
              .map((cat) => (
                <button
                  key={cat.name.en}
                  className="category-card"
                  onClick={() => navigate(`/menu?cat=${cat.name.en}`)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{isRTL ? cat.name.ar : cat.name.en}</span>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t("home.featured")}</h2>
            <Link to="/menu" className="section-link">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="products-grid">
            {featured.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-img-wrap">
                  <img
                    src={import.meta.env.VITE_SERVER_URL + product.image}
                    alt={product.name[isRTL ? "ar" : "en"]}
                    className="product-img"
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name[isRTL ? "ar" : "en"]}</h3>
                  <p className="product-desc">{product.description[isRTL ? "ar" : "en"]}</p>
                  <div className="product-footer">
                    <div>
                      <p className="product-price">
                        {t("common.egp")} {product.price}
                      </p>
                      <div className="product-rating">
                        <FiStar size={12} fill="var(--clr-primary)" stroke="none" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(product)}>
                      + {t("menu.add_to_cart")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="section">
        <div className="container">
          <div className="perks-grid">
            {[
              {
                icon: "⚡",
                title: "Fast Delivery",
                titleAr: "توصيل سريع",
                desc: "30-min guaranteed",
                descAr: "30 دقيقة مضمونة",
              },
              {
                icon: "🌿",
                title: "Fresh Ingredients",
                titleAr: "مكونات طازجة",
                desc: "Farm to table quality",
                descAr: "جودة من المزرعة للطاولة",
              },
              {
                icon: "🔒",
                title: "Secure Payments",
                titleAr: "دفع آمن",
                desc: "Encrypted & protected",
                descAr: "مشفر ومحمي",
              },
              {
                icon: "🎧",
                title: "24/7 Support",
                titleAr: "دعم على مدار الساعة",
                desc: "Always here to help",
                descAr: "دائماً هنا للمساعدة",
              },
            ].map((p, i) => (
              <div key={i} className="perk-card">
                <span className="perk-icon">{p.icon}</span>
                <h4 className="perk-title">{isRTL ? p.titleAr : p.title}</h4>
                <p className="perk-desc">{isRTL ? p.descAr : p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
