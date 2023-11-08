const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const mensajes = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(socket.id);

    //Eventos en escucha
    

    socket.emit('ALLmsg', mensajes);

    socket.on('chat message',data =>{

        mensajes.push(`${data.nickname}: ${data.message}`);
        socket.broadcast.emit('chat message',`${data.nickname}: ${data.message}`);
        console.log(mensajes);

    })

    socket.on('ALLmsg',data =>{
        io.emit('ALLmsg',data);
    })

    
    socket.on('disconnect', () => {
        // console.log(`Usuario desconectado: ${socket.id}`);
      });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});