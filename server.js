var net = require('net');

PORT = 23;
HOST = '';

var sockets  = [];

var char, string = "";

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
    sockets.push(socket);
    remoteAddr = socket.remoteAddress;
    socket.write('connected\r\n');
    console.log('remote ip: %s', remoteAddr);
    server.getConnections(function (err, count) {
        console.log('connections: %j', count);
    });

    socket.on('data', function (data){
        receiveData(socket, data);
        // socket.write(data + '\r');
    });

    socket.on('close', function(){
        closeSocket(socket);
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

/*
 * Print a socket stream of data to console.
 */
function print_stream(data, id, remoteAddr) {
    char = data.toString().charCodeAt(0);

    if (char === 10 || char === 13){
        console.log(id + " " + remoteAddr + " " + string);
        string = "";
    }
    else
    {
        string+=data.toString();
    }
}

/*
 * Cleans the input of carriage return, newline
 */
function cleanInput(data) {
    return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

/*
 * Method executed when data is received from a socket
 */
function receiveData(socket, data) {
    var cleanData = cleanInput(data);
    if(cleanData === "@quit") {
        socket.end('Goodbye!\n');
    }
    else {
        for(var i = 0; i < sockets.length; i++) {
            if (sockets[i] !== socket) {
                sockets[i].write(data);
            }
            else
            {
                print_stream(data, i, sockets[i].remoteAddress);
            }
        }
    }
}

/*
 * Callback method executed when a new TCP socket is opened.
 */
function newSocket(socket) {
    sockets.push(socket);
    socket.write('Welcome to the Telnet server!\n');
    socket.on('data', function(data) {
        receiveData(socket, data);
    });
    socket.on('end', function() {
        closeSocket(socket);
    });
}