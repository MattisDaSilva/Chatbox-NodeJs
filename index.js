const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatapp"
});

db.connect(function (err) {
    if (err)
        throw err;
    console.log("Connecté à la base de données MySQL!");
});


const createMessageTableQuery = `
    CREATE TABLE IF NOT EXISTS message (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        content VARCHAR(140) NOT NULL,
        hour TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createMessageTableQuery, (err) => {
    if (err) throw err;
    console.log('Table "message" créée avec succès ou déjà existante');
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware pour traiter les données POST
app.use(express.urlencoded({ extended: true }));

// Define a route to serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});



// Socket.IO connection handling

io.on('connection', (socket) => {

    console.log('Un client s\'est connecté');

    const selectAllMessagesQuery = 'SELECT * FROM message';

        db.query(selectAllMessagesQuery, (err, results) => {
            if (err) {
                console.error('Erreur lors de la requête MySQL :', err);
            } else {
                // Envoyer les résultats de la requête MySQL au client
                socket.emit('receive-json', results);
            }
        });

    socket.on('send message', (chat) => {

        const insertMessageQuery = 'INSERT INTO message (username, content, hour ) VALUES (?, ?, ?)';
        db.query(insertMessageQuery, [chat.username, chat.message, chat.time], (err, result) => {
            if (err) throw err;
            console.log('Nouveau message inséré avec succès. ID:', result.insertId);
        });

    });

    socket.on('send-json', () => {
        const selectAllMessagesQuery = 'SELECT * FROM message';

        db.query(selectAllMessagesQuery, (err, results) => {
            if (err) {
                console.error('Erreur lors de la requête MySQL :', err);
            } else {
                // Envoyer les résultats de la requête MySQL au client
                const lastRow = results.length > 0 ? results[results.length - 1] : null;
                socket.emit('update-json', lastRow);
            }
        });
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
