// ============================================
// POST /api/prices/calculate
// ============================================
// Calculate total price for a booking based on items and route

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface CalculateItem {
    category: string;
    size: string;
    type?: string;
    quantity: number;
}

interface CalculateRequest {
    fromCode: string;
    toCode: string;
    items: CalculateItem[];
    includeVat?: boolean;
    vatPercent?: number;
}

export async function POST(request: NextRequest) {
    const result = await requireAuth(request);
    if (result instanceof NextResponse) return result;

    try {
        const body: CalculateRequest = await request.json();
        const { fromCode, toCode, items, includeVat = true, vatPercent = 12 } = body;

        if (!fromCode || !toCode || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: fromCode, toCode, items" },
                { status: 400 }
            );
        }

        // Get locations
        const [fromLocation, toLocation] = await Promise.all([
            prisma.location.findUnique({ where: { code: fromCode } }),
            prisma.location.findUnique({ where: { code: toCode } }),
        ]);

        if (!fromLocation || !toLocation) {
            return NextResponse.json(
                { error: "Invalid location codes" },
                { status: 400 }
            );
        }

        // Calculate prices for each item
        const calculatedItems = await Promise.all(
            items.map(async (item) => {
                const priceWhere: any = {
                    category: item.category,
                    size: item.size,
                    fromId: fromLocation.id,
                    toId: toLocation.id,
                    isActive: true,
                };

                if (item.type) {
                    priceWhere.type = item.type;
                }

                const price = await prisma.price.findFirst({ where: priceWhere });

                const unitPrice = price?.value || 0;
                const total = unitPrice * item.quantity;

                return {
                    category: item.category,
                    size: item.size,
                    type: item.type,
                    quantity: item.quantity,
                    unitPrice,
                    total,
                    priceFound: !!price,
                };
            })
        );

        // Calculate totals
        const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
        const vatAmount = includeVat ? subtotal * (vatPercent / 100) : 0;
        const totalAmount = subtotal + vatAmount;

        // Check for missing prices
        const missingPrices = calculatedItems.filter((item) => !item.priceFound);

        return NextResponse.json({
            route: {
                from: { code: fromLocation.code, name: fromLocation.name },
                to: { code: toLocation.code, name: toLocation.name },
            },
            items: calculatedItems,
            subtotal,
            vatPercent: includeVat ? vatPercent : 0,
            vatAmount,
            totalAmount,
            warnings: missingPrices.length > 0
                ? `Price not found for ${missingPrices.length} item(s). Using $0 for missing prices.`
                : undefined,
            missingPrices: missingPrices.map((item) => ({
                category: item.category,
                size: item.size,
                type: item.type,
            })),
        });
    } catch (error: any) {
        console.error("Price calculation error:", error);
        return NextResponse.json(
            { error: "Failed to calculate price" },
            { status: 500 }
        );
    }
}
