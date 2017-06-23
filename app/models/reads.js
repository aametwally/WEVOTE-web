// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var readsSchema = new Schema({
    name: String , 
    description: String, 
    onServer: {
        type: Boolean , 
        default: true
    } ,
    uri: String,
    data: String
});


// the schema is useless so far
// we need to create a model using it
var Reads = mongoose.model('Reads', readsSchema );

// make this available to our Node applications
module.exports = Reads;