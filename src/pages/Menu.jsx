import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoryService, productService } from "../services/api";
import { FiSearch, FiStar } from "react-icons/fi";
import { useCartStore } from "../store";
import toast from "react-hot-toast";
import "./Menu.css";

export default function Menu() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const isRTL = i18n.language === "ar";
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(searchParams?.get("cat") || "all");
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([categoryService.getAll(), productService.getAll()]).then(([cats, prods]) => {
      setCategories(cats.data);
      setProducts(prods.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat.toLowerCase());
  }, [searchParams]);

  const filtered = useMemo(() => {
    return products?.filter((p) => {
      const matchCat = activeCat === "all" || p.category.name.en.toLowerCase() === activeCat;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.en.toLowerCase().includes(q) ||
        p.name.ar.includes(q) ||
        p.description.en.toLowerCase().includes(q) ||
        p.description.ar.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, search, activeCat]);

  const handleAdd = (product) => {
    addItem(product);
    setAddedIds((prev) => new Set([...prev, product._id]));
    toast.success(`${product.name[i18n.language]} ${t("menu.added")} 🛒`);
    setTimeout(
      () =>
        setAddedIds((prev) => {
          const s = new Set(prev);
          s.delete(product.id);
          return s;
        }),
      1500,
    );
  };

  const handleCat = (id) => {
    setActiveCat(id);
    setSearchParams(id !== "all" ? { cat: id } : {});
  };

  return (
    <main className="page menu-page">
      <div className="container">
        {/* Header */}
        <div className="menu-header">
          <h1 className="menu-title">{t("menu.title")}</h1>

          {/* Search */}
          <div className="search-wrap">
            <FiSearch className="search-icon" size={18} />
            <input
              className="form-input search-input"
              placeholder={t("menu.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="cat-tabs">
          {categories?.map((cat) => (
            <button
              key={cat._id}
              className={`cat-tab ${activeCat === cat.name.en.toLowerCase() ? "active" : ""}`}
              onClick={() => handleCat(cat.name.en)}
            >
              <span>{cat.icon}</span>
              <span>{isRTL ? cat.name.ar : cat.name.en}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="results-count">
          {filtered.length} {filtered.length === 1 ? "dish" : "dishes"} found
        </p>

        {loading && <div className="empty-state">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>}

        {/* Grid */}
        {!loading && filtered.length === 0 &&
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>{t("menu.no_results")}</h3>

          </div>
        }{!loading && filtered.length !== 0 &&
          <div className="menu-grid">
            {filtered.map((product) => (
              <div key={product._id} className="menu-card">
                <div className="menu-img-wrap">
                  <img
                    src={product.image}
                    alt={product.name[isRTL ? "ar" : "en"]}
                    className="menu-img"
                    loading="lazy"
                  />
                </div>
                <div className="menu-info">
                  <div className="menu-top">
                    <h3 className="menu-name">{product.name[isRTL ? "ar" : "en"]}</h3>
                    <div className="menu-rating">
                      <FiStar size={12} fill="var(--clr-primary)" stroke="none" />
                      <span className="review-count">{product.rating}</span>
                    </div>
                  </div>
                  <p className="menu-desc">{product.description[isRTL ? "ar" : "en"]}</p>
                  <div className="menu-footer">
                    <span className="menu-price">
                      {t("common.egp")} {product.price}
                    </span>
                    <button
                      className={`btn ${addedIds.has(product._id) ? "btn-outline" : "btn-primary"} btn-sm add-btn`}
                      onClick={() => handleAdd(product)}
                    >
                      {addedIds.has(product._id)
                        ? `✓ ${t("menu.added")}`
                        : `+ ${t("menu.add_to_cart")}`}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </main>
  );
}
