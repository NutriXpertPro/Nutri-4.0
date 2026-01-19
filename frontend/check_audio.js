const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/sounds/notification.mp3',
    method: 'HEAD'
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
