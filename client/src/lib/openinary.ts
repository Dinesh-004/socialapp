import api from './axios';

export const uploadToOpeninary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Upload to Server Proxy
    const res = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return res.data.url;
};
