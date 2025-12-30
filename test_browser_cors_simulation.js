// Test that simulates exactly what a browser does with CORS
console.log('🌐 Simulating Browser CORS Request');
console.log('=====================================');

async function testBrowserCORS() {
    const browserOrigin = 'http://localhost:5173';
    
    console.log('📍 Browser Origin:', browserOrigin);
    console.log('🌐 Making request with Origin header...');
    
    try {
        // This simulates exactly what the browser does
        const response = await fetch('https://akhizwe-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Origin': browserOrigin  // This is what triggers CORS
            },
            body: JSON.stringify({
                phone: '0711111111',
                password: 'password'
            }),
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response OK:', response.ok);
        
        const data = await response.json();
        console.log('📊 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('\n✅ BROWSER CORS TEST: SUCCESS');
            console.log('🎯 This means CORS is allowing localhost:5173');
        } else {
            console.log('\n❌ BROWSER CORS TEST: FAILED');
            console.log('🚨 This indicates CORS is blocking localhost:5173');
            console.log('🔍 Error details:', data);
        }
        
    } catch (error) {
        console.log('\n❌ BROWSER CORS TEST: NETWORK ERROR');
        console.log('🚨 Browser blocked this request due to CORS policy');
        console.log('💥 Error:', error.message);
        console.log('\n📋 This means:');
        console.log('   1. Browser sent request with Origin: http://localhost:5173');
        console.log('   2. Backend rejected it due to CORS policy');
        console.log('   3. Browser blocked the response');
    }
}

// Also test what happens with an allowed origin
async function testAllowedOrigin() {
    console.log('\n🧪 Testing Allowed Origin (localhost:3000)');
    console.log('==========================================');
    
    try {
        const response = await fetch('https://akhizwe-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'  // This IS allowed
            },
            body: JSON.stringify({
                phone: '0711111111',
                password: 'password'
            }),
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response OK:', response.ok);
        
        if (response.ok) {
            console.log('✅ ALLOWED ORIGIN TEST: SUCCESS');
            console.log('   localhost:3000 works fine');
        } else {
            console.log('❌ ALLOWED ORIGIN TEST: FAILED');
        }
        
    } catch (error) {
        console.log('❌ Network error (unexpected):', error.message);
    }
}

// Test with no origin (like curl)
async function testNoOrigin() {
    console.log('\n🧪 Testing No Origin (like curl)');
    console.log('=================================');
    
    try {
        const response = await fetch('https://akhizwe-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
                // No Origin header
            },
            body: JSON.stringify({
                phone: '0711111111',
                password: 'password'
            }),
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response OK:', response.ok);
        
        if (response.ok) {
            console.log('✅ NO ORIGIN TEST: SUCCESS');
            console.log('   This explains why curl works');
        }
        
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

// Run all tests
testBrowserCORS()
    .then(() => testAllowedOrigin())
    .then(() => testNoOrigin())
    .then(() => {
        console.log('\n📋 CORS TEST SUMMARY:');
        console.log('======================');
        console.log('🔍 If browser test failed: CORS blocking localhost:5173');
        console.log('✅ If allowed origin works: CORS config is correct');
        console.log('✅ If no origin works: API backend is functional');
        console.log('\n💡 This explains why:');
        console.log('   • curl works (no CORS)');
        console.log('   • Node.js tests work (no CORS)');
        console.log('   • Browser might fail (CORS blocked)');
    });