export default {
  /*
  |--------------------------------------------------------------------------
  | Signal Server Host
  |--------------------------------------------------------------------------
  |
  */
  iceServers:
    process.env.NODE_ENV === "development"
      ? []
      : [{ urls: "stun:stun.l.google.com:19302" }],
};
