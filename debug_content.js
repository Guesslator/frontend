const fetch = require('node-fetch');

const API_URL = "http://127.0.0.1:8080";

async function testFetch() {
    console.log("Fetching content (LIMIT=15, NO LANG)...");
    try {
        const res = await fetch(`${API_URL}/content?limit=15&page=1`);
        if (!res.ok) {
            console.log("Error:", res.status, res.statusText);
            const t = await res.text();
            console.log(t);
            return;
        }

        const data = await res.json();
        const items = data.items || [];
        console.log(`Fetched ${items.length} items.`);

        items.forEach((item, i) => {
            console.log(`[${i}] ID: ${item.id}`);
            console.log(`    Slug: ${item.slug}`);
            console.log(`    Translations count: ${item.translations?.length}`);
            if (item.translations?.length > 0) {
                console.log(`    First T: ${item.translations[0].language} - ${item.translations[0].title}`);
            } else {
                console.log(`    NO TRANSLATIONS!`);
            }
        });

    } catch (e) {
        console.log("Fetch failed:", e);
    }
}

testFetch();
