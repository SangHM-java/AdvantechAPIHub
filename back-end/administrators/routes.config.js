
const DatahubController = require('./controllers/datahub.controller');
// const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
// const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');



// const ADMIN = config.permissionLevels.ADMIN;
// const PAID = config.permissionLevels.PAID_USER;
// const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
  //Users apis
  app.get('/', [
    // ValidationMiddleware.validJWTNeeded,
    DatahubController.home
  ]);

  app.get('/getMeterParameters', [
    DatahubController.getMeterParameters
  ])
  app.get('/sendDataAPIToDatahub', [
    DatahubController.sendDataAPIToDatahub
  ]);

  app.get('/disconnectDatahub', [
    DatahubController.disconnectDatahub
  ]);

  app.get('/getDataFromAPI', [
    DatahubController.getDataFromAPI
  ]);

  //datahub apis
  app.get('/getConfigDatahub', [
    // ValidationMiddleware.validJWTNeeded,
    DatahubController.getConfigDatahub
  ]);
  //datahub apis
  app.get('/getTokenFromAPI', [
    // ValidationMiddleware.validJWTNeeded,
    DatahubController.getTokenFromAPI
  ]);
  app.post('/connectDatahub', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.connectDatahub
  ]);
  app.put('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.update
  ]);
  app.get('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.getById
  ]);
  app.delete('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.removeById
  ]);

  
};
