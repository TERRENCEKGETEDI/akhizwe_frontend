// Test login against the online backend
const https = require('https');
const querystring = require('querystring');

const testLoginOnline = () => {
  const postData = JSON.stringify({
    phone: "0711111111",
    password: "password"
  });

  const options = {
    hostname: 'akhizwe-backend.onrender.com',
    port: 443,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'sec-ch-ua-platform': '"Windows"',
      'Referer': 'http://localhost:5173/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'DNT': '1',
      'sec-ch-ua-mobile': '?0'
    }
  };

  console.log('Testing login against online backend: https://akhizwe-backend.onrender.com/api/login');
  console.log('Request data:', postData);

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n=== RESPONSE STATUS ===');
      console.log('Status Code:', res.statusCode);
      console.log('Status Message:', res.statusMessage);
      
      console.log('\n=== RESPONSE HEADERS ===');
      console.log(JSON.stringify(res.headers, null, 2));

      console.log('\n=== RESPONSE BODY ===');
      try {
        const parsedData = JSON.parse(data);
        console.log(JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(postData);
  req.end();
};

testLoginOnline();