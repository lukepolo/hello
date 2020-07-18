import Routes from "@routes";
import RouterInterface from "varie/lib/routing/RouterInterface";
import { RoutingServiceProvider as ServiceProvider } from "varie";

/*
|--------------------------------------------------------------------------
| Route Service Provider
|--------------------------------------------------------------------------
|
*/
export default class RoutingServiceProvider extends ServiceProvider {
  public $router: RouterInterface;

  public async boot() {
    super.boot();

    // ...
  }

  public async register() {
    super.register();
    $config.set(
      "router.mode",
      $config.get("app.platform") === "web" ? "history" : "hash",
    );
  }

  map() {
    this.$router.register(Routes);
  }
}
