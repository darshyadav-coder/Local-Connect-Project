const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, sortBy } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;

    let query = Service.find(filter);

    if (sortBy === 'price-high') {
      query = query.sort({ price: -1 });
    } else if (sortBy === 'price-low') {
      query = query.sort({ price: 1 });
    } else if (sortBy === 'name') {
      query = query.sort({ name: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const services = await query;

    res.json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service (Admin)
// @route   POST /api/services
// @access  Public
const createService = async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;

    if (!name || !category || !description || !price) {
      return res.status(400).json({ 
        message: 'Name, category, description, and price are required' 
      });
    }

    const serviceExists = await Service.findOne({ name });
    if (serviceExists) {
      return res.status(400).json({ message: 'Service with that name already exists' });
    }

    const service = new Service({
      name,
      category,
      description,
      price,
      icon: icon || 'fa-tools',
    });

    const createdService = await service.save();

    res.status(201).json({
      message: 'Service created successfully',
      service: createdService,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service (Admin)
// @route   PUT /api/services/:id
// @access  Public
const updateService = async (req, res) => {
  try {
    const { name, category, description, price, icon, isActive } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (name) service.name = name;
    if (category) service.category = category;
    if (description) service.description = description;
    if (price) service.price = price;
    if (icon) service.icon = icon;
    if (isActive !== undefined) service.isActive = isActive;

    const updatedService = await service.save();

    res.json({
      message: 'Service updated successfully',
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete service (Admin)
// @route   DELETE /api/services/:id
// @access  Public
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isActive = false;
    await service.save();

    res.json({
      message: 'Service deactivated successfully',
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service categories
// @route   GET /api/services/categories/list
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Service.find({ isActive: true }).distinct('category');
    res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getCategories,
};
