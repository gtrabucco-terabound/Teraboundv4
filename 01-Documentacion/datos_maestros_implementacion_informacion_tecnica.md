TERABOUND — IMPLEMENTACIÓN TÉCNICA DATOS MAESTROS (MASTER DATA)

---

## 1. PROPÓSITO

Este documento define la implementación del módulo **Datos Maestros (Catálogos)** dentro del Backend Admin, como parte del sistema central de gobierno de datos de la plataforma Terabound.

Este módulo permitirá:

* Definir catálogos globales reutilizables
* Gestionar valores normalizados
* Permitir extensibilidad controlada por tenant
* Evitar duplicación de datos en micro aplicaciones

---

## 2. ALCANCE

Incluye:

* Definición de catálogos (_gl_catalogs)
* Gestión de items (_gl_catalog_items)
* CRUD completo desde Backend Admin
* Soporte multi-tenant (override controlado)
* Estados activo/inactivo
* Metadata flexible (JSON simple)

No incluye en esta fase:

* Motor dinámico de validación JSON (itemSchema avanzado)
* Versionado de catálogos
* Sincronización externa

---

## 3. PRINCIPIOS DE DISEÑO

Este módulo debe respetar los principios definidos en:

* `backen_admin_master_plan`
* `backen_admin_especificacion_tecnica`
* `seguridad_iam_requerimientos_backen`

### Reglas clave:

1. Backend Admin = fuente de verdad
2. Catálogos NO son configuraciones libres → son datos gobernados
3. No construir sistemas low-code abiertos en esta fase
4. Toda extensibilidad debe ser controlada

---

## 4. MODELO DE DATOS

### 4.1 Colección: `_gl_catalogs`

```json
{
  "id": "countries",
  "name": "Países",
  "description": "Listado global de países",
  "scope": "global", 
  "isOverridable": false,
  "active": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Campos

| Campo         | Tipo    | Descripción                         |
| ------------- | ------- | ----------------------------------- |
| id            | string  | Identificador único (clave técnica) |
| name          | string  | Nombre visible                      |
| description   | string  | Descripción funcional               |
| scope         | enum    | global | tenant                     |
| isOverridable | boolean | Permite override por tenant         |
| active        | boolean | Estado                              |
| timestamps    | date    | Auditoría                           |

---

### 4.2 Colección: `_gl_catalog_items`

```json
{
  "catalogId": "countries",
  "key": "AR",
  "label": "Argentina",
  "value": "AR",
  "metadata": {
    "currency": "ARS",
    "region": "LATAM"
  },
  "sortOrder": 1,
  "active": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

### Campos

| Campo     | Tipo    | Descripción              |
| --------- | ------- | ------------------------ |
| catalogId | string  | Relación al catálogo     |
| key       | string  | Identificador único      |
| label     | string  | Texto visible            |
| value     | string  | Valor funcional          |
| metadata  | object  | JSON flexible controlado |
| sortOrder | number  | Orden                    |
| active    | boolean | Estado                   |

---

## 5. ARQUITECTURA DE REPOSITORIOS

### Interfaces

#### CatalogRepository

* list()
* getById(id)
* create(data)
* update(id, data)
* toggleActive(id)

#### CatalogItemsRepository

* listByCatalog(catalogId)
* create(item)
* update(id, item)
* delete(id)
* toggleActive(id)

---

## 6. INTERFAZ (BACKEND ADMIN)

Ruta:

```text
/admin/master-data/catalogs
```

---

## 6.1 Layout

Vista en dos columnas:

### IZQUIERDA

* Lista de catálogos
* Búsqueda
* Botón “Nuevo Catálogo”

### DERECHA

* Items del catálogo seleccionado
* CRUD de items
* Botón “Nuevo Item”

---

## 6.2 Funcionalidades

### Catálogos

* Crear catálogo
* Editar nombre / descripción
* Definir scope
* Activar / desactivar

### Items

* Crear item
* Editar label / value
* Editar metadata JSON simple
* Activar / desactivar
* Ordenar (sortOrder)

---

## 7. RESTRICCIONES IMPORTANTES

### 7.1 itemSchema

NO implementar en esta fase:

* validación dinámica JSON
* formularios generados automáticamente

Motivo:
Evitar convertir el módulo en un sistema low-code no gobernado.

---

### 7.2 Metadata

Permitido:

```json
{
  "extra": "valor"
}
```

No permitido:

* estructuras complejas no documentadas
* lógica de negocio embebida

---

## 8. SEEDS INICIALES (OBLIGATORIOS)

Debe cargarse automáticamente:

### Localización

* countries
* currencies
* locales

### Plataforma

* tenant-status
* user-status
* module-categories

### Operativos

* yes-no
* active-inactive
* priority-levels
* severity-levels

---

## 9. RELACIÓN CON OTROS MÓDULOS

### Seguridad (IAM)

* controla acceso a catálogos

### Navegación

* puede consumir catálogos para UI dinámica

### Micro Apps

* usan catálogos como fuente única de datos

---

## 10. FLUJO DE USO

```text
Admin → crea catálogo
Admin → carga items
Sistema → guarda en Firestore
Apps → consumen catálogo
Usuarios → ven valores normalizados
```

---

## 11. VALIDACIÓN

### Manual

* Crear catálogo “Sectores”
* Agregar items
* Validar persistencia
* Validar edición
* Validar estado activo/inactivo

---

## 12. REGLAS PARA ANTIGRAVITY

IMPLEMENTACIÓN OBLIGATORIA:

* Respetar estructura de colecciones
* No modificar contratos sin aprobación
* No agregar lógica fuera de alcance
* No implementar itemSchema avanzado
* No reinterpretar arquitectura existente

---

## 13. RESULTADO ESPERADO

El módulo debe permitir:

* Centralizar datos maestros
* Evitar duplicación en micro apps
* Mantener consistencia global
* Soportar crecimiento futuro

---

## 14. ESTADO FINAL

Una vez implementado:

* Backend Admin controla todos los catálogos
* Hub y apps consumen datos normalizados
* Sistema preparado para escalabilidad

---
