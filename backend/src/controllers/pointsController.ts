import {Request, Response} from 'express'

import knex from '../database/connection'

class pointsController {
    async index(request: Request, response: Response) {
        const {city, uf, items} = request.query

        const parsedItems = String(items).split(',').map(item => Number(item.trim()))

        const points = await knex('points')
            .join('points_items', 'points.id', '=', 'points_items.point_id')
            .whereIn('points_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .select('points.*')
            .distinct()

        return response.json(points)
    }

    async show(request: Request, response: Response) {
        const { id } = request.params
        const point = await knex('points').where('id', id).first()

        if(!point){
            response.status(400).json({message: 'Point ID not exists'})
        }

        const items = await knex('items')
            .join('points_items', 'items.id', '=', 'points_items.item_id')
            .where('points_items.point_id', id)
            .select('items.*')

        return response.json({
            point,
            items
        })
    }

    async create(request: Request, response: Response) {
        const { name, email, whatsapp, latitude, longitude, city, number, uf, items } = request.body
    
        const tsx = await knex.transaction()
        const point = {
            image: 'fake.png',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            number,
            uf
        }
    
        const insertedIds = await tsx('points').insert(point)
    
        const pointsItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id: insertedIds[0]
            }
        })
    
        await tsx('points_items').insert(pointsItems)

        tsx.commit()
    
        return response.json({
            id: insertedIds[0],
            ...point
        })
    }
}

export default pointsController