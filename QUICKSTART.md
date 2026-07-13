# 🚀 Guía Rápida: Escalado a Producción

## Qué se hizo

Chivato ahora tiene **soporte completo para producción con Supabase**:

✅ Autenticación (email/contraseña)  
✅ Persistencia en PostgreSQL  
✅ Upload de fotos en Storage  
✅ Sistema de moderación  
✅ Fallback a localStorage si Supabase no está configurado  
✅ TypeScript tipos completos  
✅ Build production optimizada  

## Quick Start (5 minutos)

### 1. Supabase (si quieres usar backend remoto)

```bash
# Ir a https://supabase.com
# Sign up → Create new project
# Esperar a que se cree (~1 min)
# Copiar: Settings → API → Project URL y Anon Key
```

### 2. Configuración local

```bash
# En la raíz del proyecto, crear .env.local:
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-clave]
VITE_USE_REMOTE_BACKEND=true
```

### 3. Setup Supabase (ejecutar una sola vez)

```bash
# En Supabase Dashboard:
# - SQL Editor → New query
# - Copiar TODO el contenido de: supabase/schema.sql
# - Click "Run"
# 
# - Storage → New bucket → "review-photos" → make public
```

### 4. Probar

```bash
npm install
npm run dev
# Abrir http://localhost:3000
# Click "Entrar" → Crear cuenta → Añadir reseña
```

### 5. Deploy (cuando esté listo)

```bash
npm run build

# Opción A: Vercel
vercel

# Opción B: Netlify
netlify deploy --prod --dir=dist

# Opción C: Tu servidor
# Copia dist/ a tu servidor + configura .env.local
```

## Sin Supabase (Modo Demo)

La app funciona perfectamente SIN hacer nada:

```bash
npm install
npm run dev
# Funciona en modo local con localStorage
# Los datos se guardan en el navegador
# Ideal para demos
```

## Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `.env.example` | Template de configuración |
| `docs/MIGRATION_TO_PRODUCTION.md` | Guía detallada |
| `ESCALADO_A_PRODUCCION.md` | Resumen técnico |
| `src/utils/supabase.ts` | Cliente Supabase + API |
| `src/utils/useProperties.ts` | State management |
| `src/components/AuthModal.tsx` | Login/Signup UI |
| `supabase/schema.sql` | Schema de base de datos |

## Errores Comunes

**"Supabase not configured"**  
→ Normal, significa que .env.local no está configurado. App usa localStorage.

**"Cannot upload photos"**  
→ Chequea que bucket "review-photos" existe y está público en Storage.

**"Auth failed"**  
→ Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son correctos.

**"Build falla"**  
→ `npm run lint` para ver errores, `npm install` para reinstalar.

## Validaciones

```bash
npm run lint    # ✓ 0 errores
npm run build   # ✓ Compila OK
npm run dev     # ✓ Dev server funciona
```

## Variables de Entorno

```env
# Requeridas para producción:
VITE_SUPABASE_URL=         # Tu proyecto Supabase URL
VITE_SUPABASE_ANON_KEY=    # Tu anon key
VITE_USE_REMOTE_BACKEND=true  # Habilitar Supabase

# Si no están configuradas:
# - La app funciona en modo local (localStorage)
# - Sin autenticación
# - Perfecto para MVP/demo
```

## Roadmap Post-Escalado

1. **Panel Admin:**
   - Revisar reseñas reportadas
   - Aprobar/rechazar comentarios
   - Ver estadísticas

2. **Email Notifications:**
   - Confirmación de registro
   - Alertas de favoritas
   - Digests

3. **API Pública:**
   - Exponer datos publicamente
   - Rate limiting

4. **Verificación:**
   - Confirmar email
   - Badgers de usuarios verificados

---

**¿Preguntas?** Revisa `docs/MIGRATION_TO_PRODUCTION.md` para guía detallada.

**Proyecto escalado y listo para producción.** 🎉
