# Postedor

Sistema de seguimiento de infraestructura eléctrica mediante códigos QR. Permite visualizar información detallada de postes eléctricos y su historial completo de operaciones (mantenimientos, lecturas, reemplazos).

## 🚀 Características

- **Escaneo QR**: Acceso rápido a información del poste
- **Información en tiempo real**: Capacidad, consumo, estado de seguridad
- **Historial completo**: Timeline de eventos con attestations y transacciones
- **Diseño responsive**: Optimizado para móviles (field workers)
- **Mock blockchain**: Simula verificación con attestations y tx hashes

## 📦 Instalación

\`\`\`bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Build para producción
pnpm build
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
/app
  /p/[tokenId]          # Ficha del poste por ID
  /a/[assetTag]         # Resolver assetTag → tokenId
  /mock/attestation     # Visor mock de attestations
  /mock/tx              # Explorador mock de transacciones
  /_health              # Health check endpoint
/components
  poste-header.tsx      # Header con imagen y datos principales
  stat-card.tsx         # Tarjetas de KPIs
  events-timeline.tsx   # Timeline de eventos
  attestation-badge.tsx # Badge de attestation
  tx-link.tsx           # Link a transacción
/lib
  types.ts              # Interfaces TypeScript
  mock-service.ts       # Servicio de datos mock
/public/mocks
  postes.json           # Datos de postes
  events-*.json         # Eventos por poste
\`\`\`

## 🔗 Rutas

- `/` - Página principal con QR de ejemplo
- `/p/1` - Poste #1 (POSTE-MDE-000134)
- `/p/2` - Poste #2 (POSTE-MDE-000135)
- `/a/POSTE-MDE-000134` - Resolver por AssetTag → redirect a `/p/1`

## 📱 Uso

1. Escanea el código QR en el poste
2. Se abre la URL `/p/[tokenId]` o `/a/[assetTag]`
3. Visualiza información del poste y timeline de eventos
4. Haz clic en badges de attestation o tx para ver detalles mock

## 🎨 Tecnologías

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes
- **Lucide React** - Iconos
- **Geist Font** - Tipografía

## 📊 Tipos de Eventos

- **MAINTENANCE**: Mantenimientos (preventivo, correctivo, repintado, transformador, vandalismo)
- **READING**: Lecturas de consumo (entregado/restante)
- **REPLACEMENT**: Reemplazo de equipos (serial anterior/nuevo)

## 🔐 Mock Blockchain

Simula verificación blockchain con:
- **Attestation UIDs**: Enlaces a visor mock
- **Transaction Hashes**: Enlaces a explorador mock
- **Actor addresses**: Identificación de operadores

---

Desarrollado con ❤️ para gestión de infraestructura eléctrica
