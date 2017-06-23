var express = require('express');
var router = express.Router();
var multer = require('multer');

// Storage option can be changed - check Multer docs 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = __dirname + '/../uploads' // Make sure this path exists 
        cb(null, path)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname )
    }
});

var upload = multer({
    storage: storage
});

// Will handle POST requests to /upload
router.post('/reads', upload.single('file'), function (req, res) {
    console.log(req.file.filename); 

    res.status(204).end(req.file.filename)
})

module.exports = router