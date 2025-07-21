# Grofy Full-Stack Project Documentation

This document describes all REST API endpoints for the Grofy backend and provides an overview of the frontend structure, usage, and integration.

---

## Backend API Documentation

### Base URL 
```
http://localhost:4000/
```

---

### Table of Contents

- [User Endpoints](#user-endpoints)
- [Seller Endpoints](#seller-endpoints)
- [Product Endpoints](#product-endpoints)
- [Cart Endpoints](#cart-endpoints)
- [Address Endpoints](#address-endpoints)
- [Order Endpoints](#order-endpoints)
- [Stripe Webhook](#stripe-webhook)
- [Health Check](#health-check)
- [Frontend Documentation](#frontend-documentation)

---

## User Endpoints

### Register

- **POST** `/api/user/register`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `success`: boolean
  - `user`: `{ "email": "string", "name": "string" }`
  - `message`: error message (on failure)
- **Notes:**  
  Registers a new user. Returns a cookie named `token` for authentication.

---

### Login

- **POST** `/api/user/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `success`: boolean
  - `user`: `{ "email": "string", "name": "string" }`
  - `message`: error message (on failure)
- **Notes:**  
  Logs in an existing user. Returns a cookie named `token` for authentication.

---

### Check Authentication

- **GET** `/api/user/is-auth`
- **Cookie:** `token`
- **Response:**
  - `success`: boolean
  - `user`: user object (without password)
  - `message`: error message (on failure)
- **Notes:**  
  Checks if the user is authenticated. Requires a valid `token` cookie.

---

### Logout

- **GET** `/api/user/logout`
- **Cookie:** `token`
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Logs out the user by clearing the `token` cookie.

---

## Seller Endpoints

### Seller Login

- **POST** `/api/seller/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Only the admin seller (credentials in `.env`) can log in. Returns a cookie named `sellerToken`.

---

### Check Seller Authentication

- **GET** `/api/seller/is-auth`
- **Cookie:** `sellerToken`
- **Response:**
  - `success`: boolean
  - `message`: error message (on failure)
- **Notes:**  
  Checks if the seller is authenticated. Requires a valid `sellerToken` cookie.

---

### Seller Logout

- **GET** `/api/seller/logout`
- **Cookie:** `sellerToken`
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Logs out the seller by clearing the `sellerToken` cookie.

---

## Product Endpoints

### Add Product

- **POST** `/api/product/add`
- **Headers:**  
  - Cookie: `sellerToken`
  - `Content-Type: multipart/form-data`
- **Body:**  
  - `productData`: JSON string with product fields (name, description, price, offerPrice, category, etc.)
  - `images`: Array of image files
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Only authenticated sellers can add products. Images are uploaded to Cloudinary.

---

### List Products

- **GET** `/api/product/list`
- **Response:**
  - `success`: boolean
  - `products`: array of product objects
- **Notes:**  
  Returns all products in the database.

---

### Get Product by ID

- **GET** `/api/product/id`
- **Body:**
  ```json
  {
    "id": "productId"
  }
  ```
- **Response:**
  - `success`: boolean
  - `product`: product object
- **Notes:**  
  Returns a single product by its ID.

---

### Change Product Stock

- **POST** `/api/product/stock`
- **Headers:**  
  - Cookie: `sellerToken`
- **Body:**
  ```json
  {
    "id": "productId",
    "inStock": true | false
  }
  ```
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Only authenticated sellers can update product stock status.

---

## Cart Endpoints

### Update Cart

- **POST** `/api/cart/update`
- **Headers:**  
  - Cookie: `token`
- **Body:**
  ```json
  {
    "cartItems": { "productId": quantity, ... }
  }
  ```
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Updates the user's cart in the database.

---

## Address Endpoints

### Add Address

- **POST** `/api/address/add`
- **Headers:**  
  - Cookie: `token`
- **Body:**
  ```json
  {
    "address": {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "street": "string",
      "city": "string",
      "state": "string",
      "zipcode": number,
      "country": "string",
      "phone": "string"
    }
  }
  ```
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Adds a new address for the authenticated user.

---

### Get Addresses

- **GET** `/api/address/get`
- **Headers:**  
  - Cookie: `token`
- **Response:**
  - `success`: boolean
  - `addresses`: array of address objects
- **Notes:**  
  Returns all addresses for the authenticated user.

---

## Order Endpoints

### Place Order (Cash on Delivery)

- **POST** `/api/order/cod`
- **Headers:**  
  - Cookie: `token`
- **Body:**
  ```json
  {
    "items": [
      { "product": "productId", "quantity": number }
    ],
    "address": "addressId"
  }
  ```
- **Response:**
  - `success`: boolean
  - `message`: status message
- **Notes:**  
  Places a new order with payment type "COD" for the authenticated user.

---

### Place Order (Stripe Payment)

- **POST** `/api/order/stripe`
- **Headers:**  
  - Cookie: `token`
- **Body:**
  ```json
  {
    "items": [
      { "product": "productId", "quantity": number }
    ],
    "address": "addressId"
  }
  ```
- **Response:**
  - `success`: boolean
  - `url`: Stripe checkout URL (on success)
  - `message`: error message (on failure)
- **Notes:**  
  Places a new order and returns a Stripe checkout session URL for payment.

---

### Get User Orders

- **GET** `/api/order/user`
- **Headers:**  
  - Cookie: `token`
- **Response:**
  - `success`: boolean
  - `orders`: array of order objects
- **Notes:**  
  Returns all orders for the authenticated user.

---

### Get All Orders (Seller)

- **GET** `/api/order/seller`
- **Headers:**  
  - Cookie: `sellerToken`
- **Response:**
  - `success`: boolean
  - `orders`: array of order objects
- **Notes:**  
  Returns all orders (COD and paid) for the seller.

---

## Stripe Webhook

### Stripe Payment Webhook

- **POST** `/stripe`
- **Headers:**  
  - `stripe-signature`: Stripe webhook signature
  - `Content-Type: application/json` (raw body)
- **Body:**  
  - Stripe event payload
- **Response:**
  - `{ "received": true }`
- **Notes:**  
  Handles Stripe payment events. Updates order status and clears user cart on payment success.

---

## Health Check

- **GET** `/`
- **Response:**  
  ```
  API is Working
  ```
- **Notes:**  
  Simple endpoint to verify the backend is running.

---

## Notes

- All endpoints that require authentication expect the relevant cookie (`token` for users, `sellerToken` for sellers).
- For file uploads (product images), use `multipart/form-data`.
- Stripe webhook endpoint should be configured in your Stripe dashboard.
- Error responses will include `success: false` and a `message` field.

---

## Environment Variables

See [`backend/.env`](backend/.env) for required configuration.  
Key variables:
- `JWT_SECRET`
- `MONGODB_URI`
- `SELLER_EMAIL`, `SELLER_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---


# Frontend Documentation

## Overview

The Grofy frontend is a modern single-page application built with **React** and **Vite**. It provides a seamless user and seller experience for grocery shopping, order management, and product administration. The frontend communicates with the backend API for all data operations.

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/        # Images, icons, and static data
│   ├── components/    # Reusable UI components (Navbar, Footer, ProductCard, etc.)
│   ├── context/       # React context for global state (AppContext)
│   ├── pages/         # Route pages (Home, Cart, MyOrders, AddAddress, Seller pages, etc.)
│   ├── routes/        # (If present) Route definitions
│   ├── services/      # (If present) API service functions
│   ├── App.jsx        # Main app component with routes
│   └── main.jsx       # Entry point
├── package.json
├── vite.config.js
└── .env
```

---

## Key Features

- **User Authentication:** Register, login, logout, session management.
- **Seller Authentication:** Seller login/logout, product management.
- **Product Browsing:** View all products, categories, and product details.
- **Cart:** Add, update, and remove items; view cart summary.
- **Checkout:** Place orders (Cash on Delivery or Stripe).
- **Order Tracking:** View past orders and order details.
- **Address Management:** Add and select addresses for delivery.
- **Stripe Integration:** Secure online payments.
- **Responsive Design:** Mobile and desktop friendly.

---

## Main Pages & Components

- **Home:** Main landing page with banners, categories, best sellers, and features.
- **Products:** Browse all products or by category.
- **Product Details:** View detailed info and add to cart/buy now.
- **Cart:** Manage cart items, select address, choose payment, and place order.
- **My Orders:** View user's order history and details.
- **Add Address:** Form to add a new shipping address.
- **Seller Dashboard:** Add product, view product list, manage orders.
- **Login/Logout:** Modal for user and seller authentication.
- **Contact:** Contact form for user queries.

---

## API Integration

- All API calls use the backend at `http://localhost:4000/` (configurable via `.env`).
- Uses [axios](https://axios-http.com/) for HTTP requests.
- Cookies are sent with requests for authentication (`withCredentials: true`).

**Example: Fetch Products**
```js
import axios from 'axios';

export const fetchProducts = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/product/list`, { withCredentials: true });
  return res.data.products;
};
```

---

## Authentication

- User and seller sessions are managed via cookies.
- Use `withCredentials: true` in axios/fetch to send cookies.
- Global state (user, cart, products, etc.) is managed via React Context (`src/context/AppContext.jsx`).

---

## Environment Variables

Create a `.env` file in the frontend root:

```
VITE_API_URL=http://localhost:4000
VITE_CURRENCY=₹
```

---

## Running the Frontend

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. The app will be available at `http://localhost:5173/` (default Vite port).

---

## Deployment

- Build the frontend:
  ```
  npm run build
  ```
- Deploy the `dist/` folder to your preferred static hosting (e.g., Vercel, Netlify, GitHub Pages).

---

## Customization

- Update API URLs in `services/` or `.env` if backend URL changes.
- Modify components and pages in `src/` to customize UI/UX, add features, or change branding.
- Tailwind CSS is used for styling; update `index.css` and component classes as needed.

---