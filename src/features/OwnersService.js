import axios from 'axios'
import CustomError from '../exceptions/CustomError'

const OWN_URL = 'http://localhost:5000/owner'

const OwnersService = {
  addOwner: async (accessToken, { registerCode, name, phone }) => {
    try {
      const response = await axios.post(
        `${OWN_URL}`,
        {
          registerCode: registerCode,
          name: name,
          phone: phone
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
  getOwners: async (accessToken) => {
    try {
      const response = await axios.get(`${OWN_URL}`, {
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
  getOwnerById: async (accessToken, id) => {
    try {
      const response = await axios.get(`${OWN_URL}/${id}`, {
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
  updateOwnerById: async (accessToken, id, { registerCode, name, phone }) => {
    try {
      const response = await axios.put(
        `${OWN_URL}/${id}`,
        {
          registerCode: registerCode,
          name: name,
          phone: phone
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
  deleteOwnerById: async (accessToken, id) => {
    try {
      const response = await axios.delete(`${OWN_URL}/${id}`, {
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

export default OwnersService
