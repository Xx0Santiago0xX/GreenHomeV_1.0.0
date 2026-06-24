// server.js - Servidor Express con API para Green Home (COMPLETO Y CORREGIDO)
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ============================================
// FUNCI�N PARA SANITIZAR BigInt
// ============================================
function sanitizeResponse(data) {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'bigint') {
        return Number(data);
    }
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeResponse(item));
    }
    
    if (typeof data === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeResponse(value);
        }
        return sanitized;
    }
    
    return data;
}

// ============================================
// RUTAS DE LA API
// ============================================

// ========== HEALTH ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '?? Green Home API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ========== USUARIOS / REGISTRO ==========
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, password } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, email y contrase�a son requeridos'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contrase�a debe tener al menos 6 caracteres'
            });
        }

        const result = await db.crearCliente(nombre, email, telefono, direccion, password);
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al registrar usuario: ' + error.message
        });
    }
});

// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contrase�a son requeridos'
            });
        }

        const result = await db.loginCliente(email, password);
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al iniciar sesi�n' 
        });
    }
});

// ========== CLIENTES ==========
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await db.obtenerClientes();
        res.json(sanitizeResponse(clientes));
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener clientes' 
        });
    }
});

app.get('/api/clientes/:id', async (req, res) => {
    try {
        const cliente = await db.obtenerClientePorId(req.params.id);
        if (cliente) {
            res.json(sanitizeResponse(cliente));
        } else {
            res.status(404).json({ 
                success: false, 
                error: 'Cliente no encontrado' 
            });
        }
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener cliente' 
        });
    }
});

// ========== PRODUCTOS ==========
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await db.obtenerProductos();
        res.json(sanitizeResponse(productos));
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener productos' 
        });
    }
});

app.get('/api/productos/todos', async (req, res) => {
    try {
        const productos = await db.obtenerProductosCompletos();
        res.json(sanitizeResponse(productos));
    } catch (error) {
        console.error('Error al obtener productos completos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener productos' 
        });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.obtenerProductoPorId(req.params.id);
        if (producto) {
            res.json(sanitizeResponse(producto));
        } else {
            res.status(404).json({ 
                success: false, 
                error: 'Producto no encontrado' 
            });
        }
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener producto' 
        });
    }
});

// ========== PEDIDOS ==========
app.post('/api/pedidos', async (req, res) => {
    try {
        const { clienteId, items, total, direccion } = req.body;
        
        console.log('?? Creando pedido:', { clienteId, items, total, direccion });
        
        if (!clienteId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Datos de pedido incompletos'
            });
        }

        let direccionEntrega = direccion;
        if (!direccionEntrega) {
            const cliente = await db.obtenerClientePorId(clienteId);
            if (cliente) {
                direccionEntrega = cliente.direccion;
            }
        }

        const result = await db.crearPedido(clienteId, items, total, direccionEntrega);
        console.log('?? Resultado:', result);
        
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear pedido: ' + error.message
        });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await db.obtenerPedidos();
        res.json(sanitizeResponse(pedidos));
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener pedidos' 
        });
    }
});

app.get('/api/pedidos/:id', async (req, res) => {
    try {
        const pedido = await db.obtenerPedidoPorId(req.params.id);
        if (pedido) {
            res.json(sanitizeResponse(pedido));
        } else {
            res.status(404).json({ 
                success: false, 
                error: 'Pedido no encontrado' 
            });
        }
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener pedido' 
        });
    }
});

app.put('/api/pedidos/:id/estatus', async (req, res) => {
    try {
        const { estatus } = req.body;
        const result = await db.actualizarEstatusPedido(req.params.id, estatus);
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error al actualizar estatus:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar estatus' 
        });
    }
});

// ========== MENSAJES DE CONTACTO ==========
app.post('/api/contacto', async (req, res) => {
    try {
        const { nombre, email, telefono, producto, mensaje } = req.body;
        
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, email y mensaje son requeridos'
            });
        }

        const result = await db.guardarMensaje(nombre, email, telefono, producto, mensaje);
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error al guardar mensaje:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al guardar mensaje' 
        });
    }
});

app.get('/api/mensajes', async (req, res) => {
    try {
        const mensajes = await db.obtenerMensajes();
        res.json(sanitizeResponse(mensajes));
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener mensajes' 
        });
    }
});

app.put('/api/mensajes/:id/leer', async (req, res) => {
    try {
        const result = await db.marcarMensajeLeido(req.params.id);
        res.json(sanitizeResponse(result));
    } catch (error) {
        console.error('Error al marcar mensaje:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al marcar mensaje' 
        });
    }
});

// ========== ESTAD�STICAS ==========
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.obtenerEstadisticas();
        res.json(sanitizeResponse(stats));
    } catch (error) {
        console.error('Error al obtener estad�sticas:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener estad�sticas' 
        });
    }
});

// ========== RUTA 404 ==========
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// ============================================
// INICIALIZAR SERVIDOR
// ============================================
async function startServer() {
    try {
        await initDatabase();
        console.log('? Base de datos inicializada');
        
        app.listen(PORT, () => {
            console.log(`\n?? Servidor corriendo en http://localhost:${PORT}`);
            console.log(`?? Green Home - Tienda de kits de cultivo caseros`);
            console.log(`?? API disponible en http://localhost:${PORT}/api/health`);
            console.log(`\n?? Credenciales Admin:`);
            console.log(`   Email: admin@greenhome.mx`);
            console.log(`   Password: admin123`);
            console.log(`\n?? Productos disponibles en http://localhost:${PORT}/api/productos\n`);
        });
    } catch (error) {
        console.error('? Error al iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();
