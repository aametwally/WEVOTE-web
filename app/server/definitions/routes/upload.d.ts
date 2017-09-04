import { BaseRoute } from "./route";
export declare class UploadRouter extends BaseRoute {
    static readonly uploadsDir: string;
    private readonly _storage;
    private readonly _upload;
    constructor();
    static router(): any;
    private static validateDNA(seqFile, reads);
}
