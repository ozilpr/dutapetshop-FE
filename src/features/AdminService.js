import axios from 'axios'

const ADM_URL = 'http://localhost:5000/admin'

const AdminService = {
  addAdmin: async (accessToken, { username, password, confPassword, fullname }) => {
    try {
      const response = await axios.post(
        `${ADM_URL}`,
        {
          username: username,
          password: password,
          confPassword: confPassword,
          fullname: fullname
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
      if (error.response) throw new Error(error.response.data.message, error.response.status)
    }
  },
  getAdminById: async (accessToken, id) => {
    try {
      const response = await axios.get(`${ADM_URL}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) throw new Error(error.response.data.message, error.response.status)
    }
  },
  getAdminByName: async (accessToken, name) => {
    try {
      const response = await axios.get(`${ADM_URL}?name=${name}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message, error.response.status)
      }
    }
  },
  updateAdminById: async (accessToken, id, { username, password, confPassword, fullname }) => {
    try {
      const response = await axios.put(
        `${ADM_URL}/${id}`,
        {
          username: username,
          password: password,
          confPassword: confPassword,
          fullname: fullname
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (response.status === 200) return response.data
    } catch (error) {
      if (error.response) throw new Error(error.response.data.message, error.response.status)
    }
  },
  deleteAdminById: async (accessToken, id) => {
    try {
      const response = await axios.delete(`${ADM_URL}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (response.status === 200) return response.data.message
    } catch (error) {
      if (error.response) throw new Error(error.response.data.message, error.response.status)
    }
  }
}

export default AdminService
