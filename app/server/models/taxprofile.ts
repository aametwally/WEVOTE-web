/**
 * Created by warsha on 01/07/2017.
 */
import * as Defs from './model';
import * as mongoose from 'mongoose';

export interface ITaxonomyAbundance extends mongoose.Document {
    taxon: Number ,
    count: Number ,
    root: String,
    superkingdom: String,
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String,
    species: String
}

export interface ITaxonomyAbundanceProfileModel extends mongoose.Document {
    description: String,
    taxa_abundance: mongoose.Types.DocumentArray<ITaxonomyAbundance>
}


export const taxonomyAbundanceSchema = new Defs.Schema({
    taxon: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    root: {
        type: String,
        default: ""
    },
    superkingdom: {
        type: String,
        default: ""
    },
    kingdom: {
        type: String,
        default: ""
    },
    phylum: {
        type: String,
        default: ""
    },
    class: {
        type: String,
        default: ""
    },
    order: {
        type: String,
        default: ""
    },
    family: {
        type: String,
        default: ""
    },
    genus: {
        type: String,
        default: ""
    },
    species: {
        type: String,
        default: ""
    }
});

export class TaxonomyAbundanceProfileModel {
    public static schema = new Defs.Schema({
        description: {
            type: String,
            required: true,
            default: "no description"
        },
        taxa_abundance: {
            type: [taxonomyAbundanceSchema] ,
            required: true
        }
    });

    private static _model =
        mongoose.model<ITaxonomyAbundanceProfileModel>('TaxonomyAbundanceProfile', TaxonomyAbundanceProfileModel.schema);
    public static repo = new Defs.RepositoryBase<ITaxonomyAbundanceProfileModel>(TaxonomyAbundanceProfileModel._model);
}
