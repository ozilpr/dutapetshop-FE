import React, { useState, useEffect, useCallback } from 'react'
import TransactionsService from '../../features/TransactionsService'
import OwnersService from '../../features/OwnersService'
import ResourcesService from '../../features/ResourcesService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Authentications/Authentication'

const FormAddTransaction = () => {
  const user = useAuth()
  const nav = useNavigate()
  // from db
  const [rsc, setRsc] = useState([])
  const [owner, setOwner] = useState([])

  // selected option
  const [ownerId, setOwnerId] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [regCode, setRegCode] = useState('')

  const [resourceId, setResourceId] = useState('')
  const [rscName, setRscName] = useState('')
  const [price, setPrice] = useState('')

  const [quantity, setQuantity] = useState(1)

  const DISCOUNT_TYPE_FLAT = 'flat'
  const DISCOUNT_TYPE_PERCENT = 'percentage'
  const MAX_DISCOUNT_IN_PERCENT = 100
  const MAX_DISCOUNT_IN_FLAT = price

  const [discount, setDiscount] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [discountType, setDiscountType] = useState(DISCOUNT_TYPE_PERCENT)
  const [finalDiscount, setFinalDiscount] = useState('')

  // added items
  const [displayedItems, setDisplayedItems] = useState([])
  const [transactionsData, setTransactionsData] = useState([])

  // filter
  const [ownerFilterText, setOwnerFilterText] = useState('')
  const [rscFilterText, setRscFilterText] = useState('')

  // message
  const [errorMsg, setErrorMsg] = useState('')
  const [msg, setMsg] = useState('')

  // Function to set message and clear after delay
  const setMessageWithDelay = (message, delay) => {
    setMsg(message)

    setTimeout(() => {
      setMsg('')
    }, delay)
  }

  const fetchData = useCallback(async () => {
    try {
      const rscResponse = await ResourcesService.getResources(user.accessToken)
      const ownResponse = await OwnersService.getOwners(user.accessToken)

      setRsc(rscResponse.data.resources)
      setOwner(ownResponse.data.owners)
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setErrorMsg(`${error.message}`)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const renderOwner = () => {
    return owner
      .filter((own) => {
        const lowerCaseFilterText = ownerFilterText.toLowerCase()
        return (
          own.name.toLowerCase().includes(lowerCaseFilterText) ||
          own.register_code.toLowerCase().includes(lowerCaseFilterText)
        )
      })
      .map((own) => (
        <option key={own.id} value={own.name} data-value={own.register_code} data-id={own.id}>
          {own.register_code + ' - ' + own.name}
        </option>
      ))
  }

  const renderItem = () => {
    return rsc
      .filter((item) => item.name.toLowerCase().includes(rscFilterText.toLowerCase()))
      .map((item) => (
        <option key={item.id} value={item.name} data-value={item.price} data-id={item.id}>
          {item.name}
        </option>
      ))
  }

  const RscHandler = async (e) => {
    const name = e.target.value
    const dataset = e.target.options[e.target.selectedIndex].dataset

    setRscName(name)
    setPrice(dataset.value)
    setResourceId(dataset.id)
  }

  const OwnHandler = async (e) => {
    const name = e.target.value
    const dataset = e.target.options[e.target.selectedIndex].dataset

    setOwnerName(name)
    setRegCode(dataset.value)
    setOwnerId(dataset.id)
  }

  const saveData = async (e) => {
    e.preventDefault()

    if (!ownerId || !ownerName) {
      setErrorMsg('Owner belum dipilih')
      return
    }

    if (transactionsData.length === 0) {
      setErrorMsg('Tidak ada item yang ditambahkan')
      return
    }

    try {
      await TransactionsService.addTransaction(
        user.accessToken,
        ownerId,
        finalPrice,
        finalDiscount,
        transactionsData
      )

      setMessageWithDelay('Berhasil menambah transaksi', 5000)
      setErrorMsg('')
    } catch (error) {
      if (error.statusCode === 401) user.refreshAccessToken()
      setErrorMsg(`${error.message}`)
    }
    setDisplayedItems([])
    setTransactionsData([])
    setFinalPrice(0)
    setFinalDiscount(0)

    setErrorMsg('')
  }

  useEffect(() => {
    const totalDiscount = displayedItems.reduce((acc, item) => {
      const discount = parseFloat(item.discount)
      return acc + (isNaN(discount) ? 0 : discount) // Add 0 if discount is NaN
    }, 0)

    if (!isNaN(totalDiscount)) setFinalDiscount(totalDiscount)
  }, [displayedItems])

  useEffect(() => {
    if (!discount) {
      setDiscount(0)
      return
    }

    if (discount > MAX_DISCOUNT_IN_PERCENT && discountType === DISCOUNT_TYPE_PERCENT)
      setDiscount(parseFloat(MAX_DISCOUNT_IN_PERCENT))

    if (discount > MAX_DISCOUNT_IN_FLAT && discountType === DISCOUNT_TYPE_FLAT)
      setDiscount(parseFloat(MAX_DISCOUNT_IN_FLAT))
  }, [discount, discountType, MAX_DISCOUNT_IN_FLAT, MAX_DISCOUNT_IN_PERCENT])

  const handleDiscountChange = (e) => {
    const { value } = e.target
    setDiscount(value)
  }

  const handleDiscountTypeChange = (e) => {
    const { value } = e.target
    setDiscountType(value)
  }

  // todo when item remove, discount didnt get calculate, find a way to fix it
  const calculateDiscount = (itemPrice, itemQuantity, itemDiscount = 0, itemDiscountType) => {
    let newDiscount = 0

    if (itemDiscount > 0) {
      if (itemDiscountType === DISCOUNT_TYPE_PERCENT) {
        newDiscount = itemPrice * itemQuantity * (itemDiscount / MAX_DISCOUNT_IN_PERCENT)
      }
      if (itemDiscountType === DISCOUNT_TYPE_FLAT) {
        newDiscount = Math.min(itemDiscount, itemPrice * itemQuantity)
      }

      return newDiscount || 0
    }
  }

  const addItemHandler = async (e) => {
    e.preventDefault()

    if (!resourceId || quantity <= 0) {
      setErrorMsg('Item dan Jumlah harus diisi')
      return
    }

    const addedDiscount = calculateDiscount(price, quantity, discount, discountType)

    const newItem = {
      resourceId,
      rscName,
      price,
      discount: addedDiscount,
      quantity,
      ownerName: owner.find((o) => o.id === ownerId)?.name,
      regCode: owner.find((o) => o.id === ownerId)?.register_code
    }

    const newDisplayedItems = [...displayedItems, newItem]
    setDisplayedItems(newDisplayedItems)

    // Data untuk backend
    const newItemForBackend = { resourceId, quantity, price }
    setTransactionsData((prev) => [...prev, newItemForBackend])

    setMessageWithDelay('Item berhasil ditambahkan', 3000)

    // Reset input fields
    setResourceId('')
    setRscName('')
    setPrice(0)
    setQuantity(1)
    setRscFilterText('')
    setOwnerFilterText('')
    setDiscount(0)
    setDiscountType(DISCOUNT_TYPE_PERCENT)
    setErrorMsg('')
  }

  const removeItemHandler = (index) => {
    const updatedItems = [...displayedItems]
    updatedItems.splice(index, 1)
    setDisplayedItems(updatedItems)

    const updatedTransactionData = [...transactionsData]
    updatedTransactionData.splice(index, 1)
    setTransactionsData(updatedTransactionData)
  }

  useEffect(() => {
    let total = 0
    displayedItems.forEach((item) => {
      total += Number(item.quantity) * Number(item.price)
    })

    if (!finalDiscount) setFinalPrice(total)
    if (finalDiscount) setFinalPrice(total - finalDiscount)
  }, [displayedItems, finalDiscount])

  return (
    <div className="columns min-h-screen pt-4 bg-gray-100 sm:justify-center sm:pt-0">
      <div className="column m-4 px-4 bg-white rounded-lg">
        <div className="mb-4">
          <h1 className=" text-2xl font-bold decoration-gray-400">Buat Transaksi Baru</h1>
        </div>
        <div className="w-full px-6 py-4 bg-white rounded shadow-md ring-1 ring-gray-900/10">
          <form name="userForm" autoComplete="off">
            <p className="text-center text-md text-red-500">{errorMsg}</p>
            <p className="text-center text-md text-green-500">{msg}</p>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Owner</label>
              <input
                className="p-1 rounded-md block my-1 ring-1 ring-gray-900/10"
                type="text"
                placeholder="Cari owner..."
                value={ownerFilterText}
                onChange={(e) => setOwnerFilterText(e.target.value)}
              />
              <select
                className="w-full p-1 text-sm block mt-1 border-gray-400 rounded-md border shadow-sm text-black focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={ownerName}
                data-value={regCode}
                data-id={ownerId}
                onChange={(e) => OwnHandler(e)}>
                <option value="">Pilih Owner</option>
                {renderOwner()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Item</label>
              <input
                className="p-1 rounded-md block my-1 ring-1 ring-gray-900/10"
                type="text"
                placeholder="Cari item..."
                value={rscFilterText}
                onChange={(e) => setRscFilterText(e.target.value)}
              />
              <select
                className="w-full p-1 text-sm inline border-gray-400 rounded-md border shadow-sm text-black"
                value={rscName}
                data-value={price}
                data-id={resourceId}
                onChange={(e) => RscHandler(e)}>
                <option value="">Pilih Item</option>
                {renderItem()}
              </select>
              <div className="w-fit p-1 border-gray-400 rounded-md border-b text-black">
                <p className="inline">Harga:</p>
                <p className="inline mx-1">
                  {!price
                    ? 'Rp. 0,00'
                    : parseFloat(price).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 2
                      })}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah</label>
                <input
                  disabled={!price}
                  className="p-2 inline w-full my-1 rounded-md shadow-sm placeholder:text-gray-400 placeholder:text-left focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-400"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  name="quantity"
                  value={quantity}
                  onChange={(e) => {
                    e.preventDefault()
                    const value = e.target.value
                    if (/^\d*$/.test(value)) {
                      setQuantity(value)
                    }
                  }}
                  placeholder="Jumlah item"
                />
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Discount</label>
              <input
                disabled={!price}
                type="number"
                pattern="[0-9]"
                min="0"
                className="w-1/3 p-1 text-sm border-gray-400 rounded-md border shadow-sm text-black disabled:bg-gray-400"
                value={discount}
                onChange={(e) => handleDiscountChange(e)}
              />
              <select
                disabled={!price}
                className="w-1/3 p-1 text-sm inline border-gray-400 rounded-md border shadow-sm text-black"
                value={discountType}
                onChange={handleDiscountTypeChange}>
                <option value="percentage">Persen (%)</option>
                <option value="flat">Flat (Nominal)</option>
              </select>
              <button
                type="button"
                disabled={!price}
                className="w-1/5 p-1 text-sm inline bg-red-500 hover:bg-red-400 rounded-md border shadow-sm text-white disabled:bg-gray-400"
                onClick={() => setDiscount(0)}>
                Reset
              </button>
            </div>

            <div className="w-fit p-1 border-gray-400 rounded-md border-b text-black">
              <p className="inline">Diskon:</p>
              <p className="inline mx-1">
                {discountType === 'flat' &&
                  parseFloat(discount).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 2
                  })}
                {discountType === 'percentage' && parseFloat(discount) + '%'}
              </p>
            </div>

            <button
              disabled={!price}
              title="Add item"
              className="inline mt-4 px-2 py-1 bold border rounded-md text-white bg-green-500 hover:bg-green-400 disabled:bg-gray-400"
              onClick={(e) => addItemHandler(e)}>
              Tambah
            </button>
          </form>
        </div>
      </div>
      <div className="column is-6 column mr-4 my-4 px-4 bg-white rounded-lg">
        <div className="mb-4">
          <h1 className=" text-2xl font-bold decoration-gray-400">List item</h1>
        </div>
        {displayedItems && (
          <div className="w-full px-1 py-2 text-xs bg-white overflow-auto">
            <div className="text-xs bg-white rounded shadow-md ring-1 ring-gray-900/10 overflow-auto">
              <table className="w-full overflow-auto">
                <thead>
                  <tr className="border-y">
                    <th className="p-2">
                      <p className="text-center">Nama</p>
                    </th>
                    <th className="p-2">
                      <p className="text-center">Harga</p>
                    </th>
                    <th className="p-2">
                      <p className="text-center">Jumlah</p>
                    </th>
                    <th className="p-2">
                      <p className="text-center">Subtotal</p>
                    </th>

                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border">{item.rscName}</td>
                      <td className="p-2 border">
                        <p className="text-right">
                          {parseFloat(item.price).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 2
                          })}
                        </p>
                      </td>
                      <td className="p-2 border">
                        <p className="text-center">{Number(item.quantity)}</p>
                      </td>
                      <td className="p-2 border">
                        <p className="text-right">
                          {(Number(item.quantity) * Number(item.price)).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 2
                          })}
                        </p>
                      </td>
                      <td className="p-2 border">
                        <button
                          className="px-2 bg-red-500 hover:bg-red-400 rounded-md border shadow-sm text-white"
                          onClick={() => removeItemHandler(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {finalDiscount !== 0 && !isNaN(finalDiscount) && (
                    <tr>
                      <td className="p-2 text-right border" colSpan="3">
                        <p className="text-right">Discount</p>
                      </td>
                      <td className="p-2 border">
                        <p className="text-right">
                          {parseFloat(finalDiscount).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 2
                          })}
                        </p>
                      </td>
                      <td className="border"></td>
                    </tr>
                  )}

                  <tr>
                    <td className="p-2 border" colSpan="3">
                      <p className="text-right">Total</p>
                    </td>
                    <td className="p-2 border text-right">
                      <p className="text-right">
                        {parseFloat(finalPrice).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 2
                        })}
                      </p>
                    </td>
                    <td className="border"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        <div className="flex w-full items-center justify-start mt-4 gap-x-2">
          <button
            disabled={!displayedItems.length > 0}
            onClick={(e) => saveData(e)}
            className="p-1 mr-1 w-1/2 text-sm font-semibold rounded-md shadow-md text-white bg-green-500 hover:bg-green-400 disabled:bg-gray-400 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300">
            Konfirmasi
          </button>
          <button
            onClick={() => nav(-1)}
            className="p-1 ml-1 w-auto text-sm font-semibold text-white bg-red-500 hover:bg-red-400 rounded-md shadow-md focus:outline-none focus:border-gray-900 focus:ring ring-gray-300">
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormAddTransaction
