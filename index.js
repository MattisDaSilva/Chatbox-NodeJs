const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware pour traiter les données POST
app.use(express.urlencoded({ extended: true }));

// Define a route to serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route pour gérer le formulaire soumis
app.post('/submit', (req, res) => {
  const inputValue = req.body.inputName; // inputName est le nom de votre champ d'entrée dans le formulaire
  console.log('Valeur de l\'input:', inputValue);
  // Faites ce que vous voulez avec la valeur de l'input ici
  res.send('Données reçues avec succès.');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle chat messages
  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    io.emit('chat message', msg); // Broadcast the message to all connected clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
