import { OAuthTokenPayload } from '../oauth';
import { OAuthProvider } from './oauth-provider';
import { InvalidTokenError } from '../oauth-error';
import * as applicationConfig from '../../../../config/config.json';
import verifyAppleIdToken from 'verify-apple-id-token';

export class AppleOAuthProvider extends OAuthProvider {
    readonly providerIdentifier: string = 'apple';

    constructor() {
        super('apple');
    }

    async decodeToken(jwtIdToken: string): Promise<OAuthTokenPayload> {
        const userInformation = verifyAppleIdToken({
            clientId: applicationConfig.oauth.apple.clientId,
            idToken: jwtIdToken,
        });

        if (!userInformation) {
            throw new InvalidTokenError();
        }
        return userInformation;
    }
}
