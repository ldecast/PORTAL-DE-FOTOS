const jwt = require("jsonwebtoken");

const webServerConfig = require('../config/webserver.config');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (token) {
    try {
      const decode = jwt.verify(token, webServerConfig.secret);
      req.token=decode
      next()
    } catch (err) {
      res.status(401).json({data:'Token de acceso invalido',status: 401})
    }
  } else {
    // Forbidden
    res.status(403).json({data:'Necesita token de acceso',status: 403})
  }
}
module.exports.verify=verifyToken