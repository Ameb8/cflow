import axios from 'axios';
import Cookies from 'js-cookie';

const csrfAxios = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
    },
});

export default csrfAxios;
