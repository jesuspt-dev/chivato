# Chivato

MVP frontend para consultar y publicar reseñas de viviendas de alquiler. La app permite registrar viviendas, añadir reseñas con fotos, consultar alertas, buscar por dirección/barrio/incidencia y visualizar los inmuebles en mapa.

## Estado del proyecto

Esta versión es un **MVP local escalable a producción**. 

- **Modo demo:** Funciona sin backend usando `localStorage`, los datos se guardan en el navegador.
- **Modo producción:** Conectado a Supabase con autenticación, persistencia remota, moderación y almacenamiento de fotos.

## Cambios incluidos

- Nombre del proyecto `chivato`.
- Integración opcional con Supabase (backend remoto).
- Autenticación de usuarios con email/contraseña.
- Persistencia en Supabase + fallback a localStorage.
- Búsqueda de viviendas aunque no tengan reseñas.
- Búsqueda por dirección, barrio, ciudad, alertas, etiquetas y contenido.
- Mapa filtrable por texto.
- Geocoding con OpenStreetMap Nominatim.
- Puntuaciones dinámicas desde reseñas.
- Estados de verificación y moderación en reseñas.
- Botón de reporte de reseñas.
- Separación de chunks en Vite.
- Esquema SQL completo para Supabase en `supabase/schema.sql`.
- Documento de criterios de moderación en `docs/moderation-and-privacy.md`.
- Componente de autenticación con login/signup.
- Hook `useProperties` para centralizar lógica de estado.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- (Opcional para producción) Proyecto en Supabase.

## Instalación

```bash
npm install
```

## Desarrollo (Modo Local)

```bash
npm run dev
```

La app arranca por defecto en:

```text
http://localhost:3000
```

## Producción con Supabase

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto nuevo.
2. Copiar la URL del proyecto y la clave anónima (API key).

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_REMOTE_BACKEND=true
```

### 3. Crear el schema en Supabase

1. Abre el SQL Editor en tu dashboard de Supabase.
2. Copia el contenido de `supabase/schema.sql` y ejecuta en el editor.
3. Configura Storage:
   - Crea un bucket llamado `review-photos`.
   - Habilita acceso público a las fotos.

### 4. Configurar Storage para fotos

En Supabase Dashboard → Storage:

1. Crea un bucket llamado `review-photos`.
2. En Policies, permite:
   - SELECT (lectura pública)
   - INSERT/UPDATE para usuarios autenticados

### 5. Instalar dependencias con Supabase

```bash
npm install @supabase/supabase-js
```

### 6. Build y deploy

```bash
npm run build
npm run preview
```

Desplega a Vercel, Netlify o tu servidor preferido.

## Validación

```bash
npm run lint
npm run build
```

## Persistencia

### Modo Local (Demo)

```text
localStorage: chivato_properties_v2
localStorage: favorites
localStorage: recent_searches
localStorage: theme
```

El botón `Reset demo` restaura los datos iniciales.

### Modo Producción (Supabase)

- Base de datos PostgreSQL en Supabase
- Autenticación de usuarios
- Almacenamiento de fotos en Supabase Storage
- Historial de cambios mediante triggers

## Flujo de autenticación

1. Usuario se registra con email/contraseña (solo si Supabase está configurado).
2. Inicia sesión para guardar reseñas como usuario verificado.
3. Los datos se sincronizan automáticamente con Supabase.
4. Si Supabase no está disponible, la app funciona en modo local.

## Moderación

Las reseñas tienen estados:

- **pending:** Nueva reseña, pendiente de revisión.
- **published:** Reseña pública.
- **reported:** Reportada por usuarios.
- **hidden:** Oculta por moderadores.

Cuando una reseña recibe 3+ reportes, se marca como `reported` automáticamente.

## Roadmap post-MVP

1. ✅ Autenticación de usuarios
2. ✅ Persistencia en Supabase
3. ✅ Almacenamiento de fotos
4. 🔄 Panel de moderación (admin)
5. 🔄 Verificación de reseñas (email confirmation)
6. 🔄 Notificaciones en tiempo real
7. 🔄 Sistema de reputación de usuarios
8. 🔄 API pública

## Advertencia legal/producto

**No publiques la app al público sin:**

- Moderación activa (panel admin)
- Términos de uso y política de privacidad
- Verificación de identidad de usuarios
- Sistema de reportes y bloqueo de contenido

Las reseñas de viviendas pueden incluir contenido sensible o potencialmente difamatorio. Revisa `docs/moderation-and-privacy.md` para políticas completas.
