import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'

import Dropzone from '../../components/Dropzone';
import api from '../../services/api';
import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface MozAPIProvinceResponse {
    id: number;
    name: string;
}

interface MozAPICityResponse {
    name: string;
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [provinces, setProvinces] = useState<MozAPIProvinceResponse[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedProvince, setSelectedProvince] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const [provinceName, setProvinceName] = useState<string>('')

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, []);

    useEffect(() => {
        axios.get<MozAPIProvinceResponse[]>('http://localhost:4000/provinces')
            .then(response => {
                const provinceData = response.data
                    .map(province => {
                        return {
                            id: province.id,
                            name: province.name
                        }
                    });
                setProvinces(provinceData);

            });
    }, []);

    useEffect(() => {
        if (selectedProvince === '0') {
            return;
        }

        axios
            .get<MozAPICityResponse[]>(`http://localhost:4000/${selectedProvince}/districts`)
            .then(response => {
                const cityNames = response.data.map(province => province.name);
                setCities(cityNames);
            });

    }, [selectedProvince]);


    useEffect(() => {
        axios
            .get<MozAPIProvinceResponse>(`http://localhost:4000/provinces/${selectedProvince}`)
            .then(response => {
                setProvinceName(response.data.name);
            });
    }, [selectedProvince])

    function handleSelectedProvince(event: ChangeEvent<HTMLSelectElement>) {
        const province = event.target.value;
        setSelectedProvince(province);
    }
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }


    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleSelectedItem(id: number) {

        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }


    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const province = provinceName;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('province', province);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);
        alert('ponto de coleta criado');
        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/" >
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br /> Ponto de coleta</h1>


                <Dropzone onFileUploaded={setSelectedFile} />


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

                    <Map center={initialPosition} zoom={14} onClick={handleMapClick} >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="province">Província</label>
                            <select
                                name="province"
                                id="province"
                                value={selectedProvince}
                                onChange={handleSelectedProvince}
                            >
                                <option value="0">Selecione uma Província</option>
                                {
                                    provinces.map(province => (
                                        <option key={province.id} value={province.id}>{province.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {
                                    cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid" >
                        {items.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}

                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>

            </form>

        </div>
    );
}

export default CreatePoint;
