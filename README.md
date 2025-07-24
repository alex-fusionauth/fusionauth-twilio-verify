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
    git clone https://github.com/alex-fusionauth/fusionauth-twilio-verify.git
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

The application will be available at `http://localhost:3000`.

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

This works great to test that your Twilio Verify API actually works as a standalone application.

## Using with FusionAuth Generic Messenger

Configure a generic messenger within FusionAuth `/admin/messenger/`.

For the URL you will need to use NGROK so you don't have issues with https, the command you will use is `ngrok http 3000`.

The result will look something like `https://1df9fb565a04.ngrok-free.app/api/check-verification` for your URL.

** YOU SHOULD [SECURE](https://fusionauth.io/docs/customize/email-and-messages/generic-messenger#securing-the-generic-message-receiver) your messenger! (we are not doing that in this example for simplicity) **

Once this has been created you can then enable multifactor in your tenant, enable SMS settings and use the messenger you have created.

## Update Twilio to allow for custom codes to be sent from FusionAuth

Enable Custom Verification Code for your Service:

You need to enable this option in the Twilio Console for your specific Verify Service. Navigate to Verify > Services, select your Service, go to the General tab, and enable "Custom Verification Code."

Alternatively, you might need to contact Twilio Sales to enable this feature for your account, especially for older accounts or certain configurations.