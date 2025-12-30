#Arquitectura por Capas - La Camisería Urbana

## Estructura de Carpetas

```
la-camiseria-urbana/
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   ├── seed.ts                 # Datos iniciales
│   └── migrations/             # Migraciones de BD
│
├── src/
│   ├── app/                    # Next.js App Router (Capa de Presentación)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/
│   │   │   ├── productos/
│   │   │   ├── carrito/
│   │   │   ├── checkout/
│   │   │   └── perfil/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── productos/
│   │   │   ├── promociones/
│   │   │   └── estadisticas/
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── trpc/           # tRPC handler
│   │   │   └── webhooks/       # MercadoPago webhooks
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/             # Componentes React reutilizables
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── productos/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── carrito/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── admin/
│   │       ├── StatsCard.tsx
│   │       └── ProductForm.tsx
│   │
│   ├── server/                 # Capa de Lógica de Negocio (Backend)
│   │   ├── api/
│   │   │   ├── root.ts         # tRPC root router
│   │   │   └── routers/
│   │   │       ├── producto.ts
│   │   │       ├── carrito.ts
│   │   │       ├── compra.ts
│   │   │       ├── usuario.ts
│   │   │       ├── promocion.ts
│   │   │       └── admin.ts
│   │   │
│   │   ├── services/           # Servicios de Negocio
│   │   │   ├── ProductoService.ts
│   │   │   ├── CarritoService.ts
│   │   │   ├── CompraService.ts
│   │   │   ├── PromocionService.ts
│   │   │   ├── PagoService.ts
│   │   │   ├── EmailService.ts
│   │   │   └── StockService.ts
│   │   │
│   │   └── auth.ts             # NextAuth configuration
│   │
│   ├── lib/                    # Capa de Acceso a Datos y Utilidades
│   │   ├── db.ts               # Prisma client
│   │   ├── trpc.ts             # tRPC client config
│   │   ├── mercadopago.ts      # MP SDK config
│   │   ├── cloudinary.ts       # Image upload
│   │   ├── email.ts            # Email sender
│   │   └── utils.ts            # Utilidades generales
│   │
│   ├── repositories/           # Capa de Repositorio (Acceso a Datos)
│   │   ├── ProductoRepository.ts
│   │   ├── CarritoRepository.ts
│   │   ├── CompraRepository.ts
│   │   ├── UsuarioRepository.ts
│   │   ├── PromocionRepository.ts
│   │   └── ProveedorRepository.ts
│   │
│   ├── types/                  # Tipos TypeScript
│   │   ├── producto.ts
│   │   ├── carrito.ts
│   │   ├── compra.ts
│   │   └── index.ts
│   │
│   ├── validations/            # Esquemas Zod
│   │   ├── producto.schema.ts
│   │   ├── carrito.schema.ts
│   │   ├── compra.schema.ts
│   │   └── usuario.schema.ts
│   │
│   └── constants/              # Constantes y configuración
│       ├── config.ts
│       └── enums.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local                  # Variables de entorno
├── .eslintrc.json
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Capas de la Arquitectura

### 1. Capa de Presentación (Frontend)
**Ubicación**: `src/app/`, `src/components/`

**Responsabilidades**:
- Interfaz de usuario con Next.js 14 App Router
- Componentes React reutilizables
- Rutas públicas y protegidas
- Server Components y Client Components
- Responsive design con Tailwind CSS

**Tecnologías**: Next.js, React, Tailwind CSS, shadcn/ui

---

### 2. Capa de API/Controladores
**Ubicación**: `src/app/api/`, `src/server/api/routers/`

**Responsabilidades**:
- Endpoints REST API y tRPC
- Autenticación con NextAuth.js
- Validación de requests
- Manejo de errores
- Webhooks de Mercado Pago

**Tecnologías**: tRPC, NextAuth.js, Zod

---

### 3. Capa de Lógica de Negocio (Services)
**Ubicación**: `src/server/services/`

**Responsabilidades**:
- Reglas de negocio del e-commerce
- Cálculo de precios y descuentos
- Gestión de stock
- Aplicación de promociones
- Procesamiento de compras
- Validación de reglas de negocio

**Ejemplo de Servicios**:
```typescript
// ProductoService.ts
class ProductoService {
  verificarDisponibilidad(productoId: string): boolean
  calcularPrecioConDescuento(producto, promocion): number
  marcarSinStock(productoId: string): void
}

// CarritoService.ts
class CarritoService {
  agregarProducto(userId, productoVarianteId, cantidad): Carrito
  calcularTotal(carritoId): number
  validarStock(carritoId): boolean
  aplicarPromociones(carritoId): void
}

// CompraService.ts
class CompraService {
  crearCompra(carritoId, direccionId): Compra
  calcularEnvio(codigoPostal): number
  generarNumeroOrden(): string
  confirmarCompra(compraId): void
}

// PromocionService.ts
class PromocionService {
  aplicar2x1(productos): number
  aplicarDescuentoPorcentaje(total, porcentaje): number
  validarVigencia(promocionId): boolean
  aplicarCupon(codigo, total): number
}
```

---

### 4. Capa de Repositorio (Acceso a Datos)
**Ubicación**: `src/repositories/`

**Responsabilidades**:
- Acceso directo a la base de datos
- Operaciones CRUD
- Queries complejas con Prisma
- Abstracción de la capa de datos

**Ejemplo**:
```typescript
// ProductoRepository.ts
class ProductoRepository {
  async findAll(filtros) { }
  async findById(id) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
  async buscarPorCategoria(categoria) { }
  async productosMasVendidos(limit) { }
}

// CarritoRepository.ts
class CarritoRepository {
  async findByUserId(userId) { }
  async agregarItem(carritoId, item) { }
  async actualizarCantidad(itemId, cantidad) { }
  async eliminarItem(itemId) { }
  async limpiarCarrito(carritoId) { }
}
```

---

### 5. Capa de Integración (Servicios Externos)
**Ubicación**: `src/lib/`

**Responsabilidades**:
- Integración con Mercado Pago
- Envío de emails
- Subida de imágenes a Cloudinary
- Servicios de terceros

**Ejemplo**:
```typescript
// mercadopago.ts
export class MercadoPagoService {
  crearPreferencia(items, compraId): Preference
  procesarPago(paymentId): Payment
  manejarWebhook(data): void
}

// email.ts
export class EmailService {
  enviarConfirmacionRegistro(email, nombre): void
  enviarConfirmacionCompra(email, compra): void
  enviarNotificacionPromocion(emails, promocion): void
}
```

---

## Flujo de Datos

### Ejemplo: Finalizar Compra

```
1. Usuario hace clic en "Finalizar Compra"
   ↓
2. Component (Presentación)
   - CartCheckout.tsx valida formulario
   ↓
3. tRPC Router (API)
   - compra.finalizarCompra() recibe request
   - Valida con Zod schema
   ↓
4. Service (Lógica de Negocio)
   - CompraService.crearCompra()
   - CarritoService.validarStock()
   - PromocionService.aplicarDescuentos()
   - PagoService.procesarPago()
   ↓
5. Repository (Acceso a Datos)
   - CompraRepository.create()
   - StockService.actualizarStock()
   - CarritoRepository.limpiar()
   ↓
6. Database (PostgreSQL + Prisma)
   - Transacción para garantizar consistencia
   ↓
7. Servicios Externos
   - MercadoPagoService.crearPreferencia()
   - EmailService.enviarConfirmacion()
   ↓
8. Response al Cliente
   - Confirmación de compra
   - Número de orden
   - Link de pago
```

---

## Principios de Diseño

### SOLID
- **S**: Cada clase tiene una responsabilidad única
- **O**: Extensible sin modificar código existente
- **L**: Las subclases son intercambiables
- **I**: Interfaces específicas por cliente
- **D**: Depender de abstracciones, no implementaciones

### Separación de Responsabilidades
- **Presentación**: Solo UI y UX
- **API**: Solo routing y validación
- **Services**: Solo lógica de negocio
- **Repository**: Solo acceso a datos

### Testeable
- Cada capa puede testearse independientemente
- Mocks y stubs para servicios externos
- Unit tests, integration tests, e2e tests

---

## Tecnologías por Capa

| Capa | Tecnologías |
|------|------------|
| Presentación | Next.js 14, React, Tailwind, shadcn/ui |
| API | tRPC, NextAuth.js, Zod |
| Lógica de Negocio | TypeScript, Class-based Services |
| Repositorio | Prisma ORM |
| Base de Datos | PostgreSQL |
| Integraciones | Mercado Pago SDK, Resend, Cloudinary |

---

## Variables de Entorno

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/camiseria_urbana"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="tu-mp-token"
MERCADOPAGO_PUBLIC_KEY="tu-mp-public-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Email
RESEND_API_KEY="tu-resend-key"
EMAIL_FROM="noreply@camiseriaurbana.com"
```

---

## Próximos Pasos

1. **Setup Inicial** (Sprint 0)
   - Crear proyecto Next.js
   - Configurar Prisma + PostgreSQL
   - Setup de autenticación

2. **Sprint 1** (Semana 1)
   - Implementar modelos de BD
   - Crear repositorios base
   - Desarrollar catálogo de productos

3. **Sprint 2** (Semana 2)
   - Sistema de carrito
   - Gestión de stock
   - Panel de administrador básico

4. **Sprint 3** (Semana 3)
   - Integración Mercado Pago
   - Proceso de checkout
   - Emails de confirmación

¿Te gustaría que comencemos con alguna capa específica o que te muestre el código de implementación de algún servicio en particular?
