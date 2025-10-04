export type EventKind = "MAINTENANCE" | "READING" | "REPLACEMENT"

export interface Poste {
  tokenId: string
  assetTag?: string
  ubicacion: string
  capacidadKW: number
  consumoEntregado: number
  consumoRestante: number
  seguridad: number // -10..+10
  imageURI: string
  lastAttestationUID?: string
  updatedAt: string // ISO
}

export interface BaseEvent {
  id: string
  tokenId: string
  type: EventKind
  actor: string
  attestationUID: string
  txHash: string
  ts: string // ISO
}

export interface MaintenanceEvent extends BaseEvent {
  type: "MAINTENANCE"
  maintenanceKind: 0 | 1 | 2 | 3 | 4
  notes?: string
}

export interface ReadingEvent extends BaseEvent {
  type: "READING"
  deliveredKWh: number
  remainingKWh: number
}

export interface ReplacementEvent extends BaseEvent {
  type: "REPLACEMENT"
  oldSerial: string
  newSerial: string
}

export type PosteEvent = MaintenanceEvent | ReadingEvent | ReplacementEvent

export type OperatorStatus = "active" | "inactive"
export type OperatorRole = "Technician" | "Supervisor" | "Admin"

export interface Operator {
  id: string
  address: string // Wallet address or identifier
  name: string
  email: string
  role: OperatorRole
  status: OperatorStatus
  addedAt: string // ISO
  addedBy: string
}

export interface OperatorActivity {
  id: string
  action: "added" | "removed" | "updated" | "activated" | "deactivated"
  operatorId: string
  operatorName: string
  actor: string
  timestamp: string // ISO
  details?: string
}

export interface ReportFilters {
  startDate?: string // ISO date
  endDate?: string // ISO date
  ubicacion?: string // City or location filter
  seguridadMinima?: number // Minimum security score
}

export interface ReportKPIs {
  totalPoles: number
  totalInterventions: number
  maintenanceCount: number
  readingCount: number
  replacementCount: number
  averageSeguridad: number
  topIncidents: Array<{
    kind: number
    count: number
    label: string
  }>
  polesByLocation: Array<{
    location: string
    count: number
  }>
  interventionsByDate: Array<{
    date: string
    count: number
  }>
}
