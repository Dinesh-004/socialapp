import axios from 'axios';

// Point to our Server Proxy
const UPLOAD_URL = 'http://localhost:5000/upload';

export const uploadToOpeninary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Server Proxy
    const res = await axios.post(UPLOAD_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // Cookies if needed
    });

    return res.data.url;
};
