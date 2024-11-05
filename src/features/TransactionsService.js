import axios from 'axios'
import CustomError from '../exceptions/CustomError'

const TRANSCT_URL = 'http://localhost:5000/transaction'

const prepareParams = ({ startDate, endDate, ownerId }) => {
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new CustomError('Tanggal mulai dan tanggal akhir harus diisi atau keduanya harus kosong')
  }

  const params = new URLSearchParams()

  if (startDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    params.append('startDate', start.toISOString())
  }

  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    params.append('endDate', end.toISOString())
  }

  if (ownerId) {
    params.append('ownerId', ownerId)
  }

  return params.toString()
}

const TransactionsService = {
  addTransaction: async (accessToken, ownerId, finalPrice, finalDiscount, transactionsData) => {
    try {
      const response = await axios.post(
        `${TRANSCT_URL}`,
        {
          ownerId: ownerId,
          totalPrice: finalPrice,
          discount: finalDiscount,
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
  getTransactions: async (accessToken, { startDate, endDate }) => {
    const query = prepareParams({ startDate, endDate })
    const url = `${TRANSCT_URL}?${query}`

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

  getTransactionByOwnerId: async (accessToken, ownerId, { startDate, endDate }) => {
    try {
      const query = prepareParams({ startDate, endDate, ownerId })
      const url = `${TRANSCT_URL}/owner/${ownerId}?${query}`

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

  generateTransactionsPdf: async (accessToken, startDate, endDate, ownerId) => {
    const query = prepareParams({ startDate, endDate, ownerId })
    const url = `${TRANSCT_URL}/export?${query}`

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/pdf',
          Authorization: `Bearer ${accessToken}`
        },
        responseType: 'blob'
      })

      return response.data
    } catch (error) {
      const errorText = await error.response.data.text()
      const errorJson = JSON.parse(errorText)

      if (error.response) throw new CustomError(errorJson.message, errorJson.status)
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
