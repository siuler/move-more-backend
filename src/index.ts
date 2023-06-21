import { HealthController } from './general/server/controller/health/health.controller';
import { MoveMoreServer } from './general/server/server';
import { install } from './installer/install';
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

install().then(async () => {
    await MysqlConnectionPool.initialize();
    const connectionPool = MysqlConnectionPool.getInstance();

    const tokenRepository = new TokenRepository(connectionPool);
    const tokenService = new TokenService('TODO: USE SSL CERT', tokenRepository);

    const userRepository = new UserRepository(connectionPool);
    const userService = new UserService(userRepository, tokenService);

    const performedExerciseRepository = new ExerciseRepository(connectionPool);
    const trainingService = new ExerciseService(performedExerciseRepository);

    const controllers = [
        new HealthController(),
        new UserController(userService),
        new TokenController(tokenService),
        new ExerciseController(trainingService),
    ];

    const server = new MoveMoreServer(controllers);

    await server.start();
    console.info('MoveMore server started');

    process.on('SIGINT', async () => {
        setTimeout(() => process.exit(1), 10 * 1000);
        console.info('SIGINT received. Stopping server...');
        await server.stop();
        console.info('MoveMore server stopped');
        process.exit(0);
    });
});
