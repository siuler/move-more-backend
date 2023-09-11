import { OAuth2Client } from 'google-auth-library';
import { OAuthTokenPayload } from '../oauth';
import { OAuthProvider } from './oauth-provider';
import * as applicationConfig from '../../../../config/config.json';
import { InvalidTokenError } from '../oauth-error';

export class GoogleOAuthProvider extends OAuthProvider {
    private googleOAuthClient: OAuth2Client;

    readonly providerIdentifier: string = 'google';

    constructor() {
        super('google');
        this.googleOAuthClient = new OAuth2Client(applicationConfig.oauth.google.clientId);
    }

    async decodeToken(jwtIdToken: string): Promise<OAuthTokenPayload> {
        const ticket = await this.googleOAuthClient.verifyIdToken({
            idToken: jwtIdToken,
            audience: applicationConfig.oauth.google.clientId,
        });
        const userInformation = ticket.getPayload();
        if (!userInformation) {
            throw new InvalidTokenError();
        }
        return userInformation;
    }
}
