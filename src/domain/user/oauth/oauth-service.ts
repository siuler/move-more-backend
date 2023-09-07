import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as applicationConfig from '../../../config/config.json';
import { GoogleOAuthRepository } from './google-oauth-repository';
import { InvalidTokenError } from '../../token/token-error';
import { TokenService } from '../../token/token-service';
import { UserService } from '../user-service';
import { MissingScopeError } from './oauth-error';
import { AuthResponse, AuthTokenPair } from '../../token/auth-token-pair';
import { UserNotFoundError } from '../user-error';

export class OAuthService {
    private googleOAuthClient: OAuth2Client;

    constructor(
        private googleOAuthRepository: GoogleOAuthRepository,
        private tokenService: TokenService,
        private userService: UserService
    ) {
        this.googleOAuthClient = new OAuth2Client(applicationConfig.oauth.google.clientId);
    }

    public async loginWithGoogle(idToken: string, email: string): Promise<AuthResponse> {
        const userIsRegistered = await this.userService.isEmailInUse(email);
        if (!userIsRegistered) {
            throw new UserNotFoundError();
        }

        const userInformation = await this.decodeToken(idToken);
        const userId = await this.googleOAuthRepository.findUserIdForSubject(userInformation.sub);
        const username = await this.userService.getUsername(userId);
        const tokenPair = await this.tokenService.generateAndStoreTokenPair(userId);
        return {
            ...tokenPair,
            username,
        };
    }

    public async registerWithGoogle(idToken: string, username: string): Promise<AuthResponse> {
        const userInformation = await this.decodeToken(idToken);

        if (!userInformation.email) {
            throw new MissingScopeError();
        }

        const userId = await this.userService.register(userInformation.email, username);
        await this.googleOAuthRepository.createUserWithGoogle(userInformation.sub, userId);
        const tokenPair = await this.tokenService.generateAndStoreTokenPair(userId);
        return {
            ...tokenPair,
            username,
        };
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
