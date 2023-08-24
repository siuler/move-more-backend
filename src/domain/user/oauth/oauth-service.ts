import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as applicationConfig from '../../../config/config.json';
import { GoogleOAuthRepository } from './google-oauth-repository';
import { InvalidTokenError } from '../../token/token-error';
import { TokenService } from '../../token/token-service';
import { UserService } from '../user-service';
import { MissingScopeError } from './oauth-error';
import { UserId } from '../user';
import { AuthTokenPair } from '../../token/auth-token-pair';

export class OAuthService {
    private googleOAuthClient: OAuth2Client;

    constructor(
        private googleOAuthRepository: GoogleOAuthRepository,
        private tokenService: TokenService,
        private userService: UserService
    ) {
        this.googleOAuthClient = new OAuth2Client(applicationConfig.oauth.google.clientId);
    }

    public async loginWithGoogle(idToken: string): Promise<AuthTokenPair> {
        const userInformation = await this.decodeToken(idToken);
        const userId = await this.googleOAuthRepository.findUserIdForSubject(userInformation.sub);
        return this.tokenService.generateAndStoreTokenPair(userId);
    }

    public async registerWithGoogle(idToken: string, username: string): Promise<UserId> {
        const userInformation = await this.decodeToken(idToken);

        if (!userInformation.email) {
            throw new MissingScopeError();
        }

        const userId = await this.userService.register(userInformation.email, username);
        await this.googleOAuthRepository.createUserWithGoogle(userInformation.sub, userId);
        return userId;
    }

    private async decodeToken(idToken: string): Promise<TokenPayload> {
        const ticket = await this.googleOAuthClient.verifyIdToken({
            idToken,
            audience: applicationConfig.oauth.google.clientId,
        });
        const userInformation = ticket.getPayload();
        if (!userInformation) {
            throw new InvalidTokenError();
        }
        return userInformation;
    }
}
