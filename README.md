# posthand — Gestor de Correos con Filtros Dinámicos

![CI](https://github.com/valenbasiuk/posthand/actions/workflows/ci.yml/badge.svg)

AE4 · Paradigmas y Lenguajes II · UCP 2026
**Grupo 20** · Diego Valentino Basiuk Fetter (`valenbasiuk`)

Sistema de gestión de correos electrónicos en **TypeScript** que combina
**Programación Orientada a Objetos** (modelo de dominio) con
**Programación Funcional** (búsquedas, filtros y estadísticas),
desarrollado con **TDD** y **integración continua** en GitHub Actions.

## Cómo correrlo

```bash
npm install
npm test            # corre los tests una vez
npm run test:watch  # modo TDD: re-corre al guardar
npm run coverage    # tests + reporte de cobertura
npm run typecheck   # chequeo de tipos de src y tests
npm run build       # compila a dist/
```

## Estructura

```
src/
  dominio/
    ErrorDeDominio.ts   error para violaciones de reglas del negocio
    Contacto.ts         RF-03  value object inmutable (nombre + email)
    Agenda.ts           RF-03  ABM de contactos, sin duplicados por email
    Correo.ts           RF-01  correo con id único · RF-08 leído · RF-09 favorito
  index.ts
tests/                  un archivo de tests por clase
.github/workflows/ci.yml  compila y corre los tests en cada push
```

## Planificación de Sprints

Cada sprint cierra un martes, en el Daily / Sprint Check-in.

| Sprint | Cierre | Objetivo | Requerimientos |
|---|---|---|---|
| **1** | mar 03/11 | Base del proyecto y modelo de dominio | Setup TS + Vitest + CI · **RF-03** Contactos · **RF-01** Correo · **RF-08** Leído/no leído |
| **2** | mar 10/11 | Bandejas y flujo de envío | **RF-06** Bandejas · **RF-07** Borradores · **RF-02** Envío · **RF-09** Vista de favoritos · Diagrama UML (borrador) |
| **3** | mar 17/11 | Paradigma funcional y cierre | **RF-04** Búsqueda · **RF-05** Filtros (AND/OR/NOT) · **RF-10** Estadísticas (map/filter/reduce) · Informe técnico + UML final |

### Entregables verificables por sprint

**Sprint 1**
- `Contacto`: valida formato de email, normaliza mayúsculas, es inmutable.
- `Agenda`: alta / consulta / modificación / baja; impide duplicados por email; borrar o modificar un contacto no altera correos ya creados.
- `Correo`: id único, remitente obligatorio, destinatarios sin duplicados y no modificables desde afuera, validación para envío, leído/no leído, favorito.

**Sprint 2**
- `Bandeja` y `GestorDeCorreos`: cada correo en una única bandeja física.
- Enviar: valida remitente/asunto/destinatarios, mueve a Enviados, sin duplicados, sale de Borradores.
- Eliminar lógico a Eliminados y restaurar a la bandeja de origen.
- Borradores incompletos editables; borrador inválido no se envía.
- Vista de favoritos (excluye Eliminados, sin duplicados, no mueve correos).
- No leídos de una bandeja.

**Sprint 3**
- Búsqueda de texto libre en Entrada (asunto, cuerpo, remitente, destinatarios), sin distinguir mayúsculas, parcial, sin duplicados.
- `Predicado<Correo>` + combinadores `and`, `or`, `not`; predicados reutilizables (`deDominio`, `asuntoContiene`, `noLeido`, `esFavorito`, ...).
- `Filtro` (nombre + predicado), máximo 5 registrados, al menos 3 complejos, aplicable a cualquier bandeja, sin modificar correos.
- Estadísticas con `map` (asuntos), `filter`, `reduce` (conteos).

## Tablero

| Tarea | Sprint | RF | Estado |
|---|---|---|---|
| Proyecto TypeScript + Vitest | 1 | — | ✅ Finalizado |
| Workflow de GitHub Actions | 1 | — | ✅ Finalizado |
| Clase `Contacto` + tests | 1 | RF-03 | ✅ Finalizado |
| Clase `Agenda` (ABM, sin duplicados) + tests | 1 | RF-03 | ✅ Finalizado |
| Clase `Correo` (id, validación, destinatarios protegidos) + tests | 1 | RF-01 | ✅ Finalizado |
| Leído / no leído + tests | 1 | RF-08 | ✅ Finalizado |
| Indicador de favorito + tests | 1 | RF-09 | ✅ Finalizado |
| Clase `Bandeja` + tests | 2 | RF-06 | ⏳ Pendiente |
| `GestorDeCorreos`: mover, eliminar, restaurar | 2 | RF-06 | ⏳ Pendiente |
| Borradores: crear, editar, recuperar | 2 | RF-07 | ⏳ Pendiente |
| Envío (desde nuevo y desde borrador) | 2 | RF-02 | ⏳ Pendiente |
| Vista de favoritos | 2 | RF-09 | ⏳ Pendiente |
| No leídos de una bandeja | 2 | RF-08 | ⏳ Pendiente |
| Diagrama de clases UML (borrador) | 2 | — | ⏳ Pendiente |
| Búsqueda de texto libre | 3 | RF-04 | ⏳ Pendiente |
| Predicados y combinadores AND/OR/NOT | 3 | RF-05 | ⏳ Pendiente |
| Registro de filtros (máx. 5) + 3 filtros complejos | 3 | RF-05 | ⏳ Pendiente |
| Estadísticas (map / filter / reduce) | 3 | RF-10 | ⏳ Pendiente |
| Informe técnico + UML final | 3 | — | ⏳ Pendiente |

## Decisiones de diseño (Sprint 1)

- **`Contacto` inmutable.** "Modificar" un contacto en la agenda crea uno nuevo y reemplaza al anterior. Los correos guardan la referencia al objeto original, así que borrar o editar un contacto no altera el historial (criterio de RF-03).
- **Criterio anti-duplicados: el email.** Se normaliza (trim + minúsculas) y se usa como clave de un `Map` en la `Agenda`.
- **Borradores incompletos desde el diseño.** `Correo` solo exige el remitente al crearse; lo necesario para enviar se valida aparte con `validarParaEnvio()`, que devuelve la lista de problemas. Esto deja preparado RF-07.
- **Encapsulamiento de destinatarios.** El array interno es privado; el getter `para` devuelve una copia congelada (`Object.freeze`), así nadie puede agregar duplicados ni vaciarlo por fuera de las reglas.
