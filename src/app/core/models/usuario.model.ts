/**
 * Modelo que representa un usuario autenticado con roles.
 */
export interface Usuario {
  id: string;
  email: string;
  role: 'admin' | 'user';
  access_token?: string;
  refresh_token?: string;
}
