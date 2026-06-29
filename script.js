// ==========================================
// A.S.T. WEB PÚBLICA — script.js v15
// Bugs corregidos: toast, modal-title,
// publicadoGitHub check, placeholder SVG,
// share panel logic.
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxpCp7aY4L48znjtqH_1svYzY6MjVY58bXxt3iZvyuPQwBBt0u7S32aXxxt9VVgtaHd/exec";
const API_KEY = "AST Web App 2026";
const GITHUB_BASE_URL = "https://arrietasolucionestecnologicas-oss.github.io/web/share/";

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
let globalCatalog        = [];
let currentShareUrl      = '';
let currentShareProduct  = null;

// Placeholder SVG inline — sin dependencias externas
const SVG_PLACEHOLDER_PRODUCT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230A1A2E'/%3E%3Ctext x='200' y='140' font-family='monospace' font-size='40' fill='%2300C8FF' text-anchor='middle'%3E📦%3C/text%3E%3Ctext x='200' y='175' font-family='monospace' font-size='13' fill='%234A6680' text-anchor='middle'%3EA.S.T. Producto%3C/text%3E%3C/svg%3E`;
const SVG_PLACEHOLDER_SERVICE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%230A1A2E'/%3E%3Ctext x='200' y='140' font-family='monospace' font-size='40' fill='%2300C8FF' text-anchor='middle'%3E⚙️%3C/text%3E%3Ctext x='200' y='175' font-family='monospace' font-size='13' fill='%234A6680' text-anchor='middle'%3EA.S.T. Servicio%3C/text%3E%3C/svg%3E`;

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, icon = 'bi-check-circle-fill') {
    const container = document.getElementById('ast-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'ast-toast';
    toast.innerHTML = `<i class="bi ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// ── FETCH DATA ────────────────────────────────────────────────
async function fetchData() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'getPublicCatalog', auth: API_KEY, payload: {} })
        });
        const result = await response.json();

        if (result.success) {
            globalCatalog = result.data;
            const services = globalCatalog.filter(item => item.tipo === 'SERVICIO');
            const products = globalCatalog.filter(item => item.tipo === 'PRODUCTO');

            renderServices(services, document.getElementById('services-grid'));
            renderStore(products, document.getElementById('store-grid'));

            // Auto-abrir modal si viene ?open=uuid
            const openId = new URLSearchParams(window.location.search).get('open');
            if (openId) {
                window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(() => openProductModal(openId), 600);
            }
        } else {
            handleError();
        }
    } catch (error) {
        console.error('Error cargando catálogo:', error);
        handleError();
    }
}

// ── RENDER SERVICIOS ──────────────────────────────────────────
function renderServices(items, container) {
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5" style="color:var(--text2);">
            <i class="bi bi-tools" style="font-size:2rem;"></i>
            <p class="mt-2 small">Próximamente.</p>
        </div>`;
        return;
    }

    items.forEach(s => {
        const img     = s.imagen && s.imagen.startsWith('http') ? s.imagen : SVG_PLACEHOLDER_SERVICE;
        const hasLink = s.publicadoGitHub === true || String(s.publicadoGitHub).toLowerCase() === 'true';
        const gitLink = generateGitHubLink(s.nombre);

        const shareBtn = hasLink
            ? `<button class="service-share-btn" onclick="event.stopPropagation(); copyLink('${gitLink}')" title="Copiar enlace compartible">
                   <i class="bi bi-link-45deg"></i>
               </button>`
            : '';

        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-3';
        card.innerHTML = `
            <div class="service-card" onclick="openProductModal('${s.uuid}')">
                <div class="service-card-img">
                    <img src="${img}" alt="${s.nombre}" loading="lazy" onerror="this.src='${SVG_PLACEHOLDER_SERVICE}'">
                    <div class="service-card-img-overlay"></div>
                    ${shareBtn}
                </div>
                <div class="service-card-body">
                    <div class="service-badge"><span></span> DISPONIBLE</div>
                    <div class="service-card-title">${s.nombre}</div>
                    <div class="service-card-desc">${s.specs || 'Solución profesional garantizada.'}</div>
                    <button class="btn-service">
                        <i class="bi bi-whatsapp"></i> Cotizar este servicio
                    </button>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

// ── RENDER STORE ──────────────────────────────────────────────
function renderStore(items, container) {
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5" style="color:var(--text2);">
            <i class="bi bi-box-seam" style="font-size:2rem;"></i>
            <p class="mt-2 small">Próximamente.</p>
        </div>`;
        return;
    }

    items.forEach(p => {
        const img     = p.imagen && p.imagen.startsWith('http') ? p.imagen : SVG_PLACEHOLDER_PRODUCT;
        const hasLink = p.publicadoGitHub === true || String(p.publicadoGitHub).toLowerCase() === 'true';
        const gitLink = generateGitHubLink(p.nombre);

        const shareBtn = hasLink
            ? `<button class="product-share-btn" onclick="event.stopPropagation(); copyLink('${gitLink}')" title="Copiar enlace">
                   <i class="bi bi-link-45deg"></i>
               </button>`
            : '';

        const priceStr = p.precio && p.precio > 0 ? fmt.format(p.precio) : 'Cotizar';
        const catLabel = (p.categoria || 'HARDWARE').replace(/_/g, ' ');

        const card = document.createElement('div');
        card.className = 'col-6 col-md-4 col-lg-3';
        card.innerHTML = `
            <div class="product-card-pub" onclick="openProductModal('${p.uuid}')">
                <div class="product-card-img">
                    <img src="${img}" alt="${p.nombre}" loading="lazy" onerror="this.src='${SVG_PLACEHOLDER_PRODUCT}'">
                    ${shareBtn}
                </div>
                <div class="product-card-body">
                    <div class="product-cat-badge">${catLabel}</div>
                    <div class="product-card-name" title="${p.nombre}">${p.nombre}</div>
                    <div class="product-card-specs">${p.specs || '—'}</div>
                    <div class="product-card-price">${priceStr}</div>
                    <button class="btn-product-detail">
                        Ver detalles <i class="bi bi-arrow-right-short"></i>
                    </button>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

// ── ABRIR MODAL ───────────────────────────────────────────────
function openProductModal(uuid) {
    const p = globalCatalog.find(item => item.uuid === uuid);
    if (!p) return;

    currentShareProduct = p;

    // Imagen
    const imgEl   = document.getElementById('modal-p-img');
    const fallback = p.tipo === 'SERVICIO' ? SVG_PLACEHOLDER_SERVICE : SVG_PLACEHOLDER_PRODUCT;
    imgEl.src     = (p.imagen && p.imagen.startsWith('http')) ? p.imagen : fallback;
    imgEl.onerror = () => { imgEl.src = fallback; };

    // Título header
    document.getElementById('modal-p-title').innerText = p.nombre;

    // Datos
    document.getElementById('modal-p-cat').innerText   = p.tipo === 'SERVICIO' ? 'SERVICIO PROFESIONAL' : (p.categoria || 'HARDWARE').replace(/_/g, ' ');
    document.getElementById('modal-p-name').innerText  = p.nombre;
    document.getElementById('modal-p-price').innerText = (p.precio && p.precio > 0) ? fmt.format(p.precio) : 'Precio a cotizar';
    document.getElementById('modal-p-specs').innerText = p.specs || 'Sin descripción detallada.';

    // WhatsApp consultar
    const actionText = p.tipo === 'SERVICIO' ? 'me interesa cotizar el servicio:' : 'estoy interesado en:';
    document.getElementById('modal-p-btn').href =
        `https://wa.me/573137713430?text=Hola%20A.S.T.,%20${actionText}%20${encodeURIComponent(p.nombre)}`;

    // Panel compartir
    const sharePanel  = document.getElementById('modal-share-panel');
    const nativeBtn   = document.getElementById('btn-share-native');
    const copyBtn     = document.getElementById('btn-share-copy');

    // Resetear botón copiar
    if (copyBtn) {
        copyBtn.innerHTML  = '<i class="bi bi-link-45deg"></i> Copiar link';
        copyBtn.style.background   = 'rgba(0,200,255,0.1)';
        copyBtn.style.borderColor  = 'rgba(0,200,255,0.3)';
        copyBtn.style.color        = '#00C8FF';
    }

    const hasLink = p.publicadoGitHub === true || String(p.publicadoGitHub).toLowerCase() === 'true';

    if (hasLink) {
        currentShareUrl        = generateGitHubLink(p.nombre);
        sharePanel.style.display = 'block';
        if (nativeBtn) {
            nativeBtn.style.display = navigator.share ? 'block' : 'none';
        }
    } else {
        currentShareUrl          = '';
        sharePanel.style.display = 'none';
    }

    // GA4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', { item_name: p.nombre, item_category: p.tipo });
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal')).show();
}

// ── COMPARTIR PRODUCTO ────────────────────────────────────────
function shareProduct(type) {
    if (!currentShareUrl) return;
    const p      = currentShareProduct;
    const nombre = p ? p.nombre : 'Producto A.S.T.';
    const precio = (p && p.precio > 0) ? fmt.format(p.precio) : 'Precio a cotizar';

    if (type === 'copy') {
        copyLink(currentShareUrl);
        const btn = document.getElementById('btn-share-copy');
        if (btn) {
            btn.innerHTML          = '<i class="bi bi-check-lg"></i> ¡Copiado!';
            btn.style.background   = 'rgba(0,230,118,0.15)';
            btn.style.borderColor  = '#00E676';
            btn.style.color        = '#00E676';
            setTimeout(() => {
                btn.innerHTML          = '<i class="bi bi-link-45deg"></i> Copiar link';
                btn.style.background   = 'rgba(0,200,255,0.1)';
                btn.style.borderColor  = 'rgba(0,200,255,0.3)';
                btn.style.color        = '#00C8FF';
            }, 2500);
        }

    } else if (type === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`;
        window.open(fbUrl, '_blank', 'width=620,height=450,left=200,top=100');
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'Facebook', content_type: 'product', item_id: nombre });
        }

    } else if (type === 'whatsapp') {
        const texto = `🏢 *A.S.T. Soluciones Tecnológicas*\n\n📦 *${nombre}*\n💰 ${precio}\n\nVe todos los detalles aquí 👇\n${currentShareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'WhatsApp', content_type: 'product', item_id: nombre });
        }

    } else if (type === 'native') {
        if (navigator.share) {
            navigator.share({
                title: `${nombre} | A.S.T. Soluciones`,
                text:  `${nombre} — ${precio}`,
                url:   currentShareUrl
            }).catch(e => {
                if (e.name !== 'AbortError') copyLink(currentShareUrl);
            });
        }
    }
}

// ── HELPERS ───────────────────────────────────────────────────
function generateGitHubLink(name) {
    const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return `${GITHUB_BASE_URL}${slug}.html`;
}

function copyLink(url) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('¡Enlace copiado! Pégalo donde quieras.', 'bi-link-45deg');
        }).catch(() => fallbackCopy(url));
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(url) {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:fixed;top:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('¡Enlace copiado!', 'bi-link-45deg');
    } catch {
        showToast('Copia este link: ' + url, 'bi-exclamation-circle');
    }
    document.body.removeChild(ta);
}

function handleError() {
    const err = `<div class="col-12 text-center py-5" style="color:#ff4444;">
        <i class="bi bi-wifi-off" style="font-size:2rem;"></i>
        <p class="mt-2 small">Error de conexión. Intenta recargar la página.</p>
    </div>`;
    const sg = document.getElementById('services-grid');
    const pg = document.getElementById('store-grid');
    if (sg) sg.innerHTML = err;
    if (pg) pg.innerHTML = err;
}
