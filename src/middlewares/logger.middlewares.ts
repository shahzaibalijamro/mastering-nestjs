import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware{
    use(req: Request, res: Response, next: NextFunction) {
        const {url, method} = req;
        console.log(`Incoming request: Method: ${method}, URL: ${url}`);
        next();
    }
}