"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Marker, Popup, NavigationControl, AttributionControl, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Store } from "lucide-react";
import { CITY_COORDINATES } from "@/lib/city-coordinates";

// MapLibre resolves its worker script relative to its own bundled module URL
// by default, which breaks once Next.js/Turbopack has repackaged that module
// (the worker file is no longer actually there) — pointing it at the static
// copy served from /public (kept in sync by scripts/copy-maplibre-worker.mjs)
// sidesteps that. This file is only ever loaded client-side (the page always
// dynamic-imports MerchantsMap with ssr: false), so this runs once per tab.
setWorkerUrl("/maplibre-gl-worker.mjs");

export interface MapMerchant {
  id: string;
  name: string;
  category: string;
  discountPercent?: number;
  city: string;
  country: "GH" | "UK";
  /** The merchant's own resolved [lat, lng], when its Maps link has one — see lib/city-coordinates.ts#merchantLatLng. */
  coords?: [number, number];
}

// OSM only serves pre-rendered raster tiles (no public vector tile endpoint),
// so this is a raster source/layer rather than a full vector style — MapLibre
// supports that just as well.
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const PIN_COLOR = "oklch(0.541 0.281 293.009)";

/** Every merchant gets the same store-pin marker, whether its position is a precise resolved location or a spread-out city-level estimate (see jitterAround). */
function MerchantPin() {
  return (
    <div
      style={{ background: PIN_COLOR }}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
    >
      <Store className="h-3.5 w-3.5" />
    </div>
  );
}

const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

/**
 * Spreads merchants that share a city center out into a small spiral around
 * it, so several merchants without a precise resolved location (see
 * MapMerchant.coords) don't stack on the exact same pixel — each gets its
 * own visible store pin instead of one bundled "N merchants here" marker.
 * `index` is that merchant's position within its city's list (stable as
 * long as the list itself is sorted deterministically, e.g. by id).
 * This is a visual approximation for "roughly in this city", not a real
 * address — merchants with a resolved `coords` skip this entirely.
 */
function jitterAround([lat, lng]: [number, number], index: number): [number, number] {
  if (index === 0) return [lat, lng];
  const angle = index * GOLDEN_ANGLE;
  const radiusKm = 0.4 * Math.sqrt(index);
  const dLat = (radiusKm / 111) * Math.sin(angle);
  const dLng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
  return [lat + dLat, lng + dLng];
}

/** Coordinates in this file are [lat, lng] (this component's own convention,
    matching CITY_COORDINATES) and get flipped to MapLibre's [lng, lat] order
    only at the points where they cross into the MapLibre API. */
export function MerchantsMap({
  merchants,
  defaultCenter = [10, 0],
  defaultZoom = 2,
  lockToDefaultView = false,
}: {
  merchants: MapMerchant[];
  defaultCenter?: [number, number];
  defaultZoom?: number;
  /** When true, stay focused on defaultCenter/defaultZoom instead of auto-fitting to markers — used when we already know the member's market (e.g. Accra for Ghana, London for the UK). */
  lockToDefaultView?: boolean;
}) {
  const mapRef = useRef<MapRef>(null);
  const [openMerchantId, setOpenMerchantId] = useState<string | null>(null);

  // Every merchant plots as its own store pin — one with a resolved location
  // goes exactly there; everyone else is spread around their city's center
  // instead of bundling into one shared marker (see jitterAround). A
  // merchant whose city isn't even in CITY_COORDINATES has nowhere to go and
  // is dropped from the map.
  const located = useMemo(() => {
    const withCoords: (MapMerchant & { coords: [number, number] })[] = [];
    const byCity = new Map<string, MapMerchant[]>();

    for (const merchant of merchants) {
      if (merchant.coords) {
        withCoords.push(merchant as MapMerchant & { coords: [number, number] });
        continue;
      }
      const key = merchant.city;
      if (!byCity.has(key)) byCity.set(key, []);
      byCity.get(key)!.push(merchant);
    }

    const jittered: (MapMerchant & { coords: [number, number] })[] = [];
    for (const [city, list] of byCity) {
      const center = CITY_COORDINATES[city];
      if (!center) continue;
      [...list]
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach((merchant, index) => {
          jittered.push({ ...merchant, coords: jitterAround(center, index) });
        });
    }

    return [...withCoords, ...jittered];
  }, [merchants]);

  useEffect(() => {
    if (lockToDefaultView) return;
    const map = mapRef.current;
    if (!map || located.length === 0) return;

    if (located.length === 1) {
      const [lat, lng] = located[0].coords;
      map.easeTo({ center: [lng, lat], zoom: 11 });
    } else {
      const lngs = located.map((m) => m.coords[1]);
      const lats = located.map((m) => m.coords[0]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 48, maxZoom: 12 },
      );
    }
  }, [located, lockToDefaultView]);

  const openMerchant = openMerchantId ? located.find((m) => m.id === openMerchantId) : undefined;
  const [defaultLat, defaultLng] = defaultCenter;

  return (
    <div className="h-full w-full overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <MapGL
        ref={mapRef}
        mapStyle={OSM_STYLE}
        initialViewState={{ latitude: defaultLat, longitude: defaultLng, zoom: defaultZoom }}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <AttributionControl compact position="bottom-right" />
        <NavigationControl position="top-right" showCompass={false} />

        {located.map((merchant) => (
          <Marker
            key={merchant.id}
            latitude={merchant.coords[0]}
            longitude={merchant.coords[1]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setOpenMerchantId(merchant.id);
            }}
          >
            <MerchantPin />
          </Marker>
        ))}

        {openMerchant && (
          <Popup
            latitude={openMerchant.coords[0]}
            longitude={openMerchant.coords[1]}
            anchor="bottom"
            offset={16}
            closeOnClick={false}
            onClose={() => setOpenMerchantId(null)}
          >
            <div className="min-w-40 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {openMerchant.name}
              </div>
              <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                {openMerchant.category}
                {openMerchant.discountPercent !== undefined && (
                  <span className="font-medium text-success">{openMerchant.discountPercent}% off</span>
                )}
              </div>
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
