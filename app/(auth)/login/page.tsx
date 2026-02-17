// app/(auth)/login/page.tsx - ✅ کامپوننت کامل
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // ✅ import درست

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSendOtp = async () => {
    setError("");

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          phone: phone.trim(),
          step: "send",
          redirect: false,
        });

        if (result?.error) {
          setError("خطا در ارسال کد");
        } else {
          setStep("otp");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "خطای ناشناخته");
      }
    });
  };

  const handleVerifyOtp = async () => {
    setError("");

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          phone: phone.trim(),
          code,
          step: "verify",
          redirect: false,
        });

        if (result?.error) {
          setError("کد اشتباه است");
        } else {
          router.push("/account");
          router.refresh();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "خطای ناشناخته");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 py-12 text-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === "phone" ? "ورود" : "تأیید کد"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === "phone"
              ? "شماره موبایل خود را وارد کنید"
              : "کد ۶ رقمی ارسال شده را وارد کنید"}
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <input
              type="tel"
              className="w-full px-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              disabled={isPending}
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <button
              onClick={handleSendOtp}
              disabled={!phone || phone.length < 11 || isPending}
              className="w-full py-4 px-6 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                "دریافت کد تأیید"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-800">
                کد به شماره <strong>{phone}</strong> ارسال شد
              </p>
            </div>

            <input
              type="text"
              className="w-full px-4 py-4 text-xl text-center tracking-widest border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="۱۲۳۴۵۶"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={isPending}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("phone")}
                className="flex-1 py-3 px-4 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                disabled={isPending}
              >
                تغییر شماره
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={code.length !== 6 || isPending}
                className="flex-1 py-3 px-4 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  "ورود"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
