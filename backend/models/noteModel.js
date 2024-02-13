const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
