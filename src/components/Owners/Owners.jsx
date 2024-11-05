import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OwnersService from '../../features/OwnersService'
import { useAuth } from '../Authentications/Authentication'
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal'

const Owners = () => {
  const user = useAuth()
  const [data, setData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const nav = useNavigate()

  // error message
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)

  // Function to set message and clear after delay
  const setMessageWithDelay = (message, delay) => {
    setMsg(message)

    setTimeout(() => {
      setMsg('')
    }, delay)
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await OwnersService.getOwners(user.accessToken)
      setData(response.data.owners)
    } catch (error) {
      if (error.statusCode === 401) user.logout()
      setErrorMsg(`${error.message}`)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deleteOwner = async (id) => {
    try {
      const response = await OwnersService.deleteOwnerById(user.accessToken, id)
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

  const filterData = data.filter((user) => {
    return (
      user.register_code.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchInput.toLowerCase())
    )
  })

  // Function to format phone numbers
  const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber.length > 12) {
      return (
        phoneNumber.slice(0, 4) +
        '-' +
        phoneNumber.slice(4, 8) +
        '-' +
        phoneNumber.slice(8, 12) +
        '-' +
        phoneNumber.slice(12)
      )
    } else if (phoneNumber.length <= 12) {
      return phoneNumber.slice(0, 4) + '-' + phoneNumber.slice(4, 8) + '-' + phoneNumber.slice(8)
    }
  }

  const ownerClickHandler = (e, ownerId) => {
    e.preventDefault()

    nav(`/owner-profile?ownerId=${ownerId}`)
  }

  const confirmDelete = () => {
    if (selectedOwner) {
      deleteOwner(selectedOwner.id)
      setModalOpen(false)
      setSelectedOwner(null)
    }
  }

  const renderTable = () => {
    return filterData.map((owner, index) => {
      return (
        <tr key={owner.id} className="hover:bg-black hover:text-white">
          <td className="px-1 py-1 mx-auto border border-gray-500 align-top">
            <div style={{ textAlign: 'center' }}>{index + 1}</div>
          </td>
          <td
            onClick={(e) => ownerClickHandler(e, owner.id)}
            className="px-2 py-1 border border-gray-500 align-top">
            <p className="text-center">{owner.register_code}</p>
          </td>
          <td
            onClick={(e) => ownerClickHandler(e, owner.id)}
            className=" border border-gray-500 align-top">
            <p className="px-3 py-1 text-justify">{owner.name}</p>
          </td>
          <td
            onClick={(e) => ownerClickHandler(e, owner.id)}
            className="px-3 py-1 border border-gray-500 align-top">
            <p className="text-center">{formatPhoneNumber(owner.phone)}</p>
          </td>

          <td className="text-sm font-medium text-center border border-gray-500 align-middle">
            <div className="text-center py-1 flex items-center justify-evenly sm:flex-row">
              <Link to={`/edit-owner?ownerId=${owner.id}`}>
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
                  setSelectedOwner(owner)
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
      <h1 className="sm:text-3xl font-bold decoration-gray-400">Daftar Owner</h1>
      <div className=" mt-5 mb-4">
        <div className="is-justify-content-space-between flex">
          <Link to={'/add-owner'}>
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
              <table id="owner" className="min-w-full">
                <thead>
                  <tr className="text-center">
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      No
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Kode Registrasi
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Nama
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      No. Telp
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
            name={selectedOwner ? selectedOwner.name : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default Owners
