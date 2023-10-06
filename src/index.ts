import { HealthController } from './general/server/controller/health/health.controller';
import { MoveMoreServer } from './general/server/server';
import { migrate } from './migration/migrate';
import { UserService } from './domain/user/user-service';
import { UserRepository } from './domain/user/user-repository';
import { MysqlConnectionPool } from './repository/mysql/mysql-connection-pool';
import { TokenService } from './domain/token/token-service';
import { TokenRepository } from './domain/token/token-repository';
import { ExerciseRepository } from './domain/exercise/repository/exercise-repository';
import { ExerciseService } from './domain/exercise/exercise-service';
import { UserController } from './domain/user/controller/user.controller';
import { TokenController } from './domain/token/controller/token.controller';
import { ExerciseController } from './domain/exercise/controller/exercise.controller';
import { FriendRepository } from './domain/friend/friend-repository';
import { FriendService } from './domain/friend/friend-service';
import { RankingRepository } from './domain/ranking/ranking-repository';
import { RankingService } from './domain/ranking/ranking-service';
import { RankingController } from './domain/ranking/controller/ranking.controller';
import { FriendController } from './domain/friend/controller/friend.controller';
import { FriendRequestRepository } from './domain/friend/friend-request-repository';
import { StatisticRepository } from './domain/statistic/statistic-repository';
import { StatisticService } from './domain/statistic/statistic-service';
import { StatisticController } from './domain/statistic/controller/statistic.controller';
import { OAuthRepository } from './domain/user/oauth/oauth-repository';
import { OAuthService } from './domain/user/oauth/oauth-service';
import { OAuthController } from './domain/user/oauth/oauth-controller';
import { JWT_PRIVATE_KEY } from './general/server/ssl/jwt-key';
import { RecoverAccountController } from './domain/user/recover/recover.controller';
import { RecoverAccountService } from './domain/user/recover/recover-service';
import { MailClient } from './domain/messaging/mail/mail-client';
import { RecoveryCodeRepository } from './domain/user/recover/recovery-code-repository';
import { Logger } from './general/logger';
import { PushNotificationController } from './domain/messaging/push-notification/controller/push-notification-controller';
import { PushNotificationService } from './domain/messaging/push-notification/service/push-notification-service';
import { PushNotificationRepository } from './domain/messaging/push-notification/service/push-notification-repository';
import { PushNotificationInternalEventListener } from './domain/messaging/push-notification/push-notification-internal-event-listener';
import { FriendAddTokenRepository } from './domain/friend/friend-add-token-repository';

migrate().then(async () => {
    await MysqlConnectionPool.initialize();
    const connectionPool = MysqlConnectionPool.getInstance();
    const mailClient = new MailClient();

    const pushNotificationRepository = new PushNotificationRepository(connectionPool);
    const pushNotificationService = new PushNotificationService(pushNotificationRepository);

    const tokenRepository = new TokenRepository(connectionPool);
    const tokenService = new TokenService(JWT_PRIVATE_KEY, tokenRepository);

    const userRepository = new UserRepository(connectionPool);
    const userService = new UserService(userRepository, tokenService);

    const googleOAuthRepository = new OAuthRepository(connectionPool);
    const oAuthService = new OAuthService(googleOAuthRepository, tokenService, userService);

    const recoveryCodeRepository = new RecoveryCodeRepository(connectionPool);
    const recoverAccountService = new RecoverAccountService(mailClient, userService, recoveryCodeRepository);

    const friendRepository = new FriendRepository(connectionPool);
    const friendRequestRepository = new FriendRequestRepository(connectionPool);
    const friendAddTokenRepository = new FriendAddTokenRepository(connectionPool);
    const friendService = new FriendService(friendRepository, friendRequestRepository, friendAddTokenRepository);

    const rankingRepository = new RankingRepository(connectionPool);
    const rankingService = new RankingService(rankingRepository, friendService);

    const statisticRepository = new StatisticRepository(connectionPool);
    const statisticService = new StatisticService(statisticRepository);

    const exerciseRepository = new ExerciseRepository(connectionPool);
    const exerciseService = new ExerciseService(exerciseRepository);

    const controllers = [
        new HealthController(),
        new TokenController(tokenService, userService),
        new UserController(userService),
        new OAuthController(oAuthService),
        new PushNotificationController(pushNotificationService),
        new RecoverAccountController(recoverAccountService),
        new FriendController(friendService),
        new RankingController(rankingService),
        new StatisticController(statisticService, friendService),
        new ExerciseController(exerciseService),
    ];

    const server = new MoveMoreServer(controllers);

    await server.start();
    Logger.info('MoveMore server started');

    new PushNotificationInternalEventListener(rankingService, pushNotificationService, exerciseService, userService);
    Logger.info('PushNotification listener registered');

    process.on('SIGINT', () => shutdown(server));
    process.on('SIGTERM', () => shutdown(server));
});

async function shutdown(server: MoveMoreServer) {
    setTimeout(() => process.exit(1), 10 * 1000);
    console.info('SIGINT or SIGTERM received. Stopping server...');
    await server.stop();
    console.info('MoveMore server stopped');
    process.exit(0);
}
