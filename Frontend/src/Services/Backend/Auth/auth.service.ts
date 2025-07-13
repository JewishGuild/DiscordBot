import { BaseBackendService } from "../base.service";
import { TokenBody, TokenResponse } from "./auth.types";

export class AuthService extends BaseBackendService {
  constructor() {
    super("auth");
  }

  public async token(body: TokenBody) {
    return this.post<TokenResponse>("/token", body);
  }
}
