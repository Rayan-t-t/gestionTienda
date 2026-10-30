/**
 * Modelo que representa un videojuego en la base de datos.
 * Corresponde a la tabla 'video-juegos' de Supabase (PostgREST).
 */
export interface Videojuego {
  id?: number;
  created_at?: string;
  titulo: string;
  codigo_sku: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  valoracion?: number | null;
  fecha_lanzamiento?: string | null;
  disponible: boolean;
  plataforma: 'PC' | 'PS5' | 'Xbox' | 'Switch';
  genero: 'RPG' | 'Accion' | 'Deportes' | 'Estrategia' | 'Aventura';
  etiquetas?: string[] | null;
  requisitos?: Requisitos | null;
  portada_url?: string | null;
}

/**
 * Requisitos mínimos del videojuego.
 */
export interface Requisitos {
  so?: string;
  procesador?: string;
  ram?: string;
  gpu?: string;
  almacenamiento?: string;
}

/**
 * Campos mostrados en el listado resumido del catálogo.
 */
export type VideojuegoListado = Pick<
  Videojuego,
  | 'id'
  | 'titulo'
  | 'precio'
  | 'stock'
  | 'plataforma'
  | 'genero'
  | 'disponible'
  | 'valoracion'
  | 'portada_url'
>;

/**
 * Campos necesarios para los cálculos del dashboard.
 */
export type VideojuegoInforme = Pick<
  Videojuego,
  'precio' | 'stock' | 'valoracion' | 'plataforma' | 'genero'
>;
