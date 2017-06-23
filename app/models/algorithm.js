// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var algorithmSchema = new Schema({
    name: String , 
    use: {
        type: Boolean,
        default: true
    }
});


// the schema is useless so far
// we need to create a model using it
var Algorithm = mongoose.model('Algorithm', algorithmSchema );

// make this available to our Node applications
module.exports = Algorithm;