import { NextResponse, type NextRequest } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
    console.error("Twilio environment variables are not set.");
}

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
    if (!accountSid || !authToken || !verifyServiceSid) {
        return NextResponse.json({ message: "Server configuration error: Twilio credentials missing." }, { status: 500 });
    }

    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ message: "Phone number is required." }, { status: 400 });
        }

        // Basic validation for phone number format (E.164)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json({ message: "Invalid phone number format. Please use E.164 format (e.g., +1234567890)." }, { status: 400 });
        }

        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications.create({ to: phone, channel: "sms" });

        return NextResponse.json({
            success: true,
            message: "Verification code sent.",
            status: verification.status,
        });
    } catch (error) {
        console.error("Twilio API error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ message: `Failed to start verification: ${errorMessage}` }, { status: 500 });
    }
}
