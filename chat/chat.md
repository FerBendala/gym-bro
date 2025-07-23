componentiza este componente @/dashboard, los archivos tienen muchos archivos y mucha logica, ha de cumplir un mínimo de estándares, max 80 - 120 lineas, hooks, utils dentro de la misma carpeta siempre que afecten al propio componente. solo puede haber una carpeta de componentes, hooks y utils. Recuerda que tenemos zustand para los estados
recuerda no crear otras carpetas a las mencionadas manteniendo la logica de la aquitectura simple

esta es la arquitectura que espero:
|- componente
|-- components
|-- hooks
|-- utils
|-- componente.tsx
|-- types.ts (opcional)
|-- constants.ts (opcional)
|-- index.ts
