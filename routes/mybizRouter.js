var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Bizes = require('../models/bizes');

var mybizRouter = express.Router();
mybizRouter.use(bodyParser.json());


var Verify    = require('./verify');

mybizRouter.route('/')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    var findByUserId = req.decoded._id;
    console.log("Hello the findByUserId is "+ findByUserId);
    Bizes.find({createdBy : findByUserId})
        .populate('reviews.postedBy')
        .exec(function (err, biz) {
        console.log(biz);
        if (err) return next(err);
        res.json(biz);
    });
})

module.exports = mybizRouter;