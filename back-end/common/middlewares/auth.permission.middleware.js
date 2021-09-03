// const jwt = require('jsonwebtoken'),
//   secret = require('../config/env.config')['jwt_secret'];
// const RoleModel = require('../../administrators/models/roles.model');

// const ADMIN_PERMISSION = 4096;

// exports.minimumPermissionLevelRequired = async (req, res, next) => {
//   // const userRole = await RoleModel.findById(req.jwt.role);
//   // const websites = userRole.website || [];
  
//   // const pages = userRole.page || [];
//   // const pathname = req._parsedUrl.pathname;
//   // const nameArr = pathname.substring(1).split("/");

//   // if (req.body.website && nameArr[0] !== "roles" && !websites.includes(req.body.website)) {
//   //   return res.status(403).send("Permission denided");
//   // }
//   // if (!pages.includes(nameArr[0])) {
//   //   return res.status(403).send("Permission denided");
//   // }
//   return next();
// };

// exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
//   console.log(req.jwt);
//   let userId = req.jwt.userId;
//   if (req.params && req.params.userId && userId === req.params.userId) {
//     return next();
//   } else {
//     if (user_permission_level >= ADMIN_PERMISSION) {
//       return next();
//     } else {
//       return res.status(403).send();
//     }
//   }

// };

// exports.sameUserCantDoThisAction = (req, res, next) => {
//   let userId = req.jwt.userId;

//   if (req.params.userId !== userId) {
//     return next();
//   } else {
//     return res.status(400).send();
//   }

// };
