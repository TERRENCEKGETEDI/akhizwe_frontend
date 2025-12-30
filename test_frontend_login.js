// Test that simulates exactly what the frontend Login component does
import { buildApiUrl } from './src/utils/api.js';

console.log('🧪 Testing Frontend Login Component Behavior');
console.log('===========================================');

// Simulate the exact login process from Login.jsx
async function testFrontendLogin() {
  const phone = '0711111111';
  const password = 'password';
  
  console.log('📱 Simulating frontend login with:');
  console.log('   Phone:', phone);
  console.log('   Password:', password);
  
  // This is exactly what the frontend does
  const loginUrl = buildApiUrl('login');
  console.log('🌐 Frontend API URL:', loginUrl);
  
  try {
    console.log('📡 Making fetch request...');
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    
    console.log('📊 Response status:', res.status);
    console.log('📊 Response ok:', res.ok);
    
    const data = await res.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (res.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   Token received:', !!data.token);
      console.log('   User data received:', !!data.user);
      if (data.user) {
        console.log('   User email:', data.user.email);
        console.log('   User role:', data.user.role);
      }
    } else {
      console.log('❌ LOGIN FAILED!');
      console.log('   Error message:', data.message);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR!');
    console.log('   Error:', error.message);
    console.log('   This means the frontend cannot reach the backend');
  }
}

// Also test what the environment variable contains
console.log('🔧 Environment Configuration:');
console.log('   VITE_API_URL from .env: https://akhizwe-backend.onrender.com');
console.log('   This should be loaded by Vite in browser context');
console.log('');

// Run the test
testFrontendLogin();