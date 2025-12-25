// CONFIGURACIÓN DE CONEXIÓN
const API_URL = "https://script.google.com/macros/s/AKfycbxLayXPyMofzgr6sbh8o5dB57Gg_jKIJGlIo8peFhojmklaE1xkzSssXsH4dhIHMKbfgA/exec";
const API_KEY = "AST_2025_SECURE";

// FORMATEADOR DE MONEDA
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    fetchStoreProducts();
});

// FUNCIÓN PRINCIPAL: TRAER PRODUCTOS
async function fetchStoreProducts() {
    const container = document.getElementById('store-grid');
    
    try {
        // Petición al Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: 'getPublicCatalog', // Solo trae lo marcado como visible
                auth: API_KEY,
                payload: {}
            })
        });

        const result = await response.json();

        if (result.success) {
            // FILTRO ESTRICTO: Solo mostrar PRODUCTOS en la tienda
            const products = result.data.filter(item => item.tipo === 'PRODUCTO');
            renderStore(products, container);
        } else {
            container.innerHTML = `<div class="col-12 text-center text-danger"><p>Error cargando catálogo.</p></div>`;
        }

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="col-12 text-center text-muted"><p>No se pudo conectar con el servidor.</p></div>`;
    }
}

// RENDERIZADO DE TARJETAS
function renderStore(products, container) {
    container.innerHTML = ''; // Limpiar spinner

    if (products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente nuevos productos.</p></div>`;
        return;
    }

    products.forEach(p => {
        // Imagen por defecto si no tiene
        const imageSrc = p.imagen ? p.imagen : 'https://via.placeholder.com/300x200?text=A.S.T.';
        
        // Mensaje pre-llenado para WhatsApp
        const wsMsg = `Hola A.S.T., estoy interesado en el producto: *${p.nombre}* con precio de *${fmt.format(p.precio)}*. ¿Tienen disponibilidad?`;
        const wsLink = `https://wa.me/573137713430?text=${encodeURIComponent(wsMsg)}`;

        const html = `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="product-card h-100">
                <div class="product-img-wrapper">
                    <img src="${imageSrc}" alt="${p.nombre}">
                </div>
                <div class="p-3 d-flex flex-column h-100" style="min-height: 180px;">
                    <div class="mb-2">
                        <span class="badge bg-dark border border-secondary text-cyan">${p.categoria || 'TECNOLOGÍA'}</span>
                    </div>
                    <h5 class="text-white fw-bold mb-1 text-truncate" title="${p.nombre}">${p.nombre}</h5>
                    <p class="small text-secondary mb-3 text-truncate">${p.specs || 'Calidad garantizada A.S.T.'}</p>
                    
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-cyan">${fmt.format(p.precio)}</span>
                        <a href="${wsLink}" target="_blank" class="btn btn-sm btn-outline-light rounded-circle" title="Consultar en WhatsApp">
                            <i class="bi bi-whatsapp"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}
