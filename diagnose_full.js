const fetch = require('node-fetch');

const API_URL = "http://127.0.0.1:8080";

async function diagnose() {
    console.log("========================================");
    console.log("🔍 FULL SYSTEM DIAGNOSTIC");
    console.log(`Backend URL: ${API_URL}`);
    console.log("========================================\n");

    // 1. BACKEND REACHABILITY
    console.log("1️⃣  Checking BACKEND REACHABILITY...");
    try {
        const start = Date.now();
        const res = await fetch(API_URL);
        console.log(`   ✅ SUCCESS: Received ${res.status} ${res.statusText} in ${Date.now() - start}ms`);
    } catch (e) {
        console.log(`   ❌ FAILED: Could not connect to backend. Error: ${e.message}`);
        console.log("   👉 ACTION: Check if 'npm run start:dev' is running in backend terminal.");
        return;
    }

    // 2. DATABASE CONNECTIVITY (VIA CONTENT ENDPOINT)
    console.log("\n2️⃣  Checking DATABASE CONNECTION (via /content)...");
    try {
        const start = Date.now();
        const res = await fetch(`${API_URL}/content?lang=en`);
        const duration = Date.now() - start;

        if (res.ok) {
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : (data.items ? data.items.length : 0);
            console.log(`   ✅ SUCCESS: Fetched ${count} items in ${duration}ms`);
        } else {
            console.log(`   ❌ FAILED: Backend returned ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log(`   Response Body: ${text.substring(0, 200)}...`);
        }

        if (duration > 2000) {
            console.log("   ⚠️  WARNING: High latency detected. Database connection might be slow.");
        }

    } catch (e) {
        console.log(`   ❌ FAILED: Error fetching content. ${e.message}`);
    }

    // 3. AUTHENTICATION ENDPOINT
    console.log("\n3️⃣  Checking AUTH ENDPOINT...");
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "test@test.com", password: "test" }) // Intentionally wrong
        });

        if (res.status === 401) {
            console.log(`   ✅ SUCCESS: Auth endpoint correctly rejected invalid credentials (401).`);
        } else {
            console.log(`   ⚠️  UNEXPECTED: Auth endpoint returned ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.log(`   ❌ FAILED: Auth check failed. ${e.message}`);
    }

    console.log("\n========================================");
    console.log("🏁 DIAGNOSTIC COMPLETE");
    console.log("========================================");
}

diagnose();
