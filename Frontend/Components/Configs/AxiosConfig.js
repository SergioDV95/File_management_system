import axios from "axios";

const instance = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 5000,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
    },
    withCredentials: true
})

export default instance;