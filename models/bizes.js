// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Getting rid of deprecated mPromise Warning
mongoose.Promise = Promise;

// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

var reviewSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var imageSchema = new Schema({
    data: Buffer,
    contentType: String
});

// create a schema
var bizSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default:false
    },
    zipcode:{
        type: Number,
        required: true
    },
    servingradius:{
        type: Number,
        required: true
    },
    searchtext:{
        type:String,
        required:true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[reviewSchema]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
var Bizes = mongoose.model('Biz', bizSchema);

// make this available to our Node applications
module.exports = Bizes;