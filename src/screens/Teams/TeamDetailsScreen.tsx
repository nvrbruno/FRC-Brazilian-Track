import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Button,
  Image,
  Pressable,
  Modal,
} from "react-native";

import { Team } from "../../api/teams";

import {
  getEventosEquipe,
  getPremiosEquipe,
  getPremiosEventoEquipe,
  getPartidasEquipe,
  getPontuacoesEvento,
  TeamEvent,
  TeamAward,
  TeamMatch,
  TeamScore,
} from "../../api/teamDetails";

// Props recebidas pela tela: os dados básicos do time (+ avatar já resolvido)
// e callbacks de navegação/ação vindos do componente pai.
interface TeamDetailsScreenProps {
  team: Team & {
    avatar: string | null;
  };
  onBack: () => void;
  onLogout: () => void;
  onOpenHome: () => void;
  onOpenEvents: () => void; // navega para a tela de Eventos
}

// Estende TeamEvent para já carregar, junto do evento, os prêmios,
// partidas e pontuações relacionados a ele (dados "achatados" em um só objeto).
interface EventWithData extends TeamEvent {
  awards: TeamAward[];
  matches: TeamMatch[];
  scores: TeamScore[];
}

export default function TeamDetailsScreen({
  team,
  onBack,
  onLogout,
  onOpenHome,
  onOpenEvents,
}: TeamDetailsScreenProps) {
  // Lista de eventos já enriquecida com prêmios/partidas/pontuações
  const [events, setEvents] = useState<EventWithData[]>([]);
  // Prêmios gerais da equipe (não vinculados a um evento específico na tela)
  const [awards, setAwards] = useState<TeamAward[]>([]);
  // Controla exibição do spinner de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  // Controla se o menu lateral (Modal) está aberto
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  // Mensagem de erro amigável exibida ao usuário
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        setLoading(true);
        setError("");

        // Busca eventos e prêmios da equipe em paralelo (independentes entre si)
        const [eventosEquipe, premiosEquipe] = await Promise.all([
          getEventosEquipe(team.teamNumber),
          getPremiosEquipe(team.teamNumber),
        ]);

        setAwards(premiosEquipe);

        // Para cada evento, busca em paralelo os prêmios e partidas da equipe
        // NAQUELE evento específico (map + Promise.all = paralelismo entre eventos)
        const eventosComDados = await Promise.all(
          eventosEquipe.map(async (event) => {
            const [premiosEvento, partidas] = await Promise.all([
              getPremiosEventoEquipe(event.code, team.teamNumber),
              getPartidasEquipe(event.code, team.teamNumber),
            ]);

            // Extrai os "níveis" de disputa (ex: qualificação, playoff) presentes
            // nas partidas da equipe, sem duplicados (Set) e sem valores vazios
            const levels = Array.from(
              new Set(
                partidas
                  .map((match) => match.level ?? match.tournamentLevel)
                  .filter((level): level is string => Boolean(level)),
              ),
            );

            // Busca as pontuações do evento para cada nível encontrado, em paralelo
            const scoreLists = await Promise.all(
              levels.map((level) => getPontuacoesEvento(event.code, level)),
            );

            // Achata a lista de listas de pontuações em uma única lista
            const scores = scoreLists.flat();

            return {
              ...event,
              awards: premiosEvento,
              matches: partidas,
              scores,
            };
          }),
        );

        setEvents(eventosComDados);
      } catch {
        // OBS: erro real não é logado aqui, só mostra mensagem genérica ao usuário
        setError("Não foi possível carregar os detalhes da equipe.");
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
    // Reexecuta sempre que o número do time mudar
  }, [team.teamNumber]);

  // Fecha o menu e navega para a Home
  function handleOpenHome() {
    setMenuOpen(false);
    onOpenHome();
  }

  // Fecha o menu e volta para a lista de times
  function handleOpenTeams() {
    setMenuOpen(false);
    onBack();
  }

  // Fecha o menu e navega para a tela de Eventos
  function handleOpenEvents() {
    setMenuOpen(false);
    onOpenEvents();
  }

  // Fecha o menu e executa logout (assíncrono)
  async function handleLogout() {
    setMenuOpen(false);
    await onLogout();
  }

  // ----- ESTADO: CARREGANDO -----
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header fixo: sanduíche + título lado a lado, travado no topo */}
        <View style={styles.fixedHeader}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {team.nameShort || team.nameFull}
          </Text>
        </View>

        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Carregando detalhes da equipe...
          </Text>
        </View>

        {/* Menu lateral também disponível durante o loading */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Menu
            onClose={() => setMenuOpen(false)}
            onHome={handleOpenHome}
            onTeams={handleOpenTeams}
            onEvents={handleOpenEvents}
            onLogout={handleLogout}
          />
        </Modal>
      </View>
    );
  }

  // ----- ESTADO: ERRO -----
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.fixedHeader}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {team.nameShort || team.nameFull}
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
            onTeams={handleOpenTeams}
            onEvents={handleOpenEvents}
            onLogout={handleLogout}
          />
        </Modal>
      </View>
    );
  }

  // ----- ESTADO: SUCESSO (conteúdo principal) -----
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pequeno espaçador antes do card do time */}
        <View style={styles.headerSpace} />

        {/* Card com informações gerais do time */}
        <View style={styles.teamCard}>
          <View style={styles.teamTop}>
            <View style={styles.teamText}>
              <Text style={styles.teamNumber}>#{team.teamNumber}</Text>

              <Text style={styles.teamName}>
                {team.nameShort || team.nameFull}
              </Text>
            </View>

            {/* Mostra avatar/logo se existir, senão mostra placeholder com o número */}
            {team.avatar ? (
              <Image
                source={{
                  uri: team.avatar,
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  #{team.teamNumber}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Cada Info só renderiza se o valor existir (ver componente Info abaixo) */}
          <Info label="Nome completo" value={team.nameFull} />

          <Info label="Escola" value={team.schoolName} />

          <Info
            label="Localização"
            value={[team.city, team.stateProv].filter(Boolean).join(" - ")}
          />

          <Info label="País" value={team.country} />

          <Info label="Rookie" value={String(team.rookieYear)} />

          <Info label="Robô" value={team.robotName} />

          <Info label="Distrito" value={team.districtCode} />

          <Info label="Site" value={team.website} />
        </View>

        {/* Seção: prêmios gerais da equipe (fora do contexto de evento) */}
        <Text style={styles.sectionTitle}>Prêmios</Text>

        {awards.length === 0 ? (
          <Text style={styles.empty}>Nenhum prêmio encontrado.</Text>
        ) : (
          awards.map((award, index) => (
            // key combina id + index para evitar colisão caso haja ids repetidos
            <View key={`${award.awardId}-${index}`} style={styles.awardCard}>
              <Text style={styles.awardName}>{award.name}</Text>

              <Text style={styles.awardEvent}>Evento: {award.eventCode}</Text>
            </View>
          ))
        )}

        {/* Seção: lista de eventos, cada um com suas sub-seções */}
        <Text style={styles.sectionTitle}>Eventos</Text>

        {events.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento encontrado.</Text>
        ) : (
          events.map((event) => (
            <View key={event.code} style={styles.eventCard}>
              <Text style={styles.eventName}>{event.name}</Text>

              <Text style={styles.eventInfo}>Código: {event.code}</Text>

              <Text style={styles.eventInfo}>
                Local: {event.city}
                {event.stateprov ? ` - ${event.stateprov}` : ""}
              </Text>

              <Text style={styles.eventInfo}>Tipo: {event.type}</Text>

              {/* Sub-seção: prêmios ganhos NESTE evento */}
              <Text style={styles.subTitle}>Prêmios no evento</Text>

              {event.awards.length === 0 ? (
                <Text style={styles.empty}>Nenhum prêmio.</Text>
              ) : (
                event.awards.map((award, index) => (
                  <Text
                    key={`${award.awardId}-${index}`}
                    style={styles.listText}
                  >
                    • {award.name}
                  </Text>
                ))
              )}

              {/* Sub-seção: partidas jogadas pela equipe neste evento */}
              <Text style={styles.subTitle}>Partidas</Text>

              {event.matches.length === 0 ? (
                <Text style={styles.empty}>Nenhuma partida encontrada.</Text>
              ) : (
                event.matches.map((match, index) => (
                  <View key={`${event.code}-${index}`} style={styles.matchCard}>
                    {/* Nome/nível da partida com fallback caso os campos venham com nomes diferentes da API */}
                    <Text style={styles.matchTitle}>
                      {match.level ?? match.tournamentLevel ?? "Partida"}{" "}
                      {match.match ?? match.matchNumber ?? ""}
                    </Text>

                    {/* Campos opcionais: só renderiza se existirem */}
                    {match.description ? (
                      <Text style={styles.matchInfo}>{match.description}</Text>
                    ) : null}

                    {match.alliance ? (
                      <Text style={styles.matchInfo}>
                        Aliança: {match.alliance}
                      </Text>
                    ) : null}

                    {match.station ? (
                      <Text style={styles.matchInfo}>
                        Posição: {match.station}
                      </Text>
                    ) : null}

                    {match.scoreFinal !== undefined ? (
                      <Text style={styles.matchInfo}>
                        Pontuação: {match.scoreFinal}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}

              {/* Sub-seção: apenas mostra a QUANTIDADE de registros de pontuação,
                  não o detalhe de cada um (poderia ser expandido futuramente) */}
              <Text style={styles.subTitle}>Dados de pontuação</Text>

              {event.scores.length === 0 ? (
                <Text style={styles.empty}>Nenhuma pontuação encontrada.</Text>
              ) : (
                <Text style={styles.matchInfo}>
                  {event.scores.length} registros de pontuação encontrados.
                </Text>
              )}
            </View>
          ))
        )}

        {/* Botão de voltar ao final da lista, dentro do ScrollView */}
        <View style={styles.backButton}>
          <Button title="Voltar" onPress={onBack} />
        </View>
      </ScrollView>

      {/* HEADER FIXO, FORA DO SCROLLVIEW: sanduíche + título travados no topo */}
      <View style={styles.fixedHeader}>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {team.nameShort || team.nameFull}
        </Text>
      </View>

      {/* BARRA LATERAL FIXA (menu em Modal, abre por cima de tudo) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Menu
          onClose={() => setMenuOpen(false)}
          onHome={handleOpenHome}
          onTeams={handleOpenTeams}
          onEvents={handleOpenEvents}
          onLogout={handleLogout}
        />
      </Modal>
    </View>
  );
}

// Props do menu lateral: fechar e navegar para cada destino
interface MenuProps {
  onClose: () => void;
  onHome: () => void;
  onTeams: () => void;
  onEvents: () => void;
  onLogout: () => void;
}

// Componente do menu lateral (sidebar) exibido dentro do Modal.
// Composto por: sidebar (conteúdo) + overlay (área escura clicável para fechar).
function Menu({ onClose, onHome, onTeams, onEvents, onLogout }: MenuProps) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.sidebar}>
        {/* Botão de fechar o menu */}
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.sidebarTitle}>FRC Brazilian Track</Text>

        <View style={styles.divider} />

        <Pressable style={styles.menuItem} onPress={onHome}>
          <Text style={styles.menuItemText}>Home</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={onTeams}>
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

      {/* Área escura fora da sidebar; clicar nela também fecha o menu */}
      <Pressable style={styles.overlay} onPress={onClose} />
    </View>
  );
}

// Componente auxiliar: renderiza "Label: valor" e não renderiza nada
// se o valor for vazio/nulo/undefined (evita linhas em branco no card)
function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <Text style={styles.info}>
      <Text style={styles.label}>{label}:</Text> {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 90, // espaço extra no topo para não ficar embaixo do header fixo (sanduíche + título)
    paddingBottom: 30,
  },

  headerSpace: {
    height: 5,
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
    zIndex: 100, // garante que fique acima do conteúdo do ScrollView
    elevation: 10, // equivalente ao zIndex no Android
  },

  menuButton: {
    padding: 8,
    marginRight: 8,
  },

  menuIcon: {
    fontSize: 32,
    color: "#000",
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  teamCard: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 16,
  },

  teamTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamText: {
    flex: 1,
    paddingRight: 15,
  },

  teamNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },

  teamName: {
    fontSize: 21,
    fontWeight: "600",
    marginTop: 6,
  },

  logo: {
    width: 45,
    height: 45,
  },

  logoPlaceholder: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  logoPlaceholderText: {
    fontSize: 13,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 14,
  },

  info: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 7,
  },

  label: {
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 10,
  },

  awardCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  awardName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  awardEvent: {
    marginTop: 5,
    color: "#666",
  },

  eventCard: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  eventInfo: {
    fontSize: 14,
    marginTop: 3,
  },

  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 6,
  },

  listText: {
    fontSize: 14,
    marginTop: 4,
  },

  matchCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },

  matchTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  matchInfo: {
    fontSize: 14,
    marginTop: 3,
  },

  empty: {
    color: "#666",
    fontSize: 14,
  },

  backButton: {
    marginTop: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 280,
    height: "100%",
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