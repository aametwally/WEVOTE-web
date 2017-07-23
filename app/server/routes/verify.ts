import { UserModel } from '../models/user';
import * as jwt from 'jsonwebtoken';// used to create, sign, and verify tokens
import { config } from '../config';
import { Request, Response, NextFunction } from 'express';

export let getToken = function (user: any) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

export let isValidToken = function (req: any, res: any, next: any, cbValid: any, cbInvalid: any) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token)
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err: any, decoded: any) {
            if (err)
                cbInvalid(req, res, next);
            else cbValid(req, res, next);
        });
    else cbInvalid(req, res, next);
}

export let verifyOrdinaryUser = function (req: any, res: any, next: any) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err: any, decoded: any) {
            if (err) {
                var err = <any>new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = <any>decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = <any>new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

export let verifyAdmin = function (req: any, res: any, next: any) {
    if (!req.decoded) {
        let err = <any>new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
        if (!req.decoded.admin) {
            let err = <any>new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
        next();
    }
};