import axios from 'axios';
const API_URL = 'http://127.0.0.1:8000'; 

export const processAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'record.wav');
    return (await axios.post(`${API_URL}/process-audio`, formData)).data;
};

export const processText = async (text) => {
    return (await axios.post(`${API_URL}/process-text`, { text })).data;
};