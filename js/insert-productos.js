// insert-productos.js - Script para insertar productos
import { db, initDatabase } from '../db.js';

async function insertarProductos() {
    await initDatabase();
    
    const productos = [
        {
            nombre: 'Kit Hierbas Aromáticas',
            descripcion: 'Albahaca, menta, cilantro y perejil. Todo lo necesario para dar sabor a tus platillos.',
            precio: 350.00,
            stock: 20,
            categoria: 'kits',
            imagen_url: 'images/kit-hierbas.jpg'
        },
        {
            nombre: 'Kit Mini Verduras',
            descripcion: 'Tomates cherry, chiles, rábanos y zanahorias. Ideal para espacios pequeños.',
            precio: 450.00,
            stock: 15,
            categoria: 'kits',
            imagen_url: 'images/kit-verduras.jpg'
        },
        {
            nombre: 'Kit Flores de Temporada',
            descripcion: 'Girasoles, lavanda, caléndula y margaritas. Llena tu hogar de color y vida.',
            precio: 400.00,
            stock: 12,
            categoria: 'kits',
            imagen_url: 'images/kit-flores.jpg'
        },
        {
            nombre: 'Semillas de Albahaca',
            descripcion: 'Semillas de albahaca de alta germinación. Perfectas para tu huerto.',
            precio: 50.00,
            stock: 50,
            categoria: 'semillas',
            imagen_url: 'images/semillas-albahaca.jpg'
        },
        {
            nombre: 'Maceta Biodegradable Grande',
            descripcion: 'Maceta 100% biodegradable hecha de materiales orgánicos. Ideal para plantas grandes.',
            precio: 120.00,
            stock: 30,
            categoria: 'macetas',
            imagen_url: 'images/maceta-grande.jpg'
        },
        {
            nombre: 'Kit Completo de Cultivo',
            descripcion: 'Incluye 3 macetas biodegradables, tierra nutritiva y 5 tipos de semillas.',
            precio: 650.00,
            stock: 10,
            categoria: 'kits',
            imagen_url: 'images/kit-completo.jpg'
        },
        {
            nombre: 'Semillas de Tomate Cherry',
            descripcion: 'Semillas de tomate cherry de alta calidad. Perfectas para cultivar en maceta.',
            precio: 60.00,
            stock: 40,
            categoria: 'semillas',
            imagen_url: 'images/semillas-tomate.jpg'
        },
        {
            nombre: 'Tierra Orgánica Premium',
            descripcion: 'Tierra orgánica enriquecida con nutrientes para un crecimiento óptimo de tus plantas.',
            precio: 80.00,
            stock: 25,
            categoria: 'accesorios',
            imagen_url: 'images/tierra-organica.jpg'
        },
        {
            nombre: 'Kit de Riego Automático',
            descripcion: 'Sistema de riego automático para mantener tus plantas hidratadas sin preocupaciones.',
            precio: 280.00,
            stock: 8,
            categoria: 'accesorios',
            imagen_url: 'images/riego-automatico.jpg'
        }
    ];

    console.log('📦 Insertando productos...');
    let contador = 0;

    for (const producto of productos) {
        const result = await db.crearProducto(
            producto.nombre,
            producto.descripcion,
            producto.precio,
            producto.stock,
            producto.categoria,
            producto.imagen_url
        );
        
        if (result.success) {
            contador++;
            console.log(`✅ Insertado: ${producto.nombre}`);
        } else {
            console.log(`❌ Error al insertar: ${producto.nombre} - ${result.error}`);
        }
    }

    console.log(`📊 Total: ${contador} productos insertados`);
    process.exit(0);
}

insertarProductos().catch(console.error);