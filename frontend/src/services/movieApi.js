import api from './api';

export const getMovies = (search = '') => {
  const params = search ? { search } : {};
  return api.get('/movies', { params });
};

export const getMovie = (id) => api.get(`/movies/${id}`);
