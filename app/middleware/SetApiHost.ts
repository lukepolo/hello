import { inject, injectable } from "inversify";
import { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import HttpMiddlewareInterface from "varie/lib/http/interfaces/HttpMiddlewareInterface";

@injectable()
export default class SetApiHost implements HttpMiddlewareInterface {
  protected configService;

  constructor(@inject("ConfigService") configService) {
    this.configService = configService;
  }

  public request(config: AxiosRequestConfig) {
    if (/^(:\/\/)/.test(config.url)) {
      return config;
    }

    config.withCredentials = true;
    config.url =
      this.configService.get("app.host") +
      `/api/${config.url}`.replace(/\/+/g, "/");

    return config;
  }

  public response(response: AxiosResponse) {
    return response;
  }

  public responseError(error: AxiosError) {
    return error;
  }
}
