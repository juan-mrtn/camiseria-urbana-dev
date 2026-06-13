# 👔 La Camisería Urbana

![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

**La Camisería Urbana** es una plataforma integral de E-commerce B2C diseñada para la comercialización minorista de camisería premium (algodón, jean, lino). El sistema ofrece un flujo transaccional seguro y escalable, integrando pasarela de pagos, cálculo dinámico de costos logísticos y gestión de inventario estricta de extremo a extremo a nivel nacional.

---

## 🛠️ Stack Tecnológico (Tech Stack)

Este proyecto está construido con una arquitectura moderna que prioriza el rendimiento, la seguridad y la experiencia del usuario (UX/UI):

| Capa | Tecnologías Clave | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React, Next.js (App Router), Tailwind CSS | Interfaces reactivas y dinámicas con soporte nativo para **Modo Oscuro**. |
| **Backend** | TypeScript, Next.js Server Actions | Arquitectura RPC (Remote Procedure Call) segura. **No utilizamos API REST tradicionales** para las mutaciones; toda la lógica se invoca directamente de forma segura desde el cliente al servidor. |
| **Autenticación** | NextAuth.js, Google OAuth | Autenticación unificada y segura delegada a proveedores externos y persistida en BD. |
| **Base de Datos** | PostgreSQL, `pg` (node-postgres) | Persistencia relacional de alto rendimiento mediante *Connection Pooling*. **No se utiliza ORM (ni Prisma ni Drizzle)**. Toda la delegación de datos se maneja mediante vistas optimizadas, CTEs y procedimientos almacenados (Triggers). |

---

## 🏗️ Arquitectura del Sistema

El sistema implementa el **Patrón Repositorio (Repository Pattern)** para garantizar un estricto desacoplamiento entre las reglas de negocio, la capa de interfaz y el almacenamiento.

1. **Capa de Presentación**: Componentes modulares y reutilizables en React/Tailwind. Interactúan con el usuario.
2. **Capa de Control (Server Actions)**: Validadores de sesión (Auth) y orquestadores que actúan de escudo y procesan la intención del usuario.
3. **Capa de Acceso a Datos (Repository Layer)**: Clases en TypeScript que encapsulan sentencias SQL crudas, inyecciones parametrizadas y lógicas de acceso sin exponer esquemas a la aplicación.
4. **Capa de Persistencia (PostgreSQL)**: El motor de base de datos se encarga de la consistencia pesada (Integridad referencial, Funciones SQL, Transacciones ACID).

### Flujo de Datos Arquitectónico

```mermaid
graph TD
    A[Cliente / Browser (React)] -->|Interacción / Hook| B[Server Action (RPC)]
    B -->|Validación & Auth| C[Repository Layer (SQL)]
    C -->|Consultas Parametrizadas 'pg'| D[(PostgreSQL)]
    D -->|Vistas Materializadas / Data| C
    C -->|DTOs Tipados| B
    B -->|Respuesta| A
```

---

## 📁 Estructura del Proyecto

La arquitectura jerárquica dentro del directorio `/src` está diseñada bajo principios de Clean Code para facilitar la escalabilidad:

```text
src/
├── actions/             # Capa de Controladores y Casos de Uso (Server Actions RPC)
├── app/                 # Enrutamiento jerárquico por Archivos (App Router: admin, auth, shop, api)
├── components/          # Unidades de UI modulares y reutilizables (admin, carrito, shop, ui)
├── config/              # Configuraciones globales de diseño (Tipografías, assets)
├── lib/                 # Inicialización de clientes core del sistema (db.ts con el pool de 'pg', email.ts)
├── repositories/        # Capa de Acceso a Datos nativa mediante SQL puro (Patrón Repositorio)
├── styles/              # Directivas CSS globales y configuración de Tailwind
└── types/               # Definiciones de tipos e interfaces globales de TypeScript
data-base/               # Scripts de inicialización SQL del motor (schema.sql y vistas)
```

---

## ⚖️ Reglas de Negocio Críticas

El E-commerce está regido por estrictas validaciones en el Backend para garantizar la consistencia comercial:

*   **Gestión de Stock Estricta y Auditable**: El stock de las variantes de productos **no puede modificarse manualmente**. Todo ingreso de inventario debe realizarse únicamente a través del registro oficial de órdenes de compra a proveedores para mantener la trazabilidad.
*   **Regla de Envío Gratis (Free Shipping)**: Promoción automática aplicada en el Checkout. Si el subtotal del carrito supera o iguala los **$150.000 ARS**, el costo logístico de envío es de **$0 ARS**.
*   **Tarifario Regional (Correo Argentino)**: Si el usuario no aplica a la promoción de envío gratis, el costo se calcula dinámicamente según el primer dígito del Código Postal ingresado:
    *   **$3.500 ARS**: Prefijo `1` (CABA / AMBA).
    *   **$5.500 ARS**: Prefijos `2` o `3` (Provincia de Buenos Aires Interior, Centro, Entre Ríos).
    *   **$8.000 ARS**: Resto del país (Cualquier otro prefijo).
*   **Políticas Generales**: Venta exclusivamente minorista a nivel nacional. Sin sistema de devoluciones integradas en plataforma.

---

## 🚀 Guía de Instalación y Configuración Local

Para levantar el entorno de desarrollo en tu máquina local, sigue los pasos a continuación:

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/tu-organizacion/camiseria-urbana.git
cd camiseria-urbana
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto. Deberás proveer las credenciales de base de datos, los tokens de OAuth y los accesos a la pasarela de pagos.

```env
# Ejemplo de .env.local

# Conexión nativa a PostgreSQL (pg)
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/camiseria_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secreto_super_seguro_generado_con_openssl"

# Google OAuth (Para Login/Registro)
GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# MercadoPago (Checkout API)
MERCADOPAGO_ACCESS_TOKEN="TEST-123456789-TU-TOKEN-SANDBOX"
```

### 3. Inicialización de la Base de Datos
Debido a que no utilizamos ORM, debes estructurar la base de datos de manera explícita ejecutando los scripts SQL en tu cliente PostgreSQL preferido (pgAdmin, DBeaver o psql).

Ingresa a tu base de datos `camiseria_db` y ejecuta en orden lógico los scripts ubicados en la carpeta `data-base/` (incluyendo la creación de tablas, funciones y la vista esencial `v_producto_detalle`).

### 4. Ejecución del Servidor
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Estrategia de QA y Testing Automatizado

La calidad del software está respaldada por una arquitectura de pruebas orientada a la **Pirámide de Pruebas**:

*   **Pruebas Unitarias (Vitest)**: Enfoque aislado y de rápida ejecución para validar la lógica pura (Matemática de los cupones, cálculos de totales del carrito, tarifas de envío, combos algorítmicos).
*   **Pruebas de Integración (Vitest + DB Test)**: Verifican la comunicación fluida entre los *Server Actions* y los Repositorios SQL. Se utiliza un entorno de base de datos aislado que se limpia tras cada ejecución (`TRUNCATE CASCADE`) para garantizar reproducibilidad.
*   **Pruebas End-to-End o de Extremo a Extremo (Playwright)**: Scripts que levantan navegadores *headless* emulando el comportamiento exacto del usuario: flujos de navegación por el catálogo, inicio de sesión con Google Auth y simulación de pagos a través de MercadoPago Sandbox.
*   **Automatización CI/CD (GitHub Actions)**: Todo código propuesto en un *Pull Request* activa un *pipeline* automatizado que corre linters, compila TypeScript y ejecuta la suite completa de pruebas antes de autorizar su integración a la rama principal.
