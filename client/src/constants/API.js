const isProduction = import.meta.env.PROD
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`)
export const API_URL = isProduction
  ? 'http://ec2-3-93-58-70.compute-1.amazonaws.com'
  : 'http://localhost:5000'
