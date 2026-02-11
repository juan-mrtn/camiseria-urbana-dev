// El Seed sirve solo para inicializar la base de datos en desarrollo o cuando levantas el proyecto de cero,
// para no tener el sistema vacío mientras programamos.

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Iniciando carga de datos (Seed) para La Camisería Urbana...');

    // ==========================================================
    // 1. PROVEEDORES
    // ==========================================================
    const proveedores = [
        { id: 'PR01', nombre: 'Textil Sur', contacto: 'Razon Social: Textil ER S.A., ventas@textilsur.com' },
        { id: 'PR02', nombre: 'Botones & Hilos', contacto: 'Razon Social: ImpCam S.R.L., info@botoneshilos.com' },
        { id: 'PR03', nombre: 'Telas del Norte', contacto: 'Razon Social: Norte Textil S.A., contacto@telasnorte.com' },
    ];

    console.log(`Cargando ${proveedores.length} proveedores...`);
    for (const p of proveedores) {
        await prisma.proveedor.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        });
    }

    // ==========================================================
    // 2. USUARIOS
    // ==========================================================
    const usuarios = [
        { id: 'U01', nombre: 'Juan Admin', email: 'juan@camiseria.com', password: 'hash_admin_123' },
        { id: 'U02', nombre: 'Facundo Cliente', email: 'facu@gmail.com', password: 'hash_cliente_456' },
        { id: 'U03', nombre: 'Maria Gomez', email: 'maria@outlook.com', password: 'hash_789' },
    ];

    console.log(`Cargando ${usuarios.length} usuarios...`);
    for (const u of usuarios) {
        await prisma.usuario.upsert({
            where: { email: u.email }, // Usamos email como clave única lógica
            update: {},
            create: u,
        });
    }

    // ==========================================================
    // 3. DIRECCIONES
    // ==========================================================
    const direcciones = [
        { id: 'DIR01', usuarioId: 'U02', calle: 'San Lorenzo', numero: '455', codigoPostal: '3200', ciudad: 'Concordia', provincia: 'Entre Ríos' },
        { id: 'DIR02', usuarioId: 'U03', calle: 'Av. Rivadavia', numero: '1200', codigoPostal: '1000', ciudad: 'CABA', provincia: 'Buenos Aires' },
    ];

    console.log(`Cargando ${direcciones.length} direcciones...`);
    for (const d of direcciones) {
        await prisma.direccion.upsert({
            where: { id: d.id },
            update: {},
            create: d,
        });
    }

    // ==========================================================
    // 4. PRODUCTOS (Base)
    // ==========================================================
    const productos = [
        { id: 'P01', nombre: 'Camisa Oxford Blanca', descripcion: '100% Algodón, clásica.', codigo: 'OX-001' },
        { id: 'P02', nombre: 'Camisa Oxford Azul', descripcion: '100% Algodón, formal.', codigo: 'OX-002' },
        { id: 'P03', nombre: 'Camisa Lino Beige', descripcion: 'Fresca para verano.', codigo: 'LN-001' },
        { id: 'P04', nombre: 'Camisa Lino Celeste', descripcion: 'Lino de alta calidad.', codigo: 'LN-002' },
        { id: 'P05', nombre: 'Pantalón Chino Beige', descripcion: 'Corte Slim Fit.', codigo: 'CH-001' },
        { id: 'P06', nombre: 'Pantalón Chino Azul', descripcion: 'Corte Recto Clásico.', codigo: 'CH-002' },
        { id: 'P07', nombre: 'Jean Slim Blue', descripcion: 'Denim con elastano.', codigo: 'JN-001' },
        { id: 'P08', nombre: 'Jean Regular Black', descripcion: 'Denim rígido duradero.', codigo: 'JN-002' },
        { id: 'P09', nombre: 'Remera Básica Blanca', descripcion: 'Jersey de algodón.', codigo: 'RB-001' },
        { id: 'P10', nombre: 'Remera Básica Negra', descripcion: 'Jersey de algodón premium.', codigo: 'RB-002' },
        { id: 'P11', nombre: 'Suéter Lana Gris', descripcion: 'Lana merino suave.', codigo: 'SW-001' },
        { id: 'P12', nombre: 'Campera Eco-cuero', descripcion: 'Corte motero.', codigo: 'CP-001' },
        { id: 'P13', nombre: 'Bermuda Gabardina', descripcion: 'Ideal para tiempo libre.', codigo: 'BM-001' },
        { id: 'P14', nombre: 'Bufanda Lana', descripcion: 'Accesorio de invierno.', codigo: 'AC-001' },
        { id: 'P15', nombre: 'Pack Dupla Oxford', descripcion: 'Representante de combo 2 camisas.', codigo: 'COMBO-01' },
    ];

    console.log(`Cargando ${productos.length} productos base...`);
    for (const p of productos) {
        await prisma.producto.upsert({
            where: { codigo: p.codigo },
            update: {},
            create: p,
        });
    }

    // ==========================================================
    // 5. VARIANTES (Talles y Colores)
    // ==========================================================
    const variantes = [
        { id: 'V1-B-M', productoId: 'P01', precio: 25000, material: 'Algodón', talle: 'M', color: 'Blanco' },
        { id: 'V1-B-L', productoId: 'P01', precio: 25000, material: 'Algodón', talle: 'L', color: 'Blanco' },
        { id: 'V2-A-M', productoId: 'P02', precio: 25000, material: 'Algodón', talle: 'M', color: 'Azul' },
        { id: 'V2-A-L', productoId: 'P02', precio: 25000, material: 'Algodón', talle: 'L', color: 'Azul' },
        { id: 'V3-BE-M', productoId: 'P03', precio: 32000, material: 'Lino', talle: 'M', color: 'Beige' },
        { id: 'V4-CE-L', productoId: 'P04', precio: 32000, material: 'Lino', talle: 'L', color: 'Celeste' },
        { id: 'V5-CH-42', productoId: 'P05', precio: 45000, material: 'Gabardina', talle: '42', color: 'Beige' },
        { id: 'V6-CH-44', productoId: 'P06', precio: 45000, material: 'Gabardina', talle: '44', color: 'Azul' },
        { id: 'V7-JN-42', productoId: 'P07', precio: 38000, material: 'Denim', talle: '42', color: 'Azul' },
        { id: 'V8-JN-46', productoId: 'P08', precio: 38000, material: 'Denim', talle: '46', color: 'Negro' },
        { id: 'V9-RB-M', productoId: 'P09', precio: 12000, material: 'Algodón', talle: 'M', color: 'Blanco' },
        { id: 'V10-RB-L', productoId: 'P10', precio: 12000, material: 'Algodón', talle: 'L', color: 'Negro' },
        { id: 'V11-SW-XL', productoId: 'P11', precio: 55000, material: 'Lana', talle: 'XL', color: 'Gris' },
        { id: 'V12-CP-L', productoId: 'P12', precio: 85000, material: 'Sintético', talle: 'L', color: 'Negro' },
        { id: 'V13-BM-42', productoId: 'P13', precio: 28000, material: 'Gabardina', talle: '42', color: 'Verde' },
        { id: 'V14-BF-UNI', productoId: 'P14', precio: 15000, material: 'Lana', talle: 'Uni', color: 'Gris' },
        { id: 'V-COMBO', productoId: 'P15', precio: 45000, material: 'Algodón', talle: 'Var', color: 'Duo' },
    ];

    console.log(`Cargando ${variantes.length} variantes...`);
    for (const v of variantes) {
        await prisma.productoVariante.upsert({
            where: { id: v.id },
            update: {},
            create: {
                id: v.id,
                productoId: v.productoId,
                precio: v.precio,
                material: v.material,
                talle: v.talle,
                // Opcional: Si tienes la tabla imagenes configurada, puedes agregar una por defecto aquí
                // imagenes: { create: [{ urlImagen: 'https://placehold.co/600x400' }] }
            },
        });
    }

    // ==========================================================
    // 6. COMPRAS A PROVEEDOR (Stock Inicial)
    // ==========================================================
    const compras = [
        { id: 'CP-001', proveedorId: 'PR01', productoVarianteId: 'V1-B-M', cantidad: 50, costo: 10000.00 },
        { id: 'CP-002', proveedorId: 'PR01', productoVarianteId: 'V1-B-L', cantidad: 30, costo: 10000.00 },
        { id: 'CP-003', proveedorId: 'PR03', productoVarianteId: 'V2-A-M', cantidad: 40, costo: 11000.00 },
        { id: 'CP-004', proveedorId: 'PR03', productoVarianteId: 'V2-A-L', cantidad: 20, costo: 11000.00 },
        { id: 'CP-005', proveedorId: 'PR02', productoVarianteId: 'V5-CH-42', cantidad: 15, costo: 20000.00 },
        { id: 'CP-006', proveedorId: 'PR02', productoVarianteId: 'V9-RB-M', cantidad: 100, costo: 4500.00 },
        { id: 'CP-007', proveedorId: 'PR01', productoVarianteId: 'V11-SW-XL', cantidad: 10, costo: 25000.00 },
    ];

    console.log(`Cargando ${compras.length} registros de stock inicial...`);
    for (const c of compras) {
        await prisma.compraProveedor.upsert({
            where: { id: c.id },
            update: {},
            create: {
                ...c,
                fecha: new Date(), // Asigna fecha actual
            },
        });
    }

    // ==========================================================
    // 7. COMBOS
    // ==========================================================
    console.log('Configurando Combos...');

    // Crear el Combo
    const combo = await prisma.combo.upsert({
        where: { id: 'C1' },
        update: {},
        create: {
            id: 'C1',
            nombre: 'Pack Dupla Oxford',
            descripcion: 'Llevate una blanca y una azul talle M',
            precio: 45000,
            productoVarianteId: 'V-COMBO',
        },
    });

    // Items del Combo (Items individuales)
    // Nota: Para relaciones M:N o tablas intermedias, a veces es mejor usar createMany si no tienen ID propio,
    // pero aquí asumimos un upsert seguro o delete/create.
    const comboItems = [
        { comboId: 'C1', productoVarianteId: 'V1-B-M', cantidad: 1 },
        { comboId: 'C1', productoVarianteId: 'V2-A-M', cantidad: 1 },
    ];

    for (const item of comboItems) {
        // Usamos una clave compuesta ficticia para el where si tu esquema lo permite, 
        // o findFirst. Para simplificar en seeds, a veces es mejor crear si no existe.
        // Asumiendo que tienes una clave compuesta @@id([comboId, productoVarianteId])
        try {
            await prisma.comboItem.upsert({
                where: {
                    comboId_productoVarianteId: { // Ajusta esto según cómo se llame tu clave compuesta en schema.prisma
                        comboId: item.comboId,
                        productoVarianteId: item.productoVarianteId
                    }
                },
                update: {},
                create: item
            });
        } catch (e) {
            // Fallback si no hay clave compuesta definida, intentamos create simple
            // (Esto podría fallar si ya existe, ideal para primera carga)
            console.log(`Nota: Intentando crear item de combo ${item.productoVarianteId}...`);
            const exists = await prisma.comboItem.findFirst({
                where: { comboId: item.comboId, productoVarianteId: item.productoVarianteId }
            });
            if (!exists) {
                await prisma.comboItem.create({ data: item });
            }
        }
    }

    console.log('Datos cargados con éxito.');
}

main()
    .then(async () => { await prisma.$disconnect(); })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });