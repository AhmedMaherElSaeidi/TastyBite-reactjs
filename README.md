# 🍕 TastyBite — Online Food Ordering App

A full-featured food ordering frontend built with **React + Vite**, designed for the ElectroPi hiring task.

## ✅ Features Implemented

| Feature                                 | Status |
| --------------------------------------- | ------ |
| Full menu with images & prices          | ✅     |
| Category filter + search                | ✅     |
| Add to cart / cart drawer               | ✅     |
| User authentication (login/register)    | ✅     |
| Admin dashboard                         | ✅     |
| Product CRUD (admin)                    | ✅     |
| Order management (admin)                | ✅     |
| Payment: Online card + Cash on Delivery | ✅     |
| Order status tracking with stepper      | ✅     |
| Multi-language: Arabic 🇸🇦 + English 🇬🇧  | ✅     |
| RTL support for Arabic                  | ✅     |
| Responsive / mobile friendly            | ✅     |
| Toast notifications                     | ✅     |
| Persistent cart & auth (localStorage)   | ✅     |

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔌 Connecting Your Backend

All API calls live in **`src/services/api.js`**.

Set your backend URL in `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar
│   └── cart/         # Cart drawer
├── pages/
│   ├── Home.jsx      # Landing page
│   ├── Menu.jsx      # Menu + filter
│   ├── Checkout.jsx  # Checkout form + payment
│   ├── Orders.jsx    # Order history + tracker
│   ├── Auth.jsx      # Login / Register
│   └── Admin.jsx     # Admin dashboard
├── store/            # Zustand (auth, cart, ui)
├── services/api.js   # All API calls (mock → real)
└── i18n/             # EN + AR translations
```

## 🌐 Language Toggle

Click the **عر / EN** button in the navbar to switch between Arabic (RTL) and English (LTR). The font automatically switches to **Cairo** for Arabic.

## 🛠️ Tech Stack

- React 18 + Vite
- React Router v6
- Zustand (state management)
- react-i18next (AR/EN)
- Axios (HTTP client)
- react-hot-toast
- react-icons
