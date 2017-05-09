var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var zipcodes = require('../lib/zipcodes');

var Bizes = require('../models/bizes');

var bizRouter = express.Router();
bizRouter.use(bodyParser.json());


var Verify    = require('./verify');

bizRouter.route('/')
.get(function (req, res, next) {
    Bizes.find(req.query)
        .populate('createdBy')
        .populate('reviews.postedBy')
        .exec(function (err, biz) {
        if (err) next(err);
        res.json(biz);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {    
    req.body.createdBy = req.decoded._id;
    var rad = zipcodes.radius(req.body.zipcode, req.body.servingradius,10);
    req.body.searchtext = JSON.stringify(rad);
    Bizes.create(req.body, function (err, biz) {
        if (err) return next(err);
        console.log('Business created!');
        var id = biz._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the biz with id: ' + id);
    });
})


.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Bizes.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

bizRouter.route('/:bizId')
.get(function (req, res, next) {
    Bizes.findById(req.params.bizId)
        .populate('reviews.postedBy')
        .exec(function (err, biz) {
        if (err) return next(err);
        res.json(biz);
    });
})


.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    Bizes.findByIdAndUpdate(req.params.bizId, {
        $set: req.body
    }, {
        new: true
    }, function (err, biz) {
        if (err) return next(err);
        res.json(biz);
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Bizes.findByIdAndRemove(req.params.bizId, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

bizRouter.route('/:bizId/reviews')

.get(function (req, res, next) {
    Bizes.findById(req.params.bizId)
        .populate('reviews.postedBy')
        .exec(function (err, biz) {
        if (err) return next(err);
        res.json(biz.reviews);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Bizes.findById(req.params.bizId, function (err, biz) {
        if (err) return next(err);
        req.body.postedBy = req.decoded._id;
        biz.reviews.push(req.body);
        biz.save(function (err, biz) {
            if (err) return next(err);
            console.log('Updated reviews!');
            res.json(biz);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Bizes.findById(req.params.bizId, function (err, biz) {
        if (err) return next(err);
        for (var i = (biz.reviews.length - 1); i >= 0; i--) {
            biz.reviews.id(biz.reviews[i]._id).remove();
        }
        biz.save(function (err, result) {
            if (err) return next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all reviews!');
        });
    });
});

bizRouter.route('/:bizId/reviews/:reviewId')

.get(function (req, res, next) {
    Bizes.findById(req.params.bizId)
        .populate('reviews.postedBy')
        .exec(function (err, biz) {
        if (err) return next(err);
        res.json(biz.reviews.id(req.params.reviewId));
    });
})



.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    // We delete the existing review and insert the updated
    // review as a new review
    Bizes.findById(req.params.bizId, function (err, biz) {
        if (err) return next(err);
        biz.reviews.id(req.params.reviewId).remove();
                req.body.postedBy = req.decoded._id;
        biz.reviews.push(req.body);
        biz.save(function (err, biz) {
            if (err) return next(err);
            console.log('Updated reviews!');
            res.json(biz);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Bizes.findById(req.params.bizId, function (err, biz) {
        if (biz.reviews.id(req.params.reviewId).postedBy
           != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        biz.reviews.id(req.params.reviewId).remove();
        biz.save(function (err, resp) {
            if (err) return next(err);
            res.json(resp);
        });
    });
});


module.exports = bizRouter;