import { HealthController } from "./controller/health/health.controller";
import { MoveMoreServer } from "./server/server";

const controllers = [
	new HealthController()
];

const server = new MoveMoreServer(controllers);

server.start().then(() => console.info("MoveMore server started"));

process.on("SIGINT", async () => {
	console.info("SIGINT noticed. Stopping server...");
	await server.stop();
	console.info("MoveMore server stopped");
});
