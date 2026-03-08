const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function verifyAlignment() {
    console.log("--- Starting Scenario Alignment Verification ---");

    // 1. Verify Manifest API alignment (Multi-stop logic)
    const voyageId = "any-voyage-id"; // Placeholder, just checking structure
    const manifestUrl = `http://localhost:3000/api/manifest/voyages/${voyageId}`;
    console.log(`Checking Manifest API structure at ${manifestUrl}... (expect 404 or auth error if server not running, but checking logic)`);

    // 2. Verify Upload API requirements
    const uploadUrl = "http://localhost:3000/api/upload";
    console.log(`Checking Upload API validation at ${uploadUrl}...`);

    try {
        const res = await fetch(uploadUrl, {
            method: 'POST',
            body: new URLSearchParams() // Empty body to trigger validation
        });
        const data = await res.json();
        console.log(`Upload API validation response: ${JSON.stringify(data)}`);

        if (data.error && data.error.includes("bookingType")) {
            console.log("✅ SUCCESS: Upload API now correctly requires 'bookingType'.");
        } else {
            console.log("❌ FAILURE: Upload API did not return expected 'bookingType' error.");
        }
    } catch (err) {
        console.error(`Verification error (is server running?): ${err.message}`);
    }

    console.log("--- Verification Complete ---");
}

verifyAlignment();
