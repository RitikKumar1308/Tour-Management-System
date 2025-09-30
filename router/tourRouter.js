const express = require('express');
const router=express.Router();
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
// router.param("id",tourController.checkinId)
router.route('/tourStats').get(tourController.tourStats)
router.route('/monthlyPlan/:year').get(tourController.monthlyPlan);


router.route('/')
.get(tourController.getAllTours)
.post(authController.protect,tourController.createTour);
router.route('/:id')
.get(tourController.getTourById)
.patch(tourController.updateTour)
.delete(authController.protect,authController.restrictsTo("admin","lead-guide","guide"), tourController.deleteTour);

module.exports=router;
