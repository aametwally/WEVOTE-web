/**
 * Created by warsha on 01/07/2017.
 */
import * as mongoose from 'mongoose';

export let Schema = mongoose.Schema;
export let ObjectId = mongoose.Types.ObjectId;
export let Mixed = mongoose.Schema.Types.Mixed;

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

// export interface IPopulateElement {
//     foreignField: string,
//     includeFields?: Object
// }

export class RepositoryBase<T extends mongoose.Document> implements IRead<T>, IWrite<T> {


    protected _model: mongoose.Model<mongoose.Document>;

    constructor(schemaModel: mongoose.Model<mongoose.Document>) {
        this._model = schemaModel;
    }

    private toObjectId(_id: string): mongoose.Types.ObjectId {
        return mongoose.Types.ObjectId.createFromHexString(_id);
    }

    // private populate(query: mongoose.DocumentQuery<mongoose.Document | mongoose.Document[] | null, mongoose.Document>, populateElements: Array<IPopulateElement>): mongoose.DocumentQuery<mongoose.Document | mongoose.Document[] | null, mongoose.Document> {
    //     let _populate: (query: mongoose.DocumentQuery<mongoose.Document | mongoose.Document[] | null, mongoose.Document>, index: number) => mongoose.DocumentQuery<mongoose.Document | mongoose.Document[] | null, mongoose.Document>;
    //     _populate = function(
    //         query: mongoose.DocumentQuery<mongoose.Document | mongoose.Document[] | null, mongoose.Document>,
    //         index: number){
    //         if (index < populateElements.length)
    //             return _populate(query.populate(
    //                 populateElements[index].foreignField,
    //                 populateElements[index].includeFields
    //             ), index + 1);
    //         else return query;
    //     };

    //     return _populate(query, 0);
    // }

    create(item: T, callback: (error: any, result: T) => void) {
        this._model.create(item, function (error: any, results: T) {
            if (error)
                console.log("Error creating data:" + error +
                    "\ndata:" + results);
            callback(error, results)
        });
    }

    retrieve(callback: (error: any, result: T[]) => void,
        populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]) {
        if (populateElements)
            return this._model.find({})
                .populate(populateElements)
                .exec(callback);
        else
            return this._model.find({}, callback);
    }

    update(_id: string | mongoose.Types.ObjectId, item: T, callback: (error: any, result: any) => void) {
        this._model.findByIdAndUpdate({ _id: _id }, item, callback);
    }

    findByIdAndUpdate(_id: string | mongoose.Types.ObjectId, update: Object, callback: (error: any, result: any) => void) {
        this._model.findByIdAndUpdate(_id, update, callback);
    }

    delete(_id: string | mongoose.Types.ObjectId, callback: (error: any, result: any) => void) {
        this._model.remove({ _id: _id }, (err) => callback(err, null));
    }

    drop(callback: (error: any) => void) {
        this._model.remove({}, callback);
    }

    findById(_id: string | mongoose.Types.ObjectId, callback: (error: any, result: T) => void,
        populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]) {
        if (populateElements)
            return this._model.findById(_id)
                .populate(populateElements)
                .exec(callback);
        else
            return this._model.findById(_id, callback);
    }

    findByIdQuery(_id: string | mongoose.Types.ObjectId) {
        return this._model.findById(_id);
    }

    findOne(cond: Object, callback?: (err: any, res: T) => void,
        populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): any {
        if (populateElements)
            return this._model.findOne(cond)
                .populate(populateElements)
                .exec(<any>callback);
        else
            return this._model.findOne(cond, <any>callback);
    }

    find(cond: Object, fields?: Object, options?: Object, callback?: (err: any, res: T[]) => void,
        populateElements?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): any {
        if (populateElements)
            return this._model.find(cond, options)
                .populate(populateElements)
                .exec(<any>callback);
        else
            return this._model.find(cond, options, callback);
    }
}

export const csvJSON = (csv: any): any => {
    let lines = csv.split("\n");

    let result = [];

    let headers = lines[0].trim('\r').split(",");
    for (let i = 1; i < lines.length; i++) {

        let obj = {};
        let currentline = lines[i].trim('\r').split(",");
        if (currentline.length != headers.length) {
            continue;
        }


        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }
    //return result; //JavaScript object
    return result; //JSON
};