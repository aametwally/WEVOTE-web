// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var configSchema = new Schema({
    algorithms:{
        type: [String],
        required: true
    },
    minScore:{
        type: Number,
        min: 0 , 
        max: 5 , 
        default: 0 
    },
    minNumAgreed:{
        type: Number ,
        min: 0 ,
        default: 0
    },
    minScore:{
        type: Number ,
        min: 0 ,
        default: 0 
    },
    penalty:{
        type: Number , 
        default: 2
    }
});



var experimentSchema = new Schema({
    user:{
        type: String ,
        required: true,
        default : "public"
    },
    private:{
        type: Boolean ,
        default: false
    },
    email:{
        type: String 
    },
    description:{
        type: String
    },
    readsSource: {
        type: String ,
        required: true
    },
    taxonomySource:  {
        type: String,
        required: true
    } , 
    config: configSchema
}, {
    timestamps: true
});


// the schema is useless so far
// we need to create a model using it
var Experiment = mongoose.model('Experiment', experimentSchema );

// make this available to our Node applications
module.exports = Experiment;