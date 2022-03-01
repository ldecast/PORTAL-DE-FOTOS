import { API_URL } from "@/constants/API"

export default async (method, url, data) => {
  console.log(`fetching data from ${API_URL}${url} with method ${method} and data ${JSON.stringify(data)}`)
  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token'),
    }

    const body = !data ? null : {
      data: JSON.stringify(data)
    }

    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body
    })

    const jsonResponse = await response.json()

    if (jsonResponse.status !== 200) {
      throw new Error(jsonResponse.data)
    }

    console.log(jsonResponse)
    return jsonResponse.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
