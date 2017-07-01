import * as Express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import errorHandler = require("errorhandler");


import  {ReadsRouter} from './routes/reads';
import  {UploadRouter} from './routes/upload';
import  {AlgorithmRouter} from './routes/algorithm';
import  {TaxonomyRouter} from './routes/taxonomy';
import  {ExperimentRouter} from './routes/experiment';
import {init} from './models/initdb';


export class Server {
    private _app: Express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.db();
        this._app = Express();
        this.middleware();
        this.routes();
        this.api();
    }

    public api() {

    }

    private db() {
        var url = 'mongodb://localhost:27017/wevote';
        mongoose.connect(url);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log("Connected correctly to the server.");
        });
        init();
    }

    public middleware() {

        // // view engine setup
        this._app.set('views', path.join(__dirname, 'views'));
        this._app.set('view engine', 'jade');

        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        this._app.use(logger('dev'));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: false}));
        this._app.use(cookieParser());
        this._app.use(Express.static(path.join(__dirname, 'dist')));

    }

    public routes() {
        this._app.use('/reads', ReadsRouter.router());
        this._app.use('/algorithm', AlgorithmRouter.router());
        this._app.use('/experiment', ExperimentRouter.router());
        this._app.use('/taxonomy', TaxonomyRouter.router());
        this._app.use('/upload', UploadRouter.router());
        // catch 404 and forward to error handler
        this._app.use(function (err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) {
            err.status = 404;
            next(err);
        });

        // error handler
        this._app.use(errorHandler());
    }
}