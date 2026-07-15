# Sistema de Gestion de Trafico de Contribucion y Comunicaciones

Este proyecto es una aplicacion web diseñada para la planificacion, maquetacion y exportacion de diagramas tecnicos de contribucion de television y sistemas de comunicaciones (Intercom y coordinacion). Permite generar fichas tecnicas optimizadas para el estandar de impresion A4 en formato apaisado (horizontal).

## Caracteristicas principales

* **Diseño de diagramas por filas**: Generacion de flujos de señales utilizando un sistema de rejilla que alinea de forma matematica las vias, las flechas de direccion (Tx, Rx, Bidireccional) y los destinos.
* **Gestion de catalogo independiente**: Modulos integrados para administrar el inventario de equipos, tipos de tecnologia, recursos comunes y listados de destinos del Control Central Tecnico (CCT).
* **Inmutabilidad historica**: Al guardar una contribucion, los datos de las vias y los destinos se copian directamente en el documento. Esto garantiza que el historial de PDFs emitidos no se altere si se modifica el catalogo en el futuro.
* **Exportacion a PDF**: Maquetacion de fichas tecnicas preparada para impresion que incluye logotipos corporativos, tablas de desglose de audio y video, datos de contacto de produccion y notas operativas.

## Tecnologias utilizadas

* **Vue 3**: Framework principal utilizando Composition API (Script Setup).
* **Vite**: Herramienta de compilacion y servidor de desarrollo rapido.
* **Pinia**: Gestion del estado global de la aplicacion (stores separados para catalogo y contribuciones).
* **Vuetify y CSS Custom**: Combinacion de componentes de interfaz con CSS Grid de alta precision para el diseño del lienzo de impresion.
* **Day.js**: Biblioteca para el manejo y formateo de fechas y versiones.
* **UUID**: Generador de identificadores unicos para los elementos creados en la aplicacion.

## Estructura del proyecto

* `src/assets/images/`: Contiene el logotipo corporativo estatico global de la aplicacion.
* `src/components/`: Carpetas con los componentes de la interfaz, el contenedor del diagrama con la franja rosa fija del CCT, el renderizado de los nodos de equipos y la estructura del lienzo A4.
* `src/stores/`: Gestion del estado compartido para el inventario tecnico y los datos de las fichas de contribucion.
* `src/utils/`: Controladores de persistencia local sincronizada para el almacenamiento de datos.


## Versiones

* 1.0.4 - Añadido el aviso para guardar y limpiar documento al añadir uno nuevo