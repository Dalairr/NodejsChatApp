var express = require("express");
var app = express();
var port = process.env.PORT || 3700;

// Views (Jade)
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// Health + simple root (keeps Jenkins happy)
app.get("/health", (_req, res) => res.type('text/plain').send('ok'));
app.get("/", (_req, res) => res.type('text/plain').send('Node Chat App is alive 🚀'));

// Static
app.use(express.static(__dirname + '/public'));

// Start HTTP server and attach socket.io
var server = app.listen(port, function () {
  console.log('Node.js listening on port ' + port);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  socket.emit('message', { message: 'Welcome to the Real Time Web Chat' });
  socket.on('send', function (data) {
    io.sockets.emit('message', data);
  });
});
