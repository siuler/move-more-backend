import { makeMockReply, makeMockRequest } from "../../../jest/controller-mocks";
import { UserController } from "./user.controller";

describe("user controller", () => {
	describe('Route Registration', () => {
		it('should return all routes', () => {
			//given
			const userController = new UserController();

			//when
			const routes = userController.getRoutes();

			//then
			expect(routes).toHaveLength(1);
			expect(routes).toContainEqual({url: '/user/register', method: 'POST', handler: userController.register});
		});
	});

	it('should extract register-payload from body and pass it to register-service', async () => {
		//given
		const mockRequest = makeMockRequest();
		const mockReply = makeMockReply();

		const userController = new UserController();

		//when
		userController.register(mockRequest, mockReply);

		//then
		expect(mockReply.code).toBeCalledWith(200);
		expect(mockReply.send).toBeCalledWith("OK");
	});
});
