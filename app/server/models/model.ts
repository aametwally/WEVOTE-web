/**
 * Created by warsha on 01/07/2017.
 */
import * as mongoose from 'mongoose';

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

export interface IRead<T> {
    retrieve: (callback: (error: any, result: any) => void) => void;
    findById: (id: string, callback: (error: any, result: T) => void) => void;
    findOne(cond?: Object, callback?: (err: any, res: T) => void): mongoose.Query<T>;
    find(cond: Object, fields: Object, options: Object, callback?: (err: any, res: T[]) => void): mongoose.Query<T[]>;
}

export interface IWrite<T> {
    create: (item: T, callback: (error: any, result: any) => void) => void;
    update: (_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) => void;
    delete: (_id: string, callback: (error: any, result: any) => void) => void;
    drop: (callback: (error: any) => void) => void;
}

export class RepositoryBase<T extends mongoose.Document> implements IRead<T>, IWrite<T> {

    protected _model: mongoose.Model<mongoose.Document>;

    constructor(schemaModel: mongoose.Model<mongoose.Document>) {
        this._model = schemaModel;
    }

    create(item: T, callback: (error: any, result: T) => void) {
        this._model.create(item, function (error: any, results: T) {
            if (error)
                console.log("Error creating data:" + error +
                    "\ndata:" + results);
            callback(error, results)
        });
    }

    retrieve(callback: (error: any, result: T) => void,
        populateStr?: String, fields?: Object) {
        if (populateStr)
            return this._model.find({})
                .populate(populateStr, fields)
                .exec(callback);
        else
            return this._model.find({}, callback);
    }

    update(_id: mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) {
        this._model.update({ _id: _id }, item, callback);
    }

    delete(_id: string, callback: (error: any, result: any) => void) {
        this._model.remove({ _id: this.toObjectId(_id) }, (err) => callback(err, null));
    }

    drop(callback: (error: any) => void) {
        this._model.remove({}, callback);
    }

    findById(_id: string, callback: (error: any, result: T) => void,
        populateStr?: String, fields?: Object) {
        if (populateStr)
            return this._model.findById(_id)
                .populate(populateStr, fields)
                .exec(callback);
        else
            return this._model.findById(_id, callback);
    }

    findOne(cond: Object, callback?: (err: any, res: T) => void,
        populateStr?: String, fields?: Object): any {
        if (populateStr)
            return this._model.findOne(cond)
                .populate(populateStr, fields)
                .exec(callback);
        else
            return this._model.findOne(cond, callback);
    }

    find(cond: Object, fields?: Object, options?: Object, callback?: (err: any, res: T[]) => void,
        populateStr?: String, popFields?: Object): any {
        if (populateStr)
            return this._model.find(cond, options)
                .populate(populateStr, popFields)
                .exec(callback);
        else
            return this._model.find(cond, options, callback);
    }

    private toObjectId(_id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(_id);
    }
}

