import * as Express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as ExpressSession from 'express-session';
// let FileStore = require('session-file-store')(ExpressSession);
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as mongoose from 'mongoose';
import errorHandler = require("errorhandler");
import * as passport from 'passport';
// routers
import { UserRouter } from './routes/user';
import { ReadsRouter } from './routes/reads';
import { UploadRouter } from './routes/upload';
import { AlgorithmRouter } from './routes/algorithm';
import { TaxonomyRouter } from './routes/taxonomy';
import { ExperimentRouter } from './routes/experiment';
import { TaxonomyAbundanceProfileRouter } from './routes/taxprofile';
import { init } from './models/initdb';
import { UserModel } from './models/user';
import { config } from './config'

export class Server {
    private _app: Express.Application;

    public static bootstrap(port: any): Express.Application {
        let server = new Server();
        server._app.set('port', port);
        return server._app;
    }

    constructor() {
        this._app = Express();
        this.db();
        this.middleware();
        this.passport();
        this.routes();
        this.api();
    }

    private api() {

    }

    private db() {
        mongoose.connect(config.mongoUrl);
        let db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log("Connected correctly to the server.");
        });
        init();
    }

    private middleware() {

        // // view engine setup
        this._app.set('views', path.join(__dirname, 'views'));
        this._app.set('view engine', 'jade');

        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        // this._app.use(ExpressSession({
        //     name: 'session-id',
        //     secret: '12345-67890-09876-54321',
        //     saveUninitialized: true,
        //     resave: true
        // }));
        this._app.use(logger('dev'));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({ extended: false }));
        this._app.use(cookieParser());
    }

    private passport() {
        // Passport
        this._app.use(passport.initialize());
        this._app.use(passport.session());
        UserModel.usePassportLocalStrategyAuthenticate();
    }
    private routes() {
        this._app.use(Express.static(path.join(__dirname, 'public')));
        this._app.use('/reads', ReadsRouter.router());
        this._app.use('/algorithm', AlgorithmRouter.router());
        this._app.use('/experiment', ExperimentRouter.router());
        this._app.use('/taxonomy', TaxonomyRouter.router());
        this._app.use('/upload', UploadRouter.router());
        this._app.use('/taxprofile', TaxonomyAbundanceProfileRouter.router());
        this._app.use('/users', UserRouter.router());
        // catch 404 and forward to error handler
        this._app.use(function (err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) {
            err.status = 404;
            next(err);
        });

        // Error Handlers
        if (this._app.get('env') === 'development')
            this._app.use(function (err: any, req: Express.Request,
                res: Express.Response, next: Express.NextFunction) {
                res.status(err.status || 500);
                res.json({
                    message: err.message,
                    error: err
                });
            });

        // error handler
        this._app.use(errorHandler());
    }

}