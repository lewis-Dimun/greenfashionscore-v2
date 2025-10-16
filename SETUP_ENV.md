# 🔧 Configuración de Variables de Entorno

⚠️ **SECURITY WARNING**: This file previously contained actual production secrets. 
**NEVER commit real secrets to version control!**

## Paso 1: Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# =============================================================================
# DATABASE - PostgreSQL (Supabase)
# =============================================================================
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# =============================================================================
# SUPABASE - Backend as a Service
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# =============================================================================
# SUPABASE - Service Role Key (Server-side only)
# =============================================================================
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 📝 Próximos Pasos

### 1. Actualizar `.env.local` (TÚ LO HACES)

```bash
# Edita el archivo .env.local y actualiza las siguientes líneas:

# Quita las comillas de NEXT_PUBLIC_SUPABASE_URL si las tiene
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Asegúrate de que SUPABASE_SERVICE_ROLE_KEY no tenga comillas
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Crear Schema Limpio en Supabase

**PASO CRÍTICO**: Hay tablas existentes con tipos incompatibles. Necesitamos limpiar y recrear:

1. **Ve a tu dashboard de Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**: `jwvqlmxvegirmurjhcdd`
3. **Ve a SQL Editor** (ícono de `</>` en el menú lateral)
4. **Copia y pega** el contenido del archivo `create-clean-schema.sql`
5. **Ejecuta el SQL** (botón "Run")

**⚠️ ADVERTENCIA**: Este script eliminará todas las tablas existentes y las recreará.

**Resultado esperado:**
- ✅ Tablas existentes eliminadas
- ✅ Schema limpio creado con tipos consistentes
- ✅ Tabla `dimensions` con 4 dimensiones
- ✅ Tabla `questions` con `id` como `INTEGER`
- ✅ Tabla `answers` con `id` como `INTEGER`
- ✅ Tabla `users` con `id` como `UUID`
- ✅ Tabla `user_answers` con tipos compatibles
- ✅ 4 dimensiones insertadas (PEOPLE, PLANET, MATERIALS, CIRCULARITY)
- ✅ Pesos suman 100%

### 3. Aplicar Schema Unificado

```bash
# Ahora que la tabla existe, ejecuta el script
npm run db:unified
```

**Resultado esperado:**
- ✅ Script se ejecuta sin errores
- ✅ Dimensiones verificadas

### 4. Reparar e Importar Datos del Excel

```bash
# Re-importa datos del Excel con la nueva estructura (puntos_respuesta)
npx tsx scripts/repairImport.ts
```

**Resultado esperado:**
- ✅ 46 preguntas generales importadas
- ✅ 15 preguntas específicas importadas
- ✅ 197 respuestas importadas
- ✅ Sin errores de "undefined" en puntos

### 5. Validar Integridad de Datos

```bash
# Verifica que todo se haya importado correctamente
npx tsx scripts/validate-data.ts
```

**Checklist de validación:**
- [ ] 4 dimensiones en DB
- [ ] 46 preguntas generales
- [ ] 15 preguntas específicas
- [ ] 197 respuestas totales
- [ ] Pesos suman 100%
- [ ] Todas las preguntas tienen respuestas
- [ ] Sin respuestas huérfanas
- [ ] Sin duplicados

### 6. (Opcional) Ejecutar Tests

```bash
# Ejecuta tests de integridad de datos
npm run test:data
```

---

## 🔍 Verificación de Cambios Implementados

### Código actualizado:
- ✅ `lib/excel/ingest.ts` → Usa `puntos_respuesta`
- ✅ `scripts/repairImport.ts` → Usa `puntos_respuesta || Puntos || 0` (fallback)
- ✅ `scripts/seed-excel.js` → Usa `puntos_respuesta || 0`
- ✅ `scripts/validate-data.ts` → Lee correctamente `.env.local`

### Excel actualizado:
- ✅ Columna `Puntos` → `puntos_respuesta`
- ✅ 197 respuestas
- ✅ Sin IDs duplicados
- ✅ Estructura consistente

---

## ⚠️ Troubleshooting

### Si `npm run db:unified` falla:
```bash
# Instala tsx globalmente o usa npx
npm install -g tsx
# o
npx tsx --version
```

### Si hay error "Invalid API key":
- Verifica que `.env.local` NO tenga comillas en los valores
- Asegúrate de que la API key es la correcta
- Reinicia el servidor: `npm run dev`

### Si faltan respuestas:
```bash
# Re-ejecuta la importación
npx tsx scripts/repairImport.ts

# Valida nuevamente
npx tsx scripts/validate-data.ts
```

---

## 📊 Resultado Final Esperado

Después de completar todos los pasos:

```
📊 Validation Report:
   Dimensions: 4
   General questions: 46 (expected: 46) ✅
   Specific questions: 15 (expected: 15) ✅
   Total questions: 61
   Total answers: 197 (expected: 197) ✅
   Questions without answers: 0 ✅
   Duplicate questions: 0 ✅
   Duplicate answers: 0 ✅

🔒 Integrity Checks:
   Weights sum: 100% (valid: true) ✅
   No orphans: true ✅
   No duplicates: true ✅
   All questions have answers: true ✅

✅ All validations passed!
```

---

## 🚀 Después de la Importación

Una vez que los datos estén importados correctamente:

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Accede a la aplicación:**
   - Login: `http://localhost:3000/login`
   - Dashboard: `http://localhost:3000/dashboard`
   - Ver respuestas: `http://localhost:3000/survey/responses`

3. **Verifica funcionalidad:**
   - [ ] Login funciona
   - [ ] Dashboard muestra datos
   - [ ] Encuesta general se puede completar
   - [ ] Ver respuestas muestra las 197 respuestas
   - [ ] Editar respuestas funciona correctamente

