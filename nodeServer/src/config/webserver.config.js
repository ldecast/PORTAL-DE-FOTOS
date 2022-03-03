require('dotenv').config();
module.exports = {
    port: process.env.HTTP_PORT || 4000,
    secret:process.env.SECRET|| 'seminario10' ,
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    region: process.env.REGION_NAME || '',
}