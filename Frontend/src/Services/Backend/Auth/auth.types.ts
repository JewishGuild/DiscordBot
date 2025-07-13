import { BaseResponse } from "../base.types";

export interface TokenBody {
  code: string;
}
export interface TokenData {
  access_token: string;
}
export interface TokenResponse extends BaseResponse<TokenData> {}
