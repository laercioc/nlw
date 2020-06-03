import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Home from './pages/home'
import CreatePoint from './pages/points/create'

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact></Route>
            <Route component={CreatePoint} path="/create-point" ></Route>
        </BrowserRouter>
    )
}

export default Routes