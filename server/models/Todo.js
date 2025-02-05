const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    default: 'personal'
  }
});

module.exports = mongoose.model('Todo', todoSchema);