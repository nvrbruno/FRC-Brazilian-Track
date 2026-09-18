import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Button,
  Image,
  Pressable,
  Modal,
} from "react-native";

import { getEquipesBrasil, getAvatarEquipe, Team } from "../../api/teams";

// equipe + avatar já carregado, usado em toda a tela e repassado ao clicar no card
export interface TeamWithAvatar extends Team {
  avatar: string | null;
}

interface TeamsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onOpenTeam: (team: TeamWithAvatar) => void; // navega para os detalhes da equipe clicada
  onOpenEvents: () => void; // navega para a tela de Eventos
}

export default function TeamsScreen({
  onBack,
  onLogout,
  onOpenTeam,
  onOpenEvents,
}: TeamsScreenProps) {
  const [teams, setTeams] = useState<TeamWithAvatar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // carrega as equipes do Brasil e seus avatares ao montar a tela
  useEffect(() => {
    async function carregarEquipes() {
      try {
        setLoading(true);
        setError("");

        const equipesBrasil = await getEquipesBrasil();

        // busca o avatar de cada equipe em paralelo
        const equipesComAvatar = await Promise.all(
          equipesBrasil.map(async (team) => {
            const avatar = await getAvatarEquipe(team.teamNumber);
            return { ...team, avatar };
          }),
        );

        // ordena por número da equipe
        equipesComAvatar.sort((a, b) => a.teamNumber - b.teamNumber);
        setTeams(equipesComAvatar);
      } catch {
        setError("Não foi possível carregar as equipes.");
      } finally {
        setLoading(false);
      }
    }

    carregarEquipes();
  }, []);

  // fecha o menu e volta para a Home
  function handleOpenHome() {
    setMenuOpen(false);
    onBack();
  }

  // fecha o menu e navega para a tela de Eventos
  function handleOpenEvents() {
    setMenuOpen(false);
    onOpenEvents();
  }

  // fecha o menu e dispara o logout
  async function handleLogout() {
    setMenuOpen(false);
    await onLogout();
  }

  // estado de carregamento
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header fixo: sanduíche + título lado a lado, travado no topo */}
        <View style={styles.fixedHeader}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Equipes FRC do Brasil
          </Text>
        </View>

        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            Carregando equipes do Brasil...
          </Text>
        </View>

        <Modal
          visible={menuOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Menu
            onClose={() => setMenuOpen(false)}
            onHome={handleOpenHome}
            onEvents={handleOpenEvents}
            onLogout={handleLogout}
          />
        </Modal>
      </View>
    );
  }

  // estado de erro na busca das equipes
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.fixedHeader}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Equipes FRC do Brasil
          </Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Voltar" onPress={onBack} />
        </View>

        <Modal
          visible={menuOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Menu
            onClose={() => setMenuOpen(false)}
            onHome={handleOpenHome}
            onEvents={handleOpenEvents}
            onLogout={handleLogout}
          />
        </Modal>
      </View>
    );
  }

  // lista de equipes carregada com sucesso
  return (
    <View style={styles.container}>
      {/* Header fixo: sanduíche + título lado a lado, travado no topo */}
      <View style={styles.fixedHeader}>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Equipes FRC do Brasil
        </Text>
      </View>

      {/* Contador de equipes, fora do header fixo, rola junto com a lista */}
      <Text style={styles.count}>{teams.length} equipes encontradas</Text>

      <FlatList
        data={teams}
        keyExtractor={(item) => String(item.teamNumber)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          // card clicável: abre a tela de detalhes da equipe
          <Pressable style={styles.card} onPress={() => onOpenTeam(item)}>
            <View style={styles.topCard}>
              <View style={styles.teamText}>
                <Text style={styles.teamNumber}>#{item.teamNumber}</Text>
                <Text style={styles.name}>
                  {item.nameShort || item.nameFull}
                </Text>
              </View>

              {/* mostra o avatar se existir, senão um placeholder com o número */}
              {item.avatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text
                    style={[
                      styles.logoPlaceholderText,
                      String(item.teamNumber).length >= 5 &&
                        styles.logoPlaceholderTextSmall,
                    ]}
                  >
                    #{item.teamNumber}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* campos opcionais, só renderiza se houver dado */}
            {item.city || item.stateProv ? (
              <Text style={styles.info}>
                <Text style={styles.label}>Localização:</Text> {item.city}
                {item.city && item.stateProv ? " - " : ""}
                {item.stateProv}
              </Text>
            ) : null}

            {item.country ? (
              <Text style={styles.info}>
                <Text style={styles.label}>País:</Text> {item.country}
              </Text>
            ) : null}
          </Pressable>
        )}
      />

      <View style={styles.backButton}>
        <Button title="Voltar" onPress={onBack} />
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Menu
          onClose={() => setMenuOpen(false)}
          onHome={handleOpenHome}
          onEvents={handleOpenEvents}
          onLogout={handleLogout}
        />
      </Modal>
    </View>
  );
}

interface MenuProps {
  onClose: () => void;
  onHome: () => void;
  onEvents: () => void;
  onLogout: () => void;
}

// menu lateral reutilizado nos estados de loading/erro/sucesso
function Menu({ onClose, onHome, onEvents, onLogout }: MenuProps) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.sidebar}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.sidebarTitle}>FRC Brazilian Track</Text>
        <View style={styles.divider} />

        <Pressable style={styles.menuItem} onPress={onHome}>
          <Text style={styles.menuItemText}>Home</Text>
        </Pressable>

        {/* já estamos em Times: apenas fecha o menu */}
        <Pressable style={styles.menuItem} onPress={onClose}>
          <Text style={styles.menuItemText}>Times</Text>
        </Pressable>

        {/* navega de verdade para a tela de Eventos */}
        <Pressable style={styles.menuItem} onPress={onEvents}>
          <Text style={styles.menuItemText}>Eventos</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <Pressable style={styles.overlay} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 90, // espaço extra no topo para não ficar embaixo do header fixo (sanduíche + título)
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  // Header travado no topo (sanduíche + título), sempre visível por cima do conteúdo
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    zIndex: 100,
    elevation: 10,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuIcon: { fontSize: 32, color: "#000" },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  count: { fontSize: 15, color: "#666", marginBottom: 10 },
  loadingText: { marginTop: 10, fontSize: 16 },
  error: { color: "red", fontSize: 16, textAlign: "center", marginBottom: 15 },
  list: { paddingBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  topCard: { flexDirection: "row", alignItems: "center" },
  teamText: { flex: 1, paddingRight: 15 },
  teamNumber: { fontSize: 25, fontWeight: "bold", color: "#111" },
  name: { fontSize: 19, fontWeight: "600", marginTop: 5, color: "#111" },
  logo: { width: 40, height: 40, marginLeft: 10 },
  logoPlaceholder: {
    width: 72,
    height: 72,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  logoPlaceholderText: { fontSize: 15, fontWeight: "bold", color: "#555" },
  logoPlaceholderTextSmall: { fontSize: 13 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 14 },
  info: { fontSize: 14, lineHeight: 20, marginTop: 6, color: "#222" },
  label: { fontWeight: "bold" },
  backButton: {
    paddingTop: 5,
    paddingBottom: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalContainer: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 280,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 55,
    zIndex: 2,
    elevation: 5,
  },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  closeButton: { alignSelf: "flex-end", padding: 8 },
  closeText: { fontSize: 24 },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  menuItem: { paddingVertical: 15 },
  menuItemText: { fontSize: 18 },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  logoutText: { fontSize: 18, color: "red", fontWeight: "bold" },
});