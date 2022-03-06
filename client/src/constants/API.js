const isProduction = import.meta.env.PROD
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`)
export const API_URL = isProduction
  ? 'http://seminario-g10-1084886731.us-east-1.elb.amazonaws.com'
  : 'http://localhost:5000'
