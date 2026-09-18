import React, { useEffect, useState } from 'react';

import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/loginScreen';

import HomeScreen from './src/screens/Home/homeScreen';

import {
  isAuthenticated,
  getStoredUsername,
  logout,
} from './src/api/auth';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    async function checkAuth() {
      const result = await isAuthenticated();

      if (result) {
        const storedUsername = await getStoredUsername();

        setUsername(storedUsername ?? '');
      }

      setAuthenticated(result);
    }

    checkAuth();
  }, []);

  async function handleLoginSuccess() {
    const storedUsername = await getStoredUsername();

    setUsername(storedUsername ?? '');

    setAuthenticated(true);
  }

  async function handleLogout() {
    await logout();

    setAuthenticated(false);

    setUsername('');
  }

  if (authenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!authenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <HomeScreen
      username={username}
      onLogout={handleLogout}
    />
  );
}