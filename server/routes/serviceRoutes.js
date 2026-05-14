const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getCategories,
} = require('../controllers/serviceController');

router.route('/').get(getServices).post(createService);
router.route('/categories/list').get(getCategories);
router.route('/:id').get(getServiceById).put(updateService).delete(deleteService);

module.exports = router;
