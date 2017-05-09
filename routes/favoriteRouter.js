var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

var Verify    = require('./verify');

favoritesRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    var userId = req.decoded._id
    Favorites.find({ postedBy: userId })
      .populate('postedBy bizes')
      .exec(function (err, favorite) {
        if (err) return next(err)
        res.json(favorite)
      })
    
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({'postedBy': req.decoded._id})
        .exec(function (err, favorites) {
            if (err) return next(err);
            req.body.postedBy = req.decoded._id;
            var favorite;
            if (favorites) //If there are some favorite bizes already existing
                favorite = favorites[0];
            else favorite = null;
            if (favorite){
                var exist = false;
                for (var i=0;i<favorite.bizes.length;i++){ //Check if the biz is already a favorite
                    if (favorite.bizes[i] == req.body._id){
                        exist = true;
                        break;
                    }
                }
                if (exist){//Do not add the biz that already exists 
                    console.log("already exists")
                    res.json(favorites);
                }
                else{//Push biz to existing biz array in case biz does not exist 
                    console.log("Push into Bizes array");
                    favorites[0].bizes.push(req.body._id);
                    favorites[0].save(function (err, favorite) {
                        if (err) return next(err);
                        res.json(favorite);
                    });
                }
            }
            else{//Create a new biz array to start adding favorites
                Favorites.create({postedBy: req.body.postedBy}, function (err, favorite) {
                    if (err) return next(err);
                    favorite.bizes.push(req.body._id);
                    favorite.save(function (err, favorite) {
                        if (err) return next(err);
                        res.json(favorite);
                    });
                })
            }
        });
})


.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    var userId = req.decoded._id

    Favorites.remove({ postedBy: userId }, function (err, resp) {
      if (err) next(err)
      res.json(resp)
    })
});

favoritesRouter.route('/:bizId')
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({postedBy: req.decoded._id}, function (err, favorite) {
            if (err) return next(err);

            console.log('Found favorite: ' + favorite.bizes.length);
            if (favorite) {
                for (var i = favorite.bizes.length - 1; i >= 0; i--) {
                    if (favorite.bizes[i] == req.params.bizId) {
                        favorite.bizes.splice(i, 1);
                    }
                }

                // Save to DB
                favorite.save(function (err, result) {
                    if (err) return next(err);
                    res.json(result);
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Deleted all favorites!');
            }
        });
    });



module.exports = favoritesRouter;