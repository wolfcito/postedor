import type { Poste } from "./types"

export const STATIC_POSTES: Poste[] = [
  {
    tokenId: "1",
    assetTag: "POSTE-MDE-000134",
    ubicacion: "Medellín - CLL 50 #80-12",
    capacidadKW: 60,
    consumoEntregado: 12500,
    consumoRestante: 3500,
    seguridad: 3,
    imageURI: "/postedor400x400.png",
    lastAttestationUID: "0xuid1",
    updatedAt: "2025-09-20T12:42:00Z",
  },
  {
    tokenId: "2",
    assetTag: "POSTE-MDE-000135",
    ubicacion: "Medellín - CRA 70 #45-23",
    capacidadKW: 75,
    consumoEntregado: 18200,
    consumoRestante: 5800,
    seguridad: 7,
    imageURI: "/postedor400x400.png",
    lastAttestationUID: "0xuid2",
    updatedAt: "2025-09-21T08:15:00Z",
  },
]
