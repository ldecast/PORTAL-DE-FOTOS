import { API_URL } from '@/constants/API'

export default async (method, url, data = null) => {
  try {
    const headers = {
      'content-type': 'application/json',
      'x-access-token': localStorage.getItem('faunaToken')
    }

    const body = data
      ? JSON.stringify({
          data
        })
      : null

    console.info(
      `fetching ${method} ${API_URL}${url}
      headers ${JSON.stringify(headers)}
      body ${body}`
    )
    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body
    })

    const jsonResponse = await response.json()

    console.info('fetched:', jsonResponse)
    return jsonResponse.data
  } catch (error) {
    console.error('error:', error)
    throw error
  }
}
