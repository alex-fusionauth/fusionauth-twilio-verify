# Twilio Auth Bridge

This Next.js application serves as a bridge between an authentication provider like FusionAuth and the Twilio Verify API. It provides API endpoints to initiate and check phone number verifications using one-time passcodes (OTPs) sent via SMS.

## Core Features

-   **Verification Request Endpoint**: Accepts a phone number to initiate the Twilio Verify flow.
-   **Verification Check Endpoint**: Accepts a phone number and an OTP to verify the user.
-   **Simple UI**: A clean user interface to test the verification flow.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm
-   A Twilio account with a configured Verify Service.

### Installation

1.  Clone the repository:
    ```bash
    git clone fusionauth-twilio-verify
    ```
2.  Navigate to the project directory:
    ```bash
    cd fusionauth-twilio-verify
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Configuration

The application requires Twilio credentials to be set as environment variables.

1.  Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.local.example .env.local
    ```
2.  Open the `.env.local` file and add your Twilio credentials:
    -   `TWILIO_ACCOUNT_SID`: Your Twilio Account SID.
    -   `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
    -   `TWILIO_VERIFY_SERVICE_SID`: The SID of your Twilio Verify Service.

### Running the Development Server

Once the dependencies are installed and the environment variables are configured, you can start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:9002`.

## API Endpoints

### `POST /api/start-verification`

Initiates the phone verification process.

**Request Body:**

```json
{
  "phone": "+15551234567"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Verification code sent."
}
```

### `POST /api/check-verification`

Checks the provided OTP against Twilio.

**Request Body:**

```json
{
  "phone": "+15551234567",
  "code": "123456"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "status": "approved"
}
```
**Failure Response (200 OK):**

```json
{
  "success": false,
  "status": "pending" 
}
```