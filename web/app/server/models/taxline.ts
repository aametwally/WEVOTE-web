// /**
//  * Created by warsha on 01/07/2017.
//  */
// import * as Defs from './model';
// import * as mongoose from 'mongoose';

// export interface ITaxon {
//     id: number,
//     name: string
// }

// export const taxonSchema = new Defs.Schema({
//     id: {
//         type: number,
//         required: true,
//         unique: true,
//         dropDups: true,
//         default: 0
//     },
//     name: {
//         type: string,
//         required: true,
//         default: ""
//     }
// });

// export interface ITaxLine extends mongoose.Document {
//     taxon: number;
//     root: number;
//     superkingdom: number;
//     kingdom: number;
//     phylum: number;
//     class: number;
//     order: number;
//     family: number;
//     genus: number;
//     species: number;
// }


// export class TaxLineModel {
//     public static schema = new Defs.Schema({
//         taxon: {
//             type: number,
//             required: true,
//             unique: true,
//             dropDups: true
//         },
//         root: {
//             type: number,
//             default: 0
//         },
//         superkingdom: {
//             type: number,
//             default: 0
//         },
//         kingdom: {
//             type: number,
//             default: 0
//         },
//         phylum: {
//             type: number,
//             default: 0
//         },
//         class: {
//             type: number,
//             default: 0
//         },
//         order: {
//             type: number,
//             default: 0
//         },
//         family: {
//             type: number,
//             default: 0
//         },
//         genus: {
//             type: number,
//             default: 0
//         },
//         species: {
//             type: number,
//             default: 0
//         }
//     });

//     private static _model =
//     mongoose.model<ITaxLine>('TaxLine', TaxLineModel.schema);
//     public static repo = new Defs.RepositoryBase<ITaxLine>(TaxLineModel._model);
// }
