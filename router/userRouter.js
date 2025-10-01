const express = require('express');
const router=express.Router();
const userController = require('../controller/userController');
const authController =require('../controller/authController');

router.post('/signup',authController.signup);
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);
router.post('/updatePassword',authController.protect,authController.updatePassword);
router.post('/updateme',authController.protect,authController.updateMe);

router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router.route('/:id')
.get(userController.getUserById)
.patch(userController.updateUser)
.delete(userController.deleteUser);
module.exports=router;
