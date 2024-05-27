import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const nav = useNavigate()
  return (
    <div>
      <div className="bg-orange-300 h-screen">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="text-center p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="font-bold text-3xl text-black m-7">404</h1>
              <p className="text-red-500 text-md">Page Not Found</p>
              <button onClick={() => nav('/dashboard')}>Home</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
