import api from './axios';

export const getMyAttendance = async () => {
    const response = await api.get('attendance/');
    return response.data;
};

export const getPastEvents = async (type) => {
    let url = 'events/?time=past';
    if (type) {
        url += `&type=${type}`;
    }
    const response = await api.get(url);
    return response.data;
};
