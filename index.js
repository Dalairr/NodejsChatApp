const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 3700;

// Views (Jade/Pug) + static files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoint for Jenkins
app.get('/health', (_req, res) => res.type('text/plain').send('ok'));

// Main page (renders chat UI)
app.get('/', (_req, res) => res.render('page'));

const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.emit('message', { username: 'Server', message: 'Welcome to the Real Time Web Chat' });
  socket.on('send', (data) => io.emit('message', data));
});

server.listen(port, () => {
  console.log(`Node.js listening on port ${port}`);
});
