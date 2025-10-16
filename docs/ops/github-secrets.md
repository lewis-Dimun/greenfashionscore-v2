# GitHub Secrets Configuration

## Required Secrets

Para que el CI/CD funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

### 1. Acceder a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Secrets and variables** > **Actions**
4. Haz clic en **New repository secret**

### 2. Secrets Requeridos

| Secret Name | Descripción | Dónde obtenerlo |
|-------------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Dashboard de Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Dashboard de Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase | Dashboard de Supabase > Settings > API |
| `DATABASE_URL` | String de conexión PostgreSQL | Dashboard de Supabase > Settings > Database |

### 3. Cómo Obtener los Valores

#### Supabase Dashboard
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Copia los valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### Database URL
1. En el mismo dashboard, ve a **Settings** > **Database**
2. Copia la **Connection string** → `DATABASE_URL`

### 4. Verificar Configuración

Para verificar que los secrets están configurados:

1. Ve a **Actions** en tu repositorio
2. Haz clic en el último workflow ejecutado
3. Verifica que no hay errores relacionados con variables de entorno

### 5. Troubleshooting

#### Error: "Missing environment variables"
- Verifica que todos los secrets están configurados
- Asegúrate de que los nombres coinciden exactamente
- No incluyas espacios extra en los nombres

#### Error: "Invalid API key"
- Verifica que copiaste la clave completa
- Asegúrate de que no hay caracteres extra al inicio/final
- Verifica que la clave corresponde al proyecto correcto

#### Error: "Database connection failed"
- Verifica que el `DATABASE_URL` incluye el parámetro `?pgbouncer=true`
- Asegúrate de que la contraseña es correcta
- Verifica que el proyecto de Supabase está activo

## Ejemplo de Configuración

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.your-project-id:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Notas Importantes

- ⚠️ **NUNCA** commits secrets al código
- 🔒 Los secrets son encriptados por GitHub
- 🔄 Los secrets se aplican a todos los workflows
- 📝 Usa `.env.example` para documentar las variables necesarias
