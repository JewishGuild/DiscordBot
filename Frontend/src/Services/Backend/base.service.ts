import { HttpService } from "../http.service";

const baseApiHost = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

export abstract class BaseBackendService extends HttpService {
  protected routeName: string;

  constructor(routeName: string) {
    super({ baseURL: `/.proxy/api/${routeName}`, withCredentials: true });
    this.routeName = routeName;
  }
}
