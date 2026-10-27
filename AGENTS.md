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

## Reglas de rendimiento y estado

Estas reglas son obligatorias en todas las fases.

### Estado y reactividad

- Gestionar el estado local y de servicios con `signal()` y los valores derivados con `computed()`. Usar `effect()` para efectos secundarios solo cuando sea imprescindible; nunca para derivar estado.
- Declarar entradas y salidas con las funciones `input()`, `input.required()`, `output()` y `model()`; no usar los decoradores `@Input` ni `@Output`.
- Consultar elementos de vista con `viewChild()` y `viewChildren()`. Usar `inject()` para la inyección de dependencias.
- Exponer las peticiones HTTP como signals mediante `httpResource`, `resource` o `toSignal()`, y evitar las suscripciones manuales. Si una suscripción es necesaria, usar `takeUntilDestroyed()`.
- No duplicar estado con `async` pipe junto a signals. El uso de `any` está prohibido.

### Plantillas y change detection

- Aplicar `ChangeDetectionStrategy.OnPush` en todos los componentes.
- Usar el control flow nativo (`@if`, `@for` con `track` obligatorio por `id`, `@switch` y `@defer`) en lugar de `*ngIf` o `*ngFor`.
- No llamar funciones ni getters costosos desde las plantillas; usar `computed()` o pipes puros.
- Usar `@defer (on viewport)` o `@defer (on idle)` para componentes pesados, como gráficos o tablas de datos grandes.
- Usar `NgOptimizedImage` para las portadas (`portada_url`), con `width`, `height` y `loading="lazy"`.

### Carga y bundle

- Cargar todas las rutas de forma diferida con `loadComponent` y configurar `PreloadAllModules`.
- Cargar Chart.js, jsPDF y jspdf-autotable mediante `import()` dinámico solo cuando se utilicen (dashboard o exportación), para excluirlos del bundle inicial.
- Importar solo los componentes Ionic standalone necesarios, sin `IonicModule`, y registrar únicamente los módulos de Chart.js que se utilicen.
- Usar en Firebase solo los imports modulares de `firebase/app` y `firebase/firestore`.

### Datos

- Paginar en el servidor con PostgREST usando `Range` o `limit` y `offset`, además de la cabecera `Prefer: count=exact`, en el listado. Limitar también las consultas de actividades con `limit`.
- Aplicar búsqueda con debounce de 300 ms y `distinctUntilChanged()`.
- Seleccionar solo las columnas necesarias en los listados: `?select=id,titulo,precio,stock,plataforma,genero,disponible`.
- Cachear el catálogo en un signal del servicio e invalidar la caché después de crear, editar o eliminar registros.
