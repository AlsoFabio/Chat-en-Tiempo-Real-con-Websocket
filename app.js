// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

// const connectDB = require('./db.js')

// connectDB()

// const mensajes = []

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', (socket) => {
//     console.log(socket.id);

//     //Eventos en escucha
//     socket.on('user connected', (nickname) => {
//         const welcomeMessage = `Usuario ${nickname} se ha conectado`;
//         mensajes.push(welcomeMessage);//cambiar cuando se agrege la persistencia de datos
//         io.emit('chat message', welcomeMessage); // Envía el mensaje a todos los clientes
//     });

//     socket.emit('ALLmsg', mensajes);

//     socket.on('chat message',data =>{

//         mensajes.push(`${data.nickname}: ${data.message}`);
//         socket.broadcast.emit('chat message',`${data.nickname}: ${data.message}`);
//         console.log(mensajes);

//     })

//     socket.on('ALLmsg',data =>{
//         io.emit('ALLmsg',data);
//     })

//     socket.on('disconnect', () => {
//         // console.log(`Usuario desconectado: ${socket.id}`);
//       });
// });

// server.listen(3000, () => {
//     console.log('listening on *:3000');
// });

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connectDB = require("./db.js");
const { Mensaje } = require("./model-mensaje.js"); // Importa el modelo Mensaje

connectDB();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log(socket.id);

  // Funcion que trae la lista completa de mensajes
  const traerMensajes = async () => {
    try {
      const mensajes = await Mensaje.find();
      const mensajesFormateados = mensajes.map((mensaje) => {
        return `${mensaje.fecha} | ${mensaje.texto}`;
      });
      return mensajesFormateados;
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      return [];
    }
  };

  // Eventos en escucha ----------------------

  // Emitir los mensajes formateados cuando un cliente se conecta
  traerMensajes().then((mensajesFormateados) => {
    socket.emit("mensajes", mensajesFormateados);
  });
  let UsuarioActual = ''
  // Nuevo usuario conectandose
  socket.on("user connected", async (nickname) => {
    const welcomeMessage = `Usuario ${nickname} se ha conectado`;
    UsuarioActual= nickname;
    // Guarda el mensaje en la base de datos
    const mensaje = new Mensaje({
      texto: welcomeMessage,
      usuario: nickname,
      fecha: obtenerHoraActual(),
    });

    await mensaje.save(); // Guarda el mensaje en la base de datos

    io.emit("chat message", `${obtenerHoraActual()} | ${welcomeMessage}`); // Envía el mensaje a todos los clientes
  });

  socket.on("chat message", async (data) => {
    const mensaje = new Mensaje({
      texto: data.message,
      usuario: data.nickname,
      fecha: obtenerHoraActual(),
    });

    await mensaje.save(); // Guarda el mensaje en la base de datos

    socket.broadcast.emit(
      "chat message",
      `${obtenerHoraActual()} | ${data.nickname}: ${data.message}`
    );
  });

  // Manejar el evento de "usuario está escribiendo"
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // Manejar el evento de dejar de escribir
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing");
  });

  socket.on("disconnect", async() => {
    const mensaje = await Mensaje.findOne({ usuario: UsuarioActual })

    const despedida = `Se desconecto ${mensaje.usuario}`

    const newMensaje = new Mensaje({
      texto: despedida,
      usuario: mensaje.nickname,
      fecha: obtenerHoraActual(),
    });

    await newMensaje.save(); // Guarda el mensaje en la base de datos

    socket.broadcast.emit("chat message",`${obtenerHoraActual()} | ${despedida}`);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

// Función para obtener la hora actual en formato HH:mm:ss
function obtenerHoraActual() {
  const date = new Date();

  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  const year = date.getFullYear();

  const horas = date.getHours().toString().padStart(2, "0");
  const minutos = date.getMinutes().toString().padStart(2, "0");
  const segundos = date.getSeconds().toString().padStart(2, "0");
  return `${year}/${mes}/${dia} ${horas}:${minutos}:${segundos}`;
}
