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
