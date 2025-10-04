# Postedor Data Schemas

This document defines the data schemas used throughout the Postedor application.

## Poste Schema

Represents a utility pole with its current state and metadata.

\`\`\`typescript
interface Poste {
  tokenId: string              // Unique identifier (e.g., "1", "2")
  assetTag?: string            // Physical asset tag (e.g., "POSTE-MDE-000134")
  ubicacion: string            // Location address
  capacidadKW: number          // Capacity in kilowatts
  consumoEntregado: number     // Delivered consumption in kWh
  consumoRestante: number      // Remaining consumption in kWh
  seguridad: number            // Security score (-10 to +10)
  imageURI: string             // Image URL or IPFS hash
  lastAttestationUID?: string  // Most recent attestation UID
  updatedAt: string            // ISO 8601 timestamp
}
\`\`\`

**Example:**
\`\`\`json
{
  "tokenId": "1",
  "assetTag": "POSTE-MDE-000134",
  "ubicacion": "Calle 10 #45-67, Medellín",
  "capacidadKW": 150,
  "consumoEntregado": 89500,
  "consumoRestante": 60500,
  "seguridad": 8,
  "imageURI": "/placeholder.svg?height=400&width=600",
  "lastAttestationUID": "0xabc123...",
  "updatedAt": "2025-01-15T10:30:00Z"
}
\`\`\`

## Event Schemas

Events represent actions performed on a pole over time.

### Base Event

All events share these common fields:

\`\`\`typescript
interface BaseEvent {
  id: string                   // Unique event identifier
  tokenId: string              // Associated pole tokenId
  type: EventKind              // "MAINTENANCE" | "READING" | "REPLACEMENT"
  actor: string                // Ethereum address of actor
  attestationUID: string       // EAS attestation UID
  txHash: string               // Transaction hash
  ts: string                   // ISO 8601 timestamp
}
\`\`\`

### Maintenance Event

\`\`\`typescript
interface MaintenanceEvent extends BaseEvent {
  type: "MAINTENANCE"
  maintenanceKind: 0 | 1 | 2 | 3 | 4  // See maintenance types below
  notes?: string                       // Optional notes
}
\`\`\`

**Maintenance Types:**
- `0` - Preventivo (Preventive)
- `1` - Correctivo (Corrective)
- `2` - Emergencia (Emergency)
- `3` - Vandalismo (Vandalism)
- `4` - Inspección (Inspection)

**Example:**
\`\`\`json
{
  "id": "evt-001",
  "tokenId": "1",
  "type": "MAINTENANCE",
  "maintenanceKind": 0,
  "actor": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "attestationUID": "0xdef456...",
  "txHash": "0x789abc...",
  "ts": "2025-01-10T14:20:00Z",
  "notes": "Revisión trimestral programada"
}
\`\`\`

### Reading Event

\`\`\`typescript
interface ReadingEvent extends BaseEvent {
  type: "READING"
  deliveredKWh: number         // Delivered consumption reading
  remainingKWh: number         // Remaining consumption reading
}
\`\`\`

**Example:**
\`\`\`json
{
  "id": "evt-002",
  "tokenId": "1",
  "type": "READING",
  "deliveredKWh": 89500,
  "remainingKWh": 60500,
  "actor": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "attestationUID": "0xghi789...",
  "txHash": "0xabc123...",
  "ts": "2025-01-15T10:30:00Z"
}
\`\`\`

### Replacement Event

\`\`\`typescript
interface ReplacementEvent extends BaseEvent {
  type: "REPLACEMENT"
  oldSerial: string            // Serial number of replaced component
  newSerial: string            // Serial number of new component
}
\`\`\`

**Example:**
\`\`\`json
{
  "id": "evt-003",
  "tokenId": "1",
  "type": "REPLACEMENT",
  "oldSerial": "TRF-2019-0045",
  "newSerial": "TRF-2025-0123",
  "actor": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "attestationUID": "0xjkl012...",
  "txHash": "0xdef456...",
  "ts": "2025-01-12T16:45:00Z"
}
\`\`\`

## API Response Schemas

### Success Response

API endpoints return the requested data directly:

\`\`\`typescript
// GET /api/poste/[tokenId]
Response: Poste

// GET /api/events/[tokenId]
Response: PosteEvent[]

// GET /api/resolve-asset-tag/[assetTag]
Response: { tokenId: string }
\`\`\`

### Error Response

All API endpoints return structured errors:

\`\`\`typescript
interface ErrorResponse {
  error: string                // Error code (e.g., "NOT_FOUND", "INTERNAL_ERROR")
  message: string              // Human-readable message in Spanish
  [key: string]: any           // Additional context (e.g., tokenId, assetTag)
}
\`\`\`

**Example:**
\`\`\`json
{
  "error": "NOT_FOUND",
  "message": "Poste no encontrado",
  "tokenId": "999"
}
\`\`\`

## Hash Utilities

The application uses keccak256 hashing for on-chain compatibility:

- **Asset Tag Hash**: `keccak256(assetTag)` - Maps physical tags to on-chain identifiers
- **Location Hash**: `keccak256(ubicacion)` - Privacy-preserving location storage
- **Image URI Hash**: `keccak256(imageURI)` - Content verification

## Mock Data Files

Mock data is stored in `/public/mocks/`:

- `postes.json` - Array of Poste objects
- `events-{tokenId}.json` - Array of PosteEvent objects for each pole

**File naming convention:**
- Events files must match the pattern `events-{tokenId}.json` where `{tokenId}` matches a pole's tokenId

## Contributing

When adding new mock data:

1. Follow the schemas defined above
2. Use valid ISO 8601 timestamps
3. Ensure tokenId references are consistent
4. Include realistic Spanish text for ubicacion and notes
5. Use valid Ethereum address format for actor fields (0x + 40 hex chars)
6. Generate unique attestationUID and txHash values (0x + hex string)
