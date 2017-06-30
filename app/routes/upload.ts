var fs = require('fs');
var express = require('express');
var router = express.Router();
var multer = require('multer');

var uploadsDir = __dirname + '/../uploads';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Storage option can be changed - check Multer docs 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
});

var upload = multer({
    storage: storage
});

var validateDNA = function (seqFile, reads) {
    //Based on: http://www.blopig.com/blog/2013/03/a-javascript-function-to-validate-fasta-sequences/

    var seq = fs.readFileSync(seqFile).toString();

    console.log("seq.length",seq.length);

    // immediately remove trailing spaces
    seq = seq.trim();

    // split on newlines... 
    var lines = seq.split('\n').filter(function (line) {
        // if (line.search(/[^gatcn\s]/i) != -1 && line[0]!='>'){
        //     console.log(line);
        // }
        return line[0] != '>';
    });

    reads.count = lines.length;
    console.log(lines.length);

    // join the array back into a single string without newlines and 
    // trailing or leading spaces
    seq = lines.join('').trim();

    //Search for charaters that are not G, A, T or C.
    if (seq.search(/[^gatcn\s]/i) != -1) {
        //The seq string contains non-DNA characters
        return false;
        /// The next line can be used to return a cleaned version of the DNA
        /// return seq.replace(/[^gatcGATC]/g, "");
    } else {
        //The seq string contains only GATC
        return true;
    }
}

// Will handle POST requests to /upload
router.post('/reads', upload.single('file'), function (req, res) {
    console.log(req.file.filename);

    /**
     * For the moment, include the filename in the http header. 
     * It is a bad practice. For some unknown reasons the response
     * body is always received empty at client side.
     */
    var reads = {};
    var isFasta = validateDNA(uploadsDir + '/' + req.file.filename,reads);
    console.log("fastaValidation",isFasta,reads.count);
    res.setHeader("isFasta", isFasta);
    res.setHeader("readsCount" , reads.count );
    res.setHeader("filename", req.file.filename);
    res.status(204).end();
    // console.log(res);
})

router.post('/taxonomy', upload.single('file'), function (req, res) {
    console.log(req.file.filename);

    /**
     * For the moment, include the filename in the http header. 
     * It is a bad practice. For some unknown reasons the response
     * body is always received empty at client side.
     */
    res.setHeader("filename", req.file.filename);
    res.status(204).end();
    // console.log(res);
})
module.exports = router