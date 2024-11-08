import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PetsService from '../../features/PetsService'
import { useAuth } from '../Authentications/Authentication'
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal'

const Pets = () => {
  const user = useAuth()
  const [data, setData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const nav = useNavigate()

  // error message
  const [errorMsg, setErrorMsg] = useState('')
  const [msg, setMsg] = useState('')

  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)

  // Function to set message and clear after delay
  const setMessageWithDelay = (message, delay) => {
    setMsg(message) // Set message to 'succeed'

    setTimeout(() => {
      setMsg('') // Clear message after delay
    }, delay)
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await PetsService.getPets(user.accessToken)
      setData(response.data.pets)
      setErrorMsg('')
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setErrorMsg(`${error.message}`)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deletePet = async (id) => {
    try {
      const response = await PetsService.deletePetById(user.accessToken, id)
      setMessageWithDelay(response, 3000)
      setErrorMsg('')
      fetchData()
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setErrorMsg(`${error.message}`)
    }
  }

  const searchHandler = (e) => {
    setSearchInput(e.target.value)
  }

  const formatBirthdate = (bod) => {
    const birthdateTimestamp = parseInt(bod)
    const currentDate = new Date()

    const ageInMilliseconds = currentDate - birthdateTimestamp
    const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24))

    let age = ''

    let years = Math.floor(ageInDays / 365)
    let months = Math.floor((ageInDays % 365) / 30)
    const weeks = Math.floor(((ageInDays % 365) % 30) / 7)
    // const days = ((ageInDays % 365) % 30) % 7

    if (months > 0 || years > 0) {
      if (months === 12) {
        months -= 12
        years += 1
      }
      if (years > 0) age += `${years} tahun `

      if (months > 0) age += `${months} bulan `
    }

    if (weeks > 0) {
      age += `${weeks} minggu `
    }

    // if (days > 0) {
    //   age += `${days} hari`
    // }

    // Trim any trailing space
    age = age.trim()

    return age
  }

  const filterData = data.filter((pet) => {
    return (
      pet.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchInput.toLowerCase()) ||
      pet.race.toLowerCase().includes(searchInput.toLowerCase()) ||
      pet.gender.toLowerCase() === searchInput.toLowerCase() ||
      formatBirthdate(pet.birthdate).toLowerCase().includes(searchInput.toLowerCase()) ||
      pet.register_code.toLowerCase().includes(searchInput.toLowerCase()) ||
      pet.owner_name.toLowerCase().includes(searchInput.toLowerCase())
    )
  })

  const navigateOwnerHandler = (e, ownerId) => {
    e.preventDefault()
    if (ownerId) {
      nav(`/owner-profile?ownerId=${ownerId}`)
    }
  }
  const navigatePetHandler = (e, petId) => {
    e.preventDefault()
    if (petId) {
      nav(`/pet?petId=${petId}`)
    }
  }

  const renderOwner = (regCode, ownerName) => {
    if (regCode && ownerName)
      return (
        <p className="text-center px-2 py-1 bg-black text-white hover:bg-white hover:text-black border rounded rounder-sm ring-black">
          {regCode + ' - ' + ownerName}
        </p>
      )
  }

  const confirmDelete = () => {
    if (selectedPet) {
      deletePet(selectedPet.id)
      setModalOpen(false)
      setSelectedPet(null)
    }
  }

  const renderTable = () => {
    return filterData.map((pet, index) => {
      return (
        <tr key={pet.id} className="hover:bg-black hover:text-white">
          <td className="px-1 py-1 my-auto border border-gray-500 align-middle">
            <p className="text-center">{index + 1}</p>
          </td>
          <td
            onClick={(e) => navigatePetHandler(e, pet.id)}
            className="px-3 py-1  border border-gray-500 align-middle">
            <p className="text-justify my-auto">{pet.name}</p>
          </td>
          <td
            onClick={(e) => navigatePetHandler(e, pet.id)}
            className="px-2 py-1 border border-gray-500 align-middle">
            <p className="text-center">{pet.type}</p>
          </td>
          <td
            onClick={(e) => navigatePetHandler(e, pet.id)}
            className="px-2 py-1 border border-gray-500 align-middle">
            <p className="text-center">{pet.race}</p>
          </td>
          <td
            onClick={(e) => navigatePetHandler(e, pet.id)}
            className="px-2 py-1 border border-gray-500 align-middle">
            <p className="text-center">{pet.gender}</p>
          </td>
          <td
            onClick={(e) => navigatePetHandler(e, pet.id)}
            className="px-2 py-1 border border-gray-500 align-middle">
            <p className="text-center">{formatBirthdate(pet.birthdate)}</p>
          </td>
          <td
            onClick={(e) => navigateOwnerHandler(e, pet.owner_id)}
            className="px-2 py-1 border border-gray-500 align-middle cursor-pointer">
            {renderOwner(pet.register_code, pet.owner_name)}
          </td>

          <td className="text-sm font-medium text-center border border-gray-500 align-middle">
            <div className="text-center py-1 flex items-center justify-evenly">
              <Link to={`/edit-pet?petId=${pet.id}`}>
                <button
                  title="Edit"
                  type="button"
                  className="sm:text-sm bg-sky-500 hover:bg-sky-400 text-white font-semibold py-1 px-2 rounded-md  items-center">
                  Edit
                </button>
              </Link>

              <button
                title="Remove"
                type="button"
                onClick={() => {
                  setSelectedPet(pet)
                  setModalOpen(true)
                }}
                className="sm:text-sm bg-red-500 hover:bg-red-400 text-white font-semibold py-1 px-2 rounded-md items-center">
                Delete
              </button>
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="p-5 mb-5">
      <h1 className="sm:text-3xl font-bold decoration-gray-400">Daftar Peliharaan</h1>
      <div className=" mt-5 mb-4">
        <div className="is-justify-content-space-between flex">
          <Link to={'/add-pet'}>
            <button className="inline px-6 py-2 w-fit text-sm font-semibold rounded-md text-white bg-green-500 hover:bg-green-400">
              Tambah baru
            </button>
          </Link>
          <input
            className="inline px-2 py-2 bg-gray-200 border rounded-md shadow-sm placeholder:text-gray-400 placeholder:text-left border-blue-500 ring ring-blue-400 focus:ring-opacity-50 transition duration-300 ease-in-out"
            value={searchInput}
            onChange={searchHandler}
            placeholder="Search"
          />
        </div>
        <div className="flex flex-col my-3">
          <div className="overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
              <p className="text-center text-md text-red-500">{errorMsg}</p>
              <p className="text-center text-md text-green-500">{msg}</p>
              <table id="pet" className="min-w-full">
                <thead>
                  <tr className="text-center">
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      No
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Nama
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Jenis
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Ras
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Jenis Kelamin
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Umur
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      owner
                    </th>
                    <th className='px-2 py-3 text-sm text-white md:w-auto border-b border-gray-200 bg-black colspan="3"'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">{renderTable()}</tbody>
              </table>
            </div>
          </div>
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={confirmDelete}
            name={selectedPet ? selectedPet.name : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default Pets
