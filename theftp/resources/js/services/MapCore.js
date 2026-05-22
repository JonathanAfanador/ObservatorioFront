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
// CONSTANTES Y CONFIGURACIÓN VISUAL COMPARTIDA
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_COLORS = [
    '#6366f1','#f43f5e','#0284c7','#d946ef','#8b5cf6',
    '#f97316','#06b6d4','#ec4899','#84cc16','#475569',
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
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
            font-family: inherit !important;
            font-size: 18px !important;
            font-weight: 500 !important;
        }
        .leaflet-control-layers {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 8px 12px !important;
            font-family: inherit;
        }
        .leaflet-control-layers-list { margin-bottom: 0 !important; }
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

// ─────────────────────────────────────────────────────────────────────────────
// ÍCONOS DE PLANIFICADOR (A y B)
// ─────────────────────────────────────────────────────────────────────────────
function createTripIcon(label, color) {
    return L.divIcon({
        className: 'geovisor-trip-marker',
        html: `<div style="
            background: ${color};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transform: rotate(-45deg) translate(2px, -2px);
        "><span style="transform: rotate(45deg);">${label}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
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
            zoomControl: false,
            preferCanvas: false,          // Renderizado hiper-rápido usando HTML5 Canvas en vez de SVG (ideal para móviles y KMZs)
            zoomAnimation: true,         // Animaciones de zoom fluidas
            markerZoomAnimation: true,   // Animar marcadores durante el zoom
            fadeAnimation: true,         // Transición suave entre tiles de mapas
            inertia: true,               // Paneo inercial (suavizado al deslizar el dedo)
            bounceAtZoomLimits: false    // Evitar rebotes molestos en los límites de zoom en móvil
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
            if (this.locationMarker) {
                this.map.removeLayer(this.locationMarker);
                this.map.removeLayer(this.locationCircle);
            }

            // Crear un marcador premium con CSS para el pulso
            const userIcon = L.divIcon({
                className: 'user-location-wrapper',
                html: `
                    <div class="user-location-pulse"></div>
                    <div class="user-location-dot"></div>
                    <div class="user-location-label">¡Tú estás aquí!</div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            this.locationMarker = L.marker(e.latlng, { icon: userIcon }).addTo(this.map);
            
            this.locationCircle = L.circle(e.latlng, {
                radius: e.accuracy,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 1,
                interactive: false
            }).addTo(this.map);

            // Inyectar animaciones para este marcador si no existen
            if (!document.getElementById('user-location-animations')) {
                const style = document.createElement('style');
                style.id = 'user-location-animations';
                style.innerHTML = `
                    .user-location-wrapper {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }
                    .user-location-dot {
                        width: 14px;
                        height: 14px;
                        background: #3b82f6;
                        border: 2px solid white;
                        border-radius: 50%;
                        z-index: 2;
                        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                    }
                    .user-location-pulse {
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        background: rgba(59, 130, 246, 0.4);
                        border-radius: 50%;
                        z-index: 1;
                        animation: pulse-user 2s infinite;
                    }
                    @keyframes pulse-user {
                        0% { transform: scale(0.5); opacity: 0.8; }
                        70% { transform: scale(2); opacity: 0; }
                        100% { transform: scale(1); opacity: 0; }
                    }
                    .user-location-label {
                        position: absolute;
                        top: -35px;
                        background: #1e293b;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 600;
                        white-space: nowrap;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                        pointer-events: none;
                    }
                    .user-location-label::after {
                        content: '';
                        position: absolute;
                        bottom: -4px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 5px solid #1e293b;
                    }
                `;
                document.head.appendChild(style);
            }
        });
        
        this.map.on('locationerror', (e) => {
            if (window.showNotification) window.showNotification('warning', 'Ubicación', 'No se pudo acceder a tu ubicación.', 3000);
        });

        this.initialView = { lat: center.lat, lng: center.lng, zoom: center.zoom };
        this.overlayGroups = {}; 
        
        // Hooks (callbacks)
        this.onFeatureClick = options.onFeatureClick || null;

        // ── Estado del Planificador ──
        this.tripPoints = { origin: null, destination: null };
        this.extraPaths = {}; // Trazados auxiliares (GPS -> Punto A, etc.)
        this.routeCache = new Map(); // Caché para evitar saturar OSRM
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // GESTIÓN DE PLANIFICADOR (ORIGEN / DESTINO)
    // ─────────────────────────────────────────────────────────────────────────────

    setTripPoint(type, latlng) {
        const label = type === 'origin' ? 'A' : 'B';
        const color = type === 'origin' ? '#3b82f6' : '#ef4444';
        if (this.tripPoints[type]) {
            this.map.removeLayer(this.tripPoints[type].marker);
        }
        const marker = L.marker(latlng, {
            icon: createTripIcon(label, color),
            draggable: false
        }).addTo(this.map);
        this.tripPoints[type] = { latlng, marker };
        this.map.fire('trip:updated');
    }

    clearSingleTripPoint(type) {
        if (this.tripPoints[type]) {
            this.map.removeLayer(this.tripPoints[type].marker);
            this.tripPoints[type] = null;
        }
        this.map.fire('trip:updated');
    }

    clearTripPoints() {
        if (this.tripPoints.origin) this.map.removeLayer(this.tripPoints.origin.marker);
        if (this.tripPoints.destination) this.map.removeLayer(this.tripPoints.destination.marker);
        this.tripPoints = { origin: null, destination: null };
        this.clearAllExtraPaths();
        this.map.fire('trip:updated');
    }

    /**
     * Crea o actualiza una polilínea auxiliar (p.ej. de GPS a Punto A o Paradero)
     */
    upsertExtraPath(id, from, to, options = {}) {
        if (!from || !to) {
            this.clearExtraPath(id);
            return;
        }

        const latlngs = options.geometry || [
            [from.lat, from.lng],
            [to.lat, to.lng]
        ];

        const style = {
            color: options.color || '#64748b',
            weight: options.weight || 3,
            opacity: options.opacity || 0.7,
            dashArray: options.dashArray || '5, 10',
            lineCap: 'round',
            interactive: false
        };

        if (this.extraPaths[id]) {
            this.extraPaths[id].setLatLngs(latlngs);
            this.extraPaths[id].setStyle(style);
        } else {
            this.extraPaths[id] = L.polyline(latlngs, style).addTo(this.map);
        }
    }

    clearExtraPath(id) {
        if (this.extraPaths[id]) {
            this.map.removeLayer(this.extraPaths[id]);
            delete this.extraPaths[id];
        }
        // Borrar todos los IDs alternativos asociados (ej: id-alt-1, id-alt-2)
        const prefix = `${id}-alt-`;
        Object.keys(this.extraPaths).forEach(key => {
            if (key.startsWith(prefix)) {
                this.map.removeLayer(this.extraPaths[key]);
                delete this.extraPaths[key];
            }
        });
    }

    clearAllExtraPaths() {
        Object.keys(this.extraPaths).forEach(id => this.clearExtraPath(id));
    }

    /**
     * Consulta la API de rutas para obtener una o más alternativas de camino real.
     * Retorna un array de geometrías [[lat, lng], ...] o null si falla.
     */
    async fetchWalkingRoute(from, to) {
        if (!from || !to) return null;
        
        const cacheKey = `${from.lat.toFixed(5)},${from.lng.toFixed(5)}-${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
        if (this.routeCache.has(cacheKey)) {
            return this.routeCache.get(cacheKey);
        }

        try {
            const params = new URLSearchParams({
                from_lat: from.lat, from_lng: from.lng,
                to_lat: to.lat, to_lng: to.lng,
            });
            const res = await fetch(`/api/public/geovisor/osrm-route?${params}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.status && data.geometries) {
                this.routeCache.set(cacheKey, data.geometries);
                return data.geometries;
            }
        } catch (e) {
            console.warn('[MapCore] Error consultando proxy de rutas:', e.message);
        }
        return null;
    }

    /**
     * Busca el paradero más cercano entre todas las rutas disponibles.
     */
    findNearestStopAcrossAllRoutes(latlng, routes) {
        if (!latlng || !routes || routes.length === 0) return null;
        let nearestStop = null;
        let minDistance = Infinity;
        routes.forEach(route => {
            if (!route.paraderos) return;
            route.paraderos.forEach(p => {
                const dist = latlng.distanceTo(L.latLng(p.lat, p.lng));
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestStop = p;
                }
            });
        });
        return nearestStop;
    }

    /**
     * Analiza TODAS las rutas disponibles y devuelve las mejores opciones de viaje.
     * Búsqueda GLOBAL Haversine: escanea todos los paraderos de cada ruta.
     */
    findBestTrip(allRoutes = []) {
        if (!this.tripPoints.origin || !this.tripPoints.destination || allRoutes.length === 0) {
            return null;
        }

        const origin = this.tripPoints.origin.latlng;
        const dest   = this.tripPoints.destination.latlng;
        const options = [];

        allRoutes.forEach(route => {
            if (!route.paraderos || route.paraderos.length < 2) return;

            // 1. Pre-procesar paraderos para extraer sus números lógicos (ej: Paradero 1 -> 1)
            const paraderosProcesados = route.paraderos.map((p, idx) => {
                const match = (p.name || '').match(/\d+/);
                return {
                    original: p,
                    idx: idx,
                    num: match ? parseInt(match[0]) : (idx + 1)
                };
            });

            // Encontrar el número máximo de paradero para lógica de final de ruta
            const maxStopNum = Math.max(...paraderosProcesados.map(p => p.num));

            // 2. Escaneo GLOBAL basado en números lógicos
            let bestPair = null;
            let minTotalDist = Infinity;

            paraderosProcesados.forEach((pA) => {
                const dA = origin.distanceTo(L.latLng(pA.original.lat, pA.original.lng));
                
                paraderosProcesados.forEach((pB) => {
                    // VALIDACIÓN: El paradero de bajada debe tener un número mayor al de subida
                    if (pA.num < pB.num) { 
                        const dB = dest.distanceTo(L.latLng(pB.original.lat, pB.original.lng));
                        const total = dA + dB;
                        
                        if (total < minTotalDist) {
                            minTotalDist = total;
                            bestPair = { 
                                cA: { p: pA.original, idx: pA.idx, num: pA.num, dist: dA }, 
                                cB: { p: pB.original, idx: pB.idx, num: pB.num, dist: dB } 
                            };
                        }
                    }
                });
            });

            if (bestPair) {
                // Candidatos para UI/Refinamiento
                const candidatesA = route.paraderos.map((p, idx) => ({
                    p, idx, dist: origin.distanceTo(L.latLng(p.lat, p.lng))
                })).sort((a, b) => a.dist - b.dist).slice(0, 10);

                const candidatesB = route.paraderos.map((p, idx) => ({
                    p, idx, dist: dest.distanceTo(L.latLng(p.lat, p.lng))
                })).sort((a, b) => a.dist - b.dist).slice(0, 10);

                // Sentido y etiquetas especiales
                // Si el paradero de subida está en el último 20% de la ruta numerada, se avisa
                const isRegreso = bestPair.cA.num > (maxStopNum * 0.8);
                
                // Si el paradero de subida está a menos de 5 del final, es tramo final
                const isFinalDeRuta = (maxStopNum - bestPair.cA.num <= 5) && (bestPair.cA.num > 5);

                options.push({
                    routeId:    route.id,
                    routeName:  route.name,
                    stopA:      bestPair.cA.p,
                    stopB:      bestPair.cB.p,
                    numA:       bestPair.cA.num,
                    numB:       bestPair.cB.num,
                    distToA:    Math.round(bestPair.cA.dist),
                    distToB:    Math.round(bestPair.cB.dist),
                    walkDist:   Math.round(minTotalDist),
                    walkTime:   Math.max(1, Math.ceil(minTotalDist / 80)),
                    candidatesA,
                    candidatesB,
                    directionOk: true,
                    isRegreso,
                    isFinalDeRuta,
                    stopsInBetween: bestPair.cB.num - bestPair.cA.num
                });
            }
        });

        const sorted = options.sort((a, b) => a.walkDist - b.walkDist);

        console.group('[TripPlanner] Análisis por Números Lógicos');
        sorted.forEach((o, i) => {
            const mark = i === 0 ? '>>>' : '   ';
            
        });
        console.groupEnd();

        return {
            best:    sorted.length > 0 ? sorted[0] : null,
            alternatives: sorted.slice(1, 3),
            hasResults: sorted.length > 0
        };
    }

    /**
     * Calcula la distancia y tiempo desde la ubicacion GPS del usuario hasta el Punto A (origen).
     */
    getGpsToOriginInfo(gpsLatLng) {
        if (!gpsLatLng || !this.tripPoints.origin) return null;
        const dist = gpsLatLng.distanceTo(this.tripPoints.origin.latlng);
        return {
            distance: Math.round(dist),
            time: Math.max(1, Math.ceil(dist / 80))
        };
    }

    _createBaseLayers() {
        const tileOptions = {
            maxZoom: 19,
            updateWhenZooming: false,    // NO intentar descargar tiles MIENTRAS haces zoom (evita tirones)
            updateWhenIdle: true,       // Esperar a que termines de mover el mapa para pintar los tiles nuevos
            keepBuffer: 3,              // Mantiene en caché los bordes para que al mover no veas cuadros grises
        };

        const osm = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { 
                ...tileOptions,
                attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
        );
        const cartoLight = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            { 
                ...tileOptions,
                attribution:'© <a href="https://carto.com/">CARTO</a>' 
            }
        );
        
        return {
            layers: {
                'Mapa claro':    cartoLight,
                'OpenStreetMap': osm,
            },
            default: cartoLight,
        };
    }

    switchBaseLayer(layerKey) {
        const layers = this.baseLayersObj.layers;
        if (!layers[layerKey]) return;
        Object.values(layers).forEach(l => {
            if (this.map.hasLayer(l)) this.map.removeLayer(l);
        });
        layers[layerKey].addTo(this.map);
    }

    resetView() {
        if (this.initialView.bounds) {
            this.map.fitBounds(this.initialView.bounds, { padding: [40, 40], animate: true });
        } else {
            this.map.setView([this.initialView.lat, this.initialView.lng], this.initialView.zoom, { animate: true });
        }
    }

    invalidateSize() {
        setTimeout(() => this.map.invalidateSize(), 300);
    }

    /** 
     * Recibe la ruta remota a un archivo KMZ, la descarga e importa como GeoJSON
     */
    async loadKmz(url, label, colorIndex = 0, fetchOptions = {}, options = {}) {
        if (!url || url.trim() === "") {
            throw new Error('URL de KMZ no especificada o vacía');
        }
        try {
            const res = await fetch(url, fetchOptions);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = await res.arrayBuffer();
            
            const view = new Uint8Array(buf, 0, 4);
            const isZip = view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
            
            let kmlText = '';
            
            if (isZip) {
                const zip = await JSZip.loadAsync(buf);
                const kmlFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.kml'));
                if (!kmlFile) throw new Error('Sin archivo .kml en el interior del KMZ');
                kmlText = await kmlFile.async('string');
            } else {
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

    /**
     * Utilidad: Recibe un objeto 'File' de un <input type="file">, 
     * lo extrae en memoria y retorna un arreglo literal de Puntos (Paraderos).
     */
    async extractParaderosFromKmzFile(file) {
        try {
            const buf = await file.arrayBuffer();
            const view = new Uint8Array(buf, 0, 4);
            const isZip = view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
            
            let kmlText = '';
            if (isZip) {
                const zip = await JSZip.loadAsync(buf);
                const kmlFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.kml'));
                if (!kmlFile) throw new Error('Sin archivo .kml en el interior del KMZ');
                kmlText = await kmlFile.async('string');
            } else {
                kmlText = new TextDecoder('utf-8').decode(buf);
            }
            
            const kmlDom  = new DOMParser().parseFromString(kmlText, 'application/xml');
            if (kmlDom.querySelector('parsererror')) throw new Error('KML inválido');
            const geoJson = toGeoJSON.kml(kmlDom);
            if (!geoJson?.features?.length) throw new Error('Sin features detectables en el archivo');

            const puntosExtras = geoJson.features.filter(f => f.geometry && f.geometry.type === 'Point');
            return puntosExtras.map((f, i) => ({
                name: f.properties?.name || `Paradero Detectado #${i + 1}`,
                description: f.properties?.description || '',
                lng: f.geometry.coordinates[0],
                lat: f.geometry.coordinates[1],
                estado: true
            }));
        } catch (e) {
            console.error(`[MapCore] Error extrayendo Puntos de archivo local:`, e);
            throw e;
        }
    }

    /** Renderiza el layer GeoJSON en el mapa CON flechas de dirección, Inicio/Fin */
    addGeoJsonFeature(geoJson, label, colorIndex, options = {}) {
    if (!geoJson || !geoJson.features) return null;

    let features = geoJson.features;

    if (options.onlyLines) {
        features = features.filter(f => {
            if (!f.geometry || !isLineGeometry(f.geometry.type)) return false;
            
            if (f.geometry.type === 'LineString' && f.geometry.coordinates.length <= 6) {
                const c = f.geometry.coordinates;
                const lastIdx = c.length - 1;
                const diffStartEnd = Math.hypot(c[0][0] - c[lastIdx][0], c[0][1] - c[lastIdx][1]);
                if (diffStartEnd < 0.001) return false;
            }
            
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
            
            const name = (f.properties?.name || '').toLowerCase();
            if (name.includes('bounding') || name.includes('box') || name.includes('superficie')) return false;
            return true;
        });
    } else if (options.onlyPoints) {
        features = features.filter(f => f.geometry && isPointGeometry(f.geometry.type));
    }
    
    if (features.length === 0) return null;
    
    const filteredGeoJson = { ...geoJson, features: features };
    const kmzRouteKey = extractRouteKey(label);
    
    const layer = L.geoJSON(filteredGeoJson, {
        style: (feature) => {
            const geomType = feature.geometry.type;
            const name = (feature.properties?.name || '').trim();
            const featKey = extractRouteKey(name) || kmzRouteKey;
            
            if (isLineGeometry(geomType)) {
                const color = getRouteColor(featKey, colorIndex);
                return lineStyle(color);
            }
            return { opacity: 0, fillOpacity: 0, weight: 0 };
        },
        pointToLayer: (feature, latlng) => {
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

    layer.eachLayer((l) => {
        if (l.feature && isLineGeometry(l.feature.geometry.type)) {
            // Flechas - protegido contra fallos del plugin
            try {
                const arrowDecorator = L.polylineDecorator(l, {
                    patterns: [
                        {
                            offset: 25, 
                            repeat: 50,
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 10, 
                                polygon: false, 
                                pathOptions: { 
                                    stroke: true, 
                                    weight: 2, 
                                    color: '#334155',
                                    opacity: 0.8, 
                                    lineCap: 'round' 
                                }
                            })
                        }
                    ]
                });
                groupLayers.push(arrowDecorator);
            } catch(decoratorErr) {
                console.warn('[MapCore] polylineDecorator no disponible:', decoratorErr.message);
            }

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
        const isOverlapping = (latDiff < 0.0003 && lngDiff < 0.0003);
        
        try {
            const startMarker = L.marker([startCoord[1], startCoord[0]], { 
                icon: createStartIcon(isOverlapping ? -60 : 0), 
                interactive: false 
            });
            const endMarker = L.marker([endCoord[1], endCoord[0]], { 
                icon: createEndIcon(isOverlapping ? 60 : 0), 
                interactive: false 
            });
            groupLayers.push(startMarker, endMarker);
        } catch(markerErr) {
            console.warn('[MapCore] Error creando marcadores Inicio/Fin:', markerErr.message);
        }
    }

    try {
        const group = L.featureGroup(groupLayers);
        group.addTo(this.map);
        this.overlayGroups[label] = group;

        if (this.nativeLayerControl) {
            this.nativeLayerControl.addOverlay(group, label);
        }

        return group;
    } catch(groupErr) {
        console.error('[MapCore] Error creando featureGroup:', groupErr);
        return null;
    }
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
        if(this.map.hasLayer(group)) this.map.removeLayer(group);
        if(this.nativeLayerControl) this.nativeLayerControl.removeLayer(group);
    });
    this.overlayGroups = {};
}

organizeLayerControl() {
    if (!this.nativeLayerControl) return;
    setTimeout(() => {
        const controlContainer = document.querySelector('.leaflet-control-layers-overlays');
        if (!controlContainer) return;
        const labels = Array.from(controlContainer.querySelectorAll('label'));
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