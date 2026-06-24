// api.js - API para el frontend
// Esta capa abstrae las llamadas a la API del servidor

const API_BASE_URL = window.location.origin || 'http://localhost:3000';

// ============================================
// PRODUCTOS
// ============================================
export const ProductAPI = {
    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/productos`);
            if (!response.ok) throw new Error('Error al cargar productos');
            return await response.json();
        } catch (error) {
            console.error('Error en ProductAPI.getAll:', error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado');
            return await response.json();
        } catch (error) {
            console.error('Error en ProductAPI.getById:', error);
            throw error;
        }
    },

    async getByCategory(categoria) {
        try {
            const productos = await this.getAll();
            return productos.filter(p => p.categoria === categoria);
        } catch (error) {
            console.error('Error en ProductAPI.getByCategory:', error);
            throw error;
        }
    }
};

// ============================================
// CLIENTES
// ============================================
export const ClientAPI = {
    async create(nombre, email, telefono = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, telefono })
            });
            if (!response.ok) throw new Error('Error al crear cliente');
            return await response.json();
        } catch (error) {
            console.error('Error en ClientAPI.create:', error);
            throw error;
        }
    },

    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes`);
            if (!response.ok) throw new Error('Error al obtener clientes');
            return await response.json();
        } catch (error) {
            console.error('Error en ClientAPI.getAll:', error);
            throw error;
        }
    }
};

// ============================================
// PEDIDOS
// ============================================
export const OrderAPI = {
    async create(clienteId, items, total) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    clienteId, 
                    items: items.map(item => ({
                        producto_id: item.id || item.producto_id,
                        cantidad: item.cantidad,
                        subtotal: item.precio * item.cantidad
                    })),
                    total 
                })
            });
            if (!response.ok) throw new Error('Error al crear pedido');
            return await response.json();
        } catch (error) {
            console.error('Error en OrderAPI.create:', error);
            throw error;
        }
    },

    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos`);
            if (!response.ok) throw new Error('Error al obtener pedidos');
            return await response.json();
        } catch (error) {
            console.error('Error en OrderAPI.getAll:', error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos/${id}`);
            if (!response.ok) throw new Error('Pedido no encontrado');
            return await response.json();
        } catch (error) {
            console.error('Error en OrderAPI.getById:', error);
            throw error;
        }
    }
};

// ============================================
// CONTACTO
// ============================================
export const ContactAPI = {
    async send(nombre, email, telefono, producto, mensaje) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/contacto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, telefono, producto, mensaje })
            });
            if (!response.ok) throw new Error('Error al enviar mensaje');
            return await response.json();
        } catch (error) {
            console.error('Error en ContactAPI.send:', error);
            throw error;
        }
    },

    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mensajes`);
            if (!response.ok) throw new Error('Error al obtener mensajes');
            return await response.json();
        } catch (error) {
            console.error('Error en ContactAPI.getAll:', error);
            throw error;
        }
    },

    async markAsRead(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mensajes/${id}/leer`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error('Error al marcar mensaje');
            return await response.json();
        } catch (error) {
            console.error('Error en ContactAPI.markAsRead:', error);
            throw error;
        }
    }
};

// ============================================
// ESTADÍSTICAS
// ============================================
export const StatsAPI = {
    async get() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stats`);
            if (!response.ok) throw new Error('Error al obtener estadísticas');
            return await response.json();
        } catch (error) {
            console.error('Error en StatsAPI.get:', error);
            throw error;
        }
    }
};

// ============================================
// HEALTH CHECK
// ============================================
export const HealthAPI = {
    async check() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            if (!response.ok) throw new Error('Servidor no disponible');
            return await response.json();
        } catch (error) {
            console.error('Error en HealthAPI.check:', error);
            throw error;
        }
    }
};