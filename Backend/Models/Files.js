const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
   size: Number,
   mimetype: String,
   encoding: String
}, {
   timestamps: true
})

fileSchema.plugin(mongoosePaginate);

const Files = mongoose.model('Files', fileSchema);

module.exports = Files;