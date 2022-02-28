const http = require('http')
const express = require('express')
var bodyParser = require('body-parser')
const { resolve } = require('path');
const { reject } = require('assert');
const webServerConfig = require('../config/webserver.config');
const router = require('./router')
const cors = require('cors');

let httpServer;

function init() {
    return new Promise((resolve, reject) => {
        const app = express()
        httpServer = http.createServer(app)
        app.use(bodyParser.json())
        app.use(router)
        app.use(cors)
        httpServer.listen(webServerConfig.port)        
        .on('listening', () => {
            console.log(' Servidor iniciado en el puerto %o',webServerConfig.port)
            resolve()
        })
        .on('error', error => {
            reject(error)
        })
    })
}

function close() {
    return new Promise((resolve, reject) => {
        httpServer.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    })
}

module.exports.init = init;
module.exports.close = close;