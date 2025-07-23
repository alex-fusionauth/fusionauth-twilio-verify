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
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json({ message: "Phone number and code are required." }, { status: 400 });
        }

        const verification_check = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({ to: phone, code: code });

        if (verification_check.status === "approved") {
            return NextResponse.json({
                success: true,
                status: verification_check.status,
                message: "Verification successful.",
            });
        } else {
            return NextResponse.json({
                success: false,
                status: verification_check.status,
                message: "Verification failed. The code is invalid or has expired.",
            });
        }

    } catch (error) {
        console.error("Twilio API error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ success: false, message: `Failed to check verification: ${errorMessage}` }, { status: 500 });
    }
}
