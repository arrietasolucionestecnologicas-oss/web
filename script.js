// ==========================================
// CONFIGURACIÓN FRONTEND (V14 - BOTÓN OCULTO/DISCRETO)
// ==========================================

// URL BASE DE TU GITHUB
const API_URL = "https://script.google.com/macros/s/AKfycbxcWc83WPaNd0v0QnsuyH0h-6hZNIxFpk61A0pbYBiegyKLPwfsCQ3uqxggRv1uTsw4hw/exec";
const API_KEY = "AST_2025_SECURE";


const GITHUB_BASE_URL = "https://arrietasolucionestecnologicas-oss.github.io/web/share/";

const DEFAULT_IMG_SERVICE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
const DEFAULT_IMG_PRODUCT = 'https://via.placeholder.com/600x400?text=AST+Producto';

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
let globalCatalog = [];

document.addEventListener('DOMContentLoaded', () => { fetchData(); });

async function fetchData() {
    const servicesContainer = document.getElementById('services-grid');
    const storeContainer = document.getElementById('store-grid');
    
    // Feedback de carga
    if(servicesContainer) servicesContainer.innerHTML = '<div class="col-12 text-center text-white"><div class="spinner-border text-primary" role="status"></div><p>Cargando Servicios...</p></div>';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST', redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: 'getPublicCatalog', auth: API_KEY, payload: {} })
        });
        const result = await response.json();
        if (result.success) {
            globalCatalog = result.data; 
            const services = globalCatalog.filter(item => item.tipo === 'SERVICIO');
            const products = globalCatalog.filter(item => item.tipo === 'PRODUCTO');
            renderServices(services, servicesContainer);
            renderStore(products, storeContainer);

            // AUTO-ABRIR MODAL
            const urlParams = new URLSearchParams(window.location.search);
            const openId = urlParams.get('open');
            if (openId) {
                window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(() => openProductModal(openId), 800);
            }
        } else { handleError(servicesContainer, storeContainer); }
    } catch (error) { console.error(error); handleError(servicesContainer, storeContainer); }
}

function renderServices(items, container) {
    container.innerHTML = '';
    if (items.length === 0) { container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente.</p></div>`; return; }
    
    items.forEach(s => {
        const img = s.imagen && s.imagen.startsWith('http') ? s.imagen : DEFAULT_IMG_SERVICE;
        const githubLink = generateGitHubLink(s.nombre);

        const html = `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="tech-card h-100 overflow-hidden p-0 d-flex flex-column" onclick="openProductModal('${s.uuid}')" style="cursor: pointer; border: 1px solid #333; border-radius: 10px; background: #1a1a1a;">
                
                <div style="height: 180px; overflow: hidden; position: relative;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, transparent, rgba(30, 41, 59, 0.8));"></div>
                    <img src="${img}" style="width:100%; height:100%; object-fit: cover;">
                    
                    <button class="btn btn-dark rounded-circle position-absolute top-0 end-0 m-2 shadow-sm" 
                            style="width:35px; height:35px; padding:0; opacity:0.6; border:1px solid #555;" 
                            onclick="event.stopPropagation(); copyToClipboard('${githubLink}')" 
                            title="Copiar Enlace">
                        <i class="bi bi-link-45deg text-white"></i>
                    </button>
                </div>

                <div class="p-3 d-flex flex-column flex-grow-1">
                    <h5 class="text-white fw-bold mb-2">${s.nombre}</h5>
                    <p class="text-secondary small flex-grow-1 mb-3" style="line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${s.specs || 'Solución profesional garantizada.'}</p>
                    
                    <div class="mt-auto">
                        <a href="https://wa.me/573137713430?text=Hola%20A.S.T.,%20me%20interesa%20el%20servicio:%20${encodeURIComponent(s.nombre)}" target="_blank" class="btn btn-outline-primary btn-sm rounded-pill w-100" onclick="event.stopPropagation()">
                            <i class="bi bi-whatsapp"></i> Cotizar
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function renderStore(items, container) {
    container.innerHTML = '';
    if (items.length === 0) { container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente.</p></div>`; return; }
    
    items.forEach(p => {
        const imageSrc = p.imagen && p.imagen.startsWith('http') ? p.imagen : DEFAULT_IMG_PRODUCT;
        const githubLink = generateGitHubLink(p.nombre);

        const html = `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div class="product-card h-100 d-flex flex-column" onclick="openProductModal('${p.uuid}')" style="background: #111; border: 1px solid #333; border-radius: 8px; overflow: hidden;">
                
                <div class="product-img-wrapper" style="height: 200px; overflow: hidden; background: #000; position: relative;">
                    <img src="${imageSrc}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: contain;">
                    
                    <button class="btn btn-dark rounded-circle position-absolute top-0 end-0 m-2 shadow-sm" 
                            style="width:35px; height:35px; padding:0; opacity:0.6; border:1px solid #555;" 
                            onclick="event.stopPropagation(); copyToClipboard('${githubLink}')" 
                            title="Copiar Enlace">
                        <i class="bi bi-link-45deg text-white"></i>
                    </button>
                </div>

                <div class="p-3 d-flex flex-column flex-grow-1">
                    <div class="mb-1"><span class="badge bg-secondary" style="font-size: 0.6rem;">${p.categoria || 'HARDWARE'}</span></div>
                    <h6 class="text-white fw-bold mb-2 text-truncate" title="${p.nombre}">${p.nombre}</h6>
                    <p class="text-info fw-bold mb-3" style="font-size: 1.1rem;">${fmt.format(p.precio)}</p>
                    
                    <div class="mt-auto pt-3 border-top border-secondary">
                        <button class="btn btn-sm btn-primary-tech rounded-pill w-100">
                            Ver Detalles <i class="bi bi-arrow-right-short"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function generateGitHubLink(name) {
    const cleanSlug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]/g, '-') 
        .replace(/-+/g, '-') 
        .replace(/^-|-$/g, ''); 
    return `${GITHUB_BASE_URL}${cleanSlug}.html`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(`✅ Enlace copiado!\n\nPégalo en WhatsApp.`);
    }).catch(err => {
        prompt("Copia este enlace:", text);
    });
}

function openProductModal(uuid) {
    const p = globalCatalog.find(item => item.uuid === uuid);
    if (!p) return;
    let finalImage = p.imagen && p.imagen.startsWith('http') ? p.imagen : null;
    if (!finalImage) finalImage = p.tipo === 'SERVICIO' ? DEFAULT_IMG_SERVICE : DEFAULT_IMG_PRODUCT;

    document.getElementById('modal-p-img').src = finalImage;
    document.getElementById('modal-p-cat').innerText = p.tipo === 'SERVICIO' ? 'SERVICIO' : 'HARDWARE';
    document.getElementById('modal-p-name').innerText = p.nombre;
    if (p.tipo === 'SERVICIO' && (!p.precio || p.precio === 0)) document.getElementById('modal-p-price').innerText = "Cotizar";
    else document.getElementById('modal-p-price').innerText = fmt.format(p.precio);
    document.getElementById('modal-p-specs').innerText = p.specs || 'Sin descripción.';

    const actionText = p.tipo === 'SERVICIO' ? 'me interesa cotizar:' : 'me interesa comprar:';
    document.getElementById('modal-p-btn').href = `https://wa.me/573137713430?text=Hola%20A.S.T.,%20${actionText}%20${encodeURIComponent(p.nombre)}`;

    // Botón compartir interno del modal también discreto (o lo dejamos como estaba, tú decides)
    // Aquí restauré el estilo original de "Compartir" pero con la función de copiar
    const btnShare = document.getElementById('modal-p-share');
    const newBtn = btnShare.cloneNode(true);
    newBtn.innerHTML = '<i class="bi bi-link-45deg me-2"></i> Copiar Link';
    newBtn.onclick = (e) => { e.preventDefault(); copyToClipboard(generateGitHubLink(p.nombre)); };
    newBtn.removeAttribute('href');
    newBtn.removeAttribute('target');
    btnShare.parentNode.replaceChild(newBtn, btnShare);

    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function handleError(c1, c2) {
    const err = `<div class="col-12 text-center text-danger"><p>Error de conexión.</p></div>`;
    if(c1) c1.innerHTML = err;
    if(c2) c2.innerHTML = err;
}
