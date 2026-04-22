Decisión: Incluir la carga de SEEDS iniciales como parte de esta tarea.

Condiciones obligatorias:

1. Los SEEDS deben implementarse como un mecanismo de inicialización controlado, no como lógica automática en runtime.

2. Crear un script dedicado (ej: `scripts/seed-master-data.ts`) que:

   * inserte los catálogos base definidos en §8
   * sea idempotente (no duplique datos)
   * valide existencia antes de crear

3. NO ejecutar seeds automáticamente en cada deploy ni dentro de la aplicación en runtime.

4. El script debe poder ejecutarse manualmente mediante comando (ej: `npm run seed:master-data`).

5. Los catálogos base son obligatorios y forman parte del dominio de la plataforma.

6. No reinterpretar esta lógica ni moverla a otro flujo sin aprobación.

Resultado esperado:
El sistema debe quedar operativo desde el inicio con catálogos base consistentes, sin depender de carga manual desde UI.
