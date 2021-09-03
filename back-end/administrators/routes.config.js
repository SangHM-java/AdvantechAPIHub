
const CategoryController = require('./controllers/datahub.controller');
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
    CategoryController.home
  ]);

  app.get('/connect', [
    // ValidationMiddleware.validJWTNeeded,   
    CategoryController.connectDatahub
  ]);

  //datahub apis
  app.get('/datahub', [
    // ValidationMiddleware.validJWTNeeded,
    CategoryController.list
  ]);
  app.post('/datahub', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    CategoryController.insert
  ]);
  app.put('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    CategoryController.update
  ]);
  app.get('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    CategoryController.getById
  ]);
  app.delete('/datahub/:id', [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    CategoryController.removeById
  ]);

  
};
