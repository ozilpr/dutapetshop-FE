import axios from 'axios'
import CustomError from '../exceptions/CustomError'

const PET_URL = 'http://localhost:5000/pet'

const PetsService = {
  addPet: async (accessToken, { name, type, race, gender, birthdate }) => {
    try {
      const response = await axios.post(
        `${PET_URL}`,
        {
          name: name,
          type: type,
          race: race,
          gender: gender,
          birthdate: birthdate
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
  getPets: async (accessToken) => {
    try {
      const response = await axios.get(`${PET_URL}`, {
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
  getPetsWithoutOwner: async (accessToken) => {
    try {
      const response = await axios.get(`${PET_URL}/without-owner`, {
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
  getPetById: async (accessToken, id) => {
    try {
      const response = await axios.get(`${PET_URL}/${id}`, {
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
  updatePetById: async (accessToken, id, { name, race, type, gender, birthdate }) => {
    try {
      const response = await axios.put(
        `${PET_URL}/${id}`,
        {
          name: name,
          type: type,
          race: race,
          gender: gender,
          birthdate: birthdate
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
      if (error.response) throw new CustomError(error.response.data.message, error.response.status)
    }
  },
  deletePetById: async (accessToken, id) => {
    try {
      const response = await axios.delete(`${PET_URL}/${id}`, {
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

export default PetsService
