import { OAuthRepository } from './oauth-repository';
import { TokenService } from '../../token/token-service';
import { UserService } from '../user-service';
import { MissingScopeError } from './oauth-error';
import { AuthResponse } from '../../token/auth-token-pair';
import { UserNotFoundError } from '../user-error';
import { OAuthProvider } from './provider/oauth-provider';

export class OAuthService {
    constructor(private oauthRepository: OAuthRepository, private tokenService: TokenService, private userService: UserService) {}

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

    public async loginWithOAuth(provider: OAuthProvider, jwtIdToken: string): Promise<AuthResponse> {
        const id = provider.getSubject(jwtIdToken);
        const userIsRegistered = await this.isSubjectRegistered(id, provider.providerIdentifier);
        if (!userIsRegistered) {
            throw new UserNotFoundError();
        }

        const userInformation = await provider.decodeToken(jwtIdToken);
        const userId = await this.oauthRepository.findUserIdForSubject(userInformation.sub, provider.providerIdentifier);
        const username = await this.userService.getUsername(userId);
        const tokenPair = await this.tokenService.generateAndStoreTokenPair(userId);
        return {
            ...tokenPair,
            username,
        };
    }

    public async registerWithOAuth(provider: OAuthProvider, jwtIdToken: string, username: string): Promise<AuthResponse> {
        const userInformation = await provider.decodeToken(jwtIdToken);

        if (!userInformation.email) {
            throw new MissingScopeError();
        }

        const userId = await this.userService.register(userInformation.email, username);
        await this.oauthRepository.createOauthUser(userInformation.sub, userId, provider.providerIdentifier);
        const tokenPair = await this.tokenService.generateAndStoreTokenPair(userId);
        return {
            ...tokenPair,
            username,
        };
    }
}
