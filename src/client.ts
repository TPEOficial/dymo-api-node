import axios from 'axios';

const dymoClient = axios.create({
    baseURL: 'https://api.tpeoficial.com/v1',
    headers: {
        'User-Agent': 'DymoAPISDK',
        'Content-Type': 'application/json'
    }
});

export default dymoClient; 