import frcApi from './frcApi';

import * as SecureStore from 'expo-secure-store';

import axios from 'axios';

const OPTS = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

interface LoginResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function login(
  username: string,
  authToken: string
): Promise<LoginResponse> {
  try {
    // Salva temporariamente para o interceptor montar o header
    await SecureStore.setItemAsync(
      'frc_username',
      username,
      OPTS
    );

    await SecureStore.setItemAsync(
      'frc_token',
      authToken,
      OPTS
    );

    // Valida as credenciais na API
    const response = await frcApi.get('/');

    if (response.status !== 200) {
      throw new Error('Credenciais inválidas');
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    // Se falhou, limpa o que guardou
    await SecureStore.deleteItemAsync('frc_username');
    await SecureStore.deleteItemAsync('frc_token');

    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const message =
      status === 401
        ? 'Usuário ou token inválidos'
        : 'Não foi possível conectar à API da FRC';

    return {
      success: false,
      error: message,
    };
  }
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('frc_username');
  await SecureStore.deleteItemAsync('frc_token');
}

export async function isAuthenticated(): Promise<boolean> {
  const username = await SecureStore.getItemAsync('frc_username');

  const token = await SecureStore.getItemAsync('frc_token');

  return !!(username && token);
}

export async function getStoredUsername(): Promise<string | null> {
  return await SecureStore.getItemAsync('frc_username');
}