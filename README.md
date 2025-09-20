# Project Overview

## Basic usage

### Authentication

This API uses token-based authentication. When a user is created, a unique token is generated and returned in the response. This token must be included in the `Authorization` header of subsequent requests to access protected endpoints as a Bearer token. Once you create an user, store the returned token in a text file so you can easily access it later.

This is a very simple authentication mechanism and this method was chosen for demonstration purposes and simplicity. In a real application, using more secure methods such as OAuth or JWT would be considered.

### Bank Operator

The bank operator user is created during the database seeding process. The token for the bank operator is:

```text
0aaf8332-27a5-4c81-97ec-86be0eac0025
```

### Customer

Customers can be created using the `POST /users` endpoint. Each customer will receive a unique token upon creation, which they must use to authenticate their requests (see Authentication section).

Users can only have one open account at a time. Attempting to create a new account while one is already open will result in an error.

When making deposits (`POST /account/deposit`), withdrawals (`POST /account/withdraw`), or transfers (`POST /account/transfer`), the opened account's balance will be updated accordingly. Withdrawals and transfers will fail if there are insufficient funds in the account.

The user does not need to specify the account ID for these operations, as the system automatically uses the authenticated user's open account. This also ensures that users can only perform operations on their own accounts.

Accounts can only be closed if there are no money on them. Attempting to close an account with a non-zero balance will result in an error.

Loans were not implemented in this version of the API due to time constraints, but they could be added in future iterations.

## Self-Directed Story and Assumptions

### Peer-to-Peer Transfers (POST /account/transfer)

Why I chose this story: While deposits and withdrawals are core banking functions, direct transfers are a primary feature of modern banking apps. I was inspired by a feature called "PIX" in Brazil, where users can send money to other accounts by simply informing the recipient's email or phone number and the amount to send.

User Value: This feature enhances the platform's utility. It transforms the service from a simple money storage box into an interactive financial tool, increasing user engagement and making the product more interesting and useful. Here in Brazil, it is also common for companies to use "PIX" to accept payment from customers and some companies uses it to transfer the salary to employees. Thus, adding this feature adds great value to the API.

### User Operations are Account-Agnostic

For deposits, withdrawals, and transfers, the user does not specify an account ID. The system uses the authenticated user's single open account. I made this choice to simplify the API and reduce user error, fulfilling the requirement that a user can only operate on their own account.

## System Architecture

I chose a layered architecture for this project, because it allows separating concerns into distinct modules to have maintainability and scalability.

- Entrypoint (`src/index.ts`): This is the main file that starts the Express server, sets up middleware, and starts listening for incoming requests.
- Routing (`src/routes`): This module defines the API endpoints. It maps HTTP methods and URL paths to specific controller functions. It acts as the front door for all incoming requests.
- Middleware (`src/middleware.ts`): Middleware functions handle cross-cutting concerns. This includes authentication (`authMiddleware`), authorization (`isOperator`, `isCustomer`), and global error handling (`errorHandlerMiddleware`).
- Controllers (`src/controllers`): Controllers are responsible for handling the request-response cycle. They receive requests from the router, validate input, call the appropriate services to execute business logic, and format the response to be sent back to the client.
- Services (`src/services`): This layer contains the core business logic of the application. Services encapsulate the application's use cases and orchestrate operations. They are called by the controllers and interact with the data access layer.
- Data Access Layer (Prisma): The application uses Prisma ORM to interact with the PostgreSQL database. I chose this since the project is in Typescript and Prisma has native support for it. The database schema is defined in `prisma/schema.prisma`.

### Request Flow

Requests goes through the system as follows:

1. An HTTP request hits an endpoint defined in the route layer.
2. The request passes through Middleware for authentication and authorization.
3. The corresponding Controller function is called.
4. The Controller calls one or more Services to perform the required business operations.
5. The Service uses the Prisma Client to interact with the database.
6. If success, the Controller sends a final HTTP response to the client.
7. If an error occurs, it is caught by the `errorHandlerMiddleware`, which sends a standardized error response.

## How to run the project

Note: since there are no sensitive data on .env file, I committed it on purpose to make it easier to run the project.

- Make sure you have [Node.js v22.*](https://nodejs.org/en/download/) installed.
- Install Yarn: `npm install --global yarn`
- Go to the project directory
- Install dependencies: `yarn`
- Start the database: `sudo docker-compose -f db-docker-compose.yml up -d`
- Run database migrations: `npx prisma migrate dev`
- Seed the database: `npx prisma db seed`
- Start the development server: `yarn dev`

The list of endpoints can be found in [src/endpoints.md](src/endpoints.md).

### Running tests

- Make sure the database is running: `sudo docker-compose -f db-docker-compose.yml up -d`
- To run the tests, use the command: `yarn test`

#### Endpoints Under Test

The tests were concentrated on the lifecycle of a customer's checking account. This is a critical path for the application, since it covers most user interactions.

The following endpoints were covered with exhaustive tests:

- `POST /accounts`: Account Creation
- `POST /account/deposit`: Depositing Funds
- `POST /account/withdraw`: Withdrawing Funds
- `POST /account/close`: Account Closure

The goal of the test suite is to validate not only the "happy path", but also to test edge cases, invalid inputs, and business rule enforcement.
