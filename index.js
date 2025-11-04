var express = require("express");
var app = express();
var port = process.env.PORT || 3700;

// View setup
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// ✅ Simple routes for health + root
app.get("/", (_req, res) => res.type('text/plain').send("Node Chat App is alive 🚀"));
app.get("/health", (_req, res) => res.type('text/plain').send("ok"));

// Serve static files
app.use(express.static(__dirname + '/public'));

// Start server
var midPort = app.listen(port, function () {
  console.log('Node.js listening on port ' + port);
});

// Setup socket.io
var io = require('socket.io').listen(midPort);

// Socket events
io.sockets.on('connection', function (socket) {
  socket.emit('message', { message: 'Welcome to the Real Time Web Chat' });
  socket.on('send', function (data) {
    io.sockets.emit('message', data);
  });
});
