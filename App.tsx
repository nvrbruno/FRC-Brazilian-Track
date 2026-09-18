import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/loginScreen';
import HomeScreen from './src/screens/Home/homeScreen';
import TeamsScreen, { TeamWithAvatar } from './src/screens/Teams/TeamsScreen';
import TeamDetailsScreen from './src/screens/Teams/TeamDetailsScreen';
import { isAuthenticated, getStoredUsername, logout } from './src/api/auth';

type Screen = 'home' | 'teams' | 'teamDetails';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>('');
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTeam, setSelectedTeam] = useState<TeamWithAvatar | null>(null);

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
    setScreen('home');
    setSelectedTeam(null);
  }

  if (authenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!authenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (screen === 'teamDetails' && selectedTeam) {
    return (
      <TeamDetailsScreen
        team={selectedTeam}
        onBack={() => setScreen('teams')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'teams') {
    return (
      <TeamsScreen
        onBack={() => setScreen('home')}
        onLogout={handleLogout}
        onOpenTeam={(team) => {
          setSelectedTeam(team);
          setScreen('teamDetails');
        }}
      />
    );
  }

  return (
    <HomeScreen
      username={username}
      onLogout={handleLogout}
      onOpenTeams={() => setScreen('teams')}
    />
  );
}