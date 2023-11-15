const mongoose = require("mongoose");

// Definir el esquema del modelo de Mensaje
const mensajeSchema = new mongoose.Schema({
  texto: String,
  usuario: String,
  fecha: String,
});

// Crear los modelos a partir de los esquemas
const Mensaje = mongoose.model("Mensaje", mensajeSchema);

// Exportar los modelos para su uso en otras partes de la aplicación
module.exports = {
  Mensaje,
};
