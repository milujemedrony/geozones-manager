"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJSON } from "leaflet"

interface GeoJSONFeature {
  type: string
  properties?: Record<string, unknown>
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][]
  }
}

interface GeoJSONData {
  type: string
  features?: GeoJSONFeature[]
}

interface GeozoneMapProps {
  geojsonData: GeoJSONData | null
  geozoneName: string
}

const SLOVAKIA_CENTER: [number, number] = [48.669, 19.699]
const DEFAULT_ZOOM = 7

export default function GeozoneMap({ geojsonData, geozoneName }: GeozoneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: SLOVAKIA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    if (geojsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geojsonLayerRef.current)
      geojsonLayerRef.current = null
    }

    if (geojsonData && mapInstanceRef.current) {
      const geojsonLayer = L.geoJSON(geojsonData as GeoJSON.GeoJsonObject, {
        style: () => ({
          color: "#3b82f6",
          weight: 2,
          opacity: 0.8,
          fillColor: "#3b82f6",
          fillOpacity: 0.25,
        }),
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#1d4ed8",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6,
          })
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const props = feature.properties
            let popupContent = `<div class="p-2 min-w-[200px]">`
            popupContent += `<h3 class="font-bold text-sm mb-2 text-blue-600">${props.name || geozoneName}</h3>`

            const excludeKeys = ["name"]
            Object.entries(props).forEach(([key, value]) => {
              if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
                const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                popupContent += `<p class="text-xs mb-1"><span class="font-medium text-gray-600">${formattedKey}:</span> <span class="text-gray-800">${value}</span></p>`
              }
            })

            popupContent += `</div>`
            layer.bindPopup(popupContent)
          }
        },
      }).addTo(mapInstanceRef.current)

      geojsonLayerRef.current = geojsonLayer

      const bounds = geojsonLayer.getBounds()
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [geojsonData, geozoneName])

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] rounded-xl overflow-hidden border border-blue-500/20"
      style={{ background: "#1a1a2e" }}
    />
  )
}
