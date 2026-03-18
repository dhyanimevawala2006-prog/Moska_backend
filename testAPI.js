const http = require('http');

console.log('Testing API endpoint...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/product/getall',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const json = JSON.parse(data);
      console.log('\n✅ Products count:', json.data?.length || 0);
      if (json.data && json.data.length > 0) {
        console.log('First product:', json.data[0].pname);
      }
    } catch (e) {
      console.error('Failed to parse JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure backend server is running on port 3000');
});

req.end();
