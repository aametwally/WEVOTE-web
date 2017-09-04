/// <reference types="passport-local-mongoose" />
/// <reference types="mongoose" />
import * as Defs from './model';
import * as mongoose from 'mongoose';
export interface IUserModel extends mongoose.PassportLocalDocument {
    username: string;
    password: string;
    email: string;
    admin: boolean;
    createdAt: Date;
    modifiedAt: Date;
}
export declare class UserModel {
    static schema: mongoose.PassportLocalSchema;
    private static _model;
    static repo: Defs.RepositoryBase<IUserModel>;
    static register: (user: IUserModel, password: string, cb: (err: any, account: any) => void) => void;
    static model: (args: any) => IUserModel;
    static usePassportLocalStrategyAuthenticate(): void;
    static reset: (cb?: ((id: mongoose.Types.ObjectId) => void) | undefined) => void;
}
