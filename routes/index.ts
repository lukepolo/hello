import RouterInterface from "varie/lib/routing/RouterInterface";

import middleware from "./middleware";
import ErrorViews from "@views/errors";
import Room from "@views/room/Room.vue";
import Hello from "@views/Hello.vue";

export default function($router: RouterInterface) {
  /*
  |--------------------------------------------------------------------------
  | Your default routes for your application
  |--------------------------------------------------------------------------
  |
  */
  $router.route("/", Hello);
  $router.route("/room/:roomCode", Room).setName("room");

  $router.redirect("*", "/");
}
