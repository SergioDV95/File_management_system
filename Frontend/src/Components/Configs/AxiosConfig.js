import axios from "axios";

const instance = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 5000,
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
})

export default instance;