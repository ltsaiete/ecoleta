import axios from 'axios';

const mozApi = axios.create({
    baseURL: 'http://192.168.43.77:4000'
});

export default mozApi;
