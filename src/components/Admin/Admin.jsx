import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminService from '../../features/AdminService'
import { useAuth } from '../Authentications/Authentication'
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal'

const Admin = () => {
  const user = useAuth()

  const [admin, setAdmin] = useState([])

  // error message
  const [msg, setMsg] = useState('')

  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await AdminService.getAdminByName(user.accessToken, '')
      setAdmin(response.data.admin)
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setMsg(`${error.message}`)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deleteAdmin = async (id) => {
    try {
      const response = await AdminService.deleteAdminById(user.accessToken, id)
      setMsg(response)
      fetchData()
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setMsg(`${error.message}`)
    }
  }

  const confirmDelete = () => {
    if (selectedAdmin) {
      deleteAdmin(selectedAdmin.id)
      setModalOpen(false)
      setSelectedAdmin(null)
    }
  }

  const renderTable = () => {
    return admin.map((admin) => {
      return (
        <tr key={admin.id} className="text-center hover:bg-black hover:text-white">
          <td className="px-2 py-1 border border-gray-500 text-center align-middle">
            {admin.username}
          </td>
          <td className="px-2 py-1 border border-gray-500 align-middle">{admin.fullname}</td>
          <td className="text-sm font-medium text-center border-b border-gray-500 nowrap whitespace-nowrap">
            <div className="text-center px-2 py-1 justify-evenly flex">
              <Link to={`/edit-admin?adminId=${admin.id}`}>
                <button
                  title="Edit"
                  type="button"
                  className="sm:text-sm bg-sky-500 hover:bg-sky-400 text-white font-semibold py-1 px-2 rounded-md items-center">
                  Edit
                </button>
              </Link>
              <button
                title="Remove"
                type="button"
                onClick={() => {
                  setSelectedAdmin(admin)
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
      <h1 className="sm:text-3xl font-bold decoration-gray-400">Data Admin</h1>
      <div className=" mt-5 mb-4">
        <Link
          to={'/add-admin'}
          className="px-6 py-2 text-sm font-semibold rounded-md shadow-md text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300">
          Tambah baru
        </Link>

        <div className="flex flex-col my-3">
          <div className="overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
              <p className="text-center text-md text-red-500">{msg}</p>
              <table id="admin" className="min-w-full">
                <thead>
                  <tr className="text-center">
                    <th className="px-2 py-3 text-xs font-medium leading-4  md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Username
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4  md:w-auto text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                      Fullname
                    </th>
                    <th className='px-2 py-3 text-sm text-center text-white md:w-auto border-b border-gray-200 bg-black colspan="3"'>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>{renderTable()}</tbody>
              </table>
            </div>
          </div>
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={confirmDelete}
            name={selectedAdmin ? selectedAdmin.fullname : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default Admin
