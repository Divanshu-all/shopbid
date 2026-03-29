# 🛍️ ShopBid — Hyperlocal Auction Marketplace

A MERN stack web app where shopkeepers list products via live 24-hour auctions. Buyers bid in real-time and the winner collects in-store using a QR Order ID.

---

## ⚡ Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React 18 + Vite + TailwindCSS             |
| Backend    | Node.js + Express                         |
| Database   | MongoDB + Mongoose                        |
| Realtime   | Socket.io                                 |
| Images     | Cloudinary                                |
| Auth       | JWT + bcrypt                              |
| QR Codes   | qrcode npm                                |
| Email      | Nodemailer (Gmail)                        |
| Maps       | Leaflet.js (free, no API key)             |

---

## 📁 Project Structure

```
shopbid/
├── server/
│   ├── config/         # DB + Cloudinary
│   ├── controllers/    # auth, shop, product, bid, order
│   ├── middleware/     # JWT auth, role guard
│   ├── models/         # User, Shop, Product, Bid, Order
│   ├── routes/         # Express routes
│   ├── socket/         # Socket.io bid rooms
│   ├── utils/          # QR generator, mailer, cron
│   └── server.js
└── client/
    └── src/
        ├── context/    # AuthContext, SocketContext
        ├── components/ # Navbar, ProductCard, BidTimer, QRModal
        ├── pages/
        │   ├── Landing.jsx, Login.jsx, Register.jsx
        │   ├── shopkeeper/  Dashboard, CreateListing, ShopSetup, OrdersManage, ScanQR, Analytics
        │   └── buyer/       BuyerHome, MapPage, ProductDetail, MyOrders, MyBids
        └── utils/      # axios api
```

---

## 🚀 Setup & Run

### 1. Clone the project
```bash
git clone <repo-url>
cd shopbid
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopbid

JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

> **Cloudinary**: Sign up free at [cloudinary.com](https://cloudinary.com) → Dashboard → copy Cloud Name, API Key, Secret

```bash
npm run dev
```

Server runs on **http://localhost:5000**

---

### 3. Setup Frontend

```bash
cd client
npm install
npm run dev
```

Client runs on **http://localhost:5173**

---

## 🔑 Credentials Setup Summary

| Service     | Where to get it                                      |
|-------------|------------------------------------------------------|
| MongoDB     | Local: `mongodb://localhost:27017/shopbid` or [MongoDB Atlas](https://cloud.mongodb.com) free tier |
| Cloudinary  | [cloudinary.com](https://cloudinary.com) free tier  |
| Gmail SMTP  | Google Account → App Passwords                      |

---

## 📄 API Endpoints

### Auth
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | /api/auth/register   | Register user       |
| POST   | /api/auth/login      | Login               |
| GET    | /api/auth/me         | Get current user    |

### Shops
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | /api/shops        | All shops           |
| POST   | /api/shops        | Create shop         |
| GET    | /api/shops/my     | My shop             |
| PUT    | /api/shops/:id    | Update shop         |

### Products
| Method | Endpoint                   | Description           |
|--------|----------------------------|-----------------------|
| GET    | /api/products              | All active listings   |
| POST   | /api/products              | Create listing        |
| GET    | /api/products/my           | My listings           |
| GET    | /api/products/:id          | Single product        |
| GET    | /api/products/shop/:shopId | Products by shop      |

### Bids
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/bids/:productId  | Place a bid         |
| GET    | /api/bids/:productId  | Get product bids    |
| GET    | /api/bids/my          | My bid history      |

### Orders
| Method | Endpoint                      | Description             |
|--------|-------------------------------|-------------------------|
| GET    | /api/orders/my                | Buyer's orders          |
| GET    | /api/orders/shop              | Shopkeeper's orders     |
| GET    | /api/orders/analytics         | Shop analytics          |
| GET    | /api/orders/verify/:orderId   | Verify QR               |
| PUT    | /api/orders/pickup/:orderId   | Mark as picked up       |

---

## ⚡ Socket.io Events

| Event           | Direction         | Description                          |
|-----------------|-------------------|--------------------------------------|
| join_room       | client → server   | Join product auction room            |
| leave_room      | client → server   | Leave room                           |
| bid_updated     | server → clients  | New bid placed in room               |
| outbid_alert    | server → clients  | Notify previous winner               |
| auction_closed  | server → clients  | Auction ended (sold/void)            |
| timer_extended  | server → clients  | Snipe protection — timer extended    |
| new_listing     | server → all      | New product listed                   |

---

## 🆓 Free Tier Limits

- **Cloudinary**: 25GB storage, 25 credits/month — plenty for product images
- **MongoDB Atlas**: 512MB free storage
- **Gmail SMTP**: 500 emails/day free via App Password

---

## 🔒 Roles

| Role        | Can Do                                                    |
|-------------|-----------------------------------------------------------|
| shopkeeper  | Create shop, list products, view orders, scan QR, analytics |
| buyer       | Browse feed, view map, place bids, view own orders & bids |

---

Built with ❤️ using the MERN stack.
