// Test what happens with localhost (like the failing curl command)
console.log('🧪 Testing Localhost Login (Like Your Curl Command)');
console.log('==================================================');

async function testLocalhostLogin() {
  const phone = '0711111111';
  const password = 'password';
  
  // This is what your curl command does
  const localhostUrl = 'https://akhizwe-backend.onrender.com/api/login';
  
  console.log('📱 Testing with:');
  console.log('   Phone:', phone);
  console.log('   Password:', password);
  console.log('🌐 Localhost URL:', localhostUrl);
  
  try {
    console.log('📡 Making fetch request to localhost...');
    const res = await fetch(localhostUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    
    console.log('📊 Response status:', res.status);
    
    const data = await res.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('❌ NETWORK ERROR (Expected):');
    console.log('   Error:', error.message);
    console.log('   This is exactly what happens with your curl command!');
  }
}

testLocalhostLogin();