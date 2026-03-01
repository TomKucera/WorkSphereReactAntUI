import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // or whatever your backend base URL is
  // Add headers, auth, interceptors, etc. here
});

export default instance;
