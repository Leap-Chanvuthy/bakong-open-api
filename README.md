# Bakong KHQR Integration with E-commerce App

This is the backend service for the Store App.
It provides APIs for managing products, orders, and generating **KHQR** codes for checkout.

---

## Features

- Product listing and store management
- Cart and checkout flow
- Order creation with KHQR code generation
- Verify Payment with MD5 & Hash
- RESTful API structure

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Leap-Chanvuthy/bakong-open-api
   cd bakong-open-api
   ```

## Environment Setup

Create a `.env` file in the root of your project and add the following variables:

```
APP_NAME=YourAppName
APP_ICON_URL=https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg
APP_DEEPLINK_CALLBACK=https://mytestapp.com/callback
PORT=3000
NODE_ENV=development

MONGODB_URI= #Your mongodb connection string

BAKONG_DEV_BASE_API_URL=https://sit-api-bakong.nbc.gov.kh/v1 # URL for production
BAKONG_PROD_BASE_API_URL=https://api-bakong.nbc.gov.kh/v1 # URL for production

BAKONG_ACCOUNT_USERNAME=dev@aclb # Your bakong username (In your bakong app)
BAKONG_MERCHANT_ID=YOUR_BAKONG_MERCHANT_ID # Optional
BAKONG_ACCESS_TOKEN= #Bakong Access token (Get from national bank of cambodia)
```

## Running the Server

### Development Mode:

<pre class="overflow-visible!" data-start="1629" data-end="1652"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run dev
</span></span></code></div></div></pre>

### Production Mode:

<pre class="overflow-visible!" data-start="1675" data-end="1710"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run build
npm start</span></span></code></div></div></pre>

# 📡 API Documentation – Bakong KHQR Integration with E-commerce App

This backend provides endpoints to **generate KHQR codes**, **check payment status**, and **retrieve order information**.

---

## 🚀 Base URL : http://localhost:3000/api

**1. Generate a KHQR code for a new order.**

**Endpoint:**

`POST /api/orders/create`

**Request Body:**

```json
{
  "items": [
    { "productId": "64d123abc456ef7890123456", "quantity": 2 },
    { "productId": "64d123abc456ef7890127890", "quantity": 1 }
  ]
}

```

**Example Response :**

```
{
  "success": true,
  "message": "Order created and QR generated",
  "data": {
    "orderId": "ORDER_00003",
    "qr": "00020101021229240020chanvuthy_leap3@aclb520459995303116540444005802KH5914Chanvuthy Leap6010PHNOM PENH9934001317564389916870113175643929168663047D00",
    "md5": "ed67bece09519cc59842358ef036d157",
    "amount": 4400,
    "expiresAt": 1756439291686
  }
}

```


**2. Check Payment Status**

**Endpoint:**

`POST /api/orders/create`


**Request Body:**

```
{
  "md5": "ed67bece09519cc59842358ef036d157"
}

```

**Example Success Response**

```
{
  "success": true,
  "message": "Payment confirmed",
  "data": {
    "orderId": "ORDER_00003",
    "bakongHash": "9bc29426b5e55f171b0e137478d04eb8b8b3a757e0eb2040561ba4f9f052db95",
    "bakongData": {
      "hash": "9bc29426b5e55f171b0e137478d04eb8b8b3a757e0eb2040561ba4f9f052db95",
      "fromAccountId": "abaakhppxxx@abaa",
      "toAccountId": "chanvuthy_leap3@aclb",
      "currency": "KHR",
      "amount": 4400,
      "description": null,
      "createdDateMs": 1756366775000,
      "acknowledgedDateMs": 1756366777000,
      "trackingStatus": null,
      "receiverBank": null,
      "receiverBankAccount": null,
      "instructionRef": null,
      "externalRef": "100FT35340355905"
    }
  }
}

```


**Example Failure Response :**

```
{
  "success": false,
  "message": "Payment not found or not completed",
  "data": null
}

```


**3. Get Order Info**

**Endpoint:**

`POST /api/orders/:orderId`

**Request Body:**

```json
{
  "items": [
    { "productId": "64d123abc456ef7890123456", "quantity": 2 },
    { "productId": "64d123abc456ef7890127890", "quantity": 1 }
  ]
}

```

**Example Response :**

```
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "orderId": "ORDER_00003",
    "items": [
      {
        "productId": "64d123abc456ef7890123456",
        "name": "Sample Product",
        "price": 2200,
        "quantity": 2
      }
    ],
    "qr": "00020101021229240020chanvuthy_leap3@aclb...",
    "md5": "ed67bece09519cc59842358ef036d157",
    "amount": 4400,
    "currency": "KHR",
    "paid": false,
    "createdAt": "2025-08-30T10:00:00.000Z"
  }
}

```
