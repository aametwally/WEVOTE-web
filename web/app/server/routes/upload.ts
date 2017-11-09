import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
const config = require('../config');

export class UploadRouter extends BaseRoute {
    static readonly uploadsDir = config.uploadDir;

    private readonly _storage = multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
            cb(null, UploadRouter.uploadsDir)
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
        }
    });

    private readonly _upload = multer({
        storage: this._storage
    });

    constructor() {
        super();


        if (!fs.existsSync(UploadRouter.uploadsDir)) {
            fs.mkdirSync(UploadRouter.uploadsDir);
        }

        // Will handle POST requests to /upload
        this._router.post('/reads', this._upload.single('file'), (req: Request, res: Response) => {
            console.log(req.file.filename);

            /**
             * For the moment, include the filename in the http header.
             * It is a bad practice. For some unknown reasons the response
             * body is always received empty at client side.
             */
            interface ReadsDummyType {
                count?: number;
            }
            let reads: ReadsDummyType = {};
            let isFasta: boolean = UploadRouter.validateDNA(UploadRouter.uploadsDir + '/' + req.file.filename, reads);
            console.log("fastaValidation", isFasta, reads.count);
            res.setHeader("isFasta", `${isFasta}`);
            res.setHeader("readscount", `${reads.count}`);
            res.setHeader("filename", req.file.filename);
            res.status(204).end();
            // console.log(res);
        });

        // Will handle POST requests to /upload
        this._router.post('/ensemble', this._upload.single('file'), (req: Request, res: Response) => {
            console.log(req.file.filename);

            let seq = fs.readFileSync( UploadRouter.uploadsDir + '/' + req.file.filename ).toString();
            
            // immediately remove trailing spaces
            seq = seq.trim();

            // split on newlines...
            const lines = seq.split('\n');

            res.setHeader("ensemblecount", `${lines.length}`);
            res.setHeader("filename", req.file.filename);
            res.status(204).end();
        });

        this._router.post('/classification', this._upload.single('file'), (req: Request, res: Response) => {
            console.log(req.file.filename);

            /**
             * For the moment, include the filename in the http header.
             * It is a bad practice. For some unknown reasons the response
             * body is always received empty at client side.
             */
            res.setHeader("filename", req.file.filename);
            res.status(204).end();
            // console.log(res);
        })
    }

    public static router() :any {
        let _ = new UploadRouter();
        return _._router;
    }

    private static validateDNA(seqFile: string, reads: any): boolean {
        //Based on: http://www.blopig.com/blog/2013/03/a-javascript-function-to-validate-fasta-sequences/

        let seq = fs.readFileSync(seqFile).toString();

        console.log("seq.length", seq.length);

        // immediately remove trailing spaces
        seq = seq.trim();

        // split on newlines...
        let lines = seq.split('\n').filter(function (line) {
            // if (line.search(/[^gatcn\s]/i) != -1 && line[0]!='>'){
            //     console.log(line);
            // }
            return line[0] != '>';
        });

        reads.count = lines.length;
        console.log(lines.length);

        // join the array back into a single string without newlines and
        // trailing or leading spaces
        seq = lines.join('').trim();

        //Search for charaters that are not G, A, T or C.
        return seq.search(/[^gatcn\s]/i) === -1;
        /// The next line can be used to return a cleaned version of the DNA
        /// return seq.replace(/[^gatcGATC]/g, "");
    }
}



