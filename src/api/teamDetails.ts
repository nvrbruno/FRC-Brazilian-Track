import frcApi from './frcApi';

const season = 2026;

// Dados de um evento em que a equipe participou
export interface TeamEvent {
  code: string;
  name: string;
  type: string;
  venue: string | null;
  city: string | null;
  stateprov: string | null;
  country: string | null;
  dateStart: string;
  dateEnd: string;
}

// Prêmio recebido pela equipe (geral ou de um evento específico)
export interface TeamAward {
  awardId: number;
  teamId: number | null;
  eventId: number | null;
  eventDivisionId: number | null;
  eventCode: string;
  name: string;
  series: number | null;
  teamNumber: number | null;
  schoolName: string | null;
  fullTeamName: string | null;
  person: string | null;
}

interface EventsResponse {
  Events: TeamEvent[];
}

interface AwardsResponse {
  Awards: TeamAward[];
}

interface EventAwardsResponse {
  Awards: TeamAward[];
}

// Partida disputada pela equipe
export interface TeamMatch {
  match?: number;
  matchNumber?: number;
  description?: string;
  level?: string;
  tournamentLevel?: string;
  actualStart?: string;
  postResult?: string;
  team?: number;
  alliance?: string;
  station?: string;
  disqualified?: boolean;
  scoreFinal?: number;
  scoreAuto?: number;
  scoreFoul?: number;
  [key: string]: unknown; // campos extras variam conforme o nível/tipo da partida
}

interface MatchesResponse {
  Matches?: TeamMatch[];
  matches?: TeamMatch[]; // API às vezes retorna a chave em minúsculo
}

// Registro de pontuação detalhado de uma partida (estrutura livre)
export interface TeamScore {
  [key: string]: unknown;
}

interface ScoresResponse {
  Scores?: TeamScore[];
  scores?: TeamScore[];
}

// Busca os eventos em que a equipe competiu na temporada
export async function getEventosEquipe(
  teamNumber: number
): Promise<TeamEvent[]> {
  const response =
    await frcApi.get<EventsResponse>(
      `/${season}/events`,
      {
        params: {
          teamNumber,
        },
      }
    );

  return response.data.Events ?? [];
}

// Busca todos os prêmios da equipe na temporada (todos os eventos)
export async function getPremiosEquipe(
  teamNumber: number
): Promise<TeamAward[]> {
  const response =
    await frcApi.get<AwardsResponse>(
      `/${season}/awards/team/${teamNumber}`
    );

  return response.data.Awards ?? [];
}

// Busca os prêmios da equipe em um evento específico
export async function getPremiosEventoEquipe(
  eventCode: string,
  teamNumber: number
): Promise<TeamAward[]> {
  try {
    const response =
      await frcApi.get<EventAwardsResponse>(
        `/${season}/awards/eventteam/${eventCode}/${teamNumber}`
      );

    return response.data.Awards ?? [];
  } catch {
    // evento pode não ter prêmios registrados para a equipe
    return [];
  }
}

// Busca as partidas da equipe em um evento específico
export async function getPartidasEquipe(
  eventCode: string,
  teamNumber: number
): Promise<TeamMatch[]> {
  try {
    const response =
      await frcApi.get<MatchesResponse>(
        `/${season}/matches/${eventCode}`,
        {
          params: {
            teamNumber,
          },
        }
      );

    return (
      response.data.Matches ??
      response.data.matches ??
      []
    );
  } catch {
    return [];
  }
}

// Busca as pontuações detalhadas de um evento/nível (ex: qualificação, playoff)
export async function getPontuacoesEvento(
  eventCode: string,
  tournamentLevel: string
): Promise<TeamScore[]> {
  try {
    const response =
      await frcApi.get<ScoresResponse>(
        `/${season}/scores/${eventCode}/${tournamentLevel}`,
        {
          params: {
            start: 1,
            end: 100, // limite de registros por página
          },
        }
      );

    return (
      response.data.Scores ??
      response.data.scores ??
      []
    );
  } catch {
    return [];
  }
}