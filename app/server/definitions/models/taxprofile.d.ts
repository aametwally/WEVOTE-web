/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
export interface ITaxLine extends mongoose.Document {
    taxon: number;
    root: string;
    superkingdom: string;
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
}
export declare const taxlineSchema: mongoose.Schema;
export interface ITaxonomyAbundance extends mongoose.Document {
    taxon: number;
    count: number;
    taxline: ITaxLine;
}
export interface ITaxonomyAbundanceProfileModel extends mongoose.Document {
    experiment: mongoose.Types.ObjectId;
    taxa_abundance: mongoose.Types.DocumentArray<ITaxonomyAbundance>;
}
export declare const taxonomyAbundanceSchema: mongoose.Schema;
export declare class TaxonomyAbundanceProfileModel {
    static schema: mongoose.Schema;
    private static _model;
    static repo: RepositoryBase<ITaxonomyAbundanceProfileModel>;
    static reset: (experimentId: string, cb?: any) => void;
}
