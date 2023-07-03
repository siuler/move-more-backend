import { UserRepository } from './user-repository';
import { compare, genSalt, hash } from 'bcrypt';
import { InsertUserPayload, User, UserId } from './user';
import { ValidationError } from '../../general/validation-error';
import { WrongPasswordError } from './user-error';
import { TokenService } from '../token/token-service';
import { AuthTokenPair } from '../token/auth-token-pair';

const EMAIL_VALIDATION_PATTERN =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const USERNAME_VALIDATION_PATTERN = /^[a-zA-Z0-9]{5,16}$/;

export class UserService {
    constructor(private userRepository: UserRepository, private tokenService: TokenService) {}

    public async login(emailOrUsername: string, password: string): Promise<AuthTokenPair> {
        let user: User;
        if (emailOrUsername.includes('@')) {
            user = await this.userRepository.findByEmail(emailOrUsername);
        } else {
            user = await this.userRepository.findByName(emailOrUsername);
        }

        const passwordsMatch = await compare(password, user.passwordHash);

        if (passwordsMatch === true) {
            const tokenPair = this.tokenService.generateAndStoreTokenPair(user.id);
            return tokenPair;
        }

        throw new WrongPasswordError('wrong password');
    }

    public async register(email: string, username: string, password: string): Promise<UserId> {
        if (!this.validateEmailFormat(email)) {
            throw new ValidationError('email is invalid');
        }
        if (!this.validateUsernameFormat(username)) {
            throw new ValidationError('username does not satisfy all specifications');
        }
        if (!this.validatePasswordFormat(password)) {
            throw new ValidationError('password does not satisfy all requirements');
        }

        const salt = await genSalt(9);
        const passwordHash = await hash(password, salt);

        const userRow: InsertUserPayload = {
            email,
            username,
            password_hash: passwordHash,
        };

        return this.userRepository.create(userRow);
    }

    public validateEmailFormat(email: string): boolean {
        return EMAIL_VALIDATION_PATTERN.test(email);
    }

    public validateUsernameFormat(username: string): boolean {
        return USERNAME_VALIDATION_PATTERN.test(username);
    }

    public validatePasswordFormat(password: string): boolean {
        return password.length >= 8;
    }
}
