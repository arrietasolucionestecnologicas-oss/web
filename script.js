// CONFIGURACIÓN DE CONEXIÓN
const API_URL = "https://script.google.com/macros/s/AKfycbxLayXPyMofzgr6sbh8o5dB57Gg_jKIJGlIo8peFhojmklaE1xkzSssXsH4dhIHMKbfgA/exec";
const API_KEY = "AST_2025_SECURE";

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

document.addEventListener('DOMContentLoaded', () => {
    fetchStoreProducts();
});

async function fetchStoreProducts() {
    const container = document.getElementById('store-grid');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: 'getPublicCatalog',
                auth: API_KEY,
                payload: {}
            })
        });

        const result = await response.json();

        if (result.success) {
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

function renderStore(products, container) {
    container.innerHTML = ''; 

    if (products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente nuevos productos.</p></div>`;
        return;
    }

    products.forEach(p => {
        const imageSrc = p.imagen ? p.imagen : 'https://via.placeholder.com/300x200?text=A.S.T.';
        const wsMsg = `Hola A.S.T., estoy interesado en el producto: *${p.nombre}* con precio de *${fmt.format(p.precio)}*. ¿Tienen disponibilidad?`;
        const wsLink = `https://wa.me/573137713430?text=${encodeURIComponent(wsMsg)}`;

        // HTML ACTUALIZADO AL NUEVO DISEÑO
        const html = `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="product-card h-100 d-flex flex-column">
                <div class="product-img-wrapper">
                    <img src="${imageSrc}" alt="${p.nombre}">
                </div>
                <div class="p-4 d-flex flex-column flex-grow-1">
                    <div class="mb-2">
                        <span class="badge-category">${p.categoria || 'TECNOLOGÍA'}</span>
                    </div>
                    <h5 class="text-white fw-bold mb-2 text-truncate" title="${p.nombre}">${p.nombre}</h5>
                    <p class="text-gray small mb-3 text-truncate" style="min-height: 20px;">${p.specs || 'Calidad garantizada A.S.T.'}</p>
                    
                    <div class="mt-auto pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-white">${fmt.format(p.precio)}</span>
                        <a href="${wsLink}" target="_blank" class="btn btn-sm btn-primary-tech rounded-pill px-3" title="Comprar">
                            <i class="bi bi-cart-plus"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}
