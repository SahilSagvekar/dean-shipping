"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Receipt, ArrowRight, Ship } from "lucide-react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const invoiceNo = searchParams.get("invoiceNo");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f8f4] via-white to-[#f0f8f4] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">

                {/* Animated check */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-12 h-12 text-[#296341]" strokeWidth={1.5} />
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Payment Successful!</h1>
                    <p className="mt-2 text-gray-500">
                        Your payment for Dean&apos;s Shipping Ltd has been received and
                        your invoice has been marked as paid.
                    </p>
                </div>

                {invoiceNo && (
                    <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5 text-left space-y-3">
                        <div className="flex items-center gap-2 text-[#296341]">
                            <Receipt className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-widest">Invoice</span>
                        </div>
                        <p className="text-2xl font-extrabold text-[#296341]">#{invoiceNo}</p>
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Status: Paid</span>
                        </div>
                    </div>
                )}

                <p className="text-xs text-gray-400">
                    A confirmation receipt has been sent to your email address. Please
                    keep this for your records.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link
                        href="/shipment"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#296341] hover:bg-[#1e4d30] text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
                    >
                        <Ship className="w-4 h-4" />
                        Track Shipment
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all active:scale-95"
                    >
                        Go Home
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PayNowSuccess() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#296341]" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
