-- CreateEnum
CREATE TYPE "TipoPromocion" AS ENUM ('Descuento', '2x1');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('inactivo', 'procesando', 'confirmado', 'rechazado');

-- CreateEnum
CREATE TYPE "EstadoCarrito" AS ENUM ('abierto', 'confirmado', 'cancelado');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('cliente', 'admin');

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "codigo" VARCHAR(50) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPromocion" NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "descuento" DECIMAL(10,2),

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_variante" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "promocion_id" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "material" VARCHAR(30),
    "talle" VARCHAR(4),
    "color" VARCHAR(30),

    CONSTRAINT "producto_variante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagen" (
    "id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "url_imagen" TEXT NOT NULL,

    CONSTRAINT "imagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "password" VARCHAR(30) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'cliente',
    "suscrito" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "contacto" TEXT,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_proveedor" (
    "id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costo" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "compra_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direccion" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "calle" VARCHAR(30) NOT NULL,
    "numero" VARCHAR(30),
    "codigo_postal" VARCHAR(5) NOT NULL,
    "ciudad" VARCHAR(50) NOT NULL,
    "provincia" VARCHAR(50) NOT NULL,

    CONSTRAINT "direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opinion" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opinion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorito" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,

    CONSTRAINT "favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrito" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "total" DECIMAL(12,2) DEFAULT 0,
    "descuento_total" DECIMAL(12,2) DEFAULT 0,
    "estado" "EstadoCarrito" NOT NULL DEFAULT 'abierto',

    CONSTRAINT "carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrito_item" (
    "id" TEXT NOT NULL,
    "carrito_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "descuento_unitario" DECIMAL(12,2) DEFAULT 0,

    CONSTRAINT "carrito_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(12,2) NOT NULL,
    "descuento_total" DECIMAL(12,2) DEFAULT 0,
    "estado_pago" "EstadoPago" NOT NULL,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linea_de_compra" (
    "id" TEXT NOT NULL,
    "compra_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "descuento_unitario" DECIMAL(12,2) DEFAULT 0,

    CONSTRAINT "linea_de_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "producto_variante_id" TEXT NOT NULL,

    CONSTRAINT "combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_item" (
    "combo_id" TEXT NOT NULL,
    "producto_variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "combo_item_pkey" PRIMARY KEY ("combo_id","producto_variante_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "favorito_usuario_id_producto_variante_id_key" ON "favorito"("usuario_id", "producto_variante_id");

-- CreateIndex
CREATE UNIQUE INDEX "compra_numero_key" ON "compra"("numero");

-- AddForeignKey
ALTER TABLE "producto_variante" ADD CONSTRAINT "producto_variante_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_variante" ADD CONSTRAINT "producto_variante_promocion_id_fkey" FOREIGN KEY ("promocion_id") REFERENCES "Promocion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_proveedor" ADD CONSTRAINT "compra_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_proveedor" ADD CONSTRAINT "compra_proveedor_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opinion" ADD CONSTRAINT "opinion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opinion" ADD CONSTRAINT "opinion_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito" ADD CONSTRAINT "carrito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_item" ADD CONSTRAINT "carrito_item_carrito_id_fkey" FOREIGN KEY ("carrito_id") REFERENCES "carrito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_item" ADD CONSTRAINT "carrito_item_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linea_de_compra" ADD CONSTRAINT "linea_de_compra_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linea_de_compra" ADD CONSTRAINT "linea_de_compra_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo" ADD CONSTRAINT "combo_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_item" ADD CONSTRAINT "combo_item_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_item" ADD CONSTRAINT "combo_item_producto_variante_id_fkey" FOREIGN KEY ("producto_variante_id") REFERENCES "producto_variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------------------------------------------------------------------
-- ==========================================================
-- 1. FUNCIÓN AUXILIAR: Cálculo de Stock en Tiempo Real
-- ==========================================================
-- Esta función hace la cuenta: (Suma Ingresos Proveedor) - (Suma Ventas Confirmadas)
-- También considera los componentes de los combos vendidos.

CREATE OR REPLACE FUNCTION fn_obtener_stock_real(p_variante_id VARCHAR) 
RETURNS INT AS $$
DECLARE
    v_ingresos INT;
    v_egresos_directos INT;
    v_egresos_combos INT;
BEGIN
    -- 1. Total ingresado por proveedores
    SELECT COALESCE(SUM(cantidad), 0) INTO v_ingresos 
    FROM compra_proveedor 
    WHERE producto_variante_id = p_variante_id;

    -- 2. Total vendido como producto individual (Ventas confirmadas)
    SELECT COALESCE(SUM(lc.cantidad), 0) INTO v_egresos_directos
    FROM linea_de_compra lc
    JOIN compra c ON lc.compra_id = c.id
    WHERE lc.producto_variante_id = p_variante_id 
    AND c.estado_pago = 'confirmado';

    -- 3. Total vendido dentro de COMBOS (Ventas confirmadas)
    -- Buscamos si la variante de la línea de compra pertenece a un combo
    SELECT COALESCE(SUM(lc.cantidad * ci.cantidad), 0) INTO v_egresos_combos
    FROM linea_de_compra lc
    JOIN compra c ON lc.compra_id = c.id
    -- Unimos la línea de compra con la tabla combo a través de la variante representante
    JOIN combo co ON lc.producto_variante_id = co.producto_variante_id
    -- Unimos con los ítems del combo para saber qué componentes tiene
    JOIN combo_item ci ON co.id = ci.combo_id
    WHERE ci.producto_variante_id = p_variante_id
    AND c.estado_pago = 'confirmado';

    RETURN v_ingresos - v_egresos_directos - v_egresos_combos;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- 2. TRIGGER: Validación de Stock antes de agregar al Carrito
-- ==========================================================
-- Bloquea la inserción si el cálculo de la función anterior es insuficiente.

CREATE OR REPLACE FUNCTION fn_trg_validar_disponibilidad() 
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INT;
    v_item_combo RECORD;
    v_combo_id VARCHAR;
BEGIN
    -- Buscamos si la variante que se intenta agregar es un COMBO
    SELECT id INTO v_combo_id FROM combo WHERE producto_variante_id = NEW.producto_variante_id;

    -- CASO A: Es un Combo (v_combo_id no es nulo)
    IF v_combo_id IS NOT NULL THEN
        FOR v_item_combo IN (SELECT producto_variante_id, cantidad FROM combo_item WHERE combo_id = v_combo_id) LOOP
            v_stock_actual := fn_obtener_stock_real(v_item_combo.producto_variante_id);
            IF v_stock_actual < (v_item_combo.cantidad * NEW.cantidad) THEN
                RAISE EXCEPTION 'Stock insuficiente en componentes del combo. La variante % solo tiene % unidades.', 
                                v_item_combo.producto_variante_id, v_stock_actual;
            END IF;
        END LOOP;

    -- CASO B: Es un producto individual
    ELSE
        v_stock_actual := fn_obtener_stock_real(NEW.producto_variante_id);
        IF v_stock_actual < NEW.cantidad THEN
            RAISE EXCEPTION 'No hay stock suficiente para el producto %. Disponible: %', 
                            NEW.producto_variante_id, v_stock_actual;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_carrito_item_valida_stock
BEFORE INSERT OR UPDATE ON carrito_item
FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_disponibilidad();

-- ==========================================================
-- TRIGGER: trg_validar_stock_antes_de_confirmar
-- ==========================================================
-- Reemplaza la reducción física de stock. 
-- Valida que al momento de confirmar el pago, todavía exista mercadería.

CREATE OR REPLACE FUNCTION fn_trg_validar_confirmacion_pago() 
RETURNS TRIGGER AS $$
DECLARE
    v_linea RECORD;
    v_stock_actual INT;
    v_comp RECORD;
    v_combo_id VARCHAR;
BEGIN
    IF NEW.estado_pago = 'confirmado' AND OLD.estado_pago <> 'confirmado' THEN
        
        FOR v_linea IN SELECT * FROM linea_de_compra WHERE compra_id = NEW.id LOOP
            
            -- Verificamos si esta línea de compra es un combo
            SELECT id INTO v_combo_id FROM combo WHERE producto_variante_id = v_linea.producto_variante_id;

            IF v_combo_id IS NOT NULL THEN
                -- Es un Combo: Validamos sus componentes
                FOR v_comp IN (SELECT producto_variante_id, cantidad FROM combo_item WHERE combo_id = v_combo_id) LOOP
                    v_stock_actual := fn_obtener_stock_real(v_comp.producto_variante_id);
                    IF v_stock_actual < (v_comp.cantidad * v_linea.cantidad) THEN
                        RAISE EXCEPTION 'No se puede confirmar la compra. El componente % del combo no tiene stock suficiente.', 
                                        v_comp.producto_variante_id;
                    END IF;
                END LOOP;
            ELSE
                -- Es producto individual: Validamos su stock
                v_stock_actual := fn_obtener_stock_real(v_linea.producto_variante_id);
                IF v_stock_actual < v_linea.cantidad THEN
                    RAISE EXCEPTION 'No se puede confirmar la compra. El producto % se quedó sin stock (Disponible: %)', 
                                    v_linea.producto_variante_id, v_stock_actual;
                END IF;
            END IF;
            
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_compra_validar_stock_final
BEFORE UPDATE OF estado_pago ON compra
FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_confirmacion_pago();


-- Esta función simplemente suma los subtotales (cantidad * precio_unitario) de los ítems asociados a un carrito.
CREATE OR REPLACE FUNCTION fn_calcular_total_carrito(p_carrito_id VARCHAR) 
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(cantidad * precio_unitario), 0) INTO v_total
    FROM carrito_item
    WHERE carrito_id = p_carrito_id;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Trigger que actualiza el total del carrito cada vez que se inserta, actualiza o elimina un ítem.
-- Para que el campo total de la tabla carrito esté siempre actualizado, creamos un trigger que se dispare cada vez que agregas, borras o modificas un ítem en carrito_item.
CREATE OR REPLACE FUNCTION fn_trg_actualizar_total_carrito() 
RETURNS TRIGGER AS $$
DECLARE
    v_carrito_id VARCHAR;
BEGIN
    -- Identificamos el ID del carrito afectado (funciona para INSERT, UPDATE y DELETE)
    IF (TG_OP = 'DELETE') THEN
        v_carrito_id := OLD.carrito_id;
    ELSE
        v_carrito_id := NEW.carrito_id;
    END IF;

    -- Actualizamos el total en la tabla padre (carrito)
    UPDATE carrito 
    SET total = fn_calcular_total_carrito(v_carrito_id)
    WHERE id = v_carrito_id;

    RETURN NULL; -- En triggers AFTER el valor de retorno no afecta a la fila
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_total_carrito
AFTER INSERT OR UPDATE OR DELETE ON carrito_item
FOR EACH ROW EXECUTE FUNCTION fn_trg_actualizar_total_carrito();

-- ---------------------------------------------------------------------------------------------------------------------------------------


-- ==========================================================
-- 1. VISTA: Stock Actual de Productos
-- ==========================================================
CREATE OR REPLACE VIEW v_stock_actual AS
SELECT 
    id AS producto_variante_id,
    fn_obtener_stock_real(id) AS stock_disponible
FROM producto_variante;

-- ==========================================================
-- 2. VISTA: Catálogo para el Usuario (Usa la vista de stock)
-- ==========================================================
CREATE OR REPLACE VIEW v_catalogo_publico AS
SELECT 
    p.nombre AS producto,
    pv.precio,
    pv.talle,
    pv.material,
    CASE 
        WHEN s.stock_disponible > 0 THEN 'Disponible' 
        ELSE 'Sin Stock' 
    END AS estado_disponibilidad
FROM producto_variante pv
JOIN producto p ON pv.producto_id = p.id
JOIN v_stock_actual s ON pv.id = s.producto_variante_id;


-- ==========================================================
-- 3. STORED PROCEDURE: Finalizar Compra
-- ==========================================================
CREATE OR REPLACE PROCEDURE sp_finalizar_compra(
    p_usuario_id VARCHAR,
    p_carrito_id VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_compra_id VARCHAR := 'CMP-' || CAST(floor(random() * 100000) AS VARCHAR);
    v_total_carrito DECIMAL;
    v_item RECORD;
BEGIN
    -- 1. Obtener el total acumulado en el carrito
    SELECT total INTO v_total_carrito FROM carrito WHERE id = p_carrito_id;

    -- 2. Crear la cabecera de la compra (Estado inicial: 'pendiente' o 'inactivo')
    -- Nota: Usamos 'pendiente' para que sea consistente con los triggers
    INSERT INTO compra (id, usuario_id, fecha, total, estado_pago)
    VALUES (v_compra_id, p_usuario_id, CURRENT_TIMESTAMP, v_total_carrito, 'procesando');

    -- 3. Mover todos los ítems del Carrito a la Línea de Compra
    FOR v_item IN SELECT * FROM carrito_item WHERE carrito_id = p_carrito_id LOOP
        -- Eliminamos combo_id de la lista de columnas y del COALESCE
        INSERT INTO linea_de_compra (id, compra_id, producto_variante_id, cantidad, precio_unitario)
        VALUES (
            'LC-' || v_compra_id || '-' || v_item.producto_variante_id, 
            v_compra_id, 
            v_item.producto_variante_id, 
            v_item.cantidad, 
            v_item.precio_unitario
        );
    END LOOP;

    -- 4. Limpieza: Se confirma el carrito y se vacían sus ítems
    UPDATE carrito SET total = 0, estado = 'confirmado' WHERE id = p_carrito_id;
    DELETE FROM carrito_item WHERE carrito_id = p_carrito_id;

    RAISE NOTICE 'Compra % generada exitosamente. Pendiente de confirmación de pago.', v_compra_id;
END;
$$;

-- probamos el Stored Procedure sp_finalizar_compra y el Trigger de confirmación.

CALL sp_finalizar_compra('U02', 'C01');

-- Revisa que la tabla compra tenga un registro nuevo en estado 'pendiente' y linea_de_compra

-- Ahora, para confirmar el pago y que el trigger trg_compra_validar_stock_final se dispare (y así descuente el stock virtualmente)
UPDATE compra 
SET estado_pago = 'confirmado' 
WHERE usuario_id = 'U02' AND estado_pago = 'procesando';

-- ==========================================================
-- 4. VISTA: Detalle del Carrito
-- ==========================================================

CREATE OR REPLACE VIEW v_carrito_detalle AS
SELECT 
    c.id AS carrito_id,
    c.usuario_id,
    u.email AS usuario_email, -- Agregamos el email para que sea más informativo
    c.estado AS estado_carrito,
    ci.producto_variante_id,
    p.nombre AS producto,
    pv.talle,
    pv.material,
    ci.cantidad,
    ci.precio_unitario,
    (ci.cantidad * ci.precio_unitario) AS subtotal_item,
    c.total AS total_acumulado_carrito
FROM carrito c
JOIN usuario u ON c.usuario_id = u.id
JOIN carrito_item ci ON c.id = ci.carrito_id
JOIN producto_variante pv ON ci.producto_variante_id = pv.id
JOIN producto p ON pv.producto_id = p.id;

-- ---------------------------------------------------------------------------------------------------------------------------------------
-- ==========================================================
-- 2. PERMISOS: ADMINISTRADOR (Control Total)
-- ==========================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL PROCEDURES IN SCHEMA public TO rol_admin;

-- ==========================================================
-- 3. PERMISOS: CLIENTE (Acceso Restringido)
-- ==========================================================

-- A. Vistas (Lo que el cliente ve en la App)
GRANT SELECT ON v_catalogo_publico TO rol_cliente;
GRANT SELECT ON v_stock_actual TO rol_cliente; -- Necesaria para que el trigger valide stock

-- B. Tablas de Lectura (Para ver detalles de productos y sus compras)
GRANT SELECT ON producto, producto_variante, "combo", "combo_item" TO rol_cliente;
GRANT SELECT ON compra, linea_de_compra TO rol_cliente;

-- C. Gestión de Carrito y Cuenta (Escritura controlada)
GRANT SELECT, INSERT, UPDATE, DELETE ON carrito TO rol_cliente;
GRANT SELECT, INSERT, UPDATE, DELETE ON carrito_item TO rol_cliente;
GRANT SELECT, INSERT, UPDATE ON direccion TO rol_cliente;
GRANT SELECT, INSERT ON opinion TO rol_cliente;
GRANT SELECT, INSERT ON favorito TO rol_cliente;

-- D. Ejecución de Lógica (Crucial para el stock calculado)
-- El cliente debe poder ejecutar la función de stock para que el trigger no le de error
GRANT EXECUTE ON FUNCTION fn_obtener_stock_real(VARCHAR) TO rol_cliente;
GRANT EXECUTE ON PROCEDURE sp_finalizar_compra(VARCHAR, VARCHAR) TO rol_cliente;

-- ---------------------------------------------------------------------------------------------------------------------------------------