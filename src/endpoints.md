# API Endpoints

## Public Endpoints

These endpoints can be accessed without authentication.

- **`POST /users`**
  - **Description:** Creates a new user in the system. It validates the user's email, SSN, and phone number, ensuring they are unique.
  - **Request Body:**

    ```json
    {
      "email": "user@example.com",
      "ssn": "123-45-6789",
      "phone": "1234567890"
    }
    ```

  - **Success Response (201):**

    ```json
    {
      "user": {
        "id": 1,
        "email": "user@example.com",
        "ssn": "123456789",
        "phone": "1234567890",
        "role": "CUSTOMER",
        "token": "a-unique-token"
      },
      "token": "a-unique-token"
    }
    ```

## Authenticated Endpoints

All endpoints below require a valid authentication token sent in the request headers.

### General Authenticated Routes

- **`GET /me`**
  - **Description:** Fetches the profile information for the currently authenticated user, including their email and details of their open bank account, if they have one.
  - **Success Response (200):**

    ```json
    {
      "user": "user@example.com",
      "account": {
        "amount": 1000.00,
        "type": "CHECKING",
        "status": "OPEN"
      }
    }
    ```

#### Bank Operator Routes

These endpoints are restricted to users with the `OPERATOR` role.

- **`GET /bank/capital`**
  - **Description:** Retrieves a breakdown of the bank's total capital. This is calculated as the bank's initial capital plus the sum of all customer account balances.
  - **Success Response (200):**

    ```json
    {
      "totalOnHand": 350000.00,
      "breakdown": {
        "initialCapital": 250000.00,
        "totalCustomerDeposits": 100000.00
      }
    }
    ```

#### Customer Routes

These endpoints are restricted to users with the `CUSTOMER` role.

- **`POST /accounts`**
  - **Description:** Creates a new bank account for the authenticated user. A user cannot have more than one open account at a time.
  - **Request Body:**

    ```json
    {
      "type": "CHECKING"
    }
    ```

  - **Success Response (201):**

    ```json
    {
      "accountId": 1,
      "message": "Account created successfully"
    }
    ```

- **`POST /account/close`**
  - **Description:** Closes the authenticated user's open bank account.
  - **Request Body:**

    ```json
    {
      "reason": "Closing my account."
    }
    ```

  - **Success Response (200):**

    ```json
    {
      "accountId": 1,
      "message": "Account closed successfully"
    }
    ```

- **`POST /account/deposit`**
  - **Description:** Deposits a specified amount into the user's account.
  - **Request Body:**

    ```json
    {
      "amount": 100.50
    }
    ```

  - **Success Response (200):**

    ```json
    {
      "newBalance": 1100.50,
      "transactionId": 1,
      "message": "Deposit successful"
    }
    ```

- **`POST /account/withdraw`**
  - **Description:** Withdraws a specified amount from the user's account. The user must have sufficient funds.
  - **Request Body:**

    ```json
    {
      "amount": 50.00
    }
    ```

  - **Success Response (200):**

    ```json
    {
      "newBalance": 1050.50,
      "transactionId": 2,
      "message": "Withdrawal successful"
    }
    ```

- **`POST /account/transfer`**
  - **Description:** Transfers a specified amount from the user's account to another user's account. The recipient can be identified by their email or phone number.
  - **Request Body:**

    ```json
    {
      "recipient": "recipient@example.com",
      "amount": 25.00
    }
    ```

  - **Success Response (200):**

    ```json
    {
      "message": "Transfer successful",
      "newBalance": 1025.50,
      "transactionId": 3
    }
    ```
