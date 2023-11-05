import { UserRepository } from './user-repository';
import { compare, genSalt, hash } from 'bcrypt';
import { InsertUserPayload, MinimalUser, User, UserId } from './user';
import { ValidationError } from '../../general/error';
import { UserNotFoundError, WrongPasswordError } from './user-error';
import { TokenService } from '../token/token-service';
import { AuthResponse } from '../token/auth-token-pair';

const EMAIL_VALIDATION_PATTERN =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const USERNAME_VALIDATION_PATTERN = /^[a-zA-Z0-9._]{3,16}$/;

export class UserService {
    constructor(private userRepository: UserRepository, private tokenService: TokenService) {}

    public async getUsername(userId: UserId): Promise<string> {
        const user = await this.userRepository.findById(userId);
        return user.username;
    }

    public async isEmailInUse(email: string): Promise<boolean> {
        try {
            const user = await this.userRepository.findByEmail(email.toLowerCase());
            return !!user;
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                return false;
            }
            throw e;
        }
    }

    public async findByEmailOrUsername(emailOrUsername: string): Promise<User> {
        if (emailOrUsername.includes('@')) {
            return await this.userRepository.findByEmail(emailOrUsername.toLowerCase());
        } else {
            return await this.userRepository.findByName(emailOrUsername);
        }
    }

    public async listUsers(amount: number, offset: number): Promise<MinimalUser[]> {
        return this.userRepository.listUsers(amount, offset);
    }

    public async isUsernameAvailable(username: string): Promise<boolean> {
        if (!this.validateUsernameFormat(username)) {
            return false;
        }
        return this.userRepository.isUsernameAvailable(username.toLowerCase());
    }

    public async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
        const user = await this.findByEmailOrUsername(emailOrUsername);

        const passwordsMatch = await compare(password, user.passwordHash);

        if (passwordsMatch === true) {
            const tokenPair = await this.tokenService.generateAndStoreTokenPair(user.id);
            return {
                ...tokenPair,
                username: user.username,
            };
        }

        throw new WrongPasswordError('wrong password');
    }

    public async register(email: string, username: string, password?: string): Promise<UserId> {
        email = email.toLowerCase();
        if (!this.validateEmailFormat(email)) {
            throw new ValidationError('email is invalid');
        }
        if (!this.validateUsernameFormat(username)) {
            throw new ValidationError('username does not satisfy all specifications');
        }

        let passwordHash: string | null = null;
        if (password) {
            if (!this.validatePasswordFormat(password)) {
                throw new ValidationError('password does not satisfy all requirements');
            }
            passwordHash = await this.hashPassword(password);
        }

        const userRow: InsertUserPayload = {
            email,
            username,
            password_hash: passwordHash,
        };

        return this.userRepository.create(userRow);
    }

    public async logout(userId: UserId): Promise<void> {
        await this.tokenService.deleteTokenPair(userId);
    }

    public async delete(userId: UserId): Promise<boolean> {
        return this.userRepository.delete(userId);
    }

    public async updatePassword(userId: UserId, password: string): Promise<boolean> {
        if (!this.validatePasswordFormat(password)) {
            throw new ValidationError('password does not satisfy all requirements');
        }
        const passwordHash = await this.hashPassword(password);
        return this.userRepository.updatePassword(userId, passwordHash);
    }

    private validateEmailFormat(email: string): boolean {
        return EMAIL_VALIDATION_PATTERN.test(email);
    }

    private validateUsernameFormat(username: string): boolean {
        return USERNAME_VALIDATION_PATTERN.test(username);
    }

    private validatePasswordFormat(password: string): boolean {
        return password.length >= 8;
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(9);
        return await hash(password, salt);
    }
}
