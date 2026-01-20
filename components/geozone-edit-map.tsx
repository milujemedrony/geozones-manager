"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"

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

interface GeozoneEditMapProps {
  geojsonData: GeoJSONData | null
  onDataChange: (data: GeoJSONData) => void
  selectedFeatureIndex: number | null
  onFeatureSelect: (index: number | null) => void
}

const SLOVAKIA_CENTER: [number, number] = [48.669, 19.699]
const DEFAULT_ZOOM = 7

export default function GeozoneEditMap({
  geojsonData,
  onDataChange,
  selectedFeatureIndex,
  onFeatureSelect,
}: GeozoneEditMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const featureLayersRef = useRef<Map<L.Layer, number>>(new Map())

  const syncDataFromLayers = useCallback(() => {
    if (!drawnItemsRef.current) return

    const features: GeoJSONFeature[] = []
    drawnItemsRef.current.eachLayer((layer) => {
      const geoJSON = (layer as L.Polygon | L.Polyline | L.Marker | L.Circle).toGeoJSON()
      const featureIndex = featureLayersRef.current.get(layer)

      if (featureIndex !== undefined && geojsonData?.features?.[featureIndex]) {
        geoJSON.properties = geojsonData.features[featureIndex].properties || {}
      }

      features.push(geoJSON as GeoJSONFeature)
    })

    const newData: GeoJSONData = {
      type: "FeatureCollection",
      features,
    }
    onDataChange(newData)
  }, [geojsonData, onDataChange])

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

      drawnItemsRef.current = new L.FeatureGroup()
      mapInstanceRef.current.addLayer(drawnItemsRef.current)

      const drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.25,
              weight: 2,
            },
          },
          polyline: {
            shapeOptions: {
              color: "#3b82f6",
              weight: 3,
            },
          },
          rectangle: {
            shapeOptions: {
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.25,
              weight: 2,
            },
          },
          circle: {
            shapeOptions: {
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.25,
              weight: 2,
            },
          },
          marker: {
            icon: new L.Icon.Default(),
          },
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
                    //@ts-ignore

          edit: true,
        },
      })
      mapInstanceRef.current.addControl(drawControl)

      mapInstanceRef.current.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
        const layer = (e as L.DrawEvents.Created).layer
        drawnItemsRef.current?.addLayer(layer)
        featureLayersRef.current.set(layer, featureLayersRef.current.size)

        layer.on("click", () => {
          const index = featureLayersRef.current.get(layer)
          if (index !== undefined) {
            onFeatureSelect(index)
          }
        })

        syncDataFromLayers()
      })

      mapInstanceRef.current.on(L.Draw.Event.EDITED, () => {
        syncDataFromLayers()
      })

      mapInstanceRef.current.on(L.Draw.Event.DELETED, () => {
        featureLayersRef.current.clear()
        let index = 0
        drawnItemsRef.current?.eachLayer((layer) => {
          featureLayersRef.current.set(layer, index++)
        })
        onFeatureSelect(null)
        syncDataFromLayers()
      })
    }

    if (drawnItemsRef.current && mapInstanceRef.current) {
      drawnItemsRef.current.clearLayers()
      featureLayersRef.current.clear()

      if (geojsonData?.features) {
        geojsonData.features.forEach((feature, index) => {
          try {
                      //@ts-ignore

            const layer = L.geoJSON(feature as L.GeoJSON.GeoJsonObject, {
              style: () => ({
                color: selectedFeatureIndex === index ? "#f97316" : "#3b82f6",
                weight: selectedFeatureIndex === index ? 3 : 2,
                opacity: 0.8,
                fillColor: selectedFeatureIndex === index ? "#f97316" : "#3b82f6",
                fillOpacity: 0.25,
              }),
              pointToLayer: (_, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 8,
                  fillColor: selectedFeatureIndex === index ? "#f97316" : "#3b82f6",
                  color: selectedFeatureIndex === index ? "#ea580c" : "#1d4ed8",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.6,
                })
              },
            })

            layer.eachLayer((subLayer) => {
              drawnItemsRef.current?.addLayer(subLayer)
              featureLayersRef.current.set(subLayer, index)

              subLayer.on("click", () => {
                onFeatureSelect(index)
              })
            })
          } catch (e) {
            console.error("Failed to add feature:", e)
          }
        })

        const bounds = drawnItemsRef.current.getBounds()
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        drawnItemsRef.current = null
        featureLayersRef.current.clear()
      }
    }
  }, [geojsonData, selectedFeatureIndex, onFeatureSelect, syncDataFromLayers])

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] rounded-xl overflow-hidden border border-orange-500/20"
      style={{ background: "#1a1a2e" }}
    />
  )
}
