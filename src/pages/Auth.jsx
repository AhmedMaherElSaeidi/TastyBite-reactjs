import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone } from "react-icons/fi";
import { authService } from "../services/api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";
import "./Auth.css";
import { FaLocationDot } from "react-icons/fa6";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const changeMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      let result;

      if (mode === "login") {
        result = await authService.login(data.email, data.password);
        toast.success(t("auth.login_success"));

        login(result.user, result.token);
        navigate(result.user.role.en === "admin" ? "/admin" : "/menu");
      } else {
        if (data.password !== data.confirm) throw new Error("Password doesn't match");
        result = await authService.register(data);
        toast.success(t("auth.register_success"));
        changeMode("login");
      }
    } catch (err) {
      console.log(err); toast.error(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page page">
      <div className="auth-container">
        <div className="auth-logo">
          <span>🍕</span>
          <span className="auth-logo-text">TastyBite</span>
        </div>

        <div className="card auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => changeMode("login")}
            >
              {t("auth.login")}
            </button>

            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => changeMode("register")}
            >
              {t("auth.register")}
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {mode === "register" && (
              <>
                <div className="form-group">
                  <label className="form-label">{t("auth.fname")}</label>

                  <div className="input-wrap">
                    <FiUser className="input-icon" />

                    <input
                      className="form-input has-icon"
                      placeholder="first Name"
                      {...register("firstName.en", { required: true })}
                    />
                  </div>
                  <div className="input-wrap">
                    <FiUser className="input-icon" />

                    <input
                      className="form-input has-icon"
                      placeholder="الاسم"
                      {...register("firstName.ar", { required: true })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t("auth.lname")}</label>
                  <div className="input-wrap">
                    <FiUser className="input-icon" />

                    <input
                      className="form-input has-icon"
                      placeholder="Last Name"
                      {...register("lastName.en", { required: true })}
                    />
                  </div>
                  <div className="input-wrap">
                    <FiUser className="input-icon" />

                    <input
                      className="form-input has-icon"
                      placeholder="اسم العائلة"
                      {...register("lastName.ar", { required: true })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">{t("auth.email")}</label>

              <div className="input-wrap">
                <FiMail className="input-icon" />

                <input
                  type="email"
                  className="form-input has-icon"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email", { required: true })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("auth.password")}</label>

              <div className="input-wrap">
                <FiLock className="input-icon" />

                <input
                  type={showPw ? "text" : "password"}
                  className="form-input has-icon has-icon-end"
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  {...register("password", { required: true })}
                />

                <button type="button" className="input-icon-end" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">{t("auth.confirm_password")}</label>

                <div className="input-wrap">
                  <FiLock className="input-icon" />

                  <input
                    type={showPw ? "text" : "password"}
                    className="form-input has-icon"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("confirm", { required: true })}
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">{t("auth.phone")}</label>

                <div className="input-wrap">
                  <FiPhone className="input-icon" />

                  <input
                    type="phone"
                    className="form-input has-icon"
                    placeholder="01123889990"
                    autoComplete="phone"
                    {...register("phone", { required: true })}
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">{t("auth.location")}</label>

                <div className="input-wrap">
                  <FaLocationDot className="input-icon" />

                  <input
                    type="text"
                    className="form-input has-icon"
                    placeholder="City, Country"
                    autoComplete="location"
                    {...register("location", { required: true })}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading && <span className="spinner" style={{ width: 18, height: 18 }} />}

              {mode === "login" ? t("auth.login") : t("auth.register")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
