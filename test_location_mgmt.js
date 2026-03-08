import fetch from "node-fetch";

async function verifyLocationManagement() {
    console.log("--- Verifying Location Management ---");
    const baseUrl = "http://localhost:3000"; // Assuming dev server is running

    try {
        // 1. Test GET /api/locations
        console.log("Testing GET /api/locations...");
        const getRes = await fetch(`${baseUrl}/api/locations`);
        const getData = await getRes.json();
        console.log(`Status: ${getRes.status}`);
        console.log(`Locations count: ${getData.locations?.length || 0}`);

        if (getRes.ok) {
            console.log("✅ GET /api/locations is working.");
        } else {
            console.log("❌ GET /api/locations failed.");
        }

        // 2. Test POST /api/locations (Requires Auth, so we'll just check if it's there)
        console.log("\nTesting POST /api/locations (Auth check)...");
        const postRes = await fetch(`${baseUrl}/api/locations`, {
            method: "POST",
            body: JSON.stringify({ code: "TEST", name: "Test Location" })
        });
        console.log(`Status (Expected 401/302 if not logged in): ${postRes.status}`);

    } catch (err) {
        console.error(`Verification error: ${err.message}`);
        console.log("Note: This test requires the dev server to be running at localhost:3000.");
    }

    console.log("\n--- Verification Complete ---");
}

verifyLocationManagement();
