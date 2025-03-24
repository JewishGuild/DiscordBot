import { Router } from "express";

/** BaseRouter - Abstract class to create reusable Express routers. */
export abstract class BaseRouter {
  protected router: Router;
  protected readonly routeName: string;

  constructor(routeName: string) {
    this.router = Router();
    this.routeName = routeName;
  }

  /** Each subclass must implement this to define its routes */
  protected abstract setupRoutes(): void;

  /** Exposes the router instance with its routeName */
  public getRouter(): { routeName: string; router: Router } {
    return { routeName: this.routeName, router: this.router };
  }
}
