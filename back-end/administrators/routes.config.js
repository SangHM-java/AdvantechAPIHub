const DatahubController = require("./controllers/datahub.controller");
// const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
// const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require("../common/config/env.config");

// const ADMIN = config.permissionLevels.ADMIN;
// const PAID = config.permissionLevels.PAID_USER;
// const FREE = config.permissionLevels.NORMAL_USER;

exports.setup = function (app) {
  /**
   * @swagger
   * definitions:
   *   getInstantRequest:
   *     type: object
   *     required:
   *       - baseUrl
   *       - sNoList
   *       - sTime
   *     properties:
   *       baseUrl:
   *         type: string
   *         example: http://14.225.244.63:8083/VendingInterface.asmx/SUNGRP_getInstant
   *       sNoList:
   *         type: string
   *         example: 20698013
   *       sTime:
   *         type: string
   *         example: 2022-06-28 00:00:00
   */
  /**
   * @swagger
   *
   * /getInstant:
   *   post:
   *     produces:
   *       - application/json   
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         required: true
   *         schema:
   *            type: object
   *            $ref: '#/definitions/getInstantRequest'
   *     responses:
   *       200:
   *         description: successful
   *       400:
   *         description: invalid
   */
  app.post("/getInstant", [DatahubController.getInstant]);
  /**
   * @swagger
   * definitions:
   *   getDailyDataRequest:
   *     type: object
   *     required:
   *       - baseUrl
   *       - sNoList
   *       - sDate
   *     properties:
   *       baseUrl:
   *         type: string
   *         example: http://14.225.244.63:8083/VendingInterface.asmx/SUNGRP_getDailyData
   *       sNoList:
   *         type: string
   *         example: 20698013
   *       sDate:
   *         type: string
   *         example: 2022-06-28 00:00:00
   */
  /**
   * @swagger
   *
   * /getDailyData:
   *   post:
   *     produces:
   *       - application/json
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         required: true
   *         schema:
   *            type: object
   *            $ref: '#/definitions/getDailyDataRequest'
   *     responses:
   *       200:
   *         description: successful
   *       400:
   *         description: invalid
   */
  app.post("/getDailyData", [DatahubController.getDailyData]);
  app.get("/sendDataAPIToDatahub", [DatahubController.sendDataAPIToDatahub]);

  app.get("/disconnectDatahub", [DatahubController.disconnectDatahub]);

  //datahub apis
  app.get("/getConfigDatahub", [
    // ValidationMiddleware.validJWTNeeded,
    DatahubController.getConfigDatahub,
  ]);

  app.post("/connectDatahub", [
    // ValidationMiddleware.validJWTNeeded,
    // PermissionMiddleware.minimumPermissionLevelRequired,
    DatahubController.connectDatahub,
  ]);
};
