import frcApi from './frcApi';

// Dados cadastrais de uma equipe FRC
export interface Team {
  teamNumber: number;
  nameFull: string;
  nameShort: string;
  schoolName: string | null;
  city: string;
  stateProv: string;
  country: string;
  website: string | null;
  rookieYear: number;
  robotName: string | null;
  districtCode: string | null;
}

// Avatar/logo da equipe em base64
export interface TeamAvatar {
  teamNumber: number;
  encodedAvatar: string | null;
}

interface TeamsResponse {
  teams: Team[];
  teamCountTotal: number;
  teamCountPage: number;
  pageCurrent: number;
  pageTotal: number;
}

interface AvatarsResponse {
  teams: TeamAvatar[];
  teamCountTotal: number;
  teamCountPage: number;
  pageCurrent: number;
  pageTotal: number;
}

// Busca todas as equipes do Brasil, percorrendo todas as páginas da API
export async function getEquipesBrasil(): Promise<Team[]> {
  const season = 2026;

  // primeira página define o total de páginas a percorrer
  const firstResponse =
    await frcApi.get<TeamsResponse>(
      `/${season}/teams?page=1`
    );

  const totalPages =
    firstResponse.data.pageTotal;

  let equipes =
    firstResponse.data.teams ?? [];

  // busca as páginas restantes e acumula os resultados
  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {
    const response =
      await frcApi.get<TeamsResponse>(
        `/${season}/teams?page=${page}`
      );

    equipes = [
      ...equipes,
      ...(response.data.teams ?? []),
    ];
  }

  // filtra apenas equipes brasileiras
  return equipes.filter(
    (team) =>
      team.country?.toLowerCase() === 'brazil'
  );
}

// Busca o avatar de uma equipe específica e monta a data URI
export async function getAvatarEquipe(
  teamNumber: number
): Promise<string | null> {
  const season = 2026;

  try {
    const response =
      await frcApi.get<AvatarsResponse>(
        `/${season}/avatars`,
        {
          params: {
            teamNumber,
          },
        }
      );

    const equipe =
      response.data.teams?.find(
        (item) =>
          String(item.teamNumber) ===
          String(teamNumber)
      );

    if (!equipe?.encodedAvatar) {
      return null; // equipe sem avatar cadastrado
    }

    return `data:image/png;base64,${equipe.encodedAvatar}`;
  } catch {
    return null;
  }
}