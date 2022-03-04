const http = require('http')
const express = require('express')
var bodyParser = require('body-parser')
const { resolve } = require('path');
const { reject } = require('assert');
const webServerConfig = require('../config/webserver.config');
const router = require('./router')
const cors = require('cors');
const AWS = require('aws-sdk');

let httpServer;
var ClienteDynamo=new AWS.DynamoDB.DocumentClient();

function init() {
    return new Promise((resolve, reject) => {
        const app = express()
        httpServer = http.createServer(app)
        app.use(cors())
        app.use(bodyParser.json({limit: '200mb'}))
        app.use(router)
        httpServer.listen(webServerConfig.port)        
        .on('listening', () => {
            console.log('Servidor iniciado en el puerto %o',webServerConfig.port)
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


function Connect() {
    return new Promise((resolve,reject) => {
        var credentials =  {
            accessKeyId: webServerConfig.accessKeyId, 
            secretAccessKey: webServerConfig.secretAccessKey,
            region: webServerConfig.region,
          }
        try {
            AWS.config.update(credentials)
            ClienteDynamo = new AWS.DynamoDB.DocumentClient();
            let params = {
                TableName: 'Users'
            }

            ClienteDynamo.scan(params, function(err,data){
                if (err) {
                    console.log('No se pudo conectar a la DB')
                    console.log(err);
                } else {
                    //console.log(data)
                    console.log('Conexion exitosa con DB')
                }
            })
        } catch (error) {
            console.log('No se pudo conectar a la DB')
            console.log(error)
        }
    })
}

module.exports.init = init;
module.exports.close = close;
module.exports.Connect=Connect
module.exports.Cliente = ClienteDynamo