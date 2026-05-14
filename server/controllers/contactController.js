const Contact = require('../models/Contact');
const { isValidEmail } = require('../utils/validators');

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Name, email, subject, and message are required' 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: 'Message must be at least 10 characters' });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    const createdContact = await contact.save();

    res.status(201).json({
      message: 'Thank you for contacting us. We will get back to you soon.',
      contact: createdContact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Public
const getContacts = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    let filter = {};

    if (status) filter.status = status;

    let query = Contact.find(filter);

    if (sortBy === 'latest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    }

    const contacts = await query;

    res.json({
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Public
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact message (Admin)
// @route   PUT /api/contact/:id
// @access  Public
const updateContact = async (req, res) => {
  try {
    const { status, response } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    if (status) {
      const validStatuses = ['new', 'read', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Status must be one of: ${validStatuses.join(', ')}` 
        });
      }
      contact.status = status;
    }

    if (response) contact.response = response;

    const updatedContact = await contact.save();

    res.json({
      message: 'Contact message updated successfully',
      contact: updatedContact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Public
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      message: 'Contact message deleted successfully',
      contact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};
