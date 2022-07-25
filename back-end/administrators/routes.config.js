const DatahubController = require("./controllers/datahub.controller");
// const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
// const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require("../common/config/env.config");

// const ADMIN = config.permissionLevels.ADMIN;
// const PAID = config.permissionLevels.PAID_USER;
// const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {

  app.get("/getMeterParameters", [DatahubController.getMeterParameters]);
  app.get("/getDailyData", [DatahubController.getDailyData]);
  app.get("/sendDataAPIToDatahub", [DatahubController.sendDataAPIToDatahub]);

  app.get("/disconnectDatahub", [DatahubController.disconnectDatahub]);

  //datahub apis
  app.get("/getConfigDatahub", [
    // ValidationMiddleware.validJWTNeeded,
    DatahubController.getConfigDatahub,
  ]);

  app.post('/connectDatahub', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.connectDatahub,
  ]);
};
