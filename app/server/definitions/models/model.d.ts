/// <reference types="mongoose" />
import * as mongoose from 'mongoose';
export declare let Schema: typeof mongoose.Schema;
export declare let ObjectId: mongoose.Types.ObjectIdConstructor;
export declare let Mixed: typeof mongoose.Schema.Types.Mixed;
export interface IRead<T> {
    retrieve: (callback: (error: any, result: any) => void) => void;
    findById: (id: string | mongoose.Types.ObjectId, callback: (error: any, result: T) => void) => void;
    findOne(cond?: Object, callback?: (err: any, res: T) => void): mongoose.Query<T>;
    find(cond: Object, fields: Object, options: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;
}
export interface IWrite<T> {
    create: (item: T, callback: (error: any, result: any) => void) => void;
    update: (id: string | mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) => void;
    findByIdAndUpdate: (id: string | mongoose.Types.ObjectId, update: Object, callback: (error: any, result: any) => void) => void;
    delete: (id: string | mongoose.Types.ObjectId, callback: (error: any, result: any) => void) => void;
    drop: (callback: (error: any) => void) => void;
}
export declare class RepositoryBase<T extends mongoose.Document> implements IRead<T>, IWrite<T> {
    protected _model: mongoose.Model<mongoose.Document>;
    constructor(schemaModel: mongoose.Model<mongoose.Document>);
    private toObjectId(_id);
    create(item: T, callback: (error: any, result: T) => void): void;
    retrieve(callback: (error: any, result: T) => void, populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): mongoose.DocumentQuery<mongoose.Document[], mongoose.Document> | Promise<mongoose.Document[]>;
    update(_id: string | mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void): void;
    findByIdAndUpdate(_id: string | mongoose.Types.ObjectId, update: Object, callback: (error: any, result: any) => void): void;
    delete(_id: string | mongoose.Types.ObjectId, callback: (error: any, result: any) => void): void;
    drop(callback: (error: any) => void): void;
    findById(_id: string | mongoose.Types.ObjectId, callback: (error: any, result: T) => void, populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): mongoose.DocumentQuery<mongoose.Document | null, mongoose.Document> | Promise<mongoose.Document | null>;
    findOne(cond: Object, callback?: (err: any, res: T) => void, populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): any;
    find(cond: Object, fields?: Object, options?: Object, callback?: (err: any, res: T[]) => void, populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): any;
}
export declare const csvJSON: (csv: any) => any;
