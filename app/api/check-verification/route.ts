import { NextResponse, type NextRequest } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
    console.error("Twilio environment variables are not set.");
}

const client = twilio(accountSid, authToken);

function respondWithLog(json: any, options?: { status?: number }) {
    console.log("API response:", JSON.stringify(json));
    return NextResponse.json(json, options);
}

export async function POST(req: NextRequest) {
    if (!accountSid || !authToken || !verifyServiceSid) {
        return respondWithLog({ message: "Server configuration error: Twilio credentials missing." }, { status: 500 });
    }

    try {
        const jsonPayload = await req.json();
        console.log("Received payload in check verification:", JSON.stringify(jsonPayload));
        let phone: string | undefined;
        let code: string | undefined;
        let isFusionAuth = false;

        // Detect FusionAuth payload
        if (jsonPayload.phoneNumber && jsonPayload.textMessage) {
            phone = jsonPayload.phoneNumber;
            const match = jsonPayload.textMessage.match(/(\d{6})/);
            if (match) {
                code = match[1];
                isFusionAuth = true;
            }
        } else {
            // Standard payload
            phone = jsonPayload.phone || jsonPayload.phoneNumber;
            code = jsonPayload.code;
        }

        if (!phone) {
            return respondWithLog({ message: "Phone number is required." }, { status: 400 });
        }

        // Normalize phone to E.164 format
        if (!phone.startsWith("+")) {
            phone = phone.replace(/[^0-9]/g, "");
            if (phone.length === 10) {
                phone = `+1${phone}`;
            } else {
                return respondWithLog({ message: "Invalid phone number format. Please use E.164 format (e.g., +1234567890)." }, { status: 400 });
            }
        }
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            return respondWithLog({ message: "Invalid phone number format. Please use E.164 format (e.g., +1234567890)." }, { status: 400 });
        }

        // If code is provided, verify; otherwise, start verification
        if (code) {
            if (isFusionAuth) {
                // For FusionAuth, initiate verification with customCode
                const verification = await client.verify.v2
                    .services(verifyServiceSid)
                    .verifications.create({ to: phone, channel: "sms", customCode: code });
                return respondWithLog({
                    success: true,
                    message: "Verification initiated with custom code.",
                    status: verification.status,
                });
            } else {
                // Standard Twilio verification check
                const verification_check = await client.verify.v2
                    .services(verifyServiceSid)
                    .verificationChecks.create({ to: phone, code });

                if (verification_check.status === "approved") {
                    return respondWithLog({
                        success: true,
                        status: verification_check.status,
                        message: "Verification successful.",
                    });
                } else {
                    return respondWithLog({
                        success: false,
                        status: verification_check.status,
                        message: "Verification failed. The code is invalid or has expired.",
                    });
                }
            }
        } else {
            // Initiate verification
            const verification = await client.verify.v2
                .services(verifyServiceSid)
                .verifications.create({ to: phone, channel: "sms" });

            return respondWithLog({
                success: true,
                message: "Verification code sent.",
                status: verification.status,
            });
        }
    } catch (error) {
        console.error("Twilio API error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return respondWithLog({ success: false, message: `Failed to process verification: ${errorMessage}` }, { status: 500 });
    }
}
