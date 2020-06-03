import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import './style.css'
import logo from '../../assets/logo.svg'
import api from '../../services/api'

interface Items {
    id: number,
    title: string,
    image_url: string
}

interface UFs {
    sigla: string
}

interface Cities {
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Items[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        number_end: '',
    })

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    const [selectedUf, setSelectedUf] = useState<string>('0')
    const [selectedCity, setSelectedCity] = useState<string>('0')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const history = useHistory()

    useEffect(() => {
        async function getItem() {
            const response =  await api.get('/items')
            setItems(response.data)
        }

        async function getUFs() {
            const response = await api.get<UFs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            const UFInitials = response.data.map(uf => uf.sigla)
            setUfs(UFInitials)
        }

        async function getCurrentLocation() {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords
                console.log(position.coords)
                setInitialPosition([latitude, longitude])
            })
        }

        getCurrentLocation()
        getItem()
        getUFs()
    }, [])

    useEffect(() => {
        if(selectedUf != '0'){
            api
            .get<Cities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const citiesName = response.data.map(city => city.nome)
                setCities(citiesName)
            })
        }
    }, [selectedUf])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    function handleSelectItem(id: number){
        const hasSelected = selectedItems.findIndex(item => item === id)

        if(hasSelected >= 0){
            const filteredSelectedList = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredSelectedList)
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmitPoint(event: FormEvent){
        event.preventDefault()

        const data = {
            name: formData.name,
            email: formData.email,
            whatsapp: formData.whatsapp,
            number: formData.number_end,
            uf: selectedUf,
            city: selectedCity,
            latitude: selectedPosition[0],
            longitude: selectedPosition[1],
            items: selectedItems
        }

        const response = await api.post('/points', data)
        alert('Ponto cadastrado com sucesso!')

        history.goBack()
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmitPoint}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map 
                        center={initialPosition} 
                        onClick={handleMapClick}
                        zoom={15}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="number_end">Número</label>
                            <input 
                                type="number"
                                name="number_end"
                                id="number_end"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {
                                    ufs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select 
                            name="city" 
                            id="city"
                            value={selectedCity}
                            onChange={handleSelectCity}
                        >
                            <option value="0">Selecione uma cidade</option>
                            {
                                cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))
                            }
                        </select>
                    </div>
                </fieldset>


                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => {
                                return (
                                    <li 
                                        key={item.id} 
                                        onClick={ () => handleSelectItem(item.id) }
                                        className={ selectedItems.includes(item.id) ? 'selected' : '' }
                                    >
                                        <img src={item.image_url} alt="Lâmpadas"/>
                                        <span>{item.title}</span>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint