# Antigravity — Corrección puntual Backend: `AuditEvent` y `users/actions.ts`

## Objetivo

Corregir el error de build de Vercel en Backend relacionado con el uso incorrecto del contrato `AuditEvent` dentro de:

```text
apps/backend/src/app/admin/security/users/actions.ts
```

Error observado en build:

```text
Type error: Object literal may only specify known properties, and 'description' does not exist in type 'Omit<AuditEvent, "createdAt">'.
```

---

## Diagnóstico

Se está construyendo un objeto de auditoría con la propiedad:

```ts
description: 'Reseteo manual de contraseña realizado por el administrador.'
```

Pero el contrato `AuditEvent` **no admite** la propiedad `description`.

### Contrato válido de auditoría

El contrato normativo contempla estos campos:

- `tenantId?`
- `moduleId?`
- `eventType`
- `entityType`
- `entityId`
- `actorUserId`
- `actorType`
- `action`
- `before?`
- `after?`
- `metadata?`
- `severity`
- `status`
- `errorCode?`
- `correlationId?`
- `source`
- `createdAt`

### Conclusión

`description` debe eliminarse del payload de auditoría.

El texto funcional debe moverse a `metadata`.

---

## Instrucción de corrección obligatoria

### Archivo a modificar

```text
apps/backend/src/app/admin/security/users/actions.ts
```

### Regla

**No agregar `description` al contrato `AuditEvent`.**  
**No alterar el contrato de dominio para acomodar esta acción.**  
**La corrección debe respetar el diseño normativo del sistema de auditoría.**

---

## Cambio requerido

### Si existe algo como esto

```ts
await auditRepository.logGlobal({
  eventType: 'UserPasswordReset',
  entityType: 'user',
  entityId: userId,
  actorUserId: adminUserId,
  actorType: 'user',
  action: 'password.reset',
  severity: 'critical',
  status: 'success',
  description: 'Reseteo manual de contraseña realizado por el administrador.'
});
```

### Debe quedar así

```ts
await auditRepository.logGlobal({
  eventType: 'UserPasswordReset',
  entityType: 'user',
  entityId: userId,
  actorUserId: adminUserId,
  actorType: 'user',
  action: 'password.reset',
  severity: 'critical',
  status: 'success',
  source: 'ui',
  metadata: {
    message: 'Reseteo manual de contraseña realizado por el administrador.'
  }
});
```

---

## Reglas de implementación

1. El texto explicativo debe ir dentro de `metadata`.
2. Si el evento no tiene `source`, agregar `source: 'ui'` o el valor correcto según el contexto real de ejecución.
3. No debilitar tipado con `as any`.
4. No modificar el contrato `AuditEvent` para incluir `description`.
5. Revisar si existen otros usos similares de `description` en eventos de auditoría y corregirlos también.

---

## Búsqueda recomendada

Buscar en todo el monorepo ocurrencias de:

```text
description:
```

dentro de llamadas como:

- `logGlobal(...)`
- `logTenant(...)`
- `auditRepository.*`
- builders/adapters de auditoría
- server actions que emiten eventos

Corregir cualquier uso incompatible con el contrato actual.

---

## Validación obligatoria

Ejecutar:

```bash
npm run build --workspace=@terabound/backend
```

Si falla nuevamente, revisar el siguiente error de tipos y corregirlo en cadena hasta dejar el build limpio.

---

## Definition of Done

La tarea se considera cerrada cuando:

- se elimina el uso inválido de `description` en auditoría
- el mensaje se migra a `metadata`
- el evento incluye `source` válido cuando corresponda
- no se modifica el contrato normativo de `AuditEvent`
- `npm run build --workspace=@terabound/backend` compila correctamente

---

## Nota para Antigravity

Respetar estrictamente la arquitectura de auditoría gobernada del Backen Admin.

No reinterpretar el contrato.  
No introducir campos ad hoc.  
No usar soluciones laxas para pasar TypeScript.

La solución correcta es adaptar el payload al contrato vigente.
