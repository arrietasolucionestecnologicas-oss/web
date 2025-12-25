// CONFIGURACIÓN DE CONEXIÓN
const API_URL = "https://script.google.com/macros/s/AKfycbxLayXPyMofzgr6sbh8o5dB57Gg_jKIJGlIo8peFhojmklaE1xkzSssXsH4dhIHMKbfgA/exec";
const API_KEY = "AST_2025_SECURE";
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    const servicesContainer = document.getElementById('services-grid');
    const storeContainer = document.getElementById('store-grid');
    
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
            // SEPARAMOS SERVICIOS DE PRODUCTOS
            const services = result.data.filter(item => item.tipo === 'SERVICIO');
            const products = result.data.filter(item => item.tipo === 'PRODUCTO');

            renderServices(services, servicesContainer);
            renderStore(products, storeContainer);
        } else {
            handleError(servicesContainer, storeContainer);
        }

    } catch (error) {
        console.error(error);
        handleError(servicesContainer, storeContainer);
    }
}

// RENDERIZADOR DE SERVICIOS (Sin precio, solo cotizar)
function renderServices(items, container) {
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente más servicios.</p></div>`;
        return;
    }

    items.forEach(s => {
        // Imagen por defecto si no subiste una en la App
        const img = s.imagen ? s.imagen : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
        
        const html = `
        <div class="col-md-6 col-lg-3">
            <div class="tech-card h-100 overflow-hidden p-0 d-flex flex-column">
                <div style="height: 180px; overflow: hidden; position: relative;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, transparent, rgba(30, 41, 59, 1));"></div>
                    <img src="${img}" style="width:100%; height:100%; object-fit: cover; opacity: 0.9;">
                </div>
                <div class="p-4 d-flex flex-column flex-grow-1" style="margin-top: -20px; position: relative; z-index: 2;">
                    <h4 class="text-white h5 fw-bold mb-3">${s.nombre}</h4>
                    <p class="text-gray small flex-grow-1 mb-4" style="line-height: 1.6;">${s.specs || 'Solución profesional garantizada.'}</p>
                    
                    <a href="https://wa.me/573137713430?text=Hola%20A.S.T.,%20me%20interesa%20cotizar%20el%20servicio:%20${encodeURIComponent(s.nombre)}" 
                       target="_blank" class="btn btn-outline-tech btn-sm w-100 rounded-pill">
                       <i class="bi bi-whatsapp me-2"></i> Cotizar Servicio
                    </a>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

// RENDERIZADOR DE PRODUCTOS (Con precio y comprar)
function renderStore(items, container) {
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente nuevos productos.</p></div>`;
        return;
    }

    items.forEach(p => {
        const imageSrc = p.imagen ? p.imagen : 'https://via.placeholder.com/300x200?text=A.S.T.';
        const wsLink = `https://wa.me/573137713430?text=Hola%20A.S.T.,%20estoy%20interesado%20en:%20${encodeURIComponent(p.nombre)}`;

        const html = `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="product-card h-100 d-flex flex-column">
                <div class="product-img-wrapper">
                    <img src="${imageSrc}" alt="${p.nombre}">
                </div>
                <div class="card-body-dark d-flex flex-column flex-grow-1">
                    <div class="mb-2">
                        <span class="badge-category">${p.categoria || 'HARDWARE'}</span>
                    </div>
                    <h5 class="text-white fw-bold mb-2 text-truncate" title="${p.nombre}">${p.nombre}</h5>
                    <p class="text-gray small mb-3 text-truncate" style="min-height: 20px;">${p.specs || '---'}</p>
                    
                    <div class="mt-auto pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                        <span class="fs-5 fw-bold text-white">${fmt.format(p.precio)}</span>
                        <a href="${wsLink}" target="_blank" class="btn btn-sm btn-primary-tech rounded-pill px-3" title="Consultar">
                            <i class="bi bi-cart-plus me-1"></i> Comprar
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function handleError(c1, c2) {
    const err = `<div class="col-12 text-center text-danger"><p>Error de conexión.</p></div>`;
    c1.innerHTML = err;
    c2.innerHTML = err;
}
