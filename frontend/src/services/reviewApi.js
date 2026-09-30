import api from './api';

export const getMovieReviews = (movieId) => api.get(`/movies/${movieId}/reviews`);
export const createReview = (movieId, data) => api.post(`/movies/${movieId}/reviews`, data);
export const updateReview = (reviewId, data) => api.put(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
export const getMyReviews = () => api.get('/users/me/reviews');
