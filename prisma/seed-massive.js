// ============================================
// MASSIVE SEED FILE - 20K+ ENTRIES
// ============================================
// Run with: node prisma/seed-massive.js
// WARNING: This will create a LOT of data!

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(startDays = -180, endDays = 30) {
    const start = new Date();
    start.setDate(start.getDate() + startDays);
    const end = new Date();
    end.setDate(end.getDate() + endDays);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone() {
    return `242${randomInt(100, 999)}${randomInt(1000, 9999)}`;
}

function generateInvoiceNo() {
    return `INV-${Date.now()}-${randomInt(1000, 9999)}`;
}

// ============================================
// DATA GENERATORS
// ============================================

const FIRST_NAMES = [
    "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
    "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
    "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
    "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Dorothy",
    "Christopher", "Brian", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary",
    "Carol", "Ruth", "Sharon", "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica", "Shirley",
    "Marcus", "Dwayne", "Terrance", "Antoine", "Jamal", "DeShawn", "Tyrone", "Andre", "Maurice", "Cedric",
    "Latoya", "Shaniqua", "Tanisha", "Keisha", "Aaliyah", "Jasmine", "Destiny", "Imani", "Ebony", "Diamond"
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Dean", "Rolle", "Saunders", "Ferguson", "Bain", "Thompson", "Pinder", "Knowles", "McKenzie", "Butler"
];

const VEHICLE_TYPES = [
    "Sedan", "SUV", "Pickup Truck", "Van", "Motorcycle", "Boat Trailer", "Cargo Van", 
    "Compact Car", "Jeep", "Golf Cart", "ATV", "Truck", "Minivan", "Convertible"
];

const CARGO_SERVICES = ["CONTAINER", "PALLET", "LUGGAGE", "BOX", "ENVELOPE", "BUNDLE"];
const BOX_SUBTYPES = ["DRY", "FROZEN", "COOLER"];
const CARGO_SIZES = ["Small", "Medium", "Large"];
const CONTAINER_SIZES = ["20 ft", "40 ft"];
const PALLET_SIZES = ["4 ft", "6 ft"];
const ENVELOPE_TYPES = ["Standard", "Large", "Parcel"];

const PAYMENT_STATUSES = ["PAID", "UNPAID", "PARTIAL"];
const VOYAGE_STATUSES = ["SCHEDULED", "BOARDING", "DEPARTED", "ARRIVED", "COMPLETED", "CANCELLED"];
const MANIFEST_STATUSES = ["PENDING", "LOADED", "UNLOADED", "DELIVERED"];
const VEHICLE_STATUSES = ["PENDING", "IN_DOCK", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

const SHIP_NAMES = ["SHIP_A", "SHIP_B", "DEAN_VOYAGER", "BAHAMAS_STAR", "ISLAND_CARRIER"];

const ID_TYPES = ["Passport", "Driver's License", "National ID", "Voter's Card"];

// ============================================
// BATCH INSERT HELPERS
// ============================================

async function batchInsert(model, data, batchSize = 500) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
    }
    
    let inserted = 0;
    for (const batch of batches) {
        await prisma[model].createMany({
            data: batch,
            skipDuplicates: true,
        });
        inserted += batch.length;
        process.stdout.write(`\r  Inserted ${inserted}/${data.length} ${model}s...`);
    }
    console.log(` ✅`);
    return inserted;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
    console.log("🚀 MASSIVE SEED STARTING...");
    console.log("⚠️  This will create 20K+ records. Please wait...\n");

    const startTime = Date.now();

    // ============================================
    // 1. LOCATIONS (Keep existing, add more)
    // ============================================
    console.log("📍 Creating locations...");
    const locationData = [
        { code: "NAS", name: "Nassau" },
        { code: "GTC", name: "Green Turtle Cay" },
        { code: "MHA", name: "Marsh Harbour" },
        { code: "GGC_BB", name: "GGC / Bakers Bay" },
        { code: "MOW_HPT", name: "MOW / Hope Town" },
        { code: "NA", name: "North Abaco" },
        { code: "FPO", name: "Freeport" },
        { code: "ELH", name: "Eleuthera" },
        { code: "CAT", name: "Cat Island" },
        { code: "EXU", name: "Exuma" },
    ];

    for (const loc of locationData) {
        await prisma.location.upsert({
            where: { code: loc.code },
            update: {},
            create: loc,
        });
    }
    const locations = await prisma.location.findMany();
    console.log(`  ✅ ${locations.length} locations ready`);

    // ============================================
    // 2. USERS (500 users)
    // ============================================
    console.log("\n👥 Creating 500 users...");
    const userCount = 500;
    const usersToCreate = [];
    const existingPhones = new Set();
    const existingEmails = new Set();

    // Create admin and agents first
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@deanshipping.com" },
        update: {},
        create: {
            firstName: "Cicily",
            lastName: "Dean",
            email: "admin@deanshipping.com",
            countryCode: "+1",
            mobileNumber: "2421234567",
            role: "ADMIN",
        },
    });
    existingPhones.add("2421234567");
    existingEmails.add("admin@deanshipping.com");

    // Create 10 agents
    for (let i = 1; i <= 10; i++) {
        let phone = randomPhone();
        while (existingPhones.has(phone)) phone = randomPhone();
        existingPhones.add(phone);
        
        const email = `agent${i}@deanshipping.com`;
        existingEmails.add(email);

        usersToCreate.push({
            firstName: randomElement(FIRST_NAMES),
            lastName: randomElement(LAST_NAMES),
            email,
            countryCode: "+1",
            mobileNumber: phone,
            role: "AGENT",
            agentCode: `AGT${String(i).padStart(3, "0")}`,
            agentLocation: randomElement(locations).code,
        });
    }

    // Create regular users
    for (let i = 1; i <= userCount - 12; i++) {
        let phone = randomPhone();
        while (existingPhones.has(phone)) phone = randomPhone();
        existingPhones.add(phone);

        const firstName = randomElement(FIRST_NAMES);
        const lastName = randomElement(LAST_NAMES);
        let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
        while (existingEmails.has(email)) {
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1000, 9999)}@email.com`;
        }
        existingEmails.add(email);

        usersToCreate.push({
            firstName,
            lastName,
            email,
            countryCode: "+1",
            mobileNumber: phone,
            role: "USER",
        });
    }

    await batchInsert("user", usersToCreate);
    const users = await prisma.user.findMany();
    const regularUsers = users.filter(u => u.role === "USER");
    console.log(`  Total users: ${users.length}`);

    // ============================================
    // 3. PRICES (All route combinations)
    // ============================================
    console.log("\n💰 Creating prices for all routes...");
    
    // First, delete existing prices to avoid conflicts
    await prisma.price.deleteMany({});
    
    const priceCategories = [
        { category: "DRY_BOX", sizes: ["Small", "Medium", "Large"], basePrice: 50 },
        { category: "FROZEN_BOX", sizes: ["Small", "Medium", "Large"], basePrice: 65 },
        { category: "COOLER_BOX", sizes: ["Small", "Medium", "Large"], basePrice: 60 },
        { category: "ENVELOPE", sizes: ["Standard", "Large"], basePrice: 15 },
        { category: "LUGGAGE", sizes: ["Small", "Medium", "Large"], basePrice: 30 },
        { category: "PALLET", sizes: ["4 ft", "6 ft"], basePrice: 200 },
        { category: "VEHICLE", sizes: ["Motorcycle", "Small Car", "SUV/Truck"], basePrice: 150 },
        { category: "PASSENGER", sizes: ["Infant", "Child", "Adult"], basePrice: 0 },
        { category: "BUNDLE", sizes: ["Small", "Medium", "Large"], basePrice: 80 },
    ];

    const containerPrices = [
        { size: "20 ft", type: "DRY", basePrice: 1000 },
        { size: "40 ft", type: "DRY", basePrice: 1800 },
        { size: "20 ft", type: "FROZEN", basePrice: 1400 },
        { size: "40 ft", type: "FROZEN", basePrice: 2400 },
        { size: "20 ft", type: "COOLER", basePrice: 1200 },
        { size: "40 ft", type: "COOLER", basePrice: 2100 },
    ];

    const priceData = [];
    
    for (const from of locations) {
        for (const to of locations) {
            if (from.id === to.id) continue;

            // Regular categories (no type)
            for (const cat of priceCategories) {
                for (let i = 0; i < cat.sizes.length; i++) {
                    const multiplier = 1 + (i * 0.5);
                    const distanceMultiplier = randomFloat(0.9, 1.3);
                    priceData.push({
                        category: cat.category,
                        size: cat.sizes[i],
                        type: null,
                        value: Math.round(cat.basePrice * multiplier * distanceMultiplier),
                        fromId: from.id,
                        toId: to.id,
                    });
                }
            }

            // Container prices (with type)
            for (const cont of containerPrices) {
                const distanceMultiplier = randomFloat(0.9, 1.3);
                priceData.push({
                    category: "CONTAINER",
                    size: cont.size,
                    type: cont.type,
                    value: Math.round(cont.basePrice * distanceMultiplier),
                    fromId: from.id,
                    toId: to.id,
                });
            }
        }
    }

    await batchInsert("price", priceData);
    const priceCount = priceData.length;
    console.log(`  ✅ ${priceCount} prices created`);

    // ============================================
    // 4. SCHEDULES (20 recurring schedules)
    // ============================================
    console.log("\n📅 Creating schedules...");
    const scheduleData = [];
    const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    
    for (let i = 0; i < 20; i++) {
        const from = randomElement(locations);
        let to = randomElement(locations);
        while (to.id === from.id) to = randomElement(locations);

        scheduleData.push({
            name: `Route ${from.code} → ${to.code} #${i + 1}`,
            shipName: randomElement(SHIP_NAMES),
            departureDay: randomElement(daysOfWeek),
            departureTime: `${randomInt(6, 18)}:${randomElement(["00", "30"])}`,
            fromLocationId: from.id,
            toLocationId: to.id,
            isActive: Math.random() > 0.1,
        });
    }

    await batchInsert("schedule", scheduleData);
    const schedules = await prisma.schedule.findMany();
    console.log(`  ✅ ${schedules.length} schedules created`);

    // ============================================
    // 5. VOYAGES (200 voyages)
    // ============================================
    console.log("\n🚢 Creating 200 voyages...");
    const voyageData = [];
    
    for (let i = 1; i <= 200; i++) {
        const from = randomElement(locations);
        let to = randomElement(locations);
        while (to.id === from.id) to = randomElement(locations);
        const schedule = Math.random() > 0.3 ? randomElement(schedules) : null;

        voyageData.push({
            voyageNo: 1000 + i,
            shipName: randomElement(SHIP_NAMES),
            date: randomDate(-90, 60),
            status: randomElement(VOYAGE_STATUSES),
            fromId: from.id,
            toId: to.id,
            maxCargoCapacity: randomInt(50, 200),
            maxPassengers: randomInt(20, 100),
            currentCargoCount: 0,
            currentPassengers: 0,
            scheduleId: schedule?.id || null,
            notes: Math.random() > 0.7 ? `Voyage notes for trip ${i}` : null,
        });
    }

    await batchInsert("voyage", voyageData);
    const voyages = await prisma.voyage.findMany();
    console.log(`  ✅ ${voyages.length} voyages created`);

    // ============================================
    // 6. CARGO BOOKINGS (8000 bookings)
    // ============================================
    console.log("\n📦 Creating 8000 cargo bookings...");
    const cargoBookings = [];
    
    for (let i = 1; i <= 8000; i++) {
        const user = randomElement(regularUsers);
        const voyage = randomElement(voyages);
        const fromLoc = randomElement(locations);
        let toLoc = randomElement(locations);
        while (toLoc.id === fromLoc.id) toLoc = randomElement(locations);
        
        const service = randomElement(CARGO_SERVICES);
        const subtotal = randomFloat(50, 2000);
        const vatPercent = 12;
        const vatAmount = subtotal * (vatPercent / 100);
        const total = subtotal + vatAmount;

        cargoBookings.push({
            invoiceNo: `CRG-${String(i).padStart(6, "0")}`,
            userId: user.id,
            voyageId: Math.random() > 0.2 ? voyage.id : null,
            service,
            boxSubType: service === "BOX" ? randomElement(BOX_SUBTYPES) : null,
            containerNo: service === "CONTAINER" ? `CONT${randomInt(10000, 99999)}` : null,
            type: service === "CONTAINER" ? randomElement(["DRY", "FROZEN", "COOLER"]) : null,
            bookingDate: randomDate(-120, 30),
            fromLocation: fromLoc.code,
            toLocation: toLoc.code,
            contactName: `${user.firstName} ${user.lastName}`,
            contactPhone: user.mobileNumber,
            contactEmail: user.email,
            paymentStatus: randomElement(PAYMENT_STATUSES),
            subtotal,
            vatPercent,
            vatAmount,
            totalAmount: total,
            remark: Math.random() > 0.8 ? "Handle with care" : null,
        });
    }

    await batchInsert("cargoBooking", cargoBookings);
    const createdCargoBookings = await prisma.cargoBooking.findMany({ select: { id: true, userId: true, totalAmount: true, paymentStatus: true } });
    console.log(`  ✅ ${createdCargoBookings.length} cargo bookings created`);

    // ============================================
    // 7. CARGO ITEMS (20000 items)
    // ============================================
    console.log("\n📋 Creating cargo items...");
    const cargoItems = [];
    
    for (const booking of createdCargoBookings) {
        const itemCount = randomInt(1, 4);
        for (let j = 0; j < itemCount; j++) {
            const quantity = randomInt(1, 10);
            const unitPrice = randomFloat(10, 200);
            cargoItems.push({
                cargoBookingId: booking.id,
                itemType: randomElement([...CARGO_SIZES, "Fragile", "Hazardous", "Live"]),
                quantity,
                weight: randomFloat(0.5, 50),
                dimensions: `${randomInt(10, 100)}x${randomInt(10, 100)}x${randomInt(10, 100)}`,
                description: `Item ${j + 1} for booking`,
                unitPrice,
                total: quantity * unitPrice,
            });
        }
    }

    await batchInsert("cargoItem", cargoItems);
    console.log(`  ✅ ${cargoItems.length} cargo items created`);

    // ============================================
    // 8. PASSENGER BOOKINGS (5000 bookings)
    // ============================================
    console.log("\n🎫 Creating 5000 passenger bookings...");
    const passengerBookings = [];

    for (let i = 1; i <= 5000; i++) {
        const user = randomElement(regularUsers);
        const voyage = randomElement(voyages);
        const fromLoc = randomElement(locations);
        let toLoc = randomElement(locations);
        while (toLoc.id === fromLoc.id) toLoc = randomElement(locations);

        const adultCount = randomInt(1, 4);
        const childCount = randomInt(0, 3);
        const infantCount = randomInt(0, 2);
        
        const adultPrice = 150;
        const childPrice = 75;
        const subtotal = (adultCount * adultPrice) + (childCount * childPrice);
        const vatPercent = 12;
        const vatAmount = subtotal * (vatPercent / 100);
        const total = subtotal + vatAmount;

        passengerBookings.push({
            invoiceNo: `PAX-${String(i).padStart(6, "0")}`,
            userId: user.id,
            voyageId: Math.random() > 0.15 ? voyage.id : null,
            infantCount,
            childCount,
            adultCount,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            contact: user.mobileNumber,
            bookingDate: randomDate(-120, 30),
            fromLocation: fromLoc.code,
            toLocation: toLoc.code,
            idType: randomElement(ID_TYPES),
            paymentStatus: randomElement(PAYMENT_STATUSES),
            subtotal,
            vatPercent,
            vatAmount,
            totalAmount: total,
            remark: Math.random() > 0.9 ? "VIP passenger" : null,
        });
    }

    await batchInsert("passengerBooking", passengerBookings);
    const createdPassengerBookings = await prisma.passengerBooking.findMany({ select: { id: true, userId: true, totalAmount: true, paymentStatus: true } });
    console.log(`  ✅ ${createdPassengerBookings.length} passenger bookings created`);

    // ============================================
    // 9. PASSENGER LUGGAGE (8000 items)
    // ============================================
    console.log("\n🧳 Creating passenger luggage...");
    const luggageItems = [];
    const luggageTypes = ["CARRY_ON", "CHECKED_BAG", "OVERSIZED", "SPECIAL"];

    for (const booking of createdPassengerBookings) {
        const luggageCount = randomInt(0, 3);
        for (let j = 0; j < luggageCount; j++) {
            luggageItems.push({
                passengerBookingId: booking.id,
                type: randomElement(luggageTypes),
                weight: randomFloat(5, 30),
                quantity: randomInt(1, 3),
                price: randomFloat(20, 75),
            });
        }
    }

    await batchInsert("passengerLuggage", luggageItems);
    console.log(`  ✅ ${luggageItems.length} luggage items created`);

    // ============================================
    // 10. VEHICLES (2000 vehicles)
    // ============================================
    console.log("\n🚗 Creating 2000 vehicles...");
    const vehicleData = [];

    for (let i = 1; i <= 2000; i++) {
        const fromLoc = randomElement(locations);
        let toLoc = randomElement(locations);
        while (toLoc.id === fromLoc.id) toLoc = randomElement(locations);

        vehicleData.push({
            invoiceNo: `VEH-${String(i).padStart(6, "0")}`,
            registrationNo: `${randomElement(["AB", "NP", "GU", "EL"])}${randomInt(1000, 9999)}`,
            ownerName: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
            ownerEmail: `vehicle${i}@email.com`,
            contactNo: randomPhone(),
            vehicleType: randomElement(VEHICLE_TYPES),
            fromLocation: fromLoc.code,
            toLocation: toLoc.code,
            status: randomElement(VEHICLE_STATUSES),
            bookingDate: randomDate(-60, 30),
            voyageId: Math.random() > 0.5 ? randomElement(voyages).id : null,
            notes: Math.random() > 0.85 ? "Special handling required" : null,
        });
    }

    await batchInsert("vehicle", vehicleData);
    console.log(`  ✅ ${vehicleData.length} vehicles created`);

    // ============================================
    // 11. INVOICES (13000 invoices)
    // ============================================
    console.log("\n🧾 Creating invoices...");
    const invoices = [];

    // Invoices for cargo bookings
    for (const booking of createdCargoBookings) {
        const isPaid = booking.paymentStatus === "PAID";
        const isPartial = booking.paymentStatus === "PARTIAL";
        const paidAmount = isPaid ? booking.totalAmount : (isPartial ? booking.totalAmount * randomFloat(0.3, 0.7) : 0);

        invoices.push({
            invoiceNo: `INV-C-${booking.id.slice(-8)}`,
            userId: booking.userId,
            cargoBookingId: booking.id,
            subtotal: booking.totalAmount / 1.12,
            vatPercent: 12,
            vatAmount: booking.totalAmount - (booking.totalAmount / 1.12),
            totalAmount: booking.totalAmount,
            paidAmount,
            paymentStatus: booking.paymentStatus,
            paymentMode: isPaid || isPartial ? randomElement(["Cash", "Card", "Bank Transfer", "Online"]) : null,
            paidAt: isPaid ? randomDate(-90, 0) : null,
            dueDate: randomDate(0, 30),
        });
    }

    // Invoices for passenger bookings
    for (const booking of createdPassengerBookings) {
        const isPaid = booking.paymentStatus === "PAID";
        const isPartial = booking.paymentStatus === "PARTIAL";
        const paidAmount = isPaid ? booking.totalAmount : (isPartial ? booking.totalAmount * randomFloat(0.3, 0.7) : 0);

        invoices.push({
            invoiceNo: `INV-P-${booking.id.slice(-8)}`,
            userId: booking.userId,
            passengerBookingId: booking.id,
            subtotal: booking.totalAmount / 1.12,
            vatPercent: 12,
            vatAmount: booking.totalAmount - (booking.totalAmount / 1.12),
            totalAmount: booking.totalAmount,
            paidAmount,
            paymentStatus: booking.paymentStatus,
            paymentMode: isPaid || isPartial ? randomElement(["Cash", "Card", "Bank Transfer", "Online"]) : null,
            paidAt: isPaid ? randomDate(-90, 0) : null,
            dueDate: randomDate(0, 30),
        });
    }

    await batchInsert("invoice", invoices);
    console.log(`  ✅ ${invoices.length} invoices created`);

    // ============================================
    // 12. MANIFEST ITEMS (10000 items)
    // ============================================
    console.log("\n📜 Creating manifest items...");
    const manifestItems = [];
    const cargoBookingsWithVoyage = await prisma.cargoBooking.findMany({
        where: { voyageId: { not: null } },
        select: { id: true, voyageId: true, contactName: true, totalAmount: true },
        take: 6000,
    });

    const passengerBookingsWithVoyage = await prisma.passengerBooking.findMany({
        where: { voyageId: { not: null } },
        select: { id: true, voyageId: true, name: true, totalAmount: true },
        take: 4000,
    });

    for (const booking of cargoBookingsWithVoyage) {
        manifestItems.push({
            voyageId: booking.voyageId,
            cargoBookingId: booking.id,
            senderName: booking.contactName,
            receiverName: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
            itemDetails: `Cargo shipment`,
            quantity: randomInt(1, 10),
            amount: booking.totalAmount,
            status: randomElement(MANIFEST_STATUSES),
            loadedAt: Math.random() > 0.5 ? randomDate(-30, 0) : null,
            notes: Math.random() > 0.9 ? "Fragile items" : null,
        });
    }

    for (const booking of passengerBookingsWithVoyage) {
        manifestItems.push({
            voyageId: booking.voyageId,
            passengerBookingId: booking.id,
            senderName: booking.name,
            itemDetails: `Passenger ticket`,
            quantity: 1,
            amount: booking.totalAmount,
            status: randomElement(MANIFEST_STATUSES),
            notes: null,
        });
    }

    await batchInsert("manifestItem", manifestItems);
    console.log(`  ✅ ${manifestItems.length} manifest items created`);

    // ============================================
    // 13. NOTIFICATIONS (5000 notifications)
    // ============================================
    console.log("\n🔔 Creating notifications...");
    const notificationTypes = ["booking", "payment", "system", "schedule", "reminder"];
    const notificationTitles = [
        "Booking Confirmed", "Payment Received", "Voyage Departure Reminder",
        "Schedule Change", "Payment Due", "Booking Cancelled", "New Voyage Available"
    ];

    const notifications = [];
    for (let i = 0; i < 5000; i++) {
        const user = randomElement(users);
        notifications.push({
            userId: user.id,
            title: randomElement(notificationTitles),
            message: `Notification message ${i + 1} for user ${user.firstName}`,
            type: randomElement(notificationTypes),
            isRead: Math.random() > 0.4,
            createdAt: randomDate(-60, 0),
        });
    }

    await batchInsert("notification", notifications);
    console.log(`  ✅ ${notifications.length} notifications created`);

    // ============================================
    // 14. INCIDENT REPORTS (200 reports)
    // ============================================
    console.log("\n⚠️ Creating incident reports...");
    const incidentTypes = ["Container Damaged", "Cargo Damaged", "Delay", "Lost Item", "Equipment Failure", "Other"];
    const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const incidentStatuses = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];

    const agents = users.filter(u => u.role === "AGENT" || u.role === "ADMIN");
    const incidents = [];

    for (let i = 0; i < 200; i++) {
        const reporter = randomElement(agents);
        incidents.push({
            reportedById: reporter.id,
            incidentType: randomElement(incidentTypes),
            title: `Incident Report #${i + 1}`,
            description: `Description of incident ${i + 1}. This requires attention.`,
            location: randomElement(locations).name,
            invoiceNo: Math.random() > 0.5 ? `INV-${randomInt(1000, 9999)}` : null,
            date: randomDate(-30, 0),
            time: `${randomInt(6, 22)}:${randomElement(["00", "15", "30", "45"])}`,
            insuranceTaken: Math.random() > 0.7,
            severity: randomElement(severities),
            status: randomElement(incidentStatuses),
            images: [],
        });
    }

    await batchInsert("incidentReport", incidents);
    console.log(`  ✅ ${incidents.length} incident reports created`);

    // ============================================
    // 15. EQUIPMENT (50 items)
    // ============================================
    console.log("\n🔧 Creating equipment...");
    const equipmentTypes = ["FORKLIFT", "MULE", "CHASSIS", "CONTAINER", "FLAT_RACK"];
    const equipmentStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];
    const equipment = [];

    for (let i = 0; i < 50; i++) {
        const type = randomElement(equipmentTypes);
        equipment.push({
            type,
            name: `${type} #${String(i + 1).padStart(2, "0")}`,
            identifier: `${type.slice(0, 2)}${String(i + 1).padStart(4, "0")}`,
            locationId: randomElement(locations).id,
            status: randomElement(equipmentStatuses),
        });
    }

    await batchInsert("equipment", equipment);
    console.log(`  ✅ ${equipment.length} equipment items created`);

    // ============================================
    // 16. AUDIT LOGS (3000 logs)
    // ============================================
    console.log("\n📝 Creating audit logs...");
    const auditActions = [
        "LOGIN", "LOGOUT", "CREATE_BOOKING", "UPDATE_BOOKING", "DELETE_BOOKING",
        "CREATE_VOYAGE", "UPDATE_VOYAGE", "UPDATE_PRICE", "CREATE_USER", "UPDATE_USER"
    ];
    const entities = ["user", "cargo_booking", "passenger_booking", "voyage", "price", "invoice"];

    const auditLogs = [];
    for (let i = 0; i < 3000; i++) {
        auditLogs.push({
            userId: randomElement(users).id,
            action: randomElement(auditActions),
            entity: randomElement(entities),
            entityId: `entity-${randomInt(1, 1000)}`,
            ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
            createdAt: randomDate(-90, 0),
        });
    }

    await batchInsert("auditLog", auditLogs);
    console.log(`  ✅ ${auditLogs.length} audit logs created`);

    // ============================================
    // SUMMARY
    // ============================================
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 MASSIVE SEED COMPLETED!");
    console.log("=".repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log("\n📊 RECORDS CREATED:");
    console.log(`   • Locations:          ${locations.length}`);
    console.log(`   • Users:              ${users.length}`);
    console.log(`   • Prices:             ${priceCount}`);
    console.log(`   • Schedules:          ${schedules.length}`);
    console.log(`   • Voyages:            ${voyages.length}`);
    console.log(`   • Cargo Bookings:     ${createdCargoBookings.length}`);
    console.log(`   • Cargo Items:        ${cargoItems.length}`);
    console.log(`   • Passenger Bookings: ${createdPassengerBookings.length}`);
    console.log(`   • Luggage Items:      ${luggageItems.length}`);
    console.log(`   • Vehicles:           ${vehicleData.length}`);
    console.log(`   • Invoices:           ${invoices.length}`);
    console.log(`   • Manifest Items:     ${manifestItems.length}`);
    console.log(`   • Notifications:      ${notifications.length}`);
    console.log(`   • Incident Reports:   ${incidents.length}`);
    console.log(`   • Equipment:          ${equipment.length}`);
    console.log(`   • Audit Logs:         ${auditLogs.length}`);
    
    const total = locations.length + users.length + priceCount + schedules.length + 
                  voyages.length + createdCargoBookings.length + cargoItems.length +
                  createdPassengerBookings.length + luggageItems.length + vehicleData.length +
                  invoices.length + manifestItems.length + notifications.length +
                  incidents.length + equipment.length + auditLogs.length;
    
    console.log(`\n   📈 TOTAL: ${total.toLocaleString()} records`);
    console.log("=".repeat(50));
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });