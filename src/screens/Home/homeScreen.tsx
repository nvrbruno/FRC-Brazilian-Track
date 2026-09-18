import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';

interface HomeScreenProps {
  username: string;
  onLogout: () => void;
}

export default function HomeScreen({
  username,
  onLogout,
}: HomeScreenProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  return (
    <View style={styles.container}>

      {/* Botão das 3 barrinhas */}
      <Pressable
        style={styles.menuButton}
        onPress={() => setMenuOpen(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Conteúdo da Home */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Seja bem-vindo!
        </Text>

        <Text style={styles.username}>
          {username}
        </Text>
      </View>

      {/* Barra lateral */}
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

            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>
                Home
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>
                Times
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>
                Eventos
              </Text>
            </Pressable>

            {/* Botão Sair */}
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>
                Sair
              </Text>
            </Pressable>

          </View>

          {/* Área fora da barra lateral */}
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

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  username: {
    fontSize: 20,
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