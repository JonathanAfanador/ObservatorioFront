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
// CONSTANTES Y CONFIGURACIÓN VSUAL COMPARTIDA
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_COLORS = [
    '#c0392b','#2980b9','#27ae60','#d35400','#8e44ad',
    '#16a085','#2c3e50','#f39c12','#1a5276','#6d4c41',
];

const ROUTE_COLOR_MAP  = { 'R3': '#c0392b', 'R5': '#2980b9' };
const PARADERO_COLOR_MAP = { 'R3': '#e74c3c', 'R5': '#3498db', 'default': '#27ae60' };

function extractRouteKey(name) {
    const m = (name || '').match(/\bR\s*(\d+)[a-zA-Z]?\b/i) || (name || '').match(/ruta\s*(\d+)/i);
    return m ? `R${m[1]}` : null;
}

const isLineGeometry  = t => /LineString|Polygon/i.test(t);
const isPointGeometry = t => /Point/i.test(t);

function getRouteColor(routeKey, fallbackIndex = 0) {
    if (routeKey && ROUTE_COLOR_MAP[routeKey]) return ROUTE_COLOR_MAP[routeKey];
    return ROUTE_COLORS[fallbackIndex % ROUTE_COLORS.length];
}

function getParaderoColor(routeKey) {
    return PARADERO_COLOR_MAP[routeKey] || PARADERO_COLOR_MAP['default'];
}

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


/**
 * Inyecta estilos CSS modernos y premium por encima de los defectos de Leaflet
 */
function injectPremiumMapStyles() {
    if (document.getElementById('leaflet-premium-styles')) return;
    const style = document.createElement('style');
    style.id = 'leaflet-premium-styles';
    style.innerHTML = `
        /* Controles generales (Zoom, Reset) */
        .leaflet-bar {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            border: none !important;
            border-radius: 8px !important;
            overflow: hidden;
        }
        .leaflet-bar a, .leaflet-bar button {
            background-color: #ffffff !important;
            color: #334155 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            transition: all 0.2s ease-in-out !important;
        }
        .leaflet-bar a:hover, .leaflet-bar button:hover {
            background-color: #f8fafc !important;
            color: #0f172a !important;
        }
        .leaflet-bar a:last-child, .leaflet-bar button:last-child {
            border-bottom: none !important;
        }
        /* Zoom text */
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
            font-family: inherit !important;
            font-size: 18px !important;
            font-weight: 500 !important;
        }
        /* Control de capas (checkboxes) */
        .leaflet-control-layers {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 8px 12px !important;
            font-family: inherit;
        }
        .leaflet-control-layers-list {
            margin-bottom: 0 !important;
        }
        .leaflet-control-layers label {
            font-size: 0.875rem !important;
            color: #334155;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * MapCore: Clase centralizada para manejar mapas, KMZs, KMLs en toda la aplicación
 */
export default class MapCore {
    constructor(containerId, options = {}) {
        const center = options.center || { lat: 4.3042, lng: -74.8014, zoom: 13 };
        
        injectPremiumMapStyles();

        this.map = L.map(containerId, {
            center: [center.lat, center.lng],
            zoom: center.zoom,
            zoomControl: false, // Lo inicializamos manualmente luego
        });

        // Crear capas base
        this.baseLayersObj = this._createBaseLayers();
        this.baseLayersObj.default.addTo(this.map);

        // Añadir controles nativos de UI
        L.control.zoom({ position: 'topleft' }).addTo(this.map);
        L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 150 }).addTo(this.map);

        // Control nativo de capas que podemos habilitar si se desea
        if (options.useNativeLayerControl) {
            this.nativeLayerControl = L.control.layers(this.baseLayersObj.layers, {}).addTo(this.map);
        }

        // Control nativo para 'Volver al Inicio' / Re-centrar
        const ResetControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: () => {
                const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
                btn.style.backgroundColor = 'white';
                btn.style.width = '34px';
                btn.style.height = '34px';
                btn.style.cursor = 'pointer';
                btn.title = "Restablecer vista inicial";
                btn.onmouseover = () => btn.style.backgroundColor = '#f4f4f4';
                btn.onmouseout = () => btn.style.backgroundColor = 'white';
                btn.onclick = (e) => {
                    L.DomEvent.stopPropagation(e);
                    this.resetView();
                };
                return btn;
            }
        });
        this.map.addControl(new ResetControl());

        this.initialView = { lat: center.lat, lng: center.lng, zoom: center.zoom };
        this.overlayGroups = {}; 
        
        // Hooks (callbacks)
        this.onFeatureClick = options.onFeatureClick || null;
    }

    _createBaseLayers() {
        const osm = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19 }
        );
        const cartoLight = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            { attribution:'© <a href="https://carto.com/">CARTO</a>', maxZoom:19 }
        );
        const cartoDark = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            { attribution:'© <a href="https://carto.com/">CARTO</a>', maxZoom:19 }
        );
        const satelite = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { attribution:'© Esri, Maxar', maxZoom:18 }
        );
        return {
            layers: {
                'Mapa claro':      cartoLight,
                'Mapa oscuro':     cartoDark,
                'Vista satelital': satelite,
                'OpenStreetMap':   osm,
            },
            default: cartoLight,
        };
    }

    /** Reset view to start point or bounds */
    resetView() {
        if (this.initialView.bounds) {
            this.map.fitBounds(this.initialView.bounds, { padding: [40, 40], animate: true });
        } else {
            this.map.setView([this.initialView.lat, this.initialView.lng], this.initialView.zoom, { animate: true });
        }
    }

    /** Refrescar tamaño del mapa (útil cuando se muestra un panel hidden) */
    invalidateSize() {
        setTimeout(() => this.map.invalidateSize(), 300);
    }

    /** 
     * Recibe la ruta remota a un archivo KMZ, la descarga e importa como GeoJSON
     * fetchOptions permite inyectar headers, credenciales, etc.
     */
    async loadKmz(url, label, colorIndex = 0, fetchOptions = {}) {
        try {
            const res = await fetch(url, fetchOptions);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            
            // Inspeccionamos los primeros 4 bytes (Magic Number) para saber si es un formato ZIP (P K \x03 \x04)
            const view = new Uint8Array(buf, 0, 4);
            const isZip = view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
            
            let kmlText = '';
            
            if (isZip) {
                // Es un archivo comprimido .kmz
                const zip = await JSZip.loadAsync(buf);
                const kmlFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.kml'));
                if (!kmlFile) throw new Error('Sin archivo .kml en el interior del KMZ');
                kmlText = await kmlFile.async('string');
            } else {
                // Asumimos que es un archivo .kml directo (texto XML)
                const decoder = new TextDecoder('utf-8');
                kmlText = decoder.decode(buf);
            }
            
            const kmlDom  = new DOMParser().parseFromString(kmlText, 'application/xml');
            if (kmlDom.querySelector('parsererror')) throw new Error('KML inválido');
            
            const geoJson = toGeoJSON.kml(kmlDom);
            if (!geoJson?.features?.length) throw new Error('Sin features en el KML');

            return this.addGeoJsonFeature(geoJson, label, colorIndex);
        } catch (e) {
            console.error(`[MapCore] Error cargando KMZ => ${url}:`, e);
            throw e;
        }
    }

    /** Renderiza el layer GeoJSON en el mapa */
    addGeoJsonFeature(geoJson, label, colorIndex) {
        if (!geoJson || !geoJson.features) return null;

        const kmzRouteKey = extractRouteKey(label);
        
        const layer = L.geoJSON(geoJson, {
            style: (feature) => {
                const geomType = feature.geometry.type;
                const name = (feature.properties?.name || '').trim();
                const featKey = extractRouteKey(name) || kmzRouteKey;
                
                if (isLineGeometry(geomType)) {
                    const color = getRouteColor(featKey, colorIndex);
                    return lineStyle(color);
                }
                return {};
            },
            pointToLayer: (feature, latlng) => {
                const geomType = feature.geometry.type;
                const name = (feature.properties?.name || '').trim();
                const featKey = extractRouteKey(name) || kmzRouteKey;
                
                const color = getParaderoColor(featKey);
                return L.marker(latlng, { icon: createParaderoIcon(color) });
            },
            onEachFeature: (feature, l) => {
                const geomType = feature.geometry.type;
                const n = feature.properties?.name || (isLineGeometry(geomType) ? 'Ruta' : 'Paradero');
                
                l.bindTooltip(n, { permanent: false, direction: 'top', className: 'geovisor-tooltip' });
                
                if (isLineGeometry(geomType)) {
                    const name = (feature.properties?.name || '').trim();
                    const featKey = extractRouteKey(name) || kmzRouteKey;
                    const color = getRouteColor(featKey, colorIndex);
                    const style = lineStyle(color);

                    l.on('mouseover', function() { 
                        this.setStyle(lineStyleHL(color)); 
                        this.bringToFront(); 
                    });
                    l.on('mouseout', function() { 
                        this.setStyle(style); 
                    });
                }
                
                l.on('click', (e) => { 
                    L.DomEvent.stopPropagation(e);
                    if (this.onFeatureClick) this.onFeatureClick(n, feature.properties, label, e); 
                });
            }
        });

        const group = L.featureGroup([layer]);
        group.addTo(this.map);
        this.overlayGroups[label] = group;

        if (this.nativeLayerControl) {
            this.nativeLayerControl.addOverlay(group, label);
        }

        return group;
    }

    fitAllOverlays() {
        const boundsList = Object.values(this.overlayGroups).map(g => {
            try { return g.getBounds(); } catch(e) { return null; }
        }).filter(b => b && b.isValid());

        if (boundsList.length > 0) {
            const combined = boundsList.reduce((acc, b) => acc.extend(b), boundsList[0]);
            this.map.fitBounds(combined, { padding: [40, 40] });
            this.initialView.bounds = combined;
        }
    }

    clearAllOverlays() {
        Object.keys(this.overlayGroups).forEach(label => {
            const group = this.overlayGroups[label];
            if(this.map.hasLayer(group)) {
                this.map.removeLayer(group);
            }
            if(this.nativeLayerControl) {
                this.nativeLayerControl.removeLayer(group);
            }
        });
        this.overlayGroups = {};
    }
}
