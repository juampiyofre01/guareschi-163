# Revisión de coherencia — 28/09/2026

Referencia: brochure PPT Guareschi 163 - 01 23 25.pdf, páginas 10–14; capturas del usuario.

## Correcciones aplicadas

- Sustitución de ventanas genéricas por intervalos trazados de cada tipología. Las medianeras permanecen ciegas; las ventanas de fachada y patio se conservan donde están dibujadas. Alturas de antepechos/dinteles propuestas, porque las plantas no las acotan.
- Tipología B (103/105, 203/205, 303/305): agregado del retorno que separa dormitorio y comedor; corrección del hueco de acceso al dormitorio principal y del cierre del distribuidor.
- A: ejes continuos de paredes de baños/dormitorios, cierre junto al baño principal y puerta del patio-lavadero.
- C: continuidad de pared del baño y dintel sobre acceso.
- D/E: continuidad de paredes en baños/dormitorios, conservando el paso hacia la escalera.
- Misma geometría procedural para aislar, destacar y ver plantas; regeneración del maestro Blender y GLB descargable.

## Comprobaciones

- 271 comprobaciones sobre las 19 unidades: puertas con pared anfitriona, ventanas sobre perímetro y fuera de medianeras, retorno B y coordenadas finitas.
- 13 comprobaciones del constructor: ocho niveles de escalera, cuatro dimensiones de dormitorio principal y geometría finita.
- Revisión visual de una instancia de cada tipología A/B/C/D/E y niveles superiores D/E. Los restantes ejemplares reutilizan la misma geometría con traslación/reflexión.
- Reimportación GLB: 1.231.793 triángulos; sin vértices inválidos ni texturas sin UV. Persisten ocho triángulos degenerados del conjunto existente.

## Alcance y límites

Esta revisión corrige errores de cerramiento y aberturas; no certifica todo el edificio como exacto. El brochure advierte que las cotas y superficies son estimativas. Alturas, espesores, mobiliario, desarrollo de escaleras y partes de los niveles superiores siguen interpretados. No se realizó una validación exhaustiva de colisiones de cada pieza de mobiliario ni una reconstrucción ejecutiva de terrazas, instalaciones o estructura. Se requiere documentación arquitectónica acotada para certificar esas partes. El exterior de referencia no se modificó en esta revisión.

Publicado en GitHub Pages; el alojamiento antiguo de Sites no se actualiza en esta revisión.
