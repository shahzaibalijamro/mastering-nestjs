import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');
    if (!clientID || !clientSecret || !callbackURL) {
      throw new InternalServerErrorException(
        'Google credentials are not set up!',
      );
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const profilePicture = profile._json.picture || profile?.photos?.[0]?.value;
      
      const email =
        profile.emails?.[0]?.value || (profile as any)?._json?.email;

      if (!email) {
        return done(
          new InternalServerErrorException('Google account has no email'),
        );
      }

      const name =
        profile.displayName ||
        [profile.name?.givenName, profile.name?.familyName]
          .filter(Boolean)
          .join(' ')
          .trim();

      const username = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-');

      const user = await this.authService.createGoogleUser({
        name,
        username,
        googleId: profile.id,
        email,
        profilePicture,
      });

      return done(null, user);
    } catch (error) {
      return done(error as any);
    }
  }
}
