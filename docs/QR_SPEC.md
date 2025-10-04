# Especificación de Códigos QR - Postedor

## Resumen

Los códigos QR de Postedor permiten a los técnicos de campo acceder instantáneamente a la información de un poste eléctrico mediante el escaneo de un código adherido físicamente al poste.

## Formato de URL

### Acceso por Token ID
\`\`\`
https://postedor.vercel.app/p/[tokenId]
\`\`\`

**Ejemplo:**
\`\`\`
https://postedor.vercel.app/p/1
\`\`\`

**Descripción:** Acceso directo al poste mediante su identificador único numérico (tokenId). Este es el método principal y más eficiente.

### Acceso por Asset Tag
\`\`\`
https://postedor.vercel.app/a/[assetTag]
\`\`\`

**Ejemplo:**
\`\`\`
https://postedor.vercel.app/a/POSTE-MDE-000134
\`\`\`

**Descripción:** Acceso mediante el código de activo físico. El sistema resuelve automáticamente el asset tag al tokenId correspondiente mediante hash keccak256 y redirige a la página del poste.

## Postes de Demostración

### Poste #1
- **Token ID:** 1
- **Asset Tag:** POSTE-MDE-000134
- **Ubicación:** Medellín - CLL 50 #80-12
- **URL Directa:** https://postedor.vercel.app/p/1
- **URL por Asset Tag:** https://postedor.vercel.app/a/POSTE-MDE-000134

### Poste #2
- **Token ID:** 2
- **Asset Tag:** POSTE-MDE-000135
- **Ubicación:** Medellín - CRA 70 #45-23
- **URL Directa:** https://postedor.vercel.app/p/2
- **URL por Asset Tag:** https://postedor.vercel.app/a/POSTE-MDE-000135

## Generación de Códigos QR

### Herramientas Recomendadas
- **QR Code Generator:** https://www.qr-code-generator.com/
- **QRCode Monkey:** https://www.qrcode-monkey.com/
- **Librería Node.js:** `qrcode` package

### Especificaciones Técnicas
- **Nivel de corrección de errores:** H (30% - máxima resistencia a daños)
- **Tamaño mínimo de impresión:** 3cm x 3cm
- **Formato recomendado:** PNG o SVG para impresión
- **Resolución mínima:** 300 DPI para impresión física

### Ejemplo con Node.js
\`\`\`javascript
const QRCode = require('qrcode')

// Generar QR para Poste #1
QRCode.toFile('poste-1-qr.png', 'https://postedor.vercel.app/p/1', {
  errorCorrectionLevel: 'H',
  type: 'png',
  width: 300,
  margin: 2
})
\`\`\`

## Consideraciones de Implementación

### Durabilidad
- Los códigos QR deben imprimirse en material resistente a la intemperie
- Se recomienda laminado UV para protección contra el sol
- Considerar etiquetas metálicas grabadas para instalaciones permanentes

### Ubicación Física
- Colocar a altura accesible (1.5m - 2m del suelo)
- Evitar áreas con sombra excesiva o reflejos
- Incluir texto legible con el Asset Tag como respaldo

### Seguridad
- Los códigos QR son públicos y no contienen información sensible
- La autenticación para operaciones de escritura se maneja en la aplicación
- Considerar códigos QR únicos por poste para evitar duplicación

## Rendimiento Esperado

### Tiempo de Carga (M1-S1)
- **Objetivo:** < 1 segundo desde escaneo hasta visualización
- **ISR:** Páginas pre-generadas con revalidación cada 60 segundos
- **Skeleton Loading:** Feedback visual inmediato durante carga de datos

### Telemetría
El sistema registra:
- Tiempo de fetch de datos
- Tiempo de renderizado de página
- Errores de carga o 404s

## Próximos Pasos

### Fase 2 (M2)
- Códigos QR con firma digital para operaciones de escritura
- Integración con app móvil nativa para escaneo offline
- Códigos QR dinámicos que actualizan su destino

### Fase 3 (M3)
- Analytics de escaneos por poste
- Mapas de calor de accesos
- Reportes de postes más consultados
