import frcApi from "./frcApi";

export interface Event {
  code: string;
  name: string;
  type: string;
  districtCode: string | null;
  week: number | null;
  venue: string | null;
  city: string | null;
  stateprov: string | null;
  country: string | null;
  dateStart: string;
  dateEnd: string;
  website: string | null;
  timezone: string | null;
}

// Temporada atual
const SEASON_ATUAL = new Date().getFullYear();

// Busca e filtra os eventos do Brasil
export async function getEventosBrasil(
  season: number = SEASON_ATUAL,
): Promise<Event[]> {
  const eventos = await getEventosTemporada(season);

  const eventosBrasil = eventos.filter(
    (evento) =>
      evento.country?.toLowerCase() === "brazil",
  );

  // Ordena pela data de início
  eventosBrasil.sort((a, b) =>
    a.dateStart.localeCompare(b.dateStart),
  );

  return eventosBrasil;
}

// Busca os eventos da temporada
async function getEventosTemporada(
  season: number,
): Promise<Event[]> {
  const response = await frcApi.get(
    `/${season}/events`,
  );

  return response.data.Events ?? response.data.events ?? [];
}