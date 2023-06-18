import { HealthController } from "./controller/health/health.controller";
import { MoveMoreServer } from "./server/server";
import { install } from "./installer/install";
import { UserController } from "./controller/user/user.controller";
import { UserService } from "./service/user/user-service";
import { UserRepository } from "./repository/user/user-repository";
import { MysqlConnectionPool } from "./repository/mysql/mysql-connection-pool";
import { TokenService } from "./service/user/token-service";
import { TokenRepository } from "./repository/user/token-repository";
import { TokenController } from "./controller/token/token.controller";

install().then(async () => {
	await MysqlConnectionPool.initialize();
	const connectionPool = MysqlConnectionPool.getInstance();

	const tokenRepository = new TokenRepository(connectionPool);
	const tokenService = new TokenService('TODO: USE SSL CERT', tokenRepository);

	const userRepository = new UserRepository(connectionPool);
	const userService = new UserService(userRepository, tokenService);

	const controllers = [
		new HealthController(),
		new UserController(userService),
		new TokenController(tokenService),
	];

	const server = new MoveMoreServer(controllers);

	await server.start()
	console.info("MoveMore server started");

	process.on("SIGINT", async () => {
		setTimeout(() => process.exit(1), 10 * 1000);
		console.info("SIGINT received. Stopping server...");
		await server.stop();
		console.info("MoveMore server stopped");
		process.exit(0);
	});
});
