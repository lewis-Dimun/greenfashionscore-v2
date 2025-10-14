Green Fashion Score (GFS) — Resumen maestro (para conservar contexto)
Visión

Plataforma de certificación de sostenibilidad para moda, powered by Ecodicta. Evalúa marcas mediante una encuesta general y encuestas específicas por producto (falda, bolso, zapatos, etc.). Resultado: 0–100 + letra A–E con mensajes y dashboards por 4 sellos: People, Planet, Materials, Circularity. Idioma: español. Accesibilidad WCAG AA.

Marca

Colores por categorías:
A #6AA67F, B #AAD4AC, C #F2D857, D #D99B84, E #D94E4E.

Landing (UI): Emerald #00A676, Beige #FAF8F5, Charcoal #1E1E1E, White #FFFFFF.

Tipografías: The Seasons (títulos), Nunito (app), Inter/Manrope (landing).

Activos: logos + 4 iconos de sellos (people/materials/planet/circularity).

Scoring (definido)

Pesos por sello y máximos: People 20% (max 50), Planet 20% (max 50), Circularity 20% (max 50), Materials 40% (max 65).

Cálculo por sello: (puntaje_obtenido / puntaje_máximo) * peso_sello, con cap en el peso.

Total: suma de los 4 sellos → 0–100.

Letras: A 75–100, B 50–74, C 25–49, D 1–24, E 0.
Mensajes:
A “Bueno para ti, bueno para el planeta”; B “Buena circularidad y sostenibilidad”;
C “En camino hacia la sostenibilidad”; D “Debe seguir avanzando…”;
E “El planeta lo nota, replantea tu impacto”.

Combinación general+específicas: promedio ponderado 60/40 (parametrizable).

Roles de usuario (MVP)

Admin: todo acceso; gestiona marcas, preguntas, pesos, versiones; bypass RLS.

Usuario (Marca): registra/login, responde encuestas, ve su dashboard.

Arquitectura elegida

Repo: Single repo.

Frontend: Next.js 15 (App Router, TS), Tailwind, shadcn/ui, Zustand, Recharts.

Backend: Supabase Edge Functions (scoring, dashboard). Validación Zod.

DB: Supabase Postgres + Drizzle ORM (migraciones). RLS activado.

Auth: Supabase email/password (OAuth opcional después).

Hosting: Vercel (FE), Supabase (DB/Auth/Storage/Functions).

CI/CD: GitHub Actions (lint, tests unit+E2E, build, migrate, deploy).

Estructura de repo (clave)
/app (Next 15: /, /register, /login, /survey, /dashboard)
/supabase/functions/scoring  (POST /submissions)
/supabase/functions/dashboard (GET /dashboard)
/lib/supabase.ts
/lib/scoring/{engine.ts, types.ts}   # lógica pura y testeable
/lib/excel/ingest.ts                 # seed desde Encuestas.xlsx
/db/{schema.ts, migrations}
/public/{hero-bg.jpg, icons, logos}
/__tests__/{ui.home.spec.tsx, domain.scoring.spec.ts, api.scoring.spec.ts}
/styles/globals.css

Esquema de datos (principal)

users (rol)

brands

product_types

dimensions (code, max_points, weight_percent)

questions (by dimension, survey_type, version)

answers_catalog (question_code, answer_code, value_points)

surveys (type, version, brand_id, product_type_id?)

survey_submissions

responses (raw_value, normalized_value)

scores (snapshot total + per_dimension)

grading_thresholds (rangos A–E)

weights (global_distribution 60/40, overrides)

audit_log

RLS: user solo sus datos; admin ve todo.

Endpoints (Edge Functions)

POST /functions/v1/scoring
Crea submission, normaliza, calcula snapshot (transacción), devuelve total, per-sello, letra y mensaje.

GET /functions/v1/dashboard?brandId=UUID
Agregados + breakdown + productos. ETag y revalidación; invalidar tras nueva submission.

Landing / (contenido)

Secciones: Hero (CTAs /register, /login), ¿Qué es GFS? (4 iconos), Cómo funciona (3 pasos + CTA), Beneficios (4 cards), Respaldado por la ciencia (texto + timeline 2024–2025), Partners (“+30 marcas…”), Área de usuario (Login/Resultados), Footer (contacto/legal). Semántico, AA, mobile-first.

TDD — Orden de trabajo

Tests UI landing → luego app/page.tsx.

Tests dominio (engine) → luego /lib/scoring/engine.ts.

Tests handlers API (scoring/dashboard con dependencias inyectadas) → luego funciones reales.

E2E Playwright (registro → encuesta → dashboard).

A11y con @axe-core/react.

Seguridad & rendimiento

RLS + Zod + sanitización inputs + rate limit en POST /submissions.

Manejo de errores consistente {error:{code,message}} + logs.

GET /dashboard con ETag/Cache-Control.

Secrets sólo en server; service role nunca en cliente.

Ingesta de Excel (Encuestas.xlsx)

Importa dimensiones (con max_points y weight_percent), preguntas, respuestas, product types, grading_thresholds, weights (incluye 60/40).

Idempotente (upsert por code+version).

Versionado para preservar submissions históricos.

Estado actual de decisiones

Backend: Supabase Edge Functions.

Repo: single.

Flujo encuesta: wizard tipo Typeform, 1 página por sello, autosave.

Partners: mostrar “Más de 30 marcas ya confían…”.

Objetivo inmediato: landing + auth + seed + engine + endpoints + wizard + dashboard.