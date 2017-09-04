/// <reference types="express" />
import * as Express from 'express';
export declare class Server {
    private _app;
    static bootstrap(port: any): Express.Application;
    constructor();
    private api();
    private db();
    private middleware();
    private passport();
    private routes();
}
