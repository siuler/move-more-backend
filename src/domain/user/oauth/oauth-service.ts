import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as applicationConfig from '../../../config/config.json';
import { OAuthRepository } from './oauth-repository';
import { InvalidTokenError } from '../../token/token-error';
import { TokenService } from '../../token/token-service';
import { UserService } from '../user-service';
import { MissingScopeError } from './oauth-error';
import { AuthResponse } from '../../token/auth-token-pair';
import { UserNotFoundError } from '../user-error';
import { OAUTH_PROVIDER_GOOGLE } from './oauth';

export class OAuthService {
    private googleOAuthClient: OAuth2Client;

    constructor(private oauthRepository: OAuthRepository, private tokenService: TokenService, private userService: UserService) {
        this.googleOAuthClient = new OAuth2Client(applicationConfig.oauth.google.clientId);
    }

    public async isSubjectRegistered(id: string, provider: string): Promise<boolean> {
        try {
            await this.oauthRepository.findUserIdForSubject(id, provider);
            return true;
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                return false;
            }
            throw e;
        }
    }

    public async loginWithGoogle(idToken: string, id: string): Promise<AuthResponse> {
        const userIsRegistered = await this.isSubjectRegistered(id, OAUTH_PROVIDER_GOOGLE);
        if (!userIsRegistered) {
            throw new UserNotFoundError();
        }

        const userInformation = await this.decodeToken(idToken);
        const userId = await this.oauthRepository.findUserIdForSubject(userInformation.sub, OAUTH_PROVIDER_GOOGLE);
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
        await this.oauthRepository.createOauthUser(userInformation.sub, userId, OAUTH_PROVIDER_GOOGLE);
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
