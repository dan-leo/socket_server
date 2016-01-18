var net = require('net');

PORT = 23;
HOST = '';

var sockets  = [];

var server = net.createServer(function (socket) {
    socket.write('Welcome to the Telnet server!\r\n');
    // socket.end('goodbye');
});

server.listen({
    port: PORT,
    host: HOST
}, function () {
    address = server.address();
console.log('opened server on %j', address);
});

server.on('connection', function (socket) {
    remoteAddr = socket.remoteAddress;
    socket.write('connected\r');
    console.log('remote ip: %s', remoteAddr);
    server.getConnections(function (err, count) {
        console.log('connections: %j', count);
    });

    socket.on('data', function (data){
        console.log(data.toString());
        // socket.write(data + '\r');
    });

    socket.on('close', function(){
        console.log('%s is now closed', remoteAddr);
    })
});

server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(function () {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
});

/*
 * Method executed when a socket ends
 */
function closeSocket(socket) {
    var i = sockets.indexOf(socket);
    if (i != -1) {
        sockets.splice(i, 1);
    }
}