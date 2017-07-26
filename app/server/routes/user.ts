import { UserModel, IUserModel } from '../models/user';
import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';
import { verifyOrdinaryUser, getToken } from './verify';

export class UserRouter extends BaseRoute {
    constructor() {
        super();
        this.addListUsersRouting();
        this.addRegisterRouting();
        this.addLoginRouting();
        this.addLogoutRouting();

    }

    private addListUsersRouting() {
        this._router.route('/')
            .get(function (req: Request, res: Response, next: NextFunction) {
                UserModel.repo.retrieve(function (err: any, users: any) {
                    if (err) return next(err);
                    res.json(users);
                });
            });
    }

    private addRegisterRouting() {
        this._router.route('/register')
            .post(function (req: Request, res: Response, next: NextFunction) {
                UserModel.register(
                    UserModel.model({ username: req.body.username }),
                    req.body.password,
                    function (err, user) {
                        if (err) {
                            return res.status(500).json({ err: err });
                        }
                        passport.authenticate('local')(req, res, function () {
                            res.status(200).json({ status: 'Registration Successful!' });
                        });
                    });
            });
    }

    private addLoginRouting() {
        this._router.route('/login')
            .post(function (req: Request, res: Response, next: NextFunction) {
                passport.authenticate('local', function (err: any, user: any, info: any) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return res.status(401).json({
                            err: info
                        });
                    }
                    req.logIn(user, function (err: any) {
                        if (err) {
                            return res.status(500).json({
                                err: 'Could not log in user'
                            });
                        }

                        const token = getToken({
                            "username": user.username,
                            "_id": user._id,
                            "admin": user.admin
                        });
                        
                        res.status(200).json({
                            status: 'Login successful!',
                            success: true,
                            token: token
                        });
                    });
                })(req, res, next);
            })
    }

    private addLogoutRouting() {
        this._router.route('/logout')
            .get(function (req: Request, res: Response, next: NextFunction) {
                req.logout();
                res.status(200).json({
                    status: 'Bye!'
                });
            });
    }
    public static router() {
        let _ = new UserRouter();
        return _._router;
    }
}