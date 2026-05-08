const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require('../controllers/userController');

router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.route('/change-password').put(changePassword);
router.route('/').get(getAllUsers);
router.route('/:id').delete(deleteUser);
router.route('/:id/role').put(updateUserRole);

module.exports = router;
