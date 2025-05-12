import { Router } from "express";

interface AuthConfig {
    sessionSecret: string,
    db: {
        table: string;
        pool: any;
    };
    salt_rounds?: number;
}

declare function createAuthRouter(config: AuthConfig): Router;

export = createAuthRouter;