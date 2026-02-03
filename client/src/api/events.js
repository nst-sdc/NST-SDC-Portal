import api from './axios';

export const getAllEvents = async () => {
    const response = await api.get('events/');
    return response.data;
};
