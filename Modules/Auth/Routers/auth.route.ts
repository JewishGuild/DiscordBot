import { BaseRouter } from "../../Base/Routes/base.router.js";
import { AuthController } from "../Controllers/auth.controller.js";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor() {
    super("/auth");
    this.authController = new AuthController();
    this.setupRoutes();
  }

  protected setupRoutes(): void {
    // Auth routes
    this.router.post("/token", this.authController.token);
  }
}
