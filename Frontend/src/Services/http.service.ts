import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class CustomHttpError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Config interface for HTTP service */
export interface HttpServiceConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

/** Generic HTTP Service */
export class HttpService {
  protected api: AxiosInstance;

  constructor(config: HttpServiceConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
        ...(config?.headers || {})
      },
      timeout: config?.timeout || 10000,
      withCredentials: config?.withCredentials || false
    });

    this.setupInterceptors();
  }

  /** Setup global interceptors */
  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || "Unknown error";
        const data = error.response?.data;

        throw new CustomHttpError(status, message, data);
      }
    );
  }

  /** Generic request wrapper */
  private async request<T>(method: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.request({ method, url, data, ...config });
    return response.data;
  }

  /** HTTP methods */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("POST", url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("PUT", url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config);
  }
}
