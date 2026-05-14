const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    default: 'fa-tools',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
