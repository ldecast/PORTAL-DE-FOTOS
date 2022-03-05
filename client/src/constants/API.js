const isProduction = import.meta.PROD
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`)
export const API_URL = isProduction ? '/' : 'http://localhost:5000'
