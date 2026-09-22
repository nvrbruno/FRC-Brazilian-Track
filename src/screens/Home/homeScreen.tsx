import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Image,
} from 'react-native';

interface HomeScreenProps {
  username: string;
  onLogout: () => void;
  onOpenTeams: () => void;
  onOpenEvents: () => void;
}

export default function HomeScreen({
  username,
  onLogout,
  onOpenTeams,
  onOpenEvents,
}: HomeScreenProps) {
  // controla se o menu lateral (Modal) está visível
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // fecha o menu e dispara o logout recebido via props
  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  // fecha o menu e navega para a tela de Times
  function handleOpenTeams() {
    setMenuOpen(false);
    onOpenTeams();
  }

  // fecha o menu e navega para a tela de Eventos
  function handleOpenEvents() {
    setMenuOpen(false);
    onOpenEvents();
  }

  return (
    <View style={styles.container}>
      {/* botão hambúrguer: só ABRE o menu lateral, não navega sozinho */}
      <Pressable
        style={styles.menuButton}
        onPress={() => setMenuOpen(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* tela inicial: nome do app, descrição breve e acesso aos dados da API */}
      <View style={styles.content}>
        <Image
          source={require('../../../assets/logoFrc.webp')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.appName}>
          FRC Brazilian Track
        </Text>

        <Text style={styles.description}>
          Acompanhe as equipes e os eventos da FIRST Robotics Competition (FRC) no Brasil,
          com dados obtidos diretamente da API oficial da FRC.
        </Text>

        <Text style={styles.username}>
          Olá, {username}
        </Text>

        <View style={styles.buttonsContainer}>
          <Pressable style={styles.apiButton} onPress={handleOpenTeams}>
            <Text style={styles.apiButtonText}>
              Ver Times
            </Text>
          </Pressable>

          <Pressable style={styles.apiButton} onPress={handleOpenEvents}>
            <Text style={styles.apiButtonText}>
              Ver Eventos
            </Text>
          </Pressable>
        </View>
      </View>

      {/* menu lateral (drawer) em modal deslizante */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.sidebar}>
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <Text style={styles.sidebarTitle}>
              FRC Brazilian Track
            </Text>

            <View style={styles.divider} />

            {/* item Home: já está na Home, só fecha o menu */}
            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>
                Home
              </Text>
            </Pressable>

            {/* item Times: navega para a tela de equipes */}
            <Pressable
              style={styles.menuItem}
              onPress={handleOpenTeams}
            >
              <Text style={styles.menuItemText}>
                Times
              </Text>
            </Pressable>

            {/* item Eventos: navega para a tela de eventos */}
            <Pressable
              style={styles.menuItem}
              onPress={handleOpenEvents}
            >
              <Text style={styles.menuItemText}>
                Eventos
              </Text>
            </Pressable>

            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>
                Sair
              </Text>
            </Pressable>
          </View>

          {/* área escura clicável fora do sidebar, fecha o menu */}
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },

  menuIcon: {
    fontSize: 32,
    color: '#000',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },

  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  username: {
    fontSize: 18,
    marginBottom: 24,
  },

  buttonsContainer: {
    width: '100%',
    gap: 12,
  },

  apiButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  apiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 55,
    zIndex: 2,
    elevation: 5,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },

  closeText: {
    fontSize: 24,
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 15,
  },

  menuItem: {
    paddingVertical: 15,
  },

  menuItemText: {
    fontSize: 18,
  },

  logoutButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  logoutText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
  },
});