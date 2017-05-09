var mongoose = require('mongoose')
var Schema = mongoose.Schema

var favoriteSchema = new Schema({
  postedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
  },
  bizes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Biz' 
  }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Favorites', favoriteSchema);