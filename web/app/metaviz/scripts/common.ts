declare namespace common {

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
    
    export interface ITaxonomyAbundance {
        taxon: number;
        count: number;
        taxline: ITaxLine;
    }
    
    export interface ITaxonomyAbundanceProfile {
        experiment: any,
        abundance: ITaxonomyAbundance[];
    }
    
    export interface IUser {
        username: string;
        password: string;
        email: string;
        admin: boolean;
        createdAt: Date;
        modifiedAt: Date;
    }
    
    
    export interface IRemoteAddress {
        host: string,
        port: number,
        relativePath: string
    }
    
    
    export enum EStatus {
        NOT_STARTED,
        IN_PROGRESS,
        SUCCSESS,
        FAILURE
    }
    
    export interface IStatus {
        code: EStatus,
        message: string,
        percentage: number
    }
    
    export interface IWevoteSubmitEnsemble {
        jobID: string,
        resultsRoute: IRemoteAddress,
        reads: IWevoteClassification[],
        abundance: ITaxonomyAbundance[],
        sequences: string[],
        algorithms: string[],
        status: IStatus,
        score: number,
        penalty: number,
        minNumAgreed: number , 
        distances: number[] 
    }
    
    export interface IWevoteClassification {
        seqId: string,
        votes: number[],
        WEVOTE?: number,
        numToolsReported?: number,
        numToolsAgreed?: number,
        numToolsUsed?: number,
        score?: number ,
        distances?: number[] ,
        cost?: number
    }
    
    export interface IWevoteClassificationPatch {
        experiment: any;
        patch: IWevoteClassification[];
        distances: number[];
        status: IStatus;
    }
    
    export interface IAlgorithm {
        name: string;
        used: boolean;
    }
    
    export interface IConfig {
        algorithms: IAlgorithm[];
        minNumAgreed: number;
        minScore: number;
        penalty: number;
    }
    
    export interface IResults {
        wevoteClassification: any;
        taxonomyAbundanceProfile: any;
    }
    
    export interface IUsageScenario {
        value: string;
        usage: string;
        hint?: string;
    }
    
    export interface IRemoteFile {
        name: string,
        description: string,
        onServer?: Boolean,
        uri: string,
        data: string,
        size: number,
        tag?: string,
        count?: number
    }
    
    export interface IExperiment {
        user: any;
        email: string;
        description: string;
        reads: IRemoteFile;
        classification: IRemoteFile;
        ensemble: IRemoteFile;
        config: IConfig;
        status?: IStatus;
        results?: IResults;
        usageScenario: IUsageScenario;
        createdAt?: Date;
        modifiedAt?: Date;
    }      
}