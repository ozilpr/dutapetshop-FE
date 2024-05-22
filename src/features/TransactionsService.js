import axios from 'axios'
import CustomError from '../exceptions/CustomError'

const TRANSCT_URL = 'http://localhost:5000/transaction'
const TRANSCT_DET_URL = 'http://localhost:5000/transaction/detail'

const TransactionsService = {
  addTransaction: async (accessToken, ownerId, transactionsData) => {
    try {
      const response = await axios.post(
        `${TRANSCT_URL}`,
        {
          ownerId: ownerId,
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
  getTransactionDetails: async (accessToken) => {
    try {
      const response = await axios.get(`${TRANSCT_DET_URL}`, {
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
  getTransactionDetailById: async (accessToken, id) => {
    try {
      const response = await axios.get(`${TRANSCT_DET_URL}/${id}`, {
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
  getTransactionDetailByOwnerId: async (accessToken, ownerId) => {
    try {
      const response = await axios.get(`${TRANSCT_DET_URL}/owner/${ownerId}`, {
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
  updateTransactionDetailById: async (accessToken, id, ownerId) => {
    try {
      const response = await axios.put(
        `${TRANSCT_DET_URL}/${id}`,
        {
          ownerId: ownerId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 200) return response.data.message
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  deleteTransactionDetailById: async (accessToken, id) => {
    try {
      const response = await axios.delete(`${TRANSCT_DET_URL}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data.message
    } catch (error) {
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  getTransactions: async (accessToken) => {
    try {
      const response = await axios.get(`${TRANSCT_URL}`, {
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
  updateTransactionById: async (accessToken, id, { resourceId, quantity }) => {
    try {
      const response = await axios.put(
        `${TRANSCT_URL}/${id}`,
        {
          resourceId: resourceId,
          quantity: quantity
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 200) return response.data.message
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
