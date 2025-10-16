# Vercel Deployment Setup

## Configuración Inicial

### 1. Conectar Repositorio a Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **New Project**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `greenfashionscore-v2`

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings** > **Environment Variables** y añade:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Clave de servicio de Supabase |
| `DATABASE_URL` | `postgresql://postgres.your-project-id:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | String de conexión PostgreSQL |

### 3. Configuración del Proyecto

#### Framework Preset
- **Framework Preset**: Next.js
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automático)

#### Build Settings
- **Node.js Version**: 20.x
- **Install Command**: `npm ci`

### 4. Deployment Automático

Una vez configurado:
- ✅ Cada push a `main` desplegará automáticamente
- ✅ Pull requests generarán preview deployments
- ✅ Los deployments se pueden ver en la pestaña **Deployments**

## Troubleshooting

### Error: "Build failed"

#### Problema: Missing environment variables
```bash
Error: Missing required environment variables
```
**Solución**: Verifica que todas las variables están configuradas en Vercel

#### Problema: TypeScript errors
```bash
Type error: Property 'mockResolvedValue' does not exist
```
**Solución**: Los errores TypeScript ya están arreglados en el código

#### Problema: ESLint errors
```bash
Error: Cannot find module '@typescript-eslint/parser'
```
**Solución**: Las dependencias ESLint ya están añadidas al `package.json`

### Error: "Function timeout"

#### Problema: API routes timeout
```bash
Function execution timed out
```
**Solución**: 
- Verifica que `vercel.json` tiene `maxDuration: 30` para API routes
- Optimiza las consultas a la base de datos

### Error: "Database connection failed"

#### Problema: Invalid DATABASE_URL
```bash
Error: Connection terminated unexpectedly
```
**Solución**:
- Verifica que el `DATABASE_URL` incluye `?pgbouncer=true`
- Asegúrate de que la contraseña es correcta
- Verifica que el proyecto de Supabase está activo

## Configuración Avanzada

### Custom Domains
1. Ve a **Settings** > **Domains**
2. Añade tu dominio personalizado
3. Configura los DNS records según las instrucciones

### Environment Variables por Entorno
- **Production**: Todas las variables configuradas
- **Preview**: Mismas variables que production
- **Development**: Usa `.env.local` localmente

### Performance Optimization
- **Edge Functions**: Para APIs de alta frecuencia
- **Image Optimization**: Automático con Next.js
- **CDN**: Automático con Vercel

## Monitoreo

### Logs
- Ve a **Functions** > **View Function Logs**
- Filtra por deployment específico
- Busca errores en tiempo real

### Analytics
- **Vercel Analytics**: Métricas de performance
- **Core Web Vitals**: LCP, FID, CLS
- **Real User Monitoring**: Datos de usuarios reales

## Checklist de Deployment

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso en GitHub Actions
- [ ] Deployment automático funcionando
- [ ] API routes respondiendo correctamente
- [ ] Base de datos conectada
- [ ] Autenticación funcionando
- [ ] Tests E2E pasando

## Comandos Útiles

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy manual
vercel --prod

# Ver logs
vercel logs

# Ver deployments
vercel ls
```

## Soporte

- 📚 [Documentación de Vercel](https://vercel.com/docs)
- 🐛 [GitHub Issues](https://github.com/vercel/vercel/issues)
- 💬 [Vercel Community](https://github.com/vercel/community)
