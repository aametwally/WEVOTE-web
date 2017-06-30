import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import errorHandler = require("errorhandler");


export class Server {
    public app: Express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.api();
    }

    public api() {

    }

    public config() {
        // // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'jade');

        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'dist')));
    }

    public routes() {

    }
}


var url = 'mongodb://localhost:27017/wevote';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected correctly to the server.");
});


var reads = require('./routes/reads');
var taxonomy = require('./routes/taxonomy');
var algorithm = require('./routes/algorithm');
var experiment = require('./routes/experiment');
var upload = require('./routes/upload');
var initializeDB = require('./models/initdb')

initializeDB.init();
var app = express();


app.use('/reads', reads);
app.use('/algorithm', algorithm);
app.use('/experiment', experiment);
app.use('/taxonomy', taxonomy);
app.use('/upload', upload);

// catch 404 and forward to error handler
app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    err.status = 404;
    next(err);
});

// error handler
app.use(errorHandler());

module.exports = app;
