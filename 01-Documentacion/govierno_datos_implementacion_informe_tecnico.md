# 📘 Informe Técnico de Implementación

## Módulo: Gobierno de Datos (Data Governance)

### Backend Admin – Terabound

---

## 1. Propósito del Módulo

El módulo de **Gobierno de Datos** es el plano de control central del modelo de datos de la plataforma Terabound.

Su objetivo es:

* Definir **entidades del sistema**
* Gestionar **relaciones entre entidades**
* Establecer **reglas de validación estructural**
* Garantizar **integridad referencial**
* Evitar inconsistencias entre micro-apps

⚠️ Este módulo **NO es low-code**, ni un generador dinámico de modelos.
Es un **sistema gobernado, controlado y restrictivo**.

---

## 2. Alcance del Módulo

### Incluye:

* Definición de entidades globales
* Definición de relaciones estructurales
* Definición de reglas de validación
* Visualización técnica del modelo de datos

### No incluye:

* Generación automática de código
* Modelado dinámico libre
* Diagramas visuales (fase futura)
* Modificación destructiva sin control

---

## 3. Arquitectura de Persistencia

### Colecciones Globales

| Colección              | Descripción                |
| ---------------------- | -------------------------- |
| `_gl_entities`         | Definición de entidades    |
| `_gl_relationships`    | Relaciones entre entidades |
| `_gl_validation_rules` | Reglas de validación       |

---

## 4. Definición de Entidades

### Estructura: `EntityDefinition`

```ts
{
  id: string
  key: string
  name: string
  description?: string

  storagePath: string
  scope: 'global' | 'tenant'

  primaryIdField: string
  displayField?: string

  auditable: boolean
  softDelete: boolean

  isSystem: boolean
  isActive: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 5. Reglas de Gobernanza para Entidades

### 5.1 Entidades Base Protegidas

Estas entidades deben ser creadas por seed y protegidas:

* `users`
* `tenants`
* `members`
* `_tn_roles`
* `_gl_modules`
* `_gl_catalogs`
* `_gl_catalog_items`
* `_gl_navigation`
* `_gl_navigation_items`

### Restricciones:

* ❌ No se pueden eliminar
* ❌ No se puede modificar `storagePath`
* ❌ No se puede modificar `scope`
* ❌ No se puede modificar `primaryIdField`

---

## 6. Definición de Relaciones

### Estructura: `RelationshipDefinition`

```ts
{
  id: string

  sourceEntityKey: string
  targetEntityKey: string

  cardinality: '1:1' | '1:N' | 'N:N'

  required: boolean

  crossModule: boolean

  strategy: 'reference' | 'embedded'

  cascadePolicy: 'restrict' | 'cascade' | 'set_null'

  isActive: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 7. Reglas de Gobernanza para Relaciones

### 7.1 Validaciones obligatorias

* source y target deben existir
* no permitir relaciones duplicadas
* no permitir self-reference sin control

---

### 7.2 Reglas para `crossModule`

Si `crossModule = true`:

* `strategy` es obligatorio
* `cascadePolicy` es obligatorio
* valor por defecto:

  * `strategy = reference`
  * `cascadePolicy = restrict`

---

### 7.3 Restricciones críticas

* ❌ No eliminar relaciones activas en uso
* ❌ No permitir cascade sin validación
* ❌ No permitir N:N sin justificación técnica

---

## 8. Definición de Validaciones

### Estructura: `ValidationRule`

```ts
{
  id: string

  entityKey: string
  field: string

  type: 'required' | 'enum' | 'format' | 'custom'

  value?: any

  errorMessage?: string

  isActive: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 9. Reglas de Gobernanza para Validaciones

### Permitido:

* required
* enum (contra catálogos)
* formatos básicos (email, phone, etc.)

### No permitido:

* ejecución de lógica dinámica
* scripts personalizados
* validaciones con side effects

---

## 10. Interfaz de Usuario

### 10.1 Entities

* listado + editor
* creación controlada
* indicadores de entidad protegida

### 10.2 Relationships

* tabla CRUD
* selectores de entidades
* validaciones en tiempo real

### 10.3 Validations

* CRUD por entidad
* selector de campos
* tipado restringido

---

## 11. Seeds Iniciales

### Script: `governance-seed.ts`

Debe crear:

### Entidades:

* users
* tenants
* members
* roles
* catalogs
* navigation

### Relaciones:

* tenants → members (1:N)
* users → members (1:N)
* tenants → roles (1:N)
* catalogs → items (1:N)
* navigation → items (1:N)

---

## 12. Reglas de Seguridad

* Solo `PlatformAdmin` puede modificar
* Cambios auditados obligatoriamente
* Versionado recomendado (fase futura)

---

## 13. Restricciones Críticas del Sistema

* No eliminar entidades base
* No modificar estructura crítica
* No permitir inconsistencias referenciales
* No permitir configuraciones ambiguas

---

## 14. Integración con Otros Módulos

### Seguridad

* entidades vinculadas a IAM

### Navegación

* navegación depende de entidades

### Datos Maestros

* validaciones dependen de catálogos

---

## 15. Definition of Done

✔ CRUD de entidades funcional
✔ CRUD de relaciones funcional
✔ CRUD de validaciones funcional
✔ Seeds ejecutados correctamente
✔ Restricciones aplicadas
✔ UI consistente con Backend Admin
✔ Sin posibilidad de romper entidades base

---

## 16. Decisiones Arquitectónicas Finales

1. Relaciones en tabla (no diagrama en esta fase)
2. Sistema gobernado (no low-code)
3. Entidades base protegidas
4. Validaciones limitadas y controladas
5. Seeds obligatorios para estabilidad

---

## 17. Instrucciones para Antigravity

* Implementar estrictamente este documento
* No reinterpretar arquitectura
* No agregar lógica no especificada
* No flexibilizar restricciones
* Respetar naming conventions y colecciones

---

> Este módulo es el núcleo estructural del sistema.
> Cualquier desviación compromete la estabilidad del ecosistema completo.
