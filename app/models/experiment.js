// grab the things we need
var mongoose = require('mongoose'),
    Algorithm = require('./algorithm'),
    Reads = require('./reads'),
    Taxonomy = require('./taxonomy');

var Schema = mongoose.Schema;


var configSchema = new Schema({
    algorithms: {
        type: [Algorithm.schema],
        required: true
    },
    minNumAgreed: {
        type: Number,
        min: 0,
        default: 0
    },
    minScore: {
        type: Number,
        min: 0,
        default: 0
    },
    penalty: {
        type: Number,
        default: 2
    }
});

var statusSchema = new Schema({
    started: Boolean,
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default:0 
    }
});


var experimentSchema = new Schema({
    user: {
        type: String,
        required: true,
        default: "public"
    },
    private: {
        type: Boolean,
        default: false
    },
    email: {
        type: String
    },
    description: {
        type: String
    },
    reads: {
        type: Reads.schema,
        required: true
    },
    taxonomy: {
        type: Taxonomy.schema,
        required: true
    },
    config: configSchema,
    status: statusSchema
}, {
    timestamps: true
});


// the schema is useless so far
// we need to create a model using it
var Experiment = mongoose.model('Experiment', experimentSchema);

// make this available to our Node applications
module.exports = Experiment;