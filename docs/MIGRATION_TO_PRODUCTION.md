# Guía de Migración: MVP Local a Producción con Supabase

Este documento describe cómo escalar la app Chivato de un MVP local a una aplicación real con autenticación, persistencia remota y moderación.

## Paso 1: Crear proyecto en Supabase

1. **Registrarse en [supabase.com](https://supabase.com)**
2. **Crear nuevo proyecto:**
   - Dashboard → New project
   - Selecciona región (recomendado EU)
   - Crear base de datos con contraseña fuerte

3. **Obtener credenciales:**
   - Settings → API → URL del proyecto
   - Settings → API → Anon public key (Project API keys)

## Paso 2: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
VITE_USE_REMOTE_BACKEND=true
```

**Nota:** No commits `.env.local` a git. El archivo `.env.example` tiene un template.

## Paso 3: Ejecutar el schema SQL

1. **En Supabase Dashboard:**
   - SQL Editor → New query
   
2. **Copiar el contenido de `supabase/schema.sql`:**
   - Pega todo el contenido en el editor SQL
   - Click "Run"

3. **Verificar tablas creadas:**
   - Table Editor → Deberías ver: `properties`, `reviews`, `user_profiles`, `user_favorites`, `moderation_queue`, etc.

## Paso 4: Configurar Storage para fotos

1. **En Supabase Dashboard:**
   - Storage → New bucket
   - Nombre: `review-photos`
   - Hacer público: ✓

2. **Configurar permisos (Policies):**
   - Ve a "review-photos" bucket
   - Policies → CREATE NEW POLICY
   
   - **Para SELECT (lectura pública):**
     ```sql
     CREATE POLICY "Public Access" ON storage.objects
     FOR SELECT USING (bucket_id = 'review-photos');
     ```
   
   - **Para INSERT/UPDATE (usuarios autenticados):**
     ```sql
     CREATE POLICY "Allow authenticated uploads" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'review-photos' AND
       auth.role() = 'authenticated'
     );
     ```

## Paso 5: Instalar dependencias

```bash
npm install
```

Ya está incluida `@supabase/supabase-js` en `package.json`.

## Paso 6: Prueba local con Supabase

```bash
npm run dev
```

- Abre http://localhost:3000
- Deberías ver un botón "Entrar" en el header si Supabase está configurado
- Prueba crear una cuenta y añadir una reseña

## Paso 7: Build para producción

```bash
npm run build
```

Esto crea la carpeta `dist/` optimizada para producción.

## Paso 8: Deploy

### Opción A: Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones y configura las variables de entorno en Vercel Dashboard.

### Opción B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Opción C: Tu propio servidor

```bash
npm run preview  # Test local production build
# Copia la carpeta dist/ a tu servidor
```

## Características habilitadas en producción

### ✅ Autenticación
- Registro con email/contraseña
- Login/Logout
- Persistencia de sesión en Supabase

### ✅ Persistencia remota
- Propiedades guardadas en base de datos
- Reseñas sincronizadas remotamente
- Fallback automático a localStorage si Supabase no está disponible

### ✅ Almacenamiento de fotos
- Fotos de reseñas en Supabase Storage
- URLs públicas accesibles

### ✅ Moderación
- Estados de reseña: pending, published, reported, hidden
- Sistema de reportes con contador
- Tabla de cola de moderación para admin

### ✅ Búsqueda
- Índices en base de datos
- Búsqueda por ciudad, barrio, dirección
- Filtros en tiempo real

## Mantenimiento

### Backups automáticos
Supabase hace backups automáticos diarios. Puedes configurar backups manuales en Settings → Backups.

### Logs de actividad
- Revisa los logs en Supabase Dashboard → Logs
- Monitorea errores en tu app deployment (Vercel, Netlify, etc.)

### Escalado
Si la app crece:
1. Actualiza el plan de Supabase (más capacidad de almacenamiento)
2. Considera CDN para fotos (Cloudflare, etc.)
3. Añade un backend personalizado si necesitas lógica compleja

## Troubleshooting

### Problema: "Supabase not configured"
- Verifica que `.env.local` está en la raíz del proyecto
- Chequea las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Recarga la página

### Problema: Fotos no se suben
- Verifica que el bucket `review-photos` existe
- Chequea los permisos de Storage
- Revisa la consola del navegador para errores

### Problema: Datos no persisten
- Verifica que el esquema SQL se ejecutó sin errores
- Chequea las RLS policies en la tabla `properties`

## Próximos pasos

1. **Panel de moderación:**
   - Crear dashboard admin
   - Revisar reseñas reportadas
   - Aprobar/rechazar moderación

2. **Notificaciones:**
   - Email a propietarios cuando se reporta propiedad
   - Webhooks para eventos

3. **API pública:**
   - Exponer datos de propiedades públicamente
   - Rate limiting

4. **Verificación de email:**
   - Confirmar email en registro
   - Re-envío de verificación

5. **Reputación de usuarios:**
   - Score de reputación
   - Badgers para usuarios verificados

---

Para preguntas o issues, revisa la [documentación de Supabase](https://supabase.com/docs).
