import axios, { InternalAxiosRequestConfig } from 'axios';

import * as SecureStore from 'expo-secure-store';

const frcApi = axios.create({
  baseURL: 'https://frc-api.firstinspires.org/v3.0',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});
  
// Injeta o Basic Auth automaticamente em toda requisição
frcApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const username = await SecureStore.getItemAsync('frc_username');
    const token = await SecureStore.getItemAsync('frc_token');

    if (username && token) {
      const encoded = btoa(`${username}:${token}`);

      config.headers.Authorization = `Basic ${encoded}`;
    }

    return config;
  }
);

export default frcApi;