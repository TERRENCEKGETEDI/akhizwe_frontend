// Test script to verify API configuration
import { API_BASE_URL, buildApiUrl } from './src/utils/api.js';

console.log('🔧 API Configuration Test');
console.log('========================');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Login endpoint:', buildApiUrl('login'));
console.log('Register endpoint:', buildApiUrl('register'));

// Test the actual login endpoint
async function testLogin() {
  console.log('\n🧪 Testing login endpoint...');
  
  try {
    const response = await fetch(buildApiUrl('login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0711111111', password: 'password' }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login test successful!');
      console.log('Token received:', data.token ? 'Yes' : 'No');
      console.log('User data:', data.user ? 'Yes' : 'No');
    } else {
      console.log('❌ Login test failed:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testLogin();