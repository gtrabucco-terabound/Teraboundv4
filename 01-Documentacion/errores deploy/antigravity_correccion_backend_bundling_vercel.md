# Corrección técnica para Antigravity — Backend build fail en Vercel

## Contexto del error actual

El deploy de `@terabound/backend` en Vercel falla durante `next build` con errores de bundling tipo:

- `Module not found: Can't resolve 'net'`
- `Module not found: Can't resolve 'tls'`
- `Module not found: Can't resolve 'fs'`
- `Module not found: Can't resolve 'child_process'`

### Import trace observado

```text
./src/app/admin/tenants/page.tsx
→ ../../packages/repositories/src/index.ts
→ ../../packages/repositories/src/firestore/admin/firestore-admin-incidents-repository.ts
→ ../../packages/firebase-admin/src/index.ts
→ firebase-admin
```

## Diagnóstico

El problema **no es de Vercel ni de dependencias faltantes**.

El problema es que una página del App Router (`apps/backend/src/app/admin/tenants/page.tsx`) está importando, directa o indirectamente, un barrel file que arrastra código `server-only` basado en `firebase-admin`.

Eso provoca que el bundler intente resolver módulos nativos de Node (`fs`, `net`, `tls`, `child_process`) en un contexto donde no deben entrar.

## Objetivo

Corregir la frontera entre:

- repositorios / utilidades seguros para páginas normales del app
- repositorios admin / server-only que usan `firebase-admin`

---

# Tareas obligatorias

## 1) Revisar `apps/backend/src/app/admin/tenants/page.tsx`

Buscar imports como:

```ts
import { ... } from '@terabound/repositories';
```

o cualquier import que pase por:

```ts
packages/repositories/src/index.ts
```

### Acción requerida
Reemplazar ese barrel import por imports **directos** y **mínimos** hacia los repositorios o contratos realmente usados por la página.

### Regla
`tenants/page.tsx` **no debe** terminar importando nada que arrastre:

- `firebase-admin`
- `packages/firebase-admin`
- `firestore-admin-incidents-repository`
- otros repos server-only no requeridos por esa pantalla

---

## 2) Revisar `packages/repositories/src/index.ts`

Verificar si este archivo está exportando mezclado:

- repositorios client-safe / SSR-safe
- repositorios admin/server-only

### Acción requerida
Separar exports en dos entradas distintas.

### Estructura sugerida

#### `packages/repositories/src/index.ts`
Solo debe exportar repos seguros para consumo general.

Ejemplo conceptual:

```ts
export * from './contracts/...';
export * from './firestore/firestore-tenants-repository';
export * from './firestore/firestore-users-repository';
```

#### `packages/repositories/src/server.ts` o `packages/repositories/src/admin-index.ts`
Debe exportar solo repositorios que dependan de `firebase-admin`.

Ejemplo conceptual:

```ts
export * from './firestore/admin/firestore-admin-incidents-repository';
export * from './firestore/admin/firestore-admin-...';
```

### Regla crítica
Nada que dependa de `firebase-admin` debe salir desde el `index.ts` general si luego ese `index.ts` es importado por páginas o componentes del app.

---

## 3) Revisar `packages/firebase-admin/src/index.ts`

Este módulo debe ser tratado como `server-only`.

### Acción requerida
Confirmar que su consumo quede restringido a:

- server actions
- route handlers
- funciones server-only
- repositorios admin explícitos

### Recomendación
Agregar separación arquitectónica clara para que Antigravity no vuelva a mezclar este módulo en imports generales.

---

## 4) Revisar la implementación de `apps/backend/src/app/admin/tenants/page.tsx`

Si la página necesita datos obtenidos mediante repositorios admin, mover esa carga a una capa explícitamente server-side, por ejemplo:

- server action
- helper server-only
- route handler interno
- módulo de acceso separado con import directo y controlado

### Regla
La página no debe importar un barrel ambiguo que exporte todo el ecosistema de repositories.

---

# Validaciones que debe ejecutar Antigravity

## Validación 1 — búsqueda de imports problemáticos
Buscar en el repo:

- `from '@terabound/repositories'`
- `from '../../packages/repositories/src/index'`
- cualquier import a `packages/repositories/src/index.ts` desde páginas del App Router

Corregir especialmente en:

```text
apps/backend/src/app/admin/tenants/page.tsx
```

## Validación 2 — detección de exports server-only en barrel general
Auditar `packages/repositories/src/index.ts` y remover exports que arrastren:

- `firebase-admin`
- `@google-cloud/storage`
- módulos admin
- implementaciones exclusivas de backend server-only

## Validación 3 — build local focalizado
Ejecutar:

```bash
npm run build --workspace=@terabound/backend
```

## Validación 4 — confirmar que desaparece el import trace
La build no debe volver a mostrar esta cadena:

```text
tenants/page.tsx → repositories/index.ts → firestore-admin-incidents-repository → firebase-admin
```

---

# Resultado esperado

El backend debe compilar en Vercel sin errores de:

- `Can't resolve 'net'`
- `Can't resolve 'tls'`
- `Can't resolve 'fs'`
- `Can't resolve 'child_process'`

y `apps/backend/src/app/admin/tenants/page.tsx` debe consumir solo dependencias apropiadas para su contexto.

---

# Criterio de cierre

La tarea se considera resuelta solo si:

1. `@terabound/backend` compila localmente
2. `@terabound/backend` deploya en Vercel
3. `packages/repositories/src/index.ts` deja de exportar repos server-only
4. queda trazabilidad clara entre imports generales y imports admin

---

# Nota de implementación

No aplicar hacks de webpack ni polyfills para `fs`, `net`, `tls` o `child_process`.

La corrección correcta es **arquitectónica**:
- aislar imports server-only
- romper barrel imports ambiguos
- separar repositorios generales de repositorios admin
