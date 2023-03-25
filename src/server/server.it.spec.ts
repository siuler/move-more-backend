import { HealthController } from "../controller/health/health.controller";
import fetch from "node-fetch";
import { MoveMoreServer } from "./server";

jest.mock("../controller/health/health.controller");

describe("server", () => {
  it("should register health endpoint", async () => {
    //given
    const healthController = new HealthController();
    jest
      .mocked(healthController)
      .health.mockImplementation((req, reply) => reply.send(200));

    await new MoveMoreServer([healthController]).start();

    //when
    await fetch("http://0.0.0.0:8080/health");

    //then
    expect(healthController.health).toBeCalledTimes(1);
  });
});
