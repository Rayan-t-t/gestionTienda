/** Hosts de YouTube aceptados para los tráileres. */
const HOSTS_YOUTUBE = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be'
]);

const PATRON_ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extrae el identificador de vídeo de una URL de YouTube (watch, youtu.be, embed, shorts o live).
 * Devuelve null si la URL no es válida o no pertenece a YouTube.
 */
export function extraerIdYoutube(url: string | null | undefined): string | null {
  const texto = url?.trim();
  if (!texto) {
    return null;
  }

  let direccion: URL;
  try {
    direccion = new URL(texto);
  } catch {
    return null;
  }

  if (direccion.protocol !== 'https:' && direccion.protocol !== 'http:') {
    return null;
  }
  if (!HOSTS_YOUTUBE.has(direccion.hostname.toLowerCase())) {
    return null;
  }

  let candidato: string | null = null;
  if (direccion.hostname.toLowerCase() === 'youtu.be') {
    candidato = direccion.pathname.split('/')[1] ?? null;
  } else if (direccion.pathname === '/watch') {
    candidato = direccion.searchParams.get('v');
  } else {
    const [, tipo, id] = direccion.pathname.split('/');
    if (tipo === 'embed' || tipo === 'shorts' || tipo === 'live' || tipo === 'v') {
      candidato = id ?? null;
    }
  }

  return candidato !== null && PATRON_ID_YOUTUBE.test(candidato) ? candidato : null;
}
