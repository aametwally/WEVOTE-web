/**
 * Created by warsha on 01/07/2017.
 */
import * as Defs from './model';
import * as mongoose from 'mongoose';

export interface ITaxon {
    id: Number,
    name: string
}

export const taxonSchema = new Defs.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        dropDups: true,
        default: 0
    },
    name: {
        type: String,
        required: true,
        default: ""
    }
});

export interface ITaxLine extends mongoose.Document {
    taxon: Number;
    root: Number;
    superkingdom: Number;
    kingdom: Number;
    phylum: Number;
    class: Number;
    order: Number;
    family: Number;
    genus: Number;
    species: Number;
}


export class TaxLineModel {
    public static schema = new Defs.Schema({
        taxon: {
            type: Number,
            required: true,
            unique: true,
            dropDups: true
        },
        root: {
            type: Number,
            default: 0
        },
        superkingdom: {
            type: Number,
            default: 0
        },
        kingdom: {
            type: Number,
            default: 0
        },
        phylum: {
            type: Number,
            default: 0
        },
        class: {
            type: Number,
            default: 0
        },
        order: {
            type: Number,
            default: 0
        },
        family: {
            type: Number,
            default: 0
        },
        genus: {
            type: Number,
            default: 0
        },
        species: {
            type: Number,
            default: 0
        }
    });

    private static _model =
    mongoose.model<ITaxLine>('TaxLine', TaxLineModel.schema);
    public static repo = new Defs.RepositoryBase<ITaxLine>(TaxLineModel._model);
}
