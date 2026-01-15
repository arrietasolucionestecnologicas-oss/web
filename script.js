// ==========================================
// CONFIGURACIÓN (PEGAR NUEVA URL AQUI TAMBIÉN)
// ==========================================
// PEGA AQUÍ LA NUEVA URL QUE TE DIO GOOGLE AL DARLE A "NUEVA IMPLEMENTACIÓN"
const API_URL = "https://script.google.com/macros/s/AKfycbxcWc83WPaNd0v0QnsuyH0h-6hZNIxFpk61A0pbYBiegyKLPwfsCQ3uqxggRv1uTsw4hw/exec";
const API_KEY = "AST_2025_SECURE";

// IMÁGENES POR DEFECTO
const DEFAULT_IMG_SERVICE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
const DEFAULT_IMG_PRODUCT = 'https://via.placeholder.com/600x400?text=AST+Producto';

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
let globalCatalog = [];

document.addEventListener('DOMContentLoaded', () => { fetchData(); });

async function fetchData() {
    const servicesContainer = document.getElementById('services-grid');
    const storeContainer = document.getElementById('store-grid');
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

            // === AUTO-ABRIR MODAL DESDE GITHUB STATIC SHARE ===
            const urlParams = new URLSearchParams(window.location.search);
            const openId = urlParams.get('open');
            if (openId) {
                // Borrar parámetros URL para limpieza
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
        const html = `<div class="col-md-6 col-lg-3"><div class="tech-card h-100 overflow-hidden p-0 d-flex flex-column" onclick="openProductModal('${s.uuid}')" style="cursor: pointer;"><div style="height: 180px; overflow: hidden; position: relative;"><div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, transparent, rgba(30, 41, 59, 1));"></div><img src="${img}" style="width:100%; height:100%; object-fit: cover; opacity: 0.9;"></div><div class="p-4 d-flex flex-column flex-grow-1" style="margin-top: -20px; position: relative; z-index: 2;"><h4 class="text-white h5 fw-bold mb-3">${s.nombre}</h4><p class="text-gray small flex-grow-1 mb-4" style="line-height: 1.6;">${s.specs || 'Solución profesional.'}</p><div class="d-flex gap-2 mt-auto"><a href="https://wa.me/573137713430?text=Hola%20A.S.T.,%20me%20interesa%20cotizar%20el%20servicio:%20${encodeURIComponent(s.nombre)}" target="_blank" class="btn btn-outline-tech btn-sm flex-grow-1 rounded-pill" onclick="event.stopPropagation()"><i class="bi bi-whatsapp me-2"></i> Cotizar</a><button class="btn btn-primary-tech btn-sm rounded-pill px-3" onclick="event.stopPropagation(); shareItem('${s.uuid}')" title="Compartir"><i class="bi bi-share-fill"></i></button></div></div></div></div>`;
        container.innerHTML += html;
    });
}

function renderStore(items, container) {
    container.innerHTML = '';
    if (items.length === 0) { container.innerHTML = `<div class="col-12 text-center text-muted"><p>Próximamente.</p></div>`; return; }
    items.forEach(p => {
        const imageSrc = p.imagen && p.imagen.startsWith('http') ? p.imagen : DEFAULT_IMG_PRODUCT;
        const html = `<div class="col-md-6 col-lg-4 col-xl-3"><div class="product-card h-100 d-flex flex-column" onclick="openProductModal('${p.uuid}')"><div class="product-img-wrapper"><img src="${imageSrc}" alt="${p.nombre}"></div><div class="card-body-dark d-flex flex-column flex-grow-1"><div class="mb-2"><span class="badge-category">${p.categoria || 'HARDWARE'}</span></div><h5 class="text-white fw-bold mb-2 text-truncate" title="${p.nombre}">${p.nombre}</h5><p class="text-primary-tech fw-bold mb-0">${fmt.format(p.precio)}</p><p class="text-gray small mb-3 text-truncate" style="min-height: 20px;">${p.specs || 'Ver detalles...'}</p><div class="mt-auto pt-3 border-top border-secondary d-flex justify-content-between align-items-center"><button class="btn btn-sm btn-primary-tech rounded-pill px-3 w-100">Ver Detalles <i class="bi bi-arrow-right-short"></i></button></div></div></div></div>`;
        container.innerHTML += html;
    });
}

// COMPARTIR INTELIGENTE (Detecta si existe ficha en GitHub o usa Trampolín)
function shareItem(uuid) {
    const p = globalCatalog.find(item => item.uuid === uuid);
    if (!p) return;
    
    // Generar slug igual que el Backend
    const cleanFileName = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // ENLACE DIRECTO A GITHUB (¡TU DOMINIO!)
    const githubLink = `https://arrietasolucionestecnologicas-oss.github.io/web/share/${cleanFileName}.html`;
    
    const text = `Mira esta solución de A.S.T.:\n*${p.nombre}*\n${githubLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function openProductModal(uuid) {
    const p = globalCatalog.find(item => item.uuid === uuid);
    if (!p) return;
    let finalImage = p.imagen && p.imagen.startsWith('http') ? p.imagen : null;
    if (!finalImage) finalImage = p.tipo === 'SERVICIO' ? DEFAULT_IMG_SERVICE : DEFAULT_IMG_PRODUCT;

    document.getElementById('modal-p-img').src = finalImage;
    document.getElementById('modal-p-cat').innerText = p.tipo === 'SERVICIO' ? 'SERVICIO PROFESIONAL' : (p.categoria || 'HARDWARE');
    document.getElementById('modal-p-name').innerText = p.nombre;
    if (p.tipo === 'SERVICIO' && (!p.precio || p.precio === 0)) document.getElementById('modal-p-price').innerText = "Cotizar";
    else document.getElementById('modal-p-price').innerText = fmt.format(p.precio);
    document.getElementById('modal-p-specs').innerText = p.specs || 'Sin descripción detallada.';

    const actionText = p.tipo === 'SERVICIO' ? 'me interesa cotizar el servicio:' : 'estoy interesado en comprar:';
    document.getElementById('modal-p-btn').href = `https://wa.me/573137713430?text=Hola%20A.S.T.,%20${actionText}%20${encodeURIComponent(p.nombre)}`;

    // Botón compartir interno del modal
    const cleanFileName = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const githubLink = `https://arrietasolucionestecnologicas-oss.github.io/web/share/${cleanFileName}.html`;
    document.getElementById('modal-p-share').href = `https://wa.me/?text=${encodeURIComponent("Mira esto:\n" + githubLink)}`;

    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function handleError(c1, c2) {
    const err = `<div class="col-12 text-center text-danger"><p>Error de conexión.</p></div>`;
    if(c1) c1.innerHTML = err;
    if(c2) c2.innerHTML = err;
}
