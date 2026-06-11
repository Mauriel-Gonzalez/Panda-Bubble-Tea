# Panda Bubble Tea

Sitio web responsive para facilitar pedidos digitales de Panda Bubble Tea en Estelí, Nicaragua.

El proyecto está desarrollado con HTML, CSS y JavaScript vanilla. Vite se usa únicamente como herramienta de desarrollo, build y despliegue del frontend.

## Funcionalidades

### Landing page

- Hero principal con producto destacado.
- Sección promocional.
- Testimonio de cliente.
- Navegación responsive.
- Acceso al carrito desde la navegación.

### Menú

- Búsqueda de bebidas.
- Filtros por categoría.
- Categorías con scroll horizontal en móviles.
- Catálogo organizado por Sodas, Cafés, Matcha, Milk Teas y Smoothies.
- Acordeones accesibles mediante `details` y `summary`.
- Modal de personalización con tamaño, toppings y cantidad.
- Carrito persistente en `localStorage`.
- Feedback visual con contador de carrito y notificaciones.

### Checkout

- Resumen del pedido.
- Edición de cantidades.
- Eliminación de productos.
- Vaciar carrito.
- Datos básicos del cliente.
- Validación básica de WhatsApp.
- Generación del pedido para WhatsApp.
- Persistencia local de pedidos enviados.

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla
- Vite
- pnpm

## Estructura

```text
frontend/
  index.html
  menu.html
  checkout.html
  src/
    assets/
    css/
      global.css
      landing.css
      menu.css
      modal.css
      checkout.css
    js/
      app.js
      menu.js
      modal.js
      checkout.js

backend/
  index.js
```

## Desarrollo

Instala dependencias del frontend:

```bash
cd frontend
pnpm install
```

Ejecuta el servidor local:

```bash
pnpm dev
```

Genera la versión de producción:

```bash
pnpm build
```

Previsualiza la build:

```bash
pnpm preview
```

Despliega a GitHub Pages:

```bash
pnpm deploy
```

## Despliegue recomendado

Para producción se recomienda Vercel:

- Conectar el repositorio en Vercel.
- Usar la configuración incluida en `vercel.json`.
- Vercel construye `frontend/` y publica `frontend/dist/`.

GitHub Pages sigue disponible como alternativa con:

```bash
cd frontend
pnpm deploy
```

## Backend

El backend Express expone un endpoint `/menu`, pero el flujo actual de pedido funciona como frontend estático con carrito local y envío por WhatsApp. GitHub Pages despliega únicamente el frontend.

## Estado

MVP funcional listo para revisión de lanzamiento:

- Landing page.
- Menú interactivo.
- Personalización de bebidas.
- Carrito.
- Checkout.
- Integración con WhatsApp.
- Build de producción validada.

## Reglas de precio

- Milk Tea, Bebidas con Café y Smoothies: 16 oz C$130, 22 oz C$150.
- Especiales Matcha: 16 oz C$160, 22 oz C$180.
- Bebidas refrescantes: 22 oz C$100.
- El precio base incluye 1 topping.
- Cada topping adicional cuesta C$30.
