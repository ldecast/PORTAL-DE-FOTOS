const jwt = require("jsonwebtoken");

const webServerConfig = require('../config/webserver.config');



module.exports.verificar = function (token) {
    if (!token) {
      return false
    }
    try {
      wt.verify(token, webServerConfig.secret,(err,usr) => {
          return true
      });
    } catch (err) {
      return false
    }
}