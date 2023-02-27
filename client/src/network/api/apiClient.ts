import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

export const authorizeAxiosInstance = (accessToken: string) => {
  axiosInstance.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${accessToken}`;
};

export const deleteAxiosHeader = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};
