# AURIX - Guía de Sistema Multi-Tenant

## Resumen

AURIX está diseñado como una plataforma SaaS multi-tenant, lo que significa que una única instalación del código puede servir a múltiples clientes (tenants), cada uno con su propia:

- **Datos aislados** (leads, propiedades, usuarios)
- **Branding personalizado** (colores, logos, fuentes)
- **Configuración específica** (moneda, timezone, features)
- **Dominio personalizado** (opcional)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      AURIX Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Tenant A   │  │   Tenant B   │  │   Tenant C   │       │
│  │  (Dubai RE)  │  │  (Miami RE)  │  │ (London RE)  │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │ - 50 leads   │  │ - 120 leads  │  │ - 30 leads   │       │
│  │ - 20 props   │  │ - 45 props   │  │ - 15 props   │       │
│  │ - 8 users    │  │ - 15 users   │  │ - 5 users    │       │
│  │ - Blue theme │  │ - Gold theme │  │ - Green theme│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                   Shared Infrastructure                      │
│        (Supabase DB, Auth, Storage, Edge Functions)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Base de Datos

### Tabla `tenants`

```sql
tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- "Luxury Homes Dubai"
  slug TEXT UNIQUE NOT NULL,    -- "luxury-homes-dubai"
  domain TEXT UNIQUE,           -- "app.luxuryhomes.ae"
  branding JSONB,               -- Configuración visual
  settings JSONB,               -- Configuración operativa
  is_active BOOLEAN,            -- Estado del tenant
  created_at TIMESTAMP
)
```

### Aislamiento de Datos

Todas las tablas principales tienen `tenant_id`:

```sql
leads.tenant_id → tenants.id
properties.tenant_id → tenants.id
users.tenant_id → tenants.id
activities.tenant_id → tenants.id
tasks.tenant_id → tenants.id
```

---

## Onboarding de Nuevo Cliente

### Paso 1: Recopilar Información

```typescript
const clientInfo = {
  // Información de la empresa
  companyName: "Prestige Properties Miami",
  companySlug: "prestige-miami",

  // Branding
  branding: {
    primaryColor: "#1E3A5F",    // Azul marino
    accentColor: "#D4AF37",      // Dorado
    logoUrl: "https://...",
    companyShortName: "PPM",
  },

  // Configuración
  settings: {
    defaultCurrency: "USD",
    defaultTimezone: "America/New_York",
    enabledMarkets: ["usa"],
    slaResponseMinutes: 10,
  },

  // Usuario Admin
  adminUser: {
    email: "admin@prestigemiami.com",
    fullName: "John Smith",
    phone: "+1 305 555 0123",
  },
};
```

### Paso 2: Ejecutar Onboarding

```typescript
import { onboardNewClient } from "@/lib/tenant/onboarding";

const result = await onboardNewClient(
  clientInfo,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

if (result.success) {
  console.log(`✅ Cliente creado`);
  console.log(`   Tenant ID: ${result.tenantId}`);
  console.log(`   URL de acceso: ${result.accessUrl}`);
} else {
  console.error(`❌ Error: ${result.error}`);
}
```

### Paso 3: Agregar Equipo (Opcional)

```typescript
import { seedTenantData } from "@/lib/tenant/onboarding";

await seedTenantData(
  result.tenantId!,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    teamMembers: [
      {
        email: "maria@prestigemiami.com",
        fullName: "Maria Garcia",
        role: "manager",
        market: "usa",
      },
      {
        email: "carlos@prestigemiami.com",
        fullName: "Carlos Rodriguez",
        role: "agent",
        market: "usa",
      },
    ],
  }
);
```

---

## Configuración de Branding

### Estructura Completa

```typescript
interface TenantBranding {
  // Colores
  primaryColor: string;      // Color principal (botones, enlaces)
  accentColor: string;       // Color de acento (highlights)

  // Logos
  logoUrl: string | null;      // Logo principal (fondo claro)
  logoWhiteUrl: string | null; // Logo blanco (fondo oscuro)
  faviconUrl: string | null;   // Favicon

  // Tipografía
  fontFamily: string;        // "Inter", "Poppins", etc.

  // Identidad
  companyName: string;       // Nombre completo
  companyShortName: string;  // Iniciales o nombre corto
}
```

### Ejemplo: Cliente Dubai

```json
{
  "primaryColor": "#0B1F3A",
  "accentColor": "#B87333",
  "logoUrl": "/logos/client-dubai.svg",
  "logoWhiteUrl": "/logos/client-dubai-white.svg",
  "fontFamily": "Inter",
  "companyName": "Meridian Harbor Realty",
  "companyShortName": "MHR"
}
```

### Ejemplo: Cliente Miami

```json
{
  "primaryColor": "#006B5A",
  "accentColor": "#FFD700",
  "logoUrl": "/logos/client-miami.svg",
  "fontFamily": "Poppins",
  "companyName": "Prestige Properties Miami",
  "companyShortName": "PPM"
}
```

---

## Configuración de Settings

### Estructura Completa

```typescript
interface TenantSettings {
  // SLA y Operaciones
  slaResponseMinutes: number;    // Tiempo máximo de respuesta

  // Defaults
  defaultTimezone: string;       // "Asia/Dubai", "America/New_York"
  defaultCurrency: string;       // "AED", "USD", "EUR"
  defaultLanguage: string;       // "en", "es", "ar"

  // Mercados habilitados
  enabledMarkets: ("dubai" | "usa")[];

  // Features habilitados
  enabledFeatures: string[];     // ["leads", "properties", "pipeline", ...]

  // Campos personalizados
  customFields: Record<string, {
    label: string;
    type: "text" | "number" | "select" | "date";
    required: boolean;
    options?: string[];  // Para tipo "select"
  }>;
}
```

---

## Detección de Tenant

El sistema detecta automáticamente el tenant de 3 formas:

### 1. Subdominio

```
cliente.aurix.app → slug = "cliente"
```

### 2. Dominio Personalizado

```
app.clienterealty.com → busca en tenants.domain
```

### 3. Development (localhost)

```
localhost:3000 → usa tenant por defecto o cookie
```

---

## Uso en Componentes

### Obtener Branding

```tsx
import { useTenant, useTenantStyles } from "@/lib/tenant";

function Header() {
  const { branding } = useTenant();
  const { logoUrl, companyName } = useTenantStyles();

  return (
    <header>
      {logoUrl ? (
        <img src={logoUrl} alt={companyName} />
      ) : (
        <span>{companyName}</span>
      )}
    </header>
  );
}
```

### Verificar Features

```tsx
function Sidebar() {
  const { isFeatureEnabled } = useTenant();

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      {isFeatureEnabled("leads") && <Link href="/leads">Leads</Link>}
      {isFeatureEnabled("properties") && <Link href="/properties">Properties</Link>}
      {isFeatureEnabled("reports") && <Link href="/reports">Reports</Link>}
    </nav>
  );
}
```

### Verificar Mercados

```tsx
function MarketFilter() {
  const { isMarketEnabled } = useTenant();

  return (
    <Select>
      {isMarketEnabled("dubai") && <Option value="dubai">Dubai</Option>}
      {isMarketEnabled("usa") && <Option value="usa">USA</Option>}
    </Select>
  );
}
```

---

## Estrategias de Deployment

### Opción A: Subdominio (Recomendado para MVP)

```
acme.aurix.app
prestige.aurix.app
luxury.aurix.app
```

**Pros:**
- Un solo deployment
- Fácil de gestionar
- Certificado SSL wildcard

**Setup:**
1. Configura DNS wildcard: `*.aurix.app → tu-servidor`
2. El middleware detecta el subdominio
3. Carga el tenant correspondiente

### Opción B: Dominios Personalizados

```
app.acmerealty.com
crm.prestigeproperties.com
```

**Pros:**
- Marca 100% del cliente
- Sin mención a AURIX

**Setup:**
1. Cliente configura CNAME a tu servidor
2. Añade dominio a tabla `tenants`
3. Configura certificado SSL por dominio

---

## Seguridad Multi-Tenant

### RLS Policies (Producción)

```sql
-- Los usuarios solo ven datos de su tenant
CREATE POLICY "tenant_isolation" ON leads
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM users
      WHERE auth_id = auth.uid()
    )
  );
```

### Validación en Queries

```typescript
// Siempre incluir tenant_id en queries
const { data } = await supabase
  .from("leads")
  .select("*")
  .eq("tenant_id", currentUser.tenant_id);
```

---

## Checklist para Nuevo Cliente

- [ ] Información de empresa recopilada
- [ ] Branding definido (colores, logo)
- [ ] Settings configurados (timezone, currency)
- [ ] Tenant creado en base de datos
- [ ] Usuario admin creado
- [ ] Equipo inicial agregado (opcional)
- [ ] Dominio configurado (subdominio o personalizado)
- [ ] Datos iniciales importados (leads, propiedades)
- [ ] Training al cliente
- [ ] Go live

---

## Comandos Útiles

### Crear nuevo cliente (CLI)

```bash
npx tsx scripts/create-tenant.ts \
  --name "Luxury Dubai Estates" \
  --slug "luxury-dubai" \
  --admin-email "admin@luxurydubai.com" \
  --admin-name "Ahmed Al-Rashid" \
  --primary-color "#1E3A5F" \
  --currency "AED" \
  --timezone "Asia/Dubai"
```

### Actualizar branding

```bash
npx tsx scripts/update-branding.ts \
  --tenant-id "uuid-here" \
  --primary-color "#FF5733" \
  --logo-url "https://..."
```

---

## Soporte

Para dudas sobre implementación multi-tenant:
- Documentación: `/docs/MULTI_TENANT_GUIDE.md`
- Código: `/src/lib/tenant/`
- Migraciones: `/supabase/migrations/`
