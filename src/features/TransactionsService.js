import axios from 'axios'
import CustomError from '../exceptions/CustomError'

const TRANSCT_URL = 'http://localhost:5000/transaction'

const TransactionsService = {
  addTransaction: async (accessToken, ownerId, totalPrice, discount, transactionsData) => {
    try {
      const response = await axios.post(
        `${TRANSCT_URL}`,
        {
          ownerId: ownerId,
          totalPrice: totalPrice,
          discount: discount,
          transactionsData: transactionsData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 201) return response.data
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  getTransactions: async (accessToken, startDate, endDate) => {
    const params = new URLSearchParams()

    if (startDate) {
      params.append('startDate', startDate)
    }
    if (endDate) {
      params.append('endDate', endDate)
    }

    const query = params.toString()
    const url = `${TRANSCT_URL}?${query}`

    console.log(query)
    try {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  getTransactionById: async (accessToken, id) => {
    try {
      const response = await axios.get(`${TRANSCT_URL}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  getTransactionByOwnerId: async (accessToken, ownerId) => {
    try {
      const response = await axios.get(`${TRANSCT_URL}/owner/${ownerId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  deleteTransactionById: async (accessToken, id) => {
    try {
      const response = await axios.delete(`${TRANSCT_URL}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data.message
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  }
}

export default TransactionsService
