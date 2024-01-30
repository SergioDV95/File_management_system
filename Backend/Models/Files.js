const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema({
   name: {
      type: String,
      trim: true,
      validate: {
         validator: (name) => !/[<>{}\\|\/\?\*]/.test(name),
         message: 'Invalid name'
      },
      required: true

   },
   path: {
      type: String,
      trim: true,
      required: true
   },
   size: {
      type: Number
   },
   mimetype: {
      type: String
   },
   encoding: {
      type: String
   }
}, {
   timestamps: true
})

const Files = mongoose.model('Files', fileSchema);

module.exports = Files;