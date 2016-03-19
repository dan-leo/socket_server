// Load the TCP Library
net = require('net');

// Port
PORT = 23;

// Keep track of the clients
var clients = [];

// Start a TCP Server
var server = net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort

    // Put this new client in the list
    clients.push(socket);

    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");
    broadcast(socket.name + " joined the chat\n", socket);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        broadcast(socket.name + "> " + data, socket);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message + '\n')
    }

}).listen(PORT);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port " + PORT + "\n");

server.on('error', function (e) {
    console.log('Error: ' + e);
    if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(function () {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
    else if (e.code == 'ECONNRESET') {
        console.log('Remote connection reset.');
    }
});
