import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor (
        private authService: AuthService
    ) {
        super({
            usernameField: 'usernameOrEmail'
        });
    }

    async validate(usernameOrEmail: string, password: string) {
        console.log(usernameOrEmail, "sgdsgsdgs");
        console.log(password, "sgdsgsdgs");
        
        const user = await this.authService.signIn({usernameOrEmail, password});
        if (!user) {
            throw new UnauthorizedException()
        }
        return user;
    }

}