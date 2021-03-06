// eslint-disable global-require
const path = require("path");
const helmet = require("helmet");
const log = require("metalogger")();
const healthcheck = require("maikai");
const hbs = require("hbs");
const cors = require("cors");
const morgan = require("morgan");
require("app-module-path").addPath(path.join(__dirname, "/lib"));
const dotenv = require('dotenv');

dotenv.config();

// Add all routes and route-handlers for your service/app here:
function serviceRoutes(app) {
  // For Liveness Probe, defaults may be all you need.
  const livenessCheck = healthcheck({ path: "/ping" });
  app.use(livenessCheck.express());

  // For readiness check, let's also test the DB
  const check = healthcheck();
  const AdvancedHealthcheckers = require("healthchecks-advanced");
  const advCheckers = new AdvancedHealthcheckers();
  // Database health check is cached for 10000ms = 10 seconds!
  check.addCheck("db", "dbQuery", advCheckers.dbCheck, { minCacheMs: 10000 });
  app.use(check.express());
  app.use(morgan("dev"));
  /* eslint-disable global-require */

  // Temporary allow all urls
  const safesitelist =
    process.env.NODE_ENV == "production"
      ? [
          "https://rndx-wallet.io",
          "https://app.rndx-wallet.io",
          "https://admin.rndx-wallet.io",
        ]
      : [
          "http://192.168.0.7:34129",
          "https://dev.rndx-wallet.io",
          "https://app.dev.rndx-wallet.io",
          "https://admin.dev.rndx-wallet.io",
        ];

  const corsOptions = {
    origin: function (origin, callback) {
      const issafesitelisted = safesitelist.indexOf(origin) !== -1;
      callback(null, issafesitelisted);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use("/users", require("users")); // attach to sub-route
  /* eslint-enable global-require */
}

function setupErrorHandling(app) {
  // Custom formatting for error responses.
  app.use((err, req, res, next) => {
    if (err) {
      const out = {};
      if (err.isJoi || err.type === "validation") {
        //validation error. No need to log these
        out.errors = err.details;
        res.status(400).json(out);
        return;
      } else {
        log.error(err);
        if (process.env.NODE_ENV === "production") {
          out.errors = ["Internal server error"];
        } else {
          out.errors = [err.toString()];
        }
        res.status(500).json(out);
        return;
      }
    }
    return next();
  });
}

exports.setup = function(app, callback) {
    // Choose your favorite view engine(s)
    app.set("view engine", "handlebars");
    app.engine("handlebars", hbs.__express);

    /** Adding security best-practices middleware
     * see: https://www.npmjs.com/package/helmet **/

    const cspOptions = {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'unsafe-inline'"],
        }
    }

    app.use(helmet({
            contentSecurityPolicy: cspOptions,
        }

    ));

    //---- Mounting well-encapsulated application modules (so-called: "mini-apps")
    //---- See: http://expressjs.com/guide/routing.html and http://vimeo.com/56166857
    serviceRoutes(app);

  setupErrorHandling(app);

  // If you need websockets:
  // let socketio = require('socket.io')(runningApp.http);
  // require('fauxchatapp')(socketio);

  if (typeof callback === "function") {
    callback(app);
    return;
  }
};
