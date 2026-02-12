# AURIX - Contexto del Proyecto para Claude Code

> Este archivo contiene el contexto necesario para que cualquier sesión de Claude Code
> pueda continuar el desarrollo del proyecto AURIX sin perder información.

---

## Resumen del Proyecto

**AURIX** es un Sistema Operativo Inmobiliario (Real Estate CRM) multi-tenant diseñado para agencias inmobiliarias en Dubai y USA.

### Stack Tecnológico
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **ORM:** Drizzle ORM (definición de esquemas)
- **Drag & Drop:** @dnd-kit

### Credenciales Supabase
- **URL:** `https://hqedvzvkalvefoodqsgr.supabase.co`
- **Archivo de credenciales:** `/supabase-aurix-credentials.md`
- **Usuario demo:** `omar.almansouri@meridianharbor.com` / `MHRealty2024!`

---

## Arquitectura Multi-Tenant

El sistema está diseñado para servir múltiples clientes desde una única base de código:

- Cada cliente es un **tenant** en la tabla `tenants`
- Todos los datos están aislados por `tenant_id`
- El branding se personaliza dinámicamente por tenant
- Documentación completa: `/docs/MULTI_TENANT_GUIDE.md`

### Archivos Clave Multi-Tenant
```
src/lib/tenant/
├── context.tsx          # TenantProvider, useTenant()
├── theme-provider.tsx   # Theming dinámico
├── onboarding.ts        # Crear nuevos clientes
└── index.ts
```

---

## Estructura del Proyecto

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/login/       # Página de login
│   │   ├── (dashboard)/        # Dashboard layout + páginas
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── shared/             # Header, Sidebar
│   │   ├── leads/              # Componentes de leads
│   │   ├── pipeline/           # Kanban board
│   │   └── providers/          # Context providers
│   └── lib/
│       ├── supabase/           # Clients Supabase
│       ├── queries/            # Funciones de consulta DB
│       ├── tenant/             # Sistema multi-tenant
│       ├── hooks/              # Custom hooks
│       └── utils.ts            # Utilidades
├── supabase/
│   ├── seed.sql               # Datos iniciales
│   └── migrations/            # Migraciones DB
└── .env.local                 # Variables de entorno
```

---

## Cliente Demo: Meridian Harbor Realty

Para desarrollo usamos un cliente ficticio con datos realistas:

- **Tenant ID:** `11111111-1111-1111-1111-111111111111`
- **Nombre:** Meridian Harbor Realty
- **Mercados:** Dubai + USA
- **Usuarios:** 10 (admin, managers, agents)
- **Leads:** 15 en diferentes estados del pipeline
- **Propiedades:** 7 (Dubai + USA)

---

## Fases de Desarrollo

### Completadas ✅
1. **Fase 1:** Setup inicial (Next.js, Supabase, estructura)
2. **Fase 2:** Esquema de base de datos
3. **Fase 3:** UI base del dashboard
4. **Fase 4:** UI/UX Premium (Framer Motion, diseño violet)
5. **Fase 4.5:** Sistema Multi-Tenant

### Completada ✅
6. **Fase 5:** Funcionalidad Completa
   - ✅ Pipeline Drag & Drop (Kanban con @dnd-kit)
   - ✅ CRUD Leads (Modal crear/editar/eliminar)
   - ✅ CRUD Properties (Modal crear/editar/eliminar)
   - ✅ CRUD Tasks (Modal crear/editar/eliminar, toggle status)
   - ✅ Asignar leads a agentes (AssignLeadDialog)
   - ✅ Dashboard con datos reales de Supabase
   - ✅ Timeline de actividades (crear/ver actividades por lead)
   - ✅ Página de detalle de lead completa con datos reales

### Pendientes 📋
7. **Fase 6:** Integraciones (WhatsApp, Email)
8. **Fase 7:** AI Features
9. **Fase 8:** Producción y deployment

---

## Convenciones de Código

### Colores del Sistema
- **Primary:** Violet (`#7C3AED` - violet-600)
- **Accent:** Copper (`#B87333`)
- **Gradients:** `from-violet-600 to-purple-600`

### Componentes UI
- Usar shadcn/ui como base
- Animaciones con Framer Motion
- Border radius: `rounded-xl` (12px)
- Shadows: `shadow-lg shadow-violet-500/25` para elevación

### Queries a Supabase
- Archivos en `src/lib/queries/`
- Usar `createClient()` de `@/lib/supabase/client`
- Siempre manejar errores con try/catch

---

## Comandos Útiles

```bash
# Desarrollo
cd apps/web && npm run dev

# Build
npm run build

# Crear nuevo tenant (ejemplo)
npx tsx scripts/create-tenant.ts --name "Cliente" --slug "cliente"
```

---

## Notas Importantes

1. **RLS deshabilitado para desarrollo** - Las políticas permiten todo con anon key
2. **Modo demo** - Cookie `demo_mode=true` permite acceso sin auth
3. **Service Role Key** - Necesario para operaciones admin (crear usuarios)

---

## Cómo Continuar el Desarrollo

Cuando inicies una nueva sesión de Claude Code:

1. Asegúrate de estar en el directorio del proyecto
2. Puedes pedirle que lea este archivo para contexto rápido
3. Especifica claramente qué tarea quieres realizar
4. El código existente tiene comentarios que explican la lógica

---

*Última actualización: Febrero 2026*
*Fase actual: 5 (Funcionalidad Completa)*
