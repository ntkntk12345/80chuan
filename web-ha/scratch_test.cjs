const http = require('http');

const loginData = JSON.stringify({
  phone: 'BichHa80land',
  password: 'BichHa80land010201@!'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
  console.log(`Login Status: ${res.statusCode}, Cookie: ${cookie}`);
  
  const updateData = JSON.stringify({
    phone: 'BichHa80land',
    avatar: 'test'
  });

  const updateReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': updateData.length,
      'Cookie': cookie
    }
  }, updateRes => {
    let body = '';
    updateRes.on('data', chunk => body += chunk);
    updateRes.on('end', () => console.log(`Update Status: ${updateRes.statusCode}, Body: ${body}`));
  });
  
  updateReq.write(updateData);
  updateReq.end();
});

loginReq.write(loginData);
loginReq.end();
