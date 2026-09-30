import api from './api';

export const getMyPreferences = () => api.get('/users/me/preferences');
export const updateUserSettings = (data) => api.patch('/users/me/settings', data);
