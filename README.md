# Chivato

MVP frontend para consultar y publicar reseñas de viviendas de alquiler. La app permite registrar viviendas, añadir reseñas con fotos, consultar alertas, buscar por dirección/barrio/incidencia y visualizar los inmuebles en mapa.

## Estado del proyecto

Esta versión es un MVP local. Funciona sin backend usando `localStorage`, por lo que los datos se guardan en el navegador del usuario. Para producción hay que conectar Supabase/Firebase o un backend propio.

## Cambios incluidos

- Nombre del proyecto cambiado a `chivato`.
- Limpieza de dependencias no usadas de AI Studio/Gemini/Express.
- Imágenes movidas a `public/images` para que funcionen en build.
- Persistencia local de viviendas, reseñas, fotos, favoritos e historial reciente.
- Búsqueda de viviendas aunque no tengan reseñas.
- Búsqueda por dirección, barrio, ciudad, alertas, etiquetas y contenido de reseñas.
- Mapa filtrable por texto.
- Geocoding con OpenStreetMap Nominatim y fallback local por ciudad.
- Puntuaciones recalculadas desde las reseñas reales.
- Estados de verificación y moderación en reseñas.
- Botón de reporte de reseñas.
- Separación de chunks en Vite para evitar bundles excesivos.
- Esquema SQL inicial para Supabase en `supabase/schema.sql`.
- Documento de criterios de moderación y privacidad en `docs/moderation-and-privacy.md`.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app arranca por defecto en:

```text
http://localhost:3000
```

## Validación

```bash
npm run lint
npm run build
```

## Producción

```bash
npm run build
npm run preview
```

## Persistencia actual

La versión actual guarda datos en:

```text
localStorage: chivato_properties_v2
localStorage: favorites
localStorage: recent_searches
localStorage: theme
```

El botón `Reset demo` restaura los datos iniciales.

## Backend recomendado

Para pasar de MVP a app real:

1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Crear buckets de Storage para fotos de reseñas.
4. Añadir autenticación.
5. Sustituir el almacenamiento local por llamadas a Supabase.
6. Añadir políticas RLS.
7. Crear panel de moderación.

Variables preparadas en `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Advertencia legal/producto

No publiques la app abierta al público sin moderación, términos de uso y política de privacidad. Las reseñas de viviendas pueden incluir contenido sensible o potencialmente difamatorio si no se controlan. Revisa `docs/moderation-and-privacy.md`.
