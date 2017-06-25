var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer');

var uploadsDir = __dirname + '/../uploads';

if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Storage option can be changed - check Multer docs 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
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
    
    /**
     * For the moment, include the filename in the http header. 
     * It is a bad practice. For some unknown reasons the response
     * body is always received empty at client side.
     */
    res.setHeader("filename",req.file.filename);
    res.status(204).end();
    console.log(res);
})

module.exports = router