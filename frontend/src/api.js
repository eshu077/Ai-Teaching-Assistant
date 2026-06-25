import axios from 'axios';
const API_URL = 'https://ai-teaching-assistant-1snv.onrender.com'; 

export const processAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'record.wav');
    return (await axios.post(`${API_URL}/process-audio`, formData)).data;
};

export const processText = async (text) => {
    return (await axios.post(`${API_URL}/process-text`, { text })).data;
};