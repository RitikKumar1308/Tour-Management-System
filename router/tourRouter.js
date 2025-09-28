const express = require('express');
const router=express.Router();
const tourController = require('../controller/tourController');
// router.param("id",tourController.checkinId)
router.route('/tourStats').get(tourController.tourStats)
router.route('/monthlyPlan/:year').get(tourController.monthlyPlan);


router.route('/')
.get(tourController.getAllTours)
.post(tourController.createTour);
router.route('/:id')
.get(tourController.getTourById)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);

module.exports=router;
