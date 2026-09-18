import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native';

import { login } from '../api/auth';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
}: LoginScreenProps) {
  const [username, setUsername] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function handleLogin(): Promise<void> {
    setError('');
    setLoading(true);

    const result = await login(username.trim(), token.trim());

    setLoading(false);

    if (result.success) {
      onLoginSuccess?.();
    } else {
      setError(result.error ?? 'Erro ao fazer login');
    }
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Login FRC API
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Authorization Token"
        value={token}
        onChangeText={setToken}
        secureTextEntry
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 10,
        }}
      />

      {error ? (
        <Text style={{ color: 'red' }}>
          {error}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="Entrar"
          onPress={handleLogin}
        />
      )}
    </View>
  );
}