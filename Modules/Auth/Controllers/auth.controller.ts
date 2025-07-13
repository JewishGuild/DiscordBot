import { Request, Response } from "express";
import { BaseController } from "../../Base/Controllers/base.controller.js";
import { AuthService } from "../Services/auth.service.js";

export class AuthController extends BaseController {
  constructor() {
    super();
  }

  public token = this.wrapEndpoint(async (req: Request, res: Response) => {
    const { code } = req.body;
    return await AuthService.token(code);
  });
}
