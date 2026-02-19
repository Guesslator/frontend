const fetch = require('node-fetch');

const API_URL = "http://127.0.0.1:8080";

async function testFetch() {
    console.log("Fetching content with ?lang=tr ...");
    try {
        const res = await fetch(`${API_URL}/content?limit=15&page=1&lang=tr`);
        if (!res.ok) {
            console.log("Error:", res.status, res.statusText);
            return;
        }

        const data = await res.json();
        const items = data.items || [];
        console.log(`Fetched ${items.length} items.`);

        let trCount = 0;
        let nonTrCount = 0;

        items.forEach((item, i) => {
            const hasTr = item.translations.some(t => t.language === 'tr');
            if (hasTr) trCount++;
            else nonTrCount++;

            console.log(`[${i}] ID: ${item.id} | Has TR: ${hasTr}`);
            if (!hasTr) {
                console.log(`    Languages: ${item.translations.map(t => t.language).join(', ')}`);
            }
        });

        console.log("--- Summary ---");
        console.log(`Total: ${items.length}`);
        console.log(`With TR: ${trCount}`);
        console.log(`Without TR: ${nonTrCount}`);

        if (nonTrCount === 0 && items.length > 0) {
            console.log("⚠️ SUSPICIOUS: Only TR items returned. Backend might be filtering by lang parameter.");
        } else {
            console.log("✅ OK: Non-TR items returned. Backend is NOT strict filtering.");
        }

    } catch (e) {
        console.log("Fetch failed:", e);
    }
}

testFetch();
