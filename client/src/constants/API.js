// const isProduction = import.meta.env.PROD
const isProduction = true
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`)
export const API_URL = isProduction ? 'http://54.89.223.177/' : 'http://localhost:5000'
