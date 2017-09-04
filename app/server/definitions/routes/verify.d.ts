export declare let getToken: (user: any) => string;
export declare let isValidToken: (req: any, res: any, next: any, cbValid: any, cbInvalid: any) => void;
export declare let verifyOrdinaryUser: (req: any, res: any, next: any) => any;
export declare let verifyAdmin: (req: any, res: any, next: any) => any;
