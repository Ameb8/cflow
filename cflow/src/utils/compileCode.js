import axios from 'axios';

export async function compileCode(code) {
    const response = await axios.post('http://127.0.0.1:8000/api/compile/', { code });
    return response.data;
}
