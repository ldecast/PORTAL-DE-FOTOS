const webServerConfig = require('../config/webserver.config');
const AWS = require('aws-sdk');

function Login(user,pass) {
    return new Promise((resolve,reject) => {
        try {
            ClienteDynamo = new AWS.DynamoDB.DocumentClient();
            ClienteDynamo.scan({TableName: 'Users'}, function(err,data){
                if (err) {
                    console.log(err);
                    resolve(false)
                    return
                } else {
                    console.log(data)
                    resolve(true)
                }
             })
        } catch (error) {
            console.log('Error on login ')
            console.log(error)
            resolve(false)
        }
    })
}

module.exports.Singing = function (user,pass,fullName,image) {
    
}

module.exports.Singing = function () {
    let foto = {"id": number,"photo": string,"album": Album,"name": string,"date": Date}
}

module.exports.Login = Login
