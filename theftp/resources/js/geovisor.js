/**
 * resources/js/geovisor.js — v6
 *
 * Correcciones principales:
 *  · Panel de capas en móvil: usa clase --hidden que activa transform en CSS
 *  · Overlay backdrop: se muestra/oculta con clase .visible
 *  · Buscador: marcador se elimina al limpiar, botón × funcional
 *  · Estado inicial correcto por breakpoint
 */

import L from 'leaflet';
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl:       markerIcon,
    shadowUrl:     markerShadow,
});

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const ROUTE_COLORS = [
    '#c0392b','#2980b9','#27ae60','#d35400','#8e44ad',
    '#16a085','#2c3e50','#f39c12','#1a5276','#6d4c41',
];

const ROUTE_COLOR_MAP  = { 'R3': '#c0392b', 'R5': '#2980b9' };
const PARADERO_COLOR_MAP = { 'R3': '#e74c3c', 'R5': '#3498db', 'default': '#27ae60' };

const PROPS_OCULTAS = new Set([
    'styleUrl','styleHash','styleMapHash','stroke','stroke-opacity','stroke-width',
    'fill','fill-opacity','icon','visibility','extrude','tessellate','altitudeMode',
    'drawOrder','icon-scale','icon-heading','icon-color','label-color','label-scale',
]);

// ─────────────────────────────────────────────────────────────────────────────
//  ESTADO
// ─────────────────────────────────────────────────────────────────────────────

let map         = null;
let initialView = null;

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────

function readConfig() {
    try {
        return JSON.parse(document.getElementById('geovisor-config')?.textContent || '{}');
    } catch {
        return { kmzFiles: [], mapCenter: { lat: 4.3042, lng: -74.8014, zoom: 13 } };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

const setLoaderVisible = v => {
    const el = document.getElementById('geovisor-loader');
    if (el) el.style.display = v ? 'flex' : 'none';
};

const escapeHtml = s => String(s ?? '').replace(
    /[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
);

function filtrarPropiedades(props) {
    return Object.entries(props || {}).filter(([k, v]) => {
        if (PROPS_OCULTAS.has(k))                           return false;
        if (k === 'name')                                   return false;
        if (v === null || v === undefined)                  return false;
        if (String(v).trim() === '')                        return false;
        if (String(v).startsWith('http://maps.google.com')) return false;
        return true;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PANEL DE INFORMACIÓN
// ─────────────────────────────────────────────────────────────────────────────

function openInfoPanel(title, props, sourceName) {
    const panel   = document.getElementById('geovisor-info-panel');
    const titleEl = document.getElementById('geovisor-info-title');
    const bodyEl  = document.getElementById('geovisor-info-body');
    if (!panel || !titleEl || !bodyEl) return;

    titleEl.textContent = title || 'Sin nombre';

    const entries = filtrarPropiedades(props);
    let html = entries.length === 0
        ? '<p class="geovisor-info-placeholder">Sin propiedades adicionales.</p>'
        : `<table class="geovisor-info-table"><tbody>
            ${entries.map(([k,v]) => `
            <tr>
                <th scope="row">${escapeHtml(k)}</th>
                <td>${escapeHtml(v)}</td>
            </tr>`).join('')}
           </tbody></table>`;

    if (sourceName) {
        html += `<span class="geovisor-info-source">Capa: ${escapeHtml(sourceName)}</span>`;
    }

    bodyEl.innerHTML = html;
    panel.classList.remove('geovisor-info-panel--hidden');
}

const closeInfoPanel = () =>
    document.getElementById('geovisor-info-panel')
        ?.classList.add('geovisor-info-panel--hidden');

// ─────────────────────────────────────────────────────────────────────────────
//  CLASIFICACIÓN / COLORES
// ─────────────────────────────────────────────────────────────────────────────

function extractRouteKey(name) {
    const m = name.match(/\bR\s*(\d+)[a-zA-Z]?\b/i) || name.match(/ruta\s*(\d+)/i);
    return m ? `R${m[1]}` : null;
}

const isLineGeometry  = t => /LineString|Polygon/i.test(t);
const isPointGeometry = t => /Point/i.test(t);

function getRouteColor(routeKey, fallbackIndex) {
    if (routeKey && ROUTE_COLOR_MAP[routeKey]) return ROUTE_COLOR_MAP[routeKey];
    return ROUTE_COLORS[fallbackIndex % ROUTE_COLORS.length];
}

function getParaderoColor(routeKey) {
    return PARADERO_COLOR_MAP[routeKey] || PARADERO_COLOR_MAP['default'];
}

// ─────────────────────────────────────────────────────────────────────────────
//  ÍCONOS
// ─────────────────────────────────────────────────────────────────────────────

function createParaderoIcon(color) {
    return L.divIcon({
        className: 'geovisor-paradero-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="20" height="28">
            <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.42-3.58-8-8-8z"
                  fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
            <circle cx="12" cy="8" r="3" fill="rgba(255,255,255,0.9)"/>
        </svg>`,
        iconSize:[20,28], iconAnchor:[10,28], popupAnchor:[0,-30],
    });
}

const lineStyle   = (color, w = 4) => ({ color, weight:w, opacity:0.9, lineCap:'round', lineJoin:'round' });
const lineStyleHL = color           => ({ color, weight:7, opacity:1 });

// ─────────────────────────────────────────────────────────────────────────────
//  CARGA KMZ
// ─────────────────────────────────────────────────────────────────────────────

async function loadKmzAsGeoJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf     = await res.arrayBuffer();
    const zip     = await JSZip.loadAsync(buf);
    const kmlFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.kml'));
    if (!kmlFile) throw new Error('Sin archivo .kml en el KMZ');
    const kmlText = await kmlFile.async('string');
    const kmlDom  = new DOMParser().parseFromString(kmlText, 'application/xml');
    if (kmlDom.querySelector('parsererror')) throw new Error('KML inválido');
    const gj = toGeoJSON.kml(kmlDom);
    if (!gj?.features?.length) throw new Error('Sin features en el KML');
    return gj;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTRUCCIÓN DE CAPA
// ─────────────────────────────────────────────────────────────────────────────

function buildLayerFromGeoJson(geoJson, label, colorIndex) {
    const group = L.featureGroup();
    const kmzRouteKey = extractRouteKey(label);

    geoJson.features.forEach(feature => {
        if (!feature.geometry) return;
        const geomType = feature.geometry.type;
        const name     = (feature.properties?.name || '').trim();
        const featKey  = extractRouteKey(name) || kmzRouteKey;

        if (isLineGeometry(geomType)) {
            const color = getRouteColor(featKey, colorIndex);
            const style = lineStyle(color);
            const layer = L.geoJSON(feature, {
                style: () => style,
                onEachFeature(feat, l) {
                    const n = feat.properties?.name || 'Ruta';
                    l.bindTooltip(n, { permanent:false, direction:'top', className:'geovisor-tooltip' });
                    l.on('mouseover', function() { this.setStyle(lineStyleHL(color)); this.bringToFront(); });
                    l.on('mouseout',  function() { this.setStyle(style); });
                    l.on('click',     ()         => openInfoPanel(n, feat.properties, label));
                },
            });
            layer.eachLayer(l => group.addLayer(l));

        } else if (isPointGeometry(geomType)) {
            const color = getParaderoColor(featKey);
            const layer = L.geoJSON(feature, {
                pointToLayer: (feat, latlng) => L.marker(latlng, { icon: createParaderoIcon(color) }),
                onEachFeature(feat, l) {
                    const n = feat.properties?.name || 'Paradero';
                    l.bindTooltip(n, { permanent:false, direction:'top', className:'geovisor-tooltip' });
                    l.on('click', () => openInfoPanel(n, feat.properties, label));
                },
            });
            layer.eachLayer(l => group.addLayer(l));
        }
    });

    return group;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PANEL DE CAPAS
// ─────────────────────────────────────────────────────────────────────────────

function buildLayerPanel(leafletMap, baseLayers, overlayMap) {
    const panel = document.getElementById('geovisor-layers-panel');
    if (!panel) return;

    const baseSection = panel.querySelector('#layers-base-section');
    if (baseSection) {
        Object.entries(baseLayers).forEach(([label, tileLayer]) => {
            const id  = `base-${label.replace(/\s+/g,'_')}`;
            const row = document.createElement('label');
            row.className = 'layer-row';
            row.htmlFor   = id;
            row.innerHTML = `
                <input type="radio" name="base-layer" id="${id}" class="layer-radio">
                <span class="layer-dot layer-dot--base"></span>
                <span class="layer-label">${escapeHtml(label)}</span>`;

            const radio = row.querySelector('input');
            if (leafletMap.hasLayer(tileLayer)) radio.checked = true;

            radio.addEventListener('change', () => {
                Object.values(baseLayers).forEach(l => {
                    if (leafletMap.hasLayer(l)) leafletMap.removeLayer(l);
                });
                tileLayer.addTo(leafletMap);
            });

            baseSection.appendChild(row);
        });
    }

    const overlaySection = panel.querySelector('#layers-overlay-section');
    if (overlaySection) {
        const entries = Object.entries(overlayMap);
        if (entries.length === 0) {
            overlaySection.innerHTML = '<p class="layers-empty">No hay capas disponibles.</p>';
        }
        entries.forEach(([label, featureGroup], idx) => {
            const id    = `overlay-${idx}`;
            const count = featureGroup.getLayers().length;
            const row   = document.createElement('label');
            row.className = 'layer-row';
            row.htmlFor   = id;
            const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];

            row.innerHTML = `
                <input type="checkbox" id="${id}" class="layer-check" checked>
                <span class="layer-dot" style="background:${color}"></span>
                <span class="layer-label">${escapeHtml(label)}</span>
                <span class="layer-count">${count}</span>`;

            const checkbox = row.querySelector('input');
            featureGroup.addTo(leafletMap);

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    featureGroup.addTo(leafletMap);
                } else {
                    leafletMap.removeLayer(featureGroup);
                    closeInfoPanel();
                }
            });

            overlaySection.appendChild(row);
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CAPAS BASE OSM
// ─────────────────────────────────────────────────────────────────────────────

function createBaseLayers() {
    const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19 }
    );
    const cartoLight = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution:'© <a href="https://carto.com/">CARTO</a> © OpenStreetMap', maxZoom:19 }
    );
    const cartoDark = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution:'© <a href="https://carto.com/">CARTO</a> © OpenStreetMap', maxZoom:19 }
    );
    const satelite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution:'© Esri, Maxar, GeoEye', maxZoom:18 }
    );
    return {
        layers: {
            'Mapa estándar':   osm,
            'Mapa claro':      cartoLight,
            'Mapa oscuro':     cartoDark,
            'Vista satelital': satelite,
        },
        default: cartoLight,
    };
}


// ─────────────────────────────────────────────────────────────────────────────
//  MAPA
// ─────────────────────────────────────────────────────────────────────────────

function initMap(center) {
    const leafletMap = L.map('geovisor-map', {
        center:      [center.lat, center.lng],
        zoom:        center.zoom,
        zoomControl: false,
    });
    const base = createBaseLayers();
    base.default.addTo(leafletMap);
    L.control.zoom({ position: 'topleft' }).addTo(leafletMap);
    L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 150 }).addTo(leafletMap);
    initialView = { lat: center.lat, lng: center.lng, zoom: center.zoom };
    return { leafletMap, baseLayers: base.layers };
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE PANEL DE CAPAS — CORREGIDO
//
//  La clase --hidden es suficiente para ambos modos:
//   · Desktop: CSS aplica margin-left: -240px
//   · Móvil:   CSS aplica transform: translateX(-100%)
//
//  JS solo maneja el overlay y el aria-expanded.
// ─────────────────────────────────────────────────────────────────────────────

function setupLayerPanelToggle() {
    const toggleBtn = document.getElementById('btn-toggle-layers');
    const panel     = document.getElementById('geovisor-layers-panel');
    const overlay   = document.getElementById('geovisor-panel-overlay');

    if (!toggleBtn || !panel) return;

    const isMobile = () => window.innerWidth <= 900;

    const openPanel = () => {
        panel.classList.remove('geovisor-layers-panel--hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.classList.add('is-active');
        if (isMobile() && overlay) overlay.classList.add('visible');
    };

    const closePanel = () => {
        panel.classList.add('geovisor-layers-panel--hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.classList.remove('is-active');
        if (overlay) overlay.classList.remove('visible');
    };

    // Estado inicial: oculto en móvil, visible en desktop
    if (isMobile()) {
        closePanel();
    } else {
        openPanel();
    }

    toggleBtn.addEventListener('click', () => {
        const isHidden = panel.classList.contains('geovisor-layers-panel--hidden');
        isHidden ? openPanel() : closePanel();
    });

    // Tap en overlay → cierra
    if (overlay) {
        overlay.addEventListener('click', closePanel);
    }

    // Al cambiar tamaño de ventana, sincronizar estado
    let lastMobile = isMobile();
    window.addEventListener('resize', () => {
        const nowMobile = isMobile();
        if (lastMobile !== nowMobile) {
            lastMobile = nowMobile;
            if (!nowMobile) {
                // Pasó a desktop: forzar panel abierto sin overlay
                openPanel();
                if (overlay) overlay.classList.remove('visible');
            } else {
                // Pasó a móvil: cerrar panel
                closePanel();
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  EVENTOS UI
// ─────────────────────────────────────────────────────────────────────────────

function setupUIEvents() {
    document.getElementById('btn-reset-view')?.addEventListener('click', () => {
        if (!initialView || !map) return;
        initialView.bounds
            ? map.fitBounds(initialView.bounds, { padding:[40,40], animate:true })
            : map.setView([initialView.lat, initialView.lng], initialView.zoom, { animate:true });
    });
    document.getElementById('geovisor-info-close')?.addEventListener('click', closeInfoPanel);
    setupLayerPanelToggle();
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUNTO DE ENTRADA
// ─────────────────────────────────────────────────────────────────────────────

async function initGeovisor() {
    const config = readConfig();
    const { leafletMap, baseLayers } = initMap(config.mapCenter);
    map = leafletMap;
    setupUIEvents();

    const kmzFiles = config.kmzFiles || [];
    if (!kmzFiles.length) { setLoaderVisible(false); return; }

    setLoaderVisible(true);

    try {
        const overlayMap = {};
        const allBounds  = [];

        for (let i = 0; i < kmzFiles.length; i++) {
            const { url, label } = kmzFiles[i];
            try {
                const geoJson      = await loadKmzAsGeoJson(url);
                const featureGroup = buildLayerFromGeoJson(geoJson, label, i);
                overlayMap[label]  = featureGroup;
                try {
                    const b = featureGroup.getBounds();
                    if (b.isValid()) allBounds.push(b);
                } catch(_) {}
            } catch(e) {
                console.warn(`[Geovisor] No se pudo cargar "${label}": ${e.message}`);
            }
        }

        buildLayerPanel(map, baseLayers, overlayMap);

        if (allBounds.length > 0) {
            const combined = allBounds.reduce((acc, b) => acc.extend(b), allBounds[0]);
            if (combined.isValid()) {
                map.fitBounds(combined, { padding:[40,40] });
                initialView = { bounds: combined };
            }
        }

        console.info('[Geovisor] Inicializacion completa.');
    } catch(err) {
        console.error('[Geovisor] Error general:', err);
    } finally {
        setLoaderVisible(false);
    }
}

document.addEventListener('DOMContentLoaded', initGeovisor);