import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PropTypes from 'prop-types'

const MainLayout = ({ children }) => {
  return (
    <React.Fragment>
      <div>
        <Navbar />
        <div className="columns h-full">
          <div className="column is-2">
            <Sidebar />
          </div>
          <div className="column bg-gray-100">
            <main>{children}</main>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
}

export default MainLayout
