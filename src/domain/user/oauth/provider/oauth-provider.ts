import { parseJwt } from '../../../../general/util';
import { OAuthTokenPayload } from '../oauth';
import { InvalidProviderError, InvalidTokenError } from '../oauth-error';

export abstract class OAuthProvider {
    private static registry: Record<string, OAuthProvider> = {};
    public static fromName(providerName: string): OAuthProvider {
        if (this.registry[providerName]) {
            return this.registry[providerName];
        }
        throw new InvalidProviderError();
    }

    abstract readonly providerIdentifier: string;

    constructor(registryName: string) {
        OAuthProvider.registry[registryName] = this;
    }

    getSubject(jwtIdToken: string): string {
        const token = parseJwt(jwtIdToken);
        if (!token.sub) {
            throw new InvalidTokenError();
        }
        return token.sub;
    }

    abstract decodeToken(jwtToken: string): Promise<OAuthTokenPayload>;
}
