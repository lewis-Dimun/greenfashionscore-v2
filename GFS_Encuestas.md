# 🌿 Green Fashion Score — Encuesta General y Específica (GFS_Encuestas.md)

Sistema de certificación de sostenibilidad textil basado en criterios sociales, ambientales, materiales y circulares.
El documento contiene **todas las preguntas y respuestas** de las encuestas General y Específica, junto con las fórmulas de cálculo y ponderaciones del índice final.

---

## 🧭 Índice

1. [Encuesta General](#encuesta-general)
   - [People](#people)
   - [Planet](#planet)
   - [Materials](#materials)
   - [Circularity](#circularity)
2. [Encuesta Específica por Producto](#encuesta-específica-por-producto)
3. [Fórmulas y Ponderaciones](#fórmulas-y-ponderaciones)

---

## 🧩 Encuesta General

(Los bloques con JSON por pregunta se incluirían aquí, ya estructurados en formato Markdown+JSON de los mensajes anteriores)

---

## 🧶 Encuesta Específica por Producto

(Contiene las preguntas tipo "específica" de todas las dimensiones, incluyendo las extras B–E)

---

## 🧮 Fórmulas y Ponderaciones

### 1. Puntuación General (GFS_General)

Promedio ponderado por dimensión:

GFS_General = (People × 0.25) + (Planet × 0.25) + (Materials × 0.25) + (Circularity × 0.25)

Score de cada dimensión:

Score_X = (Σ Puntos_Obtenidos / Σ Puntos_Máximos_Dimensión) × 100

---

### 2. Puntuación Específica (GFS_Específica)

Aplica por producto, con mayor peso en Materials y Planet:

GFS_Específica = (People × 0.15) + (Planet × 0.35) + (Materials × 0.50)

---

### 3. Puntuación Total de Marca (GFS_Total)

GFS_Total = (GFS_General × 0.6) + (Promedio(GFS_Específica) × 0.4)

---

### 4. Escala de Certificación

| Nivel | Rango | Categoría |
|-------|--------|-----------|
| 🌿 Platino | 85–100 | Marca regenerativa y certificada |
| 🌱 Oro | 70–84 | Sostenible con prácticas avanzadas |
| ♻️ Plata | 55–69 | En transición sostenible |
| 🪴 Bronce | 40–54 | Cumple parcialmente |
| 🚫 Sin Certificación | <40 | No cumple criterios mínimos |

---

**Versión:** 1.0  
**Autor:** DimunLab / Ecodicta  
**Licencia:** CC-BY-NC-SA 4.0  
