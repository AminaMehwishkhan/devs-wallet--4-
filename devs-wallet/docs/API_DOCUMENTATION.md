# Devs Wallet | API Documentation

## Response Format

API responses use the following general structure:

```json
// Success
{
  "success": true,
  "message": "...",
  "data": {}
}

// Failure
{
  "success": false,
  "message": "...",
  "errors": null
}

// Validation failure
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid email address"
    }
  ]
}
```

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```text
Authorization: Bearer <token>
```

The token is issued by `POST /auth/register` or `POST /auth/login` and contains `{ id, role }`.

For protected requests, the server retrieves the authenticated user from the database through `middleware/auth.js`. Suspended accounts return a `403` response.

Admin endpoints additionally require `role = 'admin'` through `middleware/role.js`.

Request bodies are validated server-side using `express-validator` before reaching the corresponding controller.

---

## Authentication: `/api/auth`

### `POST /auth/register`

Creates a user and wallet with an initial balance of `0.00` within one database transaction.

**Authentication:** Not required

**Body:**

```json
{
  "fullName": "Amna Khan",
  "email": "amna@example.com",
  "phone": "03001234567",
  "password": "secret123"
}
```

`phone` is optional. The password must contain at least 6 characters.

**Success: `201 Created`**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Amna Khan",
      "email": "amna@example.com",
      "phone": "03001234567",
      "role": "user",
      "avatar_url": null,
      "created_at": "..."
    },
    "token": "eyJhbGciOi..."
  }
}
```

**Errors:**

* `422`: Missing or invalid fields
* `409`: Email already registered

---

### `POST /auth/login`

Authenticates a registered user and returns a JWT.

**Authentication:** Not required

**Body:**

```json
{
  "email": "amna@example.com",
  "password": "secret123"
}
```

**Success: `200 OK`**

Returns the authenticated user and JWT.

**Errors:**

* `422`: Missing or invalid fields
* `401`: Invalid credentials
* `403`: Account suspended

---

### `POST /auth/forgot-password`

Generates a password reset token.

**Authentication:** Not required

The endpoint returns the same general response regardless of whether the supplied email exists.

**Body:**

```json
{
  "email": "amna@example.com"
}
```

**Success: `200 OK`**

```json
{
  "success": true,
  "message": "Reset token generated (demo mode: returned directly instead of emailed)",
  "data": {
    "resetToken": "..."
  }
}
```

**Implementation Note:** Email delivery is not configured in the current project. The reset token is returned through the API for demonstration purposes.

---

### `POST /auth/reset-password`

Resets a password using a valid reset token.

**Authentication:** Not required

**Body:**

```json
{
  "token": "<resetToken>",
  "newPassword": "newSecret123"
}
```

**Success: `200 OK`**

```json
{
  "message": "Password reset successful. You can now log in."
}
```

**Errors:**

* `422`: Missing or invalid password
* `400`: Invalid or expired reset token

Reset tokens expire 30 minutes after they are issued.

---

### `GET /auth/me`

Returns the currently authenticated user and wallet information.

**Authentication:** Required

**Success: `200 OK`**

```json
{
  "user": {},
  "wallet": {
    "balance": "0.00",
    "currency": "PKR"
  }
}
```

---

## Wallet: `/api/wallet`

All wallet endpoints require authentication.

### `GET /wallet`

Returns the authenticated user's wallet information, including:

* `id`
* `user_id`
* `balance`
* `currency`
* `created_at`
* `updated_at`

### `POST /wallet/deposit`

Adds funds to the authenticated user's wallet and creates a `deposit` transaction record.

**Body:**

```json
{
  "amount": 5000,
  "description": "Salary top-up"
}
```

`description` is optional.

The operation runs within a database transaction.

**Success: `200 OK`**

```json
{
  "wallet": {},
  "transaction": {}
}
```

**Errors:**

* `422`: Amount is not a positive number

### `POST /wallet/withdraw`

Withdraws funds from the authenticated user's wallet.

The endpoint uses `SELECT ... FOR UPDATE` to lock the wallet row before checking the available balance.

**Body:**

```json
{
  "amount": 1000,
  "description": "Cash withdrawal"
}
```

**Errors:**

* `422`: Invalid amount
* `400`: Insufficient balance

### `POST /wallet/transfer`

Transfers funds to another registered Devs Wallet user.

**Body:**

```json
{
  "recipientEmail": "friend@example.com",
  "amount": 1000,
  "description": "Payment"
}
```

The recipient must have an existing Devs Wallet account. Transfers to the sender's own account are not allowed.

A successful transfer creates two linked transaction records:

* `transfer_out` for the sender
* `transfer_in` for the recipient

Both records are created within the same database transaction.

**Errors:**

* `422`: Invalid input
* `400`: Self-transfer or insufficient balance
* `404`: Recipient not found

---

## Transactions: `/api/transactions`

All transaction endpoints require authentication. Returned transactions are restricted to the authenticated user's wallet.

### `GET /transactions`

Returns paginated and filterable transaction history.

**Optional Query Parameters:**

* `page`: Default `1`
* `limit`: Default `10`, maximum `100`
* `type`: `deposit`, `withdraw`, `transfer_in`, `transfer_out`, `bill_payment`, or `package_purchase`
* `status`: `pending`, `success`, or `failed`
* `startDate`: ISO date
* `endDate`: ISO date
* `search`: Case-insensitive search against transaction descriptions

**Success: `200 OK`**

```json
{
  "transactions": [],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### `GET /transactions/dashboard-stats`

Returns data used by the Dashboard, including:

* Current wallet balance
* Six-month inflow and outflow trend
* Spending breakdown
* Five most recent transactions

**Success: `200 OK`**

```json
{
  "balance": "10000.00",
  "monthly": [
    {
      "month": "Jan",
      "inflow": "5000",
      "outflow": "1200"
    }
  ],
  "breakdown": [
    {
      "type": "deposit",
      "total": "5000"
    }
  ],
  "recentTransactions": []
}
```

### `GET /transactions/:id`

Returns a transaction by ID if it belongs to the authenticated user's wallet.

**Errors:**

* `422`: Invalid UUID
* `404`: Transaction not found or not accessible to the authenticated user

---

## Savings Goals: `/api/savings-goals`

All endpoints require authentication and operate on the authenticated user's savings goals.

| Method | Endpoint          | Body                                            | Description                                       |
| ------ | ----------------- | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/`               | None                                            | Returns savings goals, newest first               |
| POST   | `/`               | `{ title, targetAmount, deadline? }`            | Creates a savings goal                            |
| PUT    | `/:id`            | `{ title?, targetAmount?, deadline?, status? }` | Updates a savings goal                            |
| DELETE | `/:id`            | None                                            | Deletes a savings goal                            |
| POST   | `/:id/contribute` | `{ amount }`                                    | Moves funds from the wallet into the savings goal |

`deadline` is optional and accepts an ISO date.

Valid status values are:

* `active`
* `completed`
* `cancelled`

Savings contributions lock the wallet row, verify sufficient balance, update the saved amount, and mark the goal as `completed` when the target is reached. A corresponding wallet transaction is also recorded.

**Errors:**

* `422`: Validation error
* `404`: Savings goal not found
* `400`: Insufficient balance

---

## Bill Payments: `/api/bills`

Bill payment endpoints require authentication.

Bill payments are simulated. No external utility provider is contacted.

### `GET /bills`

Returns the authenticated user's bill payment history.

### `POST /bills/pay`

Creates a simulated bill payment and debits the user's wallet.

**Body:**

```json
{
  "category": "electricity",
  "provider": "LESCO",
  "accountNumber": "12345",
  "amount": 500
}
```

Supported categories:

* `electricity`
* `gas`
* `internet`
* `mobile`

**Success: `200 OK`**

```json
{
  "bill": {},
  "wallet": {}
}
```

**Errors:**

* `422`: Invalid category or missing fields
* `400`: Insufficient balance

---

## Mobile Packages: `/api/packages`

Mobile package endpoints require authentication. Purchases are simulated.

| Method | Endpoint        | Body                          | Description                                               |
| ------ | --------------- | ----------------------------- | --------------------------------------------------------- |
| GET    | `/`             | None                          | Returns the seeded mobile package catalog                 |
| GET    | `/my-purchases` | None                          | Returns the authenticated user's package purchase history |
| POST   | `/purchase`     | `{ packageId, mobileNumber }` | Purchases a package and debits the wallet                 |

The package catalog contains seeded Jazz, Zong, Ufone, and Telenor packages.

A successful purchase creates a `package_purchase` transaction and a corresponding `package_purchases` record.

**Errors:**

* `422`: Invalid input
* `404`: Package not found
* `400`: Insufficient balance

---

## Beneficiaries: `/api/beneficiaries`

Beneficiary endpoints require authentication and operate on the authenticated user's beneficiary records.

A beneficiary must have an existing Devs Wallet account.

| Method | Endpoint | Body                                            |
| ------ | -------- | ----------------------------------------------- |
| GET    | `/`      | None                                            |
| POST   | `/`      | `{ nickname, beneficiaryEmail, bankOrWallet? }` |
| PUT    | `/:id`   | `{ nickname?, bankOrWallet? }`                  |
| DELETE | `/:id`   | None                                            |

The beneficiary email cannot be changed after creation.

**Errors:**

* `422`: Validation error
* `404`: Beneficiary or corresponding Devs Wallet user not found

---

## Profile & Security: `/api/profile`

All profile endpoints require authentication.

### `PUT /profile`

Updates profile information.

**Body:**

```json
{
  "fullName": "Amna Khan",
  "phone": "03001234567"
}
```

Both fields are optional.

### `PUT /profile/password`

Changes the authenticated user's password.

**Body:**

```json
{
  "currentPassword": "currentPassword",
  "newPassword": "newPassword"
}
```

The current password is verified using `bcrypt.compare` before the new password is hashed and saved.

**Errors:**

* `401`: Current password is incorrect
* `422`: New password does not meet validation requirements

### `POST /profile/avatar`

Uploads a profile avatar.

**Content-Type:** `multipart/form-data`

**Field:** `avatar`

Supported file types:

* `.png`
* `.jpg`
* `.jpeg`
* `.webp`

Maximum file size: `2 MB`

**Success: `200 OK`**

```json
{
  "id": "uuid",
  "avatar_url": "/uploads/avatars/<filename>"
}
```

**Deployment Note:** Avatar files are written to local storage. Persistent avatar storage on a serverless deployment such as Vercel requires an external storage service.

---

## Admin: `/api/admin`

Admin endpoints require authentication and `role = 'admin'`.

Requests from authenticated users without the admin role return `403`.

### `GET /admin/users`

Returns registered users with pagination and filtering.

**Optional Query Parameters:**

* `page`
* `limit`, maximum `100`
* `search`, matches name or email
* `status`, `active` or `suspended`

**Success: `200 OK`**

```json
{
  "users": [],
  "pagination": {}
}
```

### `PUT /admin/users/:id/status`

Updates a user's account status.

**Body:**

```json
{
  "status": "suspended"
}
```

Supported values:

* `active`
* `suspended`

### `GET /admin/transactions`

Returns platform-wide transaction records.

Supported filters include:

* `type`
* `status`
* `page`
* `limit`

### `GET /admin/reports`

Returns aggregate platform statistics.

**Success: `200 OK`**

```json
{
  "totals": {
    "total_users": 12,
    "active_users": 11,
    "total_wallet_balance": "45000.00",
    "total_transactions": 87,
    "total_deposits": "60000.00",
    "total_withdrawals": "10000.00",
    "total_bill_payments": "3000.00",
    "total_package_sales": "1500.00"
  },
  "monthlyTransactionVolume": [
    {
      "month": "Mar 2026",
      "transaction_count": "20",
      "volume": "15000.00"
    }
  ],
  "newUsersPerMonth": [
    {
      "month": "Mar 2026",
      "new_users": "4"
    }
  ]
}
```

The monthly transaction volume and new-user statistics cover the latest six months.

---

## HTTP Status Code Summary

| Status        | Meaning                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| `200` / `201` | Request completed successfully                                                       |
| `400`         | Business rule failure, such as insufficient balance, self-transfer, or expired token |
| `401`         | Missing, invalid, or expired JWT, or incorrect login credentials                     |
| `403`         | Account suspended or insufficient role                                               |
| `404`         | Resource not found or not accessible to the authenticated user                       |
| `409`         | Conflict, such as an email already registered                                        |
| `422`         | Request validation failed                                                            |
| `500`         | Unhandled server error                                                               |
