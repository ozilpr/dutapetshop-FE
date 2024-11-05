import PropTypes from 'prop-types'
import React from 'react'

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, name }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
        <p className="text-sm mb-6">
          Anda yakin ingin menghapus <strong>{name}</strong>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-400 text-white font-semibold py-1 px-3 rounded-md">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
}

export default DeleteConfirmationModal
