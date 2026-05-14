const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new',
  },
  response: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
