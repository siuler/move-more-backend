import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { UserId } from '../../domain/user/user';
import { AuthTokenPair } from '../../domain/token/auth-token-pair';
import { TokenRepository } from '../../repository/user/token-repository';
import { Secret } from 'jsonwebtoken';
import { InvalidTokenError } from '../../domain/token/token-error';

export class TokenService {
    constructor(private secret: Secret, private tokenRepository: TokenRepository) {}

    public async generateAndStoreTokenPair(userId: UserId): Promise<AuthTokenPair> {
        const tokenPair: AuthTokenPair = {
            accessToken: this.generateJWTToken(userId),
            refreshToken: this.generateRefreshToken(),
        };
        await this.tokenRepository.persist(userId, tokenPair.refreshToken);
        return tokenPair;
    }

    public async refreshToken(userId: UserId, refreshToken: string): Promise<AuthTokenPair> {
        const currentRefreshToken = await this.tokenRepository.findByUserId(userId);
        if (refreshToken !== currentRefreshToken) {
            throw new InvalidTokenError('the token is invalid');
        }
        return this.generateAndStoreTokenPair(userId);
    }

    private generateJWTToken(userId: UserId): string {
        return jwt.sign({ uid: userId }, this.secret, { expiresIn: '5min' });
    }

    private generateRefreshToken(): string {
        const randomValues = crypto.getRandomValues(new Uint8Array(512));
        return Buffer.from(String.fromCharCode(...randomValues))
            .toString('base64')
            .replace(/[+]/g, 'x')
            .replace(/[/]/g, 'I')
            .substring(0, 512);
    }
}
