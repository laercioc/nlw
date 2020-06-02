import express from 'express'

import knex from './database/connection'
import PointsController from './controllers/pointsController'
import ItemsController from './controllers/itemsController'

const Routes = express.Router()
const pointsController = new PointsController()
const itemsController = new ItemsController()

Routes.get('/items', itemsController.index)

Routes.get('/points', pointsController.index)
Routes.get('/points/:id', pointsController.show)
Routes.post('/points', pointsController.create)

export default Routes