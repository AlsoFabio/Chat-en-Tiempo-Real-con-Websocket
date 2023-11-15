const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            typeof: 'string',
            required: true
        },
        password: {
            typeof: 'string',
            required: true
        },
        online: {
            typeof: 'boolean',
            default: false
        },
    },
    {
        timestamps: true,
        versionKey:false
    }
  );

  const Usuario = mongoose.model("usuarios", userSchema);

  module.exports = {
    Usuario,
  };