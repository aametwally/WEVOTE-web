
namespace common {
    export interface ITaxLine {
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

    export interface ITaxonomyAbundance  {
        taxon: number;
        count: number;
        taxline: ITaxLine;
    }
}