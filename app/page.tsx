"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Phone, KeyRound, AlertCircle, CheckCircle2, Bot } from "lucide-react";
import { Spinner } from "@/components/icons";

type VerificationStep = "inputPhone" | "inputCode" | "verified";

export default function Home() {
  const [step, setStep] = useState<VerificationStep>("inputPhone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartVerification = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/start-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification code.");
      }

      setStep("inputCode");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/check-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || data.status !== "approved") {
        throw new Error(data.message || "Invalid verification code.");
      }

      setStep("verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("inputPhone");
    setPhone("");
    setCode("");
    setError(null);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Bot size={32} />
          </div>
          <CardTitle className="font-headline text-2xl">Twilio Auth Bridge</CardTitle>
          <CardDescription>
            {step === 'inputPhone' && "Enter your phone number to receive a verification code."}
            {step === 'inputCode' && "We've sent a code to your phone. Please enter it below."}
            {step === 'verified' && "Your phone number has been successfully verified."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "inputPhone" && (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner /> : "Send Code"}
              </Button>
            </form>
          )}

          {step === "inputCode" && (
            <form onSubmit={handleCheckVerification} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone-display"
                  type="tel"
                  value={phone}
                  disabled
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="pl-10 tracking-widest text-center"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner /> : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "verified" && (
            <div className="text-center space-y-4 flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium">Verification Successful!</p>
              <Button onClick={reset} className="w-full">
                Start Over
              </Button>
            </div>
          )}
        </CardContent>
        {step === 'inputCode' && (
          <CardFooter>
            <Button variant="link" className="w-full text-muted-foreground" onClick={() => setStep('inputPhone')}>
              Entered the wrong number?
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
