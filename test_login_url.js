// Test what URL the Login component is actually using
import { buildApiUrl } from './src/utils/api.js';

console.log('🔍 Login Component URL Diagnostic');
console.log('=================================');

console.log('📋 Environment Variables:');
console.log('   VITE_API_URL:', process.env.VITE_API_URL || 'Not set');

// Test what the Login component would build
const loginUrl = buildApiUrl('login');
console.log('\n🔗 Login Component API URL:');
console.log('   ', loginUrl);

// Test if this URL is correct
if (loginUrl.includes('localhost:5000')) {
    console.log('\n❌ PROBLEM: Login component still using localhost:5000!');
    console.log('   This explains why Network tab shows localhost:5000');
} else if (loginUrl.includes('akhizwe-backend.onrender.com')) {
    console.log('\n✅ GOOD: Login component using deployed backend');
    console.log('   Network tab should show akhizwe-backend.onrender.com');
} else {
    console.log('\n❓ UNKNOWN: Unexpected URL format');
}

// Test the actual fetch
async function testActualFetch() {
    console.log('\n🧪 Testing actual fetch request...');
    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '0711111111', password: 'password' }),
        });
        console.log('📊 Response:', response.status, response.ok ? 'SUCCESS' : 'FAILED');
        if (response.ok) {
            const data = await response.json();
            console.log('🎯 URL works correctly for login');
        }
    } catch (error) {
        console.log('❌ Fetch failed:', error.message);
    }
}

testActualFetch();