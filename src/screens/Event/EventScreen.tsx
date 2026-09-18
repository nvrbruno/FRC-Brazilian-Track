import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { getEventosBrasil, Event } from "../../api/events";

interface EventsScreenProps {
  onBack: () => void;
  onOpenTeams: () => void;
  onLogout: () => Promise<void>;
}

export default function EventsScreen({
  onBack,
  onOpenTeams,
  onLogout,
}: EventsScreenProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Busca os eventos do Brasil
  useEffect(() => {
    async function carregarEventos() {
      try {
        setLoading(true);

        const resultado = await getEventosBrasil();

        setEventos(resultado);
      } catch (err) {
        setError("Não foi possível carregar os eventos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    carregarEventos();
  }, []);

  // Fecha o menu e realiza o logout
  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  // Volta para a Home
  function handleBack() {
    setMenuOpen(false);
    onBack();
  }

  // Abre a tela de Times
  function handleOpenTeams() {
    setMenuOpen(false);
    onOpenTeams();
  }

  return (
    <View style={styles.container}>
      {/* Botão do menu lateral */}
      <Pressable
        style={styles.menuButton}
        onPress={() => setMenuOpen(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Lista de eventos */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Eventos</Text>

        <Text style={styles.subtitle}>
          Eventos de FRC no Brasil
        </Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#000"
          />
        )}

        {error !== "" && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {!loading && error === "" && eventos.length === 0 && (
          <Text style={styles.empty}>
            Nenhum evento encontrado.
          </Text>
        )}

        {!loading &&
          eventos.map((evento) => (
            <View
              key={evento.code}
              style={styles.eventCard}
            >
              <Text style={styles.eventName}>
                {evento.name}
              </Text>

              <Text style={styles.eventInfo}>
                Código: {evento.code}
              </Text>

              <Text style={styles.eventInfo}>
                Local: {evento.venue ?? "Não informado"}
              </Text>

              <Text style={styles.eventInfo}>
                Cidade: {evento.city ?? "Não informada"}
              </Text>

              <Text style={styles.eventInfo}>
                Estado: {evento.stateprov ?? "Não informado"}
              </Text>

              <Text style={styles.eventInfo}>
                Início: {evento.dateStart}
              </Text>

              <Text style={styles.eventInfo}>
                Fim: {evento.dateEnd}
              </Text>

              <Text style={styles.eventInfo}>
                Tipo: {evento.type}
              </Text>
            </View>
          ))}
      </ScrollView>

      {/* Menu lateral */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.sidebar}>
            {/* Botão para fechar o menu */}
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

            {/* Navegação para Home */}
            <Pressable
              style={styles.menuItem}
              onPress={handleBack}
            >
              <Text style={styles.menuItemText}>
                Home
              </Text>
            </Pressable>

            {/* Navegação para Times */}
            <Pressable
              style={styles.menuItem}
              onPress={handleOpenTeams}
            >
              <Text style={styles.menuItemText}>
                Times
              </Text>
            </Pressable>

            {/* Página atual */}
            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>
                Eventos
              </Text>
            </Pressable>

            {/* Logout */}
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>
                Sair
              </Text>
            </Pressable>
          </View>

          {/* Fecha ao clicar fora do menu */}
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
    backgroundColor: "#fff",
  },

  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },

  menuIcon: {
    fontSize: 32,
    color: "#000",
  },

  content: {
    paddingTop: 110,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: "center",
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },

  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  eventInfo: {
    fontSize: 15,
    marginBottom: 6,
  },

  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },

  empty: {
    fontSize: 16,
    textAlign: "center",
  },

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 280,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 55,
    zIndex: 2,
    elevation: 5,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },

  closeText: {
    fontSize: 24,
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
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
    borderTopColor: "#ddd",
  },

  logoutText: {
    fontSize: 18,
    color: "red",
    fontWeight: "bold",
  },
});