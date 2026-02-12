# AURIX CRM - Contexto del Proyecto

> **Actualizado:** 2026-02-12
> **Responsable del desarrollo:** Claude Code (Opus 4.5)
> **Cliente:** Fran (fran@aurix-ia.com)

---

## Resumen del Proyecto

**AURIX** es un CRM (Customer Relationship Management) especializado en el sector inmobiliario, diseñado para gestionar leads, propiedades, pipeline de ventas, tareas y equipos de trabajo.

### Características Principales
- Dashboard con métricas y KPIs en tiempo real
- Gestión de leads con pipeline Kanban drag-and-drop
- Catálogo de propiedades inmobiliarias
- Sistema de tareas y recordatorios
- Gestión de equipos y usuarios
- Multi-tenancy (múltiples organizaciones)
- Internacionalización (4 idiomas: EN, ES, AR, FR)
- Sistema de permisos RBAC completo
- Audit logging para tracking de acciones

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS, shadcn/ui |
| Animaciones | Framer Motion |
| Backend/DB | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth + @supabase/ssr |
| Estado | React Context API |
| Gráficos | Recharts |
| Iconos | Lucide React |
| Drag & Drop | @hello-pangea/dnd |

---

## Estructura del Proyecto

```
proyecto AURIX/
├── apps/
│   └── web/                          # Aplicación principal Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           # Rutas de autenticación
│       │   │   │   └── login/
│       │   │   ├── (dashboard)/      # Rutas protegidas del dashboard
│       │   │   │   └── dashboard/
│       │   │   │       ├── leads/
│       │   │   │       ├── pipeline/
│       │   │   │       ├── properties/
│       │   │   │       ├── tasks/
│       │   │   │       ├── team/
│       │   │   │       ├── reports/
│       │   │   │       └── settings/
│       │   │   │           ├── users/      # Gestión de usuarios
│       │   │   │           ├── profile/    # Perfil personal
│       │   │   │           └── audit/      # Logs de auditoría
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/               # Componentes base (shadcn)
│       │   │   ├── shared/           # Componentes compartidos
│       │   │   ├── providers/        # Context providers
│       │   │   ├── leads/            # Componentes de leads
│       │   │   ├── pipeline/         # Kanban board
│       │   │   ├── properties/       # Componentes de propiedades
│       │   │   ├── tasks/            # Componentes de tareas
│       │   │   ├── charts/           # Gráficos del dashboard
│       │   │   └── settings/         # Modales y formularios de settings
│       │   ├── lib/
│       │   │   ├── supabase/         # Configuración Supabase
│       │   │   │   ├── client.ts     # Cliente browser
│       │   │   │   ├── server.ts     # Cliente server
│       │   │   │   └── middleware.ts # Cliente middleware
│       │   │   ├── queries/          # Funciones de consulta a DB
│       │   │   │   ├── leads.ts
│       │   │   │   ├── properties.ts
│       │   │   │   ├── tasks.ts
│       │   │   │   ├── team.ts
│       │   │   │   ├── dashboard.ts
│       │   │   │   ├── user-management.ts
│       │   │   │   ├── profile.ts
│       │   │   │   └── audit.ts
│       │   │   ├── rbac/             # Sistema de permisos
│       │   │   │   ├── permissions.ts
│       │   │   │   └── index.ts
│       │   │   ├── i18n/             # Internacionalización
│       │   │   │   ├── index.ts
│       │   │   │   └── translations/
│       │   │   │       ├── en.ts
│       │   │   │       ├── es.ts
│       │   │   │       ├── ar.ts     # RTL support
│       │   │   │       └── fr.ts
│       │   │   └── data/             # Datos mock/estáticos
│       │   └── middleware.ts         # Auth middleware
│       ├── supabase/
│       │   └── migrations/           # SQL migrations
│       │       ├── 001_initial_schema.sql
│       │       ├── 002_sample_data.sql
│       │       ├── 003_seed_mhr.sql
│       │       ├── 004_audit_logs.sql
│       │       └── 005_row_level_security.sql
│       └── package.json
├── packages/                         # Paquetes compartidos (futuro)
├── python/                           # Scripts Python (futuro)
└── CLAUDE.md                         # Este archivo
```

---

## Configuración de Supabase

### Proyecto
- **URL:** `https://hqedvzvkalvefoodqsgr.supabase.co`
- **Proyecto ID:** `hqedvzvkalvefoodqsgr`

### Variables de Entorno (apps/web/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://hqedvzvkalvefoodqsgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurado]
```

### Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| tenants | Organizaciones/empresas |
| users | Usuarios del sistema (vinculados a auth.users via auth_id) |
| leads | Leads/prospectos de clientes |
| properties | Propiedades inmobiliarias |
| tasks | Tareas y recordatorios |
| audit_logs | Registro de acciones para auditoría |

### Tenant de Prueba
- **Nombre:** Meridian Harbor Realty (MHR)
- **ID:** (generado automáticamente)

---

## Sistema RBAC (Role-Based Access Control)

### Roles del Sistema
| Rol | Nivel | Descripción |
|-----|-------|-------------|
| admin | 1 | Acceso total, gestión de tenant |
| manager | 2 | Gestión de mercado/región |
| team_lead | 3 | Líder de equipo |
| agent | 4 | Agente de ventas |
| backoffice | 4 | Soporte administrativo |

### Matriz de Permisos

```typescript
// Recursos: leads, properties, tasks, team, settings, reports, audit
// Acciones: view, create, edit, delete, manage

// Ejemplo de permisos por rol:
admin:     todos los recursos, todas las acciones
manager:   leads (all), properties (all), tasks (all), team (view, manage market)
team_lead: leads (team), properties (view), tasks (team), team (view team)
agent:     leads (own), properties (view), tasks (own)
backoffice: leads (view all), properties (all), tasks (own)
```

### Delegación de Usuarios
- Admin puede crear: todos los roles
- Manager puede crear: team_lead, agent
- Team Lead puede crear: agent (mismo equipo)

### Componentes RBAC
```typescript
// Uso en componentes:
<Can resource="leads" action="create">
  <Button>Nuevo Lead</Button>
</Can>

<AdminOnly>
  <AuditLogSection />
</AdminOnly>

<ManagerOrAbove>
  <TeamManagement />
</ManagerOrAbove>
```

---

## Sistema de Internacionalización (i18n)

### Idiomas Soportados
| Código | Idioma | Dirección |
|--------|--------|-----------|
| en | English | LTR |
| es | Español | LTR |
| ar | العربية (Arabic) | RTL |
| fr | Français | LTR |

### Uso
```typescript
import { useLanguage } from "@/lib/i18n";

function Component() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  return <h1>{t.dashboard.title}</h1>;
}
```

### Selector de Idioma
Ubicado en el header, dentro del menú de usuario.

---

## Estado Actual del Desarrollo

### Completado
- [x] Setup inicial del proyecto (Next.js 15, Tailwind, shadcn)
- [x] Integración con Supabase (auth, client, server, middleware)
- [x] Dashboard con métricas y gráficos
- [x] Gestión de Leads (CRUD, tabla, filtros)
- [x] Pipeline Kanban con drag-and-drop
- [x] Gestión de Propiedades (CRUD, tabla, filtros)
- [x] Gestión de Tareas (CRUD, tabla, filtros, prioridades)
- [x] Vista de Equipo
- [x] Sistema de Autenticación completo
- [x] Multi-tenancy
- [x] Sistema RBAC completo (frontend)
- [x] Sistema i18n (4 idiomas + RTL)
- [x] User Management (Settings > Users)
- [x] Profile Settings (personal info, notifications, security, appearance)
- [x] Audit Log (tracking de acciones)
- [x] Row-Level Security SQL (migrations creadas)

### Pendiente
- [ ] **URGENTE:** Configurar usuario admin con email fran@aurix-ia.com
- [ ] Ejecutar migration 004_audit_logs.sql en Supabase
- [ ] Ejecutar migration 005_row_level_security.sql en Supabase
- [ ] Activar MCP de Supabase en Claude Code (plugin habilitado, reiniciar CLI)
- [ ] Conectar audit logging real (actualmente funciones creadas pero no conectadas)
- [ ] Implementar Reports con gráficos dinámicos
- [ ] Notificaciones push/email
- [ ] Dark mode

---

## Credenciales y Acceso

### Usuario Admin (A ACTUALIZAR)
- **Email actual:** admin@meridianharbor.ae (ficticio, sin acceso)
- **Email nuevo:** fran@aurix-ia.com
- **Acción requerida:** Eliminar usuario actual en Supabase Auth y crear nuevo con email correcto

### Proceso para crear nuevo admin
1. Supabase Dashboard > Authentication > Users
2. Eliminar usuario con email admin@meridianharbor.ae
3. Crear nuevo usuario con email fran@aurix-ia.com
4. Actualizar tabla public.users con el nuevo auth_id

---

## Manera de Trabajar

### Preferencias del Cliente (Fran)
1. **Autonomía:** Claude debe tomar decisiones técnicas sin preguntar constantemente
2. **Proactividad:** Sugerir mejoras y siguiente pasos
3. **Escalabilidad:** Las soluciones deben ser escalables, no manuales
4. **Documentación:** Mantener este archivo actualizado

### Flujo de Desarrollo
1. Entender el requerimiento
2. Analizar el código existente
3. Implementar siguiendo patrones existentes
4. Actualizar traducciones si hay nuevo texto
5. Verificar permisos RBAC si aplica
6. Actualizar este CLAUDE.md si hay cambios significativos

### Patrones de Código
- Usar Server Components por defecto, Client Components solo cuando sea necesario
- Queries en `/lib/queries/` con funciones async
- Traducciones en `/lib/i18n/translations/`
- Componentes reutilizables en `/components/ui/` o `/components/shared/`
- Permisos via hooks `usePermissions()` y componentes `<Can>`, `<AdminOnly>`, etc.

---

## Archivos Clave para Referencia

| Propósito | Archivo |
|-----------|---------|
| Tipos de base de datos | `src/lib/supabase/types.ts` |
| Permisos RBAC | `src/lib/rbac/permissions.ts` |
| Traducciones EN | `src/lib/i18n/translations/en.ts` |
| Provider de tenant | `src/components/providers/tenant-provider.tsx` |
| Provider de idioma | `src/lib/i18n/index.ts` |
| Queries de leads | `src/lib/queries/leads.ts` |
| Schema SQL | `supabase/migrations/001_initial_schema.sql` |
| RLS Policies | `supabase/migrations/005_row_level_security.sql` |

---

## Próximos Pasos Inmediatos

1. **Reiniciar Claude Code** para activar MCP de Supabase
2. **Verificar herramientas Supabase** disponibles
3. **Actualizar usuario admin** a fran@aurix-ia.com
4. **Ejecutar migrations** de audit y RLS en Supabase
5. **Probar login** con nuevo usuario

---

## Notas Importantes

- El proyecto usa **App Router** de Next.js (no Pages Router)
- Autenticación maneja **cookies** via @supabase/ssr
- Las traducciones deben agregarse en **los 4 idiomas** cuando se añade texto nuevo
- El campo `market` en la tabla users es un **ENUM**, puede requerir cast `::text` en comparaciones SQL
- RTL para árabe se maneja automáticamente con `document.dir = 'rtl'`

---

*Este archivo debe mantenerse actualizado con cada sesión de desarrollo significativa.*
