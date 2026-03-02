const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testFetch() {
    const startDate = "2026-03-02";
    const endDate = "2026-03-07";
    const url = `http://localhost:3000/api/schedules?published=true&startDate=${startDate}&endDate=${endDate}&limit=100`;
    console.log(`Fetching from ${url}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`Fetch failed with status: ${res.status}`);
            const text = await res.text();
            console.log(`Response: ${text.substring(0, 200)}`);
        } else {
            const data = await res.json();
            console.log(`Success! Total schedules returned: ${data.schedules.length}`);
            data.schedules.forEach(s => {
                console.log(`- Ship: ${s.shipName}, Date: ${s.date}, Published: ${s.isPublished}, Events: ${s.events.length}`);
            });
        }
    } catch (err) {
        console.error("Fetch error:", err.message);
    }
}

testFetch();
