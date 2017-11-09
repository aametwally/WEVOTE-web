/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import { IExperimentModel, ExperimentModel } from './experiment';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as common from '../common/common';

export interface ITaxLine extends common.ITaxLine,  mongoose.Document {
}

export const taxlineSchema = new mongoose.Schema({
    taxon: Number,
    root: String,
    superkingdom: String,
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String,
    species: String
});

export interface ITaxonomyAbundance extends common.ITaxonomyAbundance, mongoose.Document 
{
    taxline: ITaxLine;
}

export interface ITaxonomyAbundanceProfile extends common.ITaxonomyAbundanceProfile, mongoose.Document {
    experiment: mongoose.Types.ObjectId,
    abundance: mongoose.Types.DocumentArray<ITaxonomyAbundance>;
}

export const taxonomyAbundanceSchema = new mongoose.Schema({
    taxon: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    taxline: {
        type: taxlineSchema,
        required: true
    }
});

export class TaxonomyAbundanceProfileModel {
    public static schema = new mongoose.Schema({
        experiment: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Experiment'
        },
        abundance: {
            type: [taxonomyAbundanceSchema],
            required: true
        }
    });

    private static _model =
    mongoose.model<ITaxonomyAbundanceProfile>('TaxonomyAbundanceProfile', TaxonomyAbundanceProfileModel.schema);
    public static repo = new RepositoryBase<ITaxonomyAbundanceProfile>(TaxonomyAbundanceProfileModel._model);
}
