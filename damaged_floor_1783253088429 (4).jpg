# Moderación y privacidad

Chivato maneja información sensible sobre viviendas y experiencias de alquiler. Antes de abrir la app al público conviene aplicar estas reglas mínimas.

## Datos personales

No se deben publicar nombres completos de caseros, teléfonos, emails, DNI, matrículas, cuentas bancarias, fotos de documentos sin censurar ni datos que identifiquen directamente a terceros.

## Redacción de reseñas

La interfaz debe empujar a escribir hechos observables:

- Correcto: "Hubo humedad visible en el baño durante tres meses".
- Evitar: "El casero es un estafador".

## Estados recomendados

- `verificationStatus`: `unverified`, `pending`, `verified`, `rejected`.
- `moderationStatus`: `pending`, `published`, `reported`, `hidden`.

## Flujo mínimo

1. El usuario envía reseña.
2. La reseña queda marcada como pendiente o no verificada.
3. Si aporta pruebas, moderación puede marcarla como verificada.
4. Cualquier usuario puede reportarla.
5. Las reseñas reportadas pasan a cola de revisión.
6. Moderación puede publicar, ocultar o rechazar.

## Recomendación para producción

Usar autenticación, base de datos, almacenamiento seguro de imágenes, logs de moderación y textos legales: términos de uso, política de privacidad y canal de retirada/corrección.
