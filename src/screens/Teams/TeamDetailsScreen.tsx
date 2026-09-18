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

interface TeamDetailsScreenProps {
  team: Team & {
    avatar: string | null;
  };
  onBack: () => void;
  onLogout: () => void;
}

// evento com seus prêmios, partidas e pontuações já agregados
interface EventWithData extends TeamEvent {
  awards: TeamAward[];
  matches: TeamMatch[];
  scores: TeamScore[];
}

export default function TeamDetailsScreen({
  team,
  onBack,
  onLogout,
}: TeamDetailsScreenProps) {
  const [events, setEvents] = useState<EventWithData[]>([]);
  const [awards, setAwards] = useState<TeamAward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // carrega eventos, prêmios, partidas e pontuações da equipe ao montar/trocar de equipe
  useEffect(() => {
    async function carregarDetalhes() {
      try {
        setLoading(true);
        setError("");

        // busca eventos e prêmios gerais da equipe em paralelo
        const [eventosEquipe, premiosEquipe] = await Promise.all([
          getEventosEquipe(team.teamNumber),
          getPremiosEquipe(team.teamNumber),
        ]);

        setAwards(premiosEquipe);

        // para cada evento, busca prêmios do evento e partidas em paralelo
        const eventosComDados = await Promise.all(
          eventosEquipe.map(async (event) => {
            const [premiosEvento, partidas] = await Promise.all([
              getPremiosEventoEquipe(event.code, team.teamNumber),
              getPartidasEquipe(event.code, team.teamNumber),
            ]);

            // descobre quais níveis de torneio (quali, playoff etc.) a equipe jogou
            const levels = Array.from(
              new Set(
                partidas
                  .map((match) => match.level ?? match.tournamentLevel)
                  .filter((level): level is string => Boolean(level)),
              ),
            );

            // busca as pontuações de cada nível encontrado e junta tudo numa lista só
            const scoreLists = await Promise.all(
              levels.map((level) => getPontuacoesEvento(event.code, level)),
            );

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
        setError("Não foi possível carregar os detalhes da equipe.");
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [team.teamNumber]);

  // fecha o menu e dispara o logout
  async function handleLogout() {
    setMenuOpen(false);
    await onLogout();
  }

  // estado de carregamento
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Carregando detalhes da equipe...</Text>
      </View>
    );
  }

  // estado de erro
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Button title="Voltar" onPress={onBack} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSpace} />

        {/* card com os dados cadastrais da equipe */}
        <View style={styles.teamCard}>
          <View style={styles.teamTop}>
            <View style={styles.teamText}>
              <Text style={styles.teamNumber}>#{team.teamNumber}</Text>

              <Text style={styles.teamName}>
                {team.nameShort || team.nameFull}
              </Text>
            </View>

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

          {/* linhas de info só aparecem se o campo tiver valor (ver componente Info) */}
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

        {/* lista de prêmios gerais da equipe na temporada */}
        <Text style={styles.sectionTitle}>Prêmios</Text>

        {awards.length === 0 ? (
          <Text style={styles.empty}>Nenhum prêmio encontrado.</Text>
        ) : (
          awards.map((award, index) => (
            <View key={`${award.awardId}-${index}`} style={styles.awardCard}>
              <Text style={styles.awardName}>{award.name}</Text>

              <Text style={styles.awardEvent}>Evento: {award.eventCode}</Text>
            </View>
          ))
        )}

        {/* lista de eventos, cada um com seus prêmios, partidas e pontuações */}
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

              {/* prêmios ganhos especificamente neste evento */}
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

              {/* partidas disputadas neste evento */}
              <Text style={styles.subTitle}>Partidas</Text>

              {event.matches.length === 0 ? (
                <Text style={styles.empty}>Nenhuma partida encontrada.</Text>
              ) : (
                event.matches.map((match, index) => (
                  <View key={`${event.code}-${index}`} style={styles.matchCard}>
                    {/* nome do nível/número da partida, com fallback entre campos alternativos da API */}
                    <Text style={styles.matchTitle}>
                      {match.level ?? match.tournamentLevel ?? "Partida"}{" "}
                      {match.match ?? match.matchNumber ?? ""}
                    </Text>

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

              {/* dados de pontuação detalhados, só mostra a contagem (estrutura livre) */}
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

        <View style={styles.backButton}>
          <Button title="Voltar" onPress={onBack} />
        </View>
      </ScrollView>

      {/* menu lateral (drawer) */}
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

            <Text style={styles.sidebarTitle}>FRC Brazilian Track</Text>

            <View style={styles.divider} />

            {/* item Times: volta para a listagem de equipes */}
            <Pressable style={styles.menuItem} onPress={onBack}>
              <Text style={styles.menuItemText}>Times</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.menuItemText}>Eventos</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

// linha de rótulo + valor; não renderiza nada se o valor for vazio/nulo
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
    paddingTop: 80,
    paddingBottom: 30,
  },

  headerSpace: {
    height: 5,
  },

  menuButton: {
    position: "absolute",
    top: 35,
    left: 20,
    zIndex: 10,
    padding: 8,
  },

  menuIcon: {
    fontSize: 32,
    color: "#000",
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
