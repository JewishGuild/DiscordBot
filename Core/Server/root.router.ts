import { Router } from "express";
import { BaseRouter } from "../../Modules/Base/Routes/base.router.js";

/** RootRouter - Centralized router that registers all feature routers dynamically. */
export class RootRouter {
  private static router = Router();

  /** Dynamically adds feature routers */
  public static init(): Router {
    const moduleRouters: Array<BaseRouter> = [];

    moduleRouters.forEach((moduleRouter) => {
      const { routeName, router } = moduleRouter.getRouter();
      this.router.use(routeName, router);
    });

    return this.router;
  }
}
