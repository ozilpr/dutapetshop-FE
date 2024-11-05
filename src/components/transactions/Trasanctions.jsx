import React, { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TransactionService from '../../features/TransactionsService'
import { useAuth } from '../Authentications/Authentication'
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal'

const Trasanctions = () => {
  const user = useAuth()
  const [searchParams] = useSearchParams()
  const ownerId = searchParams.get('ownerId')

  const [data, setData] = useState([])

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const [visibleItems, setVisibleItems] = useState(false)
  const [visibleAllItems, setVisibleAllItems] = useState(false)

  // Function to set message and clear after delay
  const setMessageWithDelay = (message, delay) => {
    setMsg(message) // Set message to 'succeed'

    setTimeout(() => {
      setMsg('') // Clear message after delay
    }, delay)
  }

  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }

  const fetchData = useCallback(
    async (start = '', end = '') => {
      if ((start && !end) || (!start && end)) {
        setErrorMsg('Tanggal mulai dan tanggal akhir harus diisi atau keduanya harus kosong')
      }
      try {
        const url = new URL(window.location)

        if (ownerId && !start && !end) {
          url.searchParams.set('ownerId', ownerId)
        } else {
          url.searchParams.delete('ownerId')
        }

        window.history.replaceState({}, '', url)

        const dateRange = { startDate: start, endDate: end }

        const response = ownerId
          ? await TransactionService.getTransactionByOwnerId(user.accessToken, ownerId, dateRange)
          : await TransactionService.getTransactions(user.accessToken, dateRange)

        setData(response.data)
        setErrorMsg('')
      } catch (error) {
        if (error.statusCode === 401) user.refreshAccessToken()
        setErrorMsg(`${error.message}`)
      }
    },
    [user, ownerId]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deleteTransaction = async (id) => {
    try {
      const response = await TransactionService.deleteTransactionById(user.accessToken, id)
      setMessageWithDelay(response, 3000)
      setErrorMsg('')
      fetchData()
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setErrorMsg(`${error.message}`)
    }
  }

  const toggleShowItems = (e, transactionId) => {
    e.preventDefault()
    setVisibleItems((prevVisibleItems) => ({
      ...prevVisibleItems,
      [transactionId]: !prevVisibleItems[transactionId]
    }))
  }

  const toggleShowAllItems = (e) => {
    e.preventDefault()
    setVisibleAllItems((prevVisibleAllItems) => !prevVisibleAllItems)
    if (visibleItems) setVisibleItems(false)
    if (!visibleItems) setVisibleItems(true)
  }

  const formatDate = (date) => {
    const newDate = new Date(date)
    const formattedDate = newDate.toLocaleDateString('id-ID', dateOptions).replace(/\./g, ':')
    return formattedDate
  }

  useEffect(() => {
    // Check if both start date and end date are set
    if (startDate && endDate) {
      // Convert strings to Date objects
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)

      startDateObj.setHours(0, 0, 0, 0)
      endDateObj.setHours(0, 0, 0, 0)

      if (startDateObj.getTime() === endDateObj.getTime()) {
        const newEndDateObj = new Date(endDateObj)
        newEndDateObj.setDate(endDateObj.getDate())
        newEndDateObj.setHours(23, 59, 59, 999)

        setStartDate(startDateObj.toISOString().split('T')[0])
        setEndDate(newEndDateObj.toISOString().split('T')[0])
      }

      if (endDateObj.getTime() < startDateObj.getTime()) {
        const newStartDateObj = new Date(startDateObj)
        newStartDateObj.setDate(startDateObj.getDate() + 1)
        endDateObj.setDate(startDateObj.getDate() + 1)

        endDateObj.setHours(23, 59, 59, 999)
        setEndDate(endDateObj.toISOString().split('T')[0])
        setStartDate(newStartDateObj.toISOString().split('T')[0])
      }
    }
  }, [startDate, endDate])

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value)
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value)
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = ownerId
        ? await TransactionService.generateTransactionsPdf(
            user.accessToken,
            startDate,
            endDate,
            ownerId
          )
        : await TransactionService.generateTransactionsPdf(user.accessToken, startDate, endDate)

      const pdfBlob = new Blob([response], { type: 'application/pdf' })

      const url = URL.createObjectURL(pdfBlob)

      const newWindow = window.open(url)

      if (newWindow) {
        newWindow.addEventListener('unload', () => {
          URL.revokeObjectURL(url)
          console.info('url revoked')
        })
      }
    } catch (error) {
      if (error.statusCode === 401) {
        setErrorMsg(error.message)
        user.refreshAccessToken()
      } else {
        setErrorMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id)
      setModalOpen(false)
      setSelectedTransaction(null)
    }
  }

  const listTransaction = () => {
    const filteredData = data.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date)

      // Set the comparison dates
      const startDateObj = startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : null
      const endDateObj = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : null

      return (
        (!startDateObj || transactionDate >= startDateObj) &&
        (!endDateObj || transactionDate <= endDateObj)
      )
    })

    return filteredData.map((transaction, index) => {
      return (
        <React.Fragment key={index + 1}>
          <tr className="hover:bg-black hover:text-white cursor-pointer">
            <td className="p-1 text-sm font-medium text-center border-y-2 border-gray-500 align-middle">
              <p className="text-center">{index + 1 + '.'}</p>
            </td>
            <td className="p-1 text-sm font-medium text-center border-y-2 border-gray-500 align-middle">
              <p className="text-center">{transaction.register_code}</p>
            </td>
            <td className="p-1 text-sm font-medium text-center text-white border-y-2 border-gray-500 align-middle">
              <Link to={`/owner-profile?ownerId=${transaction.owner_id}`} title="See owner info">
                <p className="inline px-2 text-center rounded-sm bg-black hover:border hover:border-black hover:text-black hover:bg-white">
                  {transaction.owner_name}
                </p>
              </Link>
            </td>
            <td className="p-1 text-sm font-medium text-center border-y-2 border-gray-500 align-middle">
              <p className="text-center">{formatDate(transaction.transaction_date)}</p>
            </td>
            <td className="py-1 px-3 text-sm font-medium text-center border-y-2 border-gray-500 align-middle">
              <p className="text-right">
                {parseFloat(transaction.total_price).toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2
                })}
              </p>
            </td>
            <td className="text-sm font-medium text-center border-y-2 border-gray-500 align-middle">
              <div className="text-center flex items-center justify-center sm:flex-row">
                <button
                  title="Show detail"
                  onClick={(e) => toggleShowItems(e, transaction.id)}
                  className="inline px-2 py-1 mx-2 bold border rounded-md text-white bg-black hover:bg-gray-700">
                  {visibleItems[transaction.id] || visibleAllItems ? '-' : '+'}
                </button>

                <button
                  title="Remove"
                  type="button"
                  onClick={() => {
                    setSelectedTransaction(transaction)
                    setModalOpen(true)
                  }}
                  className="sm:text-sm bg-red-500 hover:bg-red-400 text-white font-semibold py-1 px-2 rounded-md items-center">
                  Delete
                </button>
              </div>
            </td>
          </tr>
          {(visibleItems[transaction.id] || visibleAllItems) && (
            <tr>
              <td colSpan="6">
                <div className="float-right">
                  <h2 className="my-2 font-medium text-black border-b">List Item</h2>
                  <table className="w-full mx-auto mb-4">
                    <thead className="border">
                      <tr className="">
                        <th className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                          <p className="text-center">Nama Item</p>
                        </th>
                        <th className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                          <p className="text-center">Qty.</p>
                        </th>
                        <th className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                          <p className="text-center">Harga</p>
                        </th>
                        <th className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                          <p className="text-center">Sub Total</p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.transaction_items.map((item, index) => (
                        <tr key={index + 1}>
                          <td className="px-3 align-middle border bold text-gray-600">
                            <p className="text-left">{item.resource_name}</p>
                          </td>
                          <td className="px-3 align-middle border bold text-gray-600">
                            <p className="text-center">{item.quantity}</p>
                          </td>
                          <td className="px-3 align-middle border bold text-gray-600">
                            <p className="text-right">
                              {parseFloat(item.price).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 2
                              })}
                            </p>
                          </td>
                          <td className="px-3 align-middle border bold text-gray-600">
                            <p className="text-right">
                              {parseFloat(item.price * item.quantity).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 2
                              })}
                            </p>
                          </td>
                        </tr>
                      ))}
                      {transaction.discount !== 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                            <p className="text-right">Diskon</p>
                          </td>
                          <td className="px-3 align-middle border bold text-gray-600">
                            <p className="text-right text-red-600">
                              -
                              {parseFloat(transaction.discount).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 2
                              })}
                            </p>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-medium leading-4 md:w-auto text-black border border-gray-200 bg-gray-50">
                          <p className="text-right">Total</p>
                        </td>
                        <td className="px-3 align-middle border bold text-gray-600">
                          <p className="text-right">
                            {parseFloat(transaction.total_price).toLocaleString('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 2
                            })}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="items-center min-h-screen pt-2 bg-gray-100 sm:justify-center sm:pt-0">
      <div className="w-full sm:px-16 px-4 py-2 overflow-hidden bg-white rounded-lg">
        <div className="flex is-justify-content-space-between">
          <div>
            <h2 className="inline text-2xl font-bold decoration-gray-400">List Transaksi</h2>
          </div>
          <div>
            <p className="inline mx-1">Start Date:</p>
            <input
              className="p-1 border rounded-sm border-slate-700"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start Date"
            />
            <p className="inline mx-1">End Date:</p>
            <input
              className="p-1 border rounded-sm border-slate-700"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End Date"
            />
            <button
              onClick={() => fetchData(startDate, endDate)}
              className="inline mx-3 text-white border bg-sky-400 hover:bg-sky-700 font-semibold px-2 rounded-md  items-center">
              Search
            </button>
          </div>
        </div>
        <div className="flex justify-start">
          <Link to={`/add-transaction`} title="Add Transaction">
            <button className="mr-3 text-white border bg-green-500 hover:bg-green-400 font-semibold px-2 rounded-md items-center">
              Buat Transaksi Baru
            </button>
          </Link>
          <button
            onClick={(e) => toggleShowAllItems(e)}
            className="inline mx-3 text-white border bg-black hover:bg-gray-700 font-semibold px-2 rounded-md items-center">
            {!visibleAllItems ? 'Show all' : 'Hide all'}
          </button>
          <button
            disabled={loading}
            onClick={(e) => handleDownload(e)}
            className={`inline mx-3 text-white font-semibold px-2 rounded-md items-center ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400'
            }`}>
            {loading ? 'Loading...' : 'Export'}
          </button>
        </div>
        <div className="my-2">
          <p className="text-center text-md text-red-500">{errorMsg}</p>
          <p className="text-center text-md text-green-500">{msg}</p>
        </div>
        <div className="text-sm">
          <table className="min-w-full">
            <thead>
              <tr className="text-center">
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  No.
                </th>
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  Kode Registrasi
                </th>
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  Nama Owner
                </th>
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  Tanggal Transaksi
                </th>
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                  Nilai Transaksi
                </th>
                <th className="px-2 py-3 text-xs font-medium leading-4 md:w-auto text-white uppercase border-b border-gray-200 bg-black">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{listTransaction()}</tbody>
          </table>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        name={
          selectedTransaction
            ? 'Transaksi pada ' + formatDate(selectedTransaction.transaction_date)
            : ''
        }
      />
    </div>
  )
}

export default Trasanctions
