// db.js - Versión final
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const turso = createClient({
    url: process.env.TURSO_URL || 'libsql://greenh-santiagox.aws-ap-northeast-1.turso.io',
    authToken: process.env.TURSO_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODIwOTc0NTEsImlkIjoiMDE5ZWVkNDYtYzYwMS03ZjBmLTg4ZjMtMmY5MWQ2YjlmZTRmIiwicmlkIjoiZjlkNDA1M2QtNWUzOS00MjA5LWFhZmYtZjk5MjgyZTBhODllIn0.sXEjaC7b2ymn34LUfAb9tCQ8eplbxiZRrQcoibYcq2Fq9xYLkmzSNKtbucY0HSL2ToIQ6FohcLjIt9n-T_XsAA'
});

async function initDatabase() {
    try {
        // 1. VERIFICAR Y ACTUALIZAR TABLA CLIENTES
        console.log('🔄 Verificando tabla clientes...');
        
        // Verificar si la tabla existe
        const tableCheck = await turso.execute(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'
        `);

        if (tableCheck.rows.length === 0) {
            // Crear tabla completa si no existe
            console.log('🔄 Creando tabla clientes...');
            await turso.execute(`
                CREATE TABLE clientes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    telefono TEXT,
                    direccion TEXT,
                    password TEXT NOT NULL,
                    es_admin INTEGER DEFAULT 0,
                    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabla clientes creada');
        } else {
            console.log('ℹ️ Tabla clientes existe, verificando columnas...');
            
            // Obtener columnas actuales
            const columns = await turso.execute(`PRAGMA table_info(clientes)`);
            const columnNames = columns.rows.map(col => col.name);
            
            // Agregar columnas faltantes una por una
            const columnasFaltantes = [];
            
            if (!columnNames.includes('password')) {
                columnasFaltantes.push('password TEXT');
            }
            if (!columnNames.includes('direccion')) {
                columnasFaltantes.push('direccion TEXT');
            }
            if (!columnNames.includes('es_admin')) {
                columnasFaltantes.push('es_admin INTEGER DEFAULT 0');
            }
            
            for (const col of columnasFaltantes) {
                try {
                    await turso.execute(`ALTER TABLE clientes ADD COLUMN ${col}`);
                    console.log(`✅ Columna agregada: ${col.split(' ')[0]}`);
                } catch (e) {
                    console.log(`ℹ️ No se pudo agregar columna: ${col.split(' ')[0]}`);
                }
            }
        }

        // 2. Tabla de productos
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10,2) NOT NULL,
                stock INTEGER DEFAULT 0,
                categoria TEXT,
                imagen_url TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla productos creada/verificada');

        // 3. Tabla de pedidos (VERSIÓN CORREGIDA)
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id INTEGER,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                total DECIMAL(10,2),
                estatus TEXT DEFAULT 'pendiente',
                direccion_entrega TEXT,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        `);
        console.log('✅ Tabla pedidos creada/verificada');

        // 4. Tabla de detalles de pedido
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS detalles_pedido (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER,
                producto_id INTEGER,
                cantidad INTEGER,
                subtotal DECIMAL(10,2),
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);
        console.log('✅ Tabla detalles_pedido creada/verificada');

        // 5. Tabla de mensajes de contacto
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS mensajes_contacto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL,
                telefono TEXT,
                producto_interes TEXT,
                mensaje TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                leido INTEGER DEFAULT 0
            )
        `);
        console.log('✅ Tabla mensajes_contacto creada/verificada');

        // 6. Tabla de inventario
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS inventario (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                producto_id INTEGER,
                cantidad INTEGER NOT NULL,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);
        console.log('✅ Tabla inventario creada/verificada');

        // 7. Crear usuario admin si no existe
        await crearAdminPorDefecto();

        // 8. Insertar productos de ejemplo
        await insertarProductosEjemplo();

        console.log('✅ Base de datos inicializada correctamente');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
}

// ============================================
// CREAR ADMIN POR DEFECTO
// ============================================
async function crearAdminPorDefecto() {
    try {
        const adminEmail = 'admin@greenhome.mx';
        const adminPassword = 'admin123';
        
        const check = await turso.execute({
            sql: `SELECT id FROM clientes WHERE email = ?`,
            args: [adminEmail]
        });

        if (check.rows.length === 0) {
            await turso.execute({
                sql: `INSERT INTO clientes (nombre, email, password, es_admin) 
                      VALUES (?, ?, ?, 1)`,
                args: ['Administrador', adminEmail, adminPassword]
            });
            console.log('✅ Usuario admin creado: admin@greenhome.mx / admin123');
        } else {
            console.log('ℹ️ Usuario admin ya existe');
        }
    } catch (error) {
        console.error('Error al crear admin:', error);
        // Si el error es por columna faltante, intentar con INSERT sin password
        if (error.message && error.message.includes('password')) {
            try {
                console.log('🔄 Intentando crear admin sin password (tabla antigua)...');
                await turso.execute({
                    sql: `INSERT INTO clientes (nombre, email) VALUES (?, ?)`,
                    args: ['Administrador', adminEmail]
                });
                console.log('✅ Admin creado en tabla antigua');
            } catch (e2) {
                console.error('❌ No se pudo crear admin:', e2);
            }
        }
    }
}

// ============================================
// INSERTAR PRODUCTOS DE EJEMPLO
// ============================================
async function insertarProductosEjemplo() {
    const productos = [
        {
            nombre: 'Kit Hierbas Aromáticas',
            descripcion: 'Albahaca, menta, cilantro y perejil. Todo lo necesario para dar sabor a tus platillos.',
            precio: 350.00,
            stock: 20,
            categoria: 'kits',
            imagen_url: 'images/productos/kit-hierbas.jpg'
        },
        {
            nombre: 'Kit Mini Verduras',
            descripcion: 'Tomates cherry, chiles, rábanos y zanahorias. Ideal para espacios pequeños.',
            precio: 450.00,
            stock: 15,
            categoria: 'kits',
            imagen_url: 'images/productos/kit-verduras.jpg'
        },
        {
            nombre: 'Kit Flores de Temporada',
            descripcion: 'Girasoles, lavanda, caléndula y margaritas. Llena tu hogar de color y vida.',
            precio: 400.00,
            stock: 12,
            categoria: 'kits',
            imagen_url: 'images/productos/kit-flores.jpg'
        },
        {
            nombre: 'Semillas de Albahaca',
            descripcion: 'Semillas de albahaca de alta germinación. Perfectas para tu huerto.',
            precio: 50.00,
            stock: 50,
            categoria: 'semillas',
            imagen_url: 'images/productos/semillas-albahaca.jpg'
        },
        {
            nombre: 'Maceta Biodegradable Grande',
            descripcion: 'Maceta 100% biodegradable hecha de materiales orgánicos. Ideal para plantas grandes.',
            precio: 120.00,
            stock: 30,
            categoria: 'macetas',
            imagen_url: 'images/productos/maceta-grande.jpg'
        },
        {
            nombre: 'Kit Completo de Cultivo',
            descripcion: 'Incluye 3 macetas biodegradables, tierra nutritiva y 5 tipos de semillas.',
            precio: 650.00,
            stock: 10,
            categoria: 'kits',
            imagen_url: 'images/productos/kit-completo.jpg'
        }
    ];

    for (const producto of productos) {
        try {
            const check = await turso.execute({
                sql: `SELECT id FROM productos WHERE nombre = ?`,
                args: [producto.nombre]
            });

            if (check.rows.length === 0) {
                await turso.execute({
                    sql: `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url)
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    args: [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.categoria, producto.imagen_url]
                });
                console.log(`✅ Producto insertado: ${producto.nombre}`);
            }
        } catch (error) {
            console.error(`Error al insertar ${producto.nombre}:`, error);
        }
    }
}

// ============================================
// FUNCIONES CRUD
// ============================================

const db = {
    async crearCliente(nombre, email, telefono, direccion, password) {
        try {
            console.log('📝 Creando cliente:', { nombre, email, telefono, direccion });
            
            // Verificar si el email ya existe
            const check = await turso.execute({
                sql: `SELECT id FROM clientes WHERE email = ?`,
                args: [email]
            });

            if (check.rows.length > 0) {
                console.log('⚠️ Email ya registrado:', email);
                return { 
                    success: false, 
                    error: 'El correo ya está registrado' 
                };
            }

            // Insertar cliente
            const result = await turso.execute({
                sql: `INSERT INTO clientes (nombre, email, telefono, direccion, password, es_admin) 
                      VALUES (?, ?, ?, ?, ?, 0)`,
                args: [nombre, email, telefono || null, direccion || null, password]
            });
            
            // CONVERTIR BigInt A Number
            const id = result.lastInsertRowid ? Number(result.lastInsertRowid) : null;
            
            console.log('✅ Cliente creado con ID:', id);
            return { success: true, id: id };
        } catch (error) {
            console.error('❌ Error detallado al crear cliente:');
            console.error('  - Mensaje:', error.message);
            console.error('  - Código:', error.code);
            return { success: false, error: error.message };
        }
    },

    async loginCliente(email, password) {
        try {
            const result = await turso.execute({
                sql: `SELECT id, nombre, email, telefono, direccion, es_admin 
                      FROM clientes WHERE email = ? AND password = ?`,
                args: [email, password]
            });
            
            if (result.rows.length === 0) {
                return { success: false, error: 'Correo o contraseña incorrectos' };
            }
            
            return { 
                success: true, 
                usuario: {
                    id: result.rows[0].id,
                    nombre: result.rows[0].nombre,
                    email: result.rows[0].email,
                    telefono: result.rows[0].telefono,
                    direccion: result.rows[0].direccion,
                    esAdmin: result.rows[0].es_admin === 1
                }
            };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    },

    async obtenerClientes() {
        try {
            const result = await turso.execute(`
                SELECT id, nombre, email, telefono, direccion, es_admin, fecha_registro 
                FROM clientes 
                ORDER BY fecha_registro DESC
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            return [];
        }
    },

    async obtenerClientePorId(id) {
        try {
            const result = await turso.execute({
                sql: `SELECT id, nombre, email, telefono, direccion, es_admin 
                      FROM clientes WHERE id = ?`,
                args: [id]
            });
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            return null;
        }
    },

    async obtenerProductos() {
        try {
            const result = await turso.execute(`SELECT * FROM productos WHERE stock > 0 ORDER BY nombre`);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    },

    async obtenerProductoPorId(id) {
        try {
            const result = await turso.execute({
                sql: `SELECT * FROM productos WHERE id = ?`,
                args: [id]
            });
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return null;
        }
    },

    async crearPedido(clienteId, items, total, direccion) {
        try {
            const result = await turso.execute({
                sql: `INSERT INTO pedidos (cliente_id, total, estatus, direccion_entrega) 
                      VALUES (?, ?, 'pendiente', ?)`,
                args: [clienteId, total, direccion]
            });
            const pedidoId = result.lastInsertRowid;

            for (const item of items) {
                await turso.execute({
                    sql: `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, subtotal) 
                          VALUES (?, ?, ?, ?)`,
                    args: [pedidoId, item.producto_id, item.cantidad, item.subtotal]
                });
            }

            return { success: true, pedidoId };
        } catch (error) {
            console.error('Error al crear pedido:', error);
            return { success: false, error: error.message };
        }
    },

    async obtenerPedidos() {
        try {
            const result = await turso.execute(`
                SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email
                FROM pedidos p 
                JOIN clientes c ON p.cliente_id = c.id 
                ORDER BY p.fecha DESC
            `);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            return [];
        }
    },

    async actualizarEstatusPedido(id, estatus) {
        try {
            const result = await turso.execute({
                sql: `UPDATE pedidos SET estatus = ? WHERE id = ?`,
                args: [estatus, id]
            });
            return { success: true, rowsAffected: result.rowsAffected };
        } catch (error) {
            console.error('Error al actualizar estatus:', error);
            return { success: false, error: error.message };
        }
    },

    async guardarMensaje(nombre, email, telefono, producto_interes, mensaje) {
        try {
            const result = await turso.execute({
                sql: `INSERT INTO mensajes_contacto (nombre, email, telefono, producto_interes, mensaje) 
                      VALUES (?, ?, ?, ?, ?)`,
                args: [nombre, email, telefono || null, producto_interes || null, mensaje]
            });
            return { success: true, id: result.lastInsertRowid };
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
            return { success: false, error: error.message };
        }
    },

    async obtenerMensajes() {
        try {
            const result = await turso.execute(`SELECT * FROM mensajes_contacto ORDER BY fecha DESC`);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            return [];
        }
    },

    async obtenerEstadisticas() {
        try {
            const totalClientes = await turso.execute(`SELECT COUNT(*) as total FROM clientes`);
            const totalProductos = await turso.execute(`SELECT COUNT(*) as total FROM productos WHERE stock > 0`);
            const totalPedidos = await turso.execute(`SELECT COUNT(*) as total FROM pedidos`);
            const totalMensajes = await turso.execute(`SELECT COUNT(*) as total FROM mensajes_contacto`);
            const pedidosPendientes = await turso.execute(`SELECT COUNT(*) as total FROM pedidos WHERE estatus = 'pendiente'`);

            return {
                totalClientes: totalClientes.rows[0]?.total || 0,
                totalProductos: totalProductos.rows[0]?.total || 0,
                totalPedidos: totalPedidos.rows[0]?.total || 0,
                totalMensajes: totalMensajes.rows[0]?.total || 0,
                pedidosPendientes: pedidosPendientes.rows[0]?.total || 0
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return null;
        }
    }
};

export { turso, db, initDatabase };