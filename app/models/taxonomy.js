// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var taxonomySchema = new Schema({
    name: String , 
    description: {
        type: String,
        default:""
    }, 
    onServer: {
        type: Boolean , 
        default: true
    } ,
    uri: {
        type: String,
        default:""
    },
    data: {
        type: String,
        default:""
    },
    size: Number
});


// the schema is useless so far
// we need to create a model using it
var Taxonomy = mongoose.model('Taxonomy', taxonomySchema );

// make this available to our Node applications
module.exports = Taxonomy;