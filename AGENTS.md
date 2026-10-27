# Contexto del proyecto

- Aplicación Ionic + Angular para gestionar una tienda de videojuegos. Proyecto de Desarrollo de Interfaces (DAM).
- Usar componentes standalone, signals, `ChangeDetectionStrategy.OnPush` y carga diferida con `loadComponent`.
- Escribir el código y los comentarios JSDoc en español.
- Mantener TypeScript estricto; está prohibido usar `any`.
- No incluir secretos en el repositorio.
- Supabase: autenticación REST y PostgREST; la tabla es `video-juegos`. El rol se obtiene de `app_metadata.role` y puede ser `admin` o `user`.
- Firebase Firestore: colección `actividad` para auditoría.

## Tabla `video-juegos`

| Columna | Tipo / valores |
| --- | --- |
| `id` | Identificador |
| `created_at` | Fecha de creación |
| `titulo` | Texto |
| `codigo_sku` | Texto único |
| `descripcion` | Texto |
| `precio` | Número |
| `stock` | Número |
| `valoracion` | Número de 0 a 10 |
| `fecha_lanzamiento` | Fecha |
| `disponible` | Booleano |
| `plataforma` | `PC`, `PS5`, `Xbox` o `Switch` |
| `genero` | `RPG`, `Accion`, `Deportes`, `Estrategia` o `Aventura` |
| `etiquetas` | `text[]` |
| `requisitos` | `jsonb` |
| `portada_url` | URL de portada |

## Flujo Git

- Ramas permanentes: `main` y `develop`; ramas de trabajo: `feature/*`.
- Trabajar siempre en una rama `feature/*`.
- Fusionar las ramas de funcionalidad en `develop` con `--no-ff`.
