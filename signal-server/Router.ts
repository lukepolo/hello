import { Response, Request } from "express";
import Bindings from "./constants/Bindings";
import { inject, injectable } from "inversify";

type MethodTypes = "get" | "post" | "delete" | "options" | "put";
interface RouteDefinition {
  path: string;
  methodName: string;
  method: MethodTypes;
}

export const Prefix = (prefix: string = ""): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata("prefix", prefix, target);
    if (!Reflect.hasMetadata("routes", target.constructor)) {
      Reflect.defineMetadata("routes", [], target.constructor);
    }
  };
};

export const Get = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    addRoute(path, "get", target, propertyKey);
  };
};

export const Post = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    addRoute(path, "post", target, propertyKey);
  };
};

export const Delete = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    addRoute(path, "delete", target, propertyKey);
  };
};

export const Options = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    addRoute(path, "options", target, propertyKey);
  };
};

export const Put = (path: string): MethodDecorator => {
  return (target, propertyKey: string): void => {
    addRoute(path, "put", target, propertyKey);
  };
};

function addRoute(path: string, method: MethodTypes, target, propertyKey) {
  if (!Reflect.hasMetadata("routes", target.constructor)) {
    Reflect.defineMetadata("routes", [], target.constructor);
  }
  const routes = Reflect.getMetadata("routes", target.constructor) as Array<
    RouteDefinition
  >;

  routes.push({
    path,
    method,
    methodName: propertyKey,
  });

  Reflect.defineMetadata("routes", routes, target.constructor);
}

@injectable()
export default class Router {
  constructor(@inject(Bindings.App) app) {
    const prefix = Reflect.getMetadata("prefix", this.constructor);
    const routes: Array<RouteDefinition> = Reflect.getMetadata(
      "routes",
      this.constructor,
    );
    routes.forEach((route) => {
      let path = `${prefix || "/"}/${route.path}`.replace(/\/+/g, "/");
      app[route.method](path, async (request: Request, response: Response) => {
        try {
          if (this[route.methodName]! instanceof Promise) {
            return response.json(this[route.methodName](request, response));
          }
          return response.json(await this[route.methodName](request, response));
        } catch ({ status, message }) {
          return response.status(status || 500).json({
            error: message,
          });
        }
      });
    });
  }
}
