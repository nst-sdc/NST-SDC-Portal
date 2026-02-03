import api from './axios';

export const getMembers = async () => {
    const response = await api.get('users/');
    return response.data;
};
