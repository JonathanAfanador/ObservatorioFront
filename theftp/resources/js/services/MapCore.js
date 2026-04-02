import L from 'leaflet';
import 'leaflet-polylinedecorator';
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
    '#6366f1','#f43f5e','#10b981','#0284c7','#8b5cf6',
    '#f97316','#06b6d4','#ec4899','#14b8a6','#475569',
];

const ROUTE_COLOR_MAP  = { 
    'R3': '#6366f1', // Indigo suave
    'R5': '#0284c7'  // Sky blue profesional
};
const PARADERO_COLOR_MAP = { 
    'R3': '#818cf8', 
    'R5': '#38bdf8', 
    'default': '#10b981' 
};

function extractRouteKey(name) {
    const m = (name || '').match(/\bR\s*(\d+)[a-zA-Z]?\b/i) || (name || '').match(/ruta\s*(\d+)/i);
    return m ? `R${m[1]}` : null;
}

const isLineGeometry  = t => /LineString/i.test(t);
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
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <circle cx="12" cy="12" r="10" fill="${color}" filter="url(#shadow)" stroke="#ffffff" stroke-width="2"/>
            <path d="M7 8h10M7 11h10M8 15h2v2H8zm6 0h2v2h-2zM6 7a2 2 0 012-2h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
}

function createStartIcon(shift = 0) {
    return L.divIcon({
        className: 'geovisor-label-marker start-label',
        html: `<div style="background-color: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); white-space: nowrap; transform: translateX(${shift}px); transform-origin: center;">Inicio</div>`,
        iconAnchor: [15, 12],
        iconSize: null
    });
}

function createEndIcon(shift = 0) {
    return L.divIcon({
        className: 'geovisor-label-marker end-label',
        html: `<div style="background-color: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); white-space: nowrap; transform: translateX(${shift}px); transform-origin: center;">Finalización</div>`,
        iconAnchor: [35, 12],
        iconSize: null
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
        .leaflet-layer-control-header {
            font-weight: 700 !important;
            font-size: 11px !important;
            color: #64748b !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            padding: 8px 4px 4px 4px !important;
            border-top: 1px solid #f1f5f9 !important;
            margin-top: 6px !important;
            display: block !important;
            width: 100%;
        }
        .leaflet-layer-control-header:first-child {
            border-top: none !important;
            margin-top: 0 !important;
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
                const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.href = '#';
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
                btn.style.backgroundColor = 'white';
                btn.style.width = '34px';
                btn.style.height = '34px';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.cursor = 'pointer';
                btn.style.borderBottom = '1px solid #ccc';
                btn.title = "Restablecer vista inicial";
                btn.onmouseover = () => btn.style.backgroundColor = '#f4f4f4';
                btn.onmouseout = () => btn.style.backgroundColor = 'white';
                btn.onclick = (e) => {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    this.resetView();
                };
                return btn;
            }
        });
        this.map.addControl(new ResetControl());

        // Control nativo para 'Ubicación Actual'
        const LocateControl = L.Control.extend({
            options: { position: 'topleft' },
            onAdd: () => {
                const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control leaflet-control-custom');
                btn.href = '#';
                btn.title = "Mostrar mi ubicación";
                btn.style.backgroundColor = 'white';
                btn.style.width = '34px';
                btn.style.height = '34px';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.cursor = 'pointer';
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`;
                
                btn.onmouseover = () => btn.style.backgroundColor = '#f4f4f4';
                btn.onmouseout = () => btn.style.backgroundColor = 'white';
                btn.onclick = (e) => {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    this.map.locate({setView: true, maxZoom: 16});
                    if (window.showNotification) window.showNotification('info', 'Ubicación', 'Buscando tu ubicación...', 2000);
                };
                return btn;
            }
        });
        this.map.addControl(new LocateControl());

        // Eventos de geolocalización
        this.map.on('locationfound', (e) => {
            const radius = e.accuracy;
            if (this.locationMarker) {
                this.map.removeLayer(this.locationMarker);
                this.map.removeLayer(this.locationCircle);
            }
            this.locationMarker = L.marker(e.latlng).addTo(this.map)
                .bindPopup("Estás a " + Math.round(radius) + " metros de este punto").openPopup();
            this.locationCircle = L.circle(e.latlng, radius).addTo(this.map);
        });
        
        this.map.on('locationerror', (e) => {
            if (window.showNotification) window.showNotification('warning', 'Ubicación', 'No se pudo acceder a tu ubicación.', 3000);
        });

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
        
        return {
            layers: {
                'Mapa claro':    cartoLight,
                'OpenStreetMap': osm,
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
    async loadKmz(url, label, colorIndex = 0, fetchOptions = {}, options = {}) {
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

            return this.addGeoJsonFeature(geoJson, label, colorIndex, options);
        } catch (e) {
            console.error(`[MapCore] Error cargando KMZ => ${url}:`, e);
            throw e;
        }
    }

    /** Renderiza el layer GeoJSON en el mapa */
    addGeoJsonFeature(geoJson, label, colorIndex, options = {}) {
        if (!geoJson || !geoJson.features) return null;

        let features = geoJson.features;
        
        // Filtrar por geometría si se solicita
        if (options.onlyLines) {
            features = features.filter(f => {
                if (!f.geometry || !isLineGeometry(f.geometry.type)) return false;
                
                // Detectar Bounding Boxes ocultos (de 4 a 6 puntos formando un cierre)
                if (f.geometry.type === 'LineString' && f.geometry.coordinates.length <= 6) {
                    const c = f.geometry.coordinates;
                    const lastIdx = c.length - 1;
                    const diffStartEnd = Math.hypot(c[0][0] - c[lastIdx][0], c[0][1] - c[lastIdx][1]);
                    if (diffStartEnd < 0.001) return false; // Es un recuadro cerrado pequeño
                }
                
                // Si viene como MultiLineString, aplicar el mismo filtro interno
                if (f.geometry.type === 'MultiLineString') {
                    const lineasValidas = f.geometry.coordinates.filter(c => {
                        if (c.length === 5) {
                            const diffStartEnd = Math.hypot(c[0][0] - c[4][0], c[0][1] - c[4][1]);
                            if (diffStartEnd < 0.0001) return false;
                        }
                        return true;
                    });
                    if (lineasValidas.length === 0) return false;
                    f.geometry.coordinates = lineasValidas;
                }
                
                // Excluir específicamente nombres comunes de metadatos o recuadros
                const name = (f.properties?.name || '').toLowerCase();
                if (name.includes('bounding') || name.includes('box') || name.includes('superficie')) return false;

                return true;
            });
        } else if (options.onlyPoints) {
            features = features.filter(f => f.geometry && isPointGeometry(f.geometry.type));
        }
        
        if (features.length === 0) {
            return null; // Nada que añadir
        }
        
        const filteredGeoJson = { ...geoJson, features: features };
        const kmzRouteKey = extractRouteKey(label);
        
        const layer = L.geoJSON(filteredGeoJson, {
            style: (feature) => {
                const geomType = feature.geometry.type;
                const name = (feature.properties?.name || '').trim();
                const featKey = extractRouteKey(name) || kmzRouteKey;
                
                if (isLineGeometry(geomType)) {
                    // Si el objeto fue filtrado antes y es una línea real, darle el color de ruta.
                    const color = getRouteColor(featKey, colorIndex);
                    return lineStyle(color);
                }
                
                // Si por alguna razón Leaflet intenta pintar otra cosa, forzamos que sea invisible.
                return { opacity: 0, fillOpacity: 0, weight: 0 };
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

        const groupLayers = [layer];
        let allLinePoints = [];

        // Extraer endpoints de manera robusta y dibujar flechas
        layer.eachLayer((l) => {
            if (l.feature && isLineGeometry(l.feature.geometry.type)) {
                // 1. Agregar decoradores de flecha en el sentido del trazado
                const arrowDecorator = L.polylineDecorator(l, {
                    patterns: [
                        {
                            offset: 25, 
                            repeat: 50, // Flechas cada 50 píxeles constantes
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 10, 
                                polygon: false, 
                                pathOptions: { 
                                    stroke: true, 
                                    weight: 2, 
                                    color: '#334155', // Slate-700: visible en claro y oscuro
                                    opacity: 0.8, 
                                    lineCap: 'round' 
                                }
                            })
                        }
                    ]
                });
                groupLayers.push(arrowDecorator);

                // 2. Extraer vértices para los marcadores de Inicio/Fin
                if (l.feature.geometry.type === 'LineString') {
                    allLinePoints.push(...l.feature.geometry.coordinates);
                } else if (l.feature.geometry.type === 'MultiLineString') {
                    l.feature.geometry.coordinates.forEach(line => allLinePoints.push(...line));
                }
            }
        });

        if (allLinePoints.length >= 2) {
            const startCoord = allLinePoints[0];
            const endCoord = allLinePoints[allLinePoints.length - 1];
            
            const latDiff = Math.abs(startCoord[1] - endCoord[1]);
            const lngDiff = Math.abs(startCoord[0] - endCoord[0]);
            
            // Umbral aproximado para detectar si coinciden visualmente (unos 30-40 metros)
            const isOverlapping = (latDiff < 0.0003 && lngDiff < 0.0003);
            
            const startMarker = L.marker([startCoord[1], startCoord[0]], { 
                icon: createStartIcon(isOverlapping ? -60 : 0), 
                interactive: false 
            });
            const endMarker = L.marker([endCoord[1], endCoord[0]], { 
                icon: createEndIcon(isOverlapping ? 60 : 0), 
                interactive: false 
            });
            groupLayers.push(startMarker, endMarker);
        }

        const group = L.featureGroup(groupLayers);
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

    /**
     * Reorganiza visualmente el control de capas inyectando cabeceras
     */
    organizeLayerControl() {
        if (!this.nativeLayerControl) return;

        // Esperar un momento a que Leaflet termine de renderizar el control
        setTimeout(() => {
            const controlContainer = document.querySelector('.leaflet-control-layers-overlays');
            if (!controlContainer) return;

            const labels = Array.from(controlContainer.querySelectorAll('label'));
            
            // Eliminar cabeceras previas para evitar duplicados
            controlContainer.querySelectorAll('.leaflet-layer-control-header').forEach(h => h.remove());

            let hasRutasHeader = false;
            let hasParaderosHeader = false;

            labels.forEach(label => {
                const text = label.textContent.trim();
                
                if (text.startsWith('Ruta Asignada:') && !hasRutasHeader) {
                    const header = document.createElement('div');
                    header.className = 'leaflet-layer-control-header';
                    header.textContent = 'Rutas Asignadas';
                    controlContainer.insertBefore(header, label);
                    hasRutasHeader = true;
                } else if (text.startsWith('Paraderos:') && !hasParaderosHeader) {
                    const header = document.createElement('div');
                    header.className = 'leaflet-layer-control-header';
                    header.textContent = 'Paraderos Oficiales';
                    controlContainer.insertBefore(header, label);
                    hasParaderosHeader = true;
                }
            });
        }, 100);
    }
}
