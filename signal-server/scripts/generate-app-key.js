const dotenvM = require("dotenv-manipulator");
require("crypto").randomBytes(48, function(err, buffer) {
  dotenvM.update("APP_KEY", buffer.toString("hex"));
});
