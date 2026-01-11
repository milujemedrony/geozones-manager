"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Trash2,
  Download,
  Upload,
  MapPin,
  Eye,
  X,
  FileJson,
  Calendar,
  HardDrive,
  Edit3,
  Save,
  RotateCcw,
  Code,
  Map,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import dynamic from "next/dynamic"

const GeozoneMap = dynamic(() => import("@/components/geozone-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-slate-800/50 border border-blue-500/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200/60">
          Prebieha načítavanie mapy...
        </p>
      </div>
    </div>
  ),
})

const GeozoneEditMap = dynamic(() => import("@/components/geozone-edit-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-slate-800/50 border border-blue-500/20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200/60">
          Prebieha načítavanie mapy na úpravy...
        </p>
      </div>
    </div>
  ),
})

interface Geozone {
  id: string
  name: string
  version: number
  filePath: string
  fileSize: number
  description?: string
  uploadedAt: string
}

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

export function GeozonesManager() {
  const [geozones, setGeozones] = useState<Geozone[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<Geozone | null>(null)
  const [previewGeozone, setPreviewGeozone] = useState<Geozone | null>(null)
  const [previewData, setPreviewData] = useState<GeoJSONData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const [editingGeozone, setEditingGeozone] = useState<Geozone | null>(null)
  const [editData, setEditData] = useState<GeoJSONData | null>(null)
  const [originalEditData, setOriginalEditData] = useState<GeoJSONData | null>(null)
  const [editJsonText, setEditJsonText] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [discardConfirm, setDiscardConfirm] = useState(false)
  const [editMode, setEditMode] = useState<"map" | "json" | "properties">("map")
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null)
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchGeozones()
  }, [])

  useEffect(() => {
    if (editData && originalEditData) {
      const hasChanges = JSON.stringify(editData) !== JSON.stringify(originalEditData)
      setHasUnsavedChanges(hasChanges)
    }
  }, [editData, originalEditData])

  const fetchGeozones = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/geozones")
      const result = await response.json()
      setGeozones(result.data || [])
    } catch (error) {
      console.error("Failed to fetch geozones:", error)
      toast.error("Failed to fetch geozones")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".geojson")) {
        toast.error("Iba súbory .geojson sú povolené")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !name.trim()) {
      toast.error("Prosím vyberte súbor a zadajte názov geozóny")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name)
      if (description) {
        formData.append("description", description)
      }

      const response = await fetch("/api/geozones/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Nahrávanie zlyhalo")
        return
      }

      toast.success("Geozóna bola úspešne nahraná")
      setFile(null)
      setName("")
      setDescription("")
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""
      await fetchGeozones()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Nahrávanie zlyhalo")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (geozone: Geozone) => {
    try {
      const response = await fetch(`/api/geozones/${geozone.name}/${geozone.version}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Zmazanie zlyhalo")
        return
      }

      toast.success("Geozóna bola úspešne zmazaná")
      setDeleteConfirm(null)
      await fetchGeozones()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Zmazanie zlyhalo")
    }
  }

  const handleDownload = (geozone: Geozone) => {
    const url = `/api/geozones/download/${geozone.name}/${geozone.version}`
    const a = document.createElement("a")
    a.href = url
    a.download = `${geozone.name}-v${geozone.version}.geojson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePreview = async (geozone: Geozone) => {
    try {
      setLoadingPreview(true)
      setPreviewGeozone(geozone)
      const response = await fetch(`/api/geozones/download/${geozone.name}/${geozone.version}`)
      if (!response.ok) {
        throw new Error("Nepodarilo sa načítať dáta geozóny")
      }
      const data = await response.json()
      setPreviewData(data)
    } catch (error) {
      console.error("Preview error:", error)
      toast.error("Nepodarilo sa načítať náhľad geozóny")
      setPreviewGeozone(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  const closePreview = () => {
    setPreviewGeozone(null)
    setPreviewData(null)
  }

  const handleEdit = async (geozone: Geozone) => {
    try {
      setLoadingPreview(true)
      const response = await fetch(`/api/geozones/download/${geozone.name}/${geozone.version}`)
      if (!response.ok) {
        throw new Error("Nepodarilo sa načítať dáta geozóny")
      }
      const data = await response.json()
      setEditingGeozone(geozone)
      setEditData(data)
      setOriginalEditData(JSON.parse(JSON.stringify(data)))
      setEditJsonText(JSON.stringify(data, null, 2))
      setJsonError(null)
      setHasUnsavedChanges(false)
      setEditMode("map")
      setSelectedFeatureIndex(null)
      setPreviewGeozone(null)
      setPreviewData(null)
    } catch (error) {
      console.error("Edit error:", error)
      toast.error("Nepodarilo sa načítať geozónu na úpravu")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleJsonTextChange = (text: string) => {
    setEditJsonText(text)
    try {
      const parsed = JSON.parse(text)
      setEditData(parsed)
      setJsonError(null)
    } catch (e) {
      setJsonError((e as Error).message)
    }
  }

  const handleMapEdit = (newData: GeoJSONData) => {
    setEditData(newData)
    setEditJsonText(JSON.stringify(newData, null, 2))
    setJsonError(null)
  }

  const handlePropertyChange = (featureIndex: number, key: string, value: string) => {
    if (!editData?.features) return

    const newData = JSON.parse(JSON.stringify(editData)) as GeoJSONData
    if (newData.features && newData.features[featureIndex]) {
      if (!newData.features[featureIndex].properties) {
        newData.features[featureIndex].properties = {}
      }
      newData.features[featureIndex].properties![key] = value
    }
    setEditData(newData)
    setEditJsonText(JSON.stringify(newData, null, 2))
  }

  const handleAddProperty = (featureIndex: number) => {
    if (!editData?.features) return

    const newData = JSON.parse(JSON.stringify(editData)) as GeoJSONData
    if (newData.features && newData.features[featureIndex]) {
      if (!newData.features[featureIndex].properties) {
        newData.features[featureIndex].properties = {}
      }
      const newKey = `property_${Object.keys(newData.features[featureIndex].properties || {}).length + 1}`
      newData.features[featureIndex].properties![newKey] = ""
    }
    setEditData(newData)
    setEditJsonText(JSON.stringify(newData, null, 2))
  }

  const handleDeleteProperty = (featureIndex: number, key: string) => {
    if (!editData?.features) return

    const newData = JSON.parse(JSON.stringify(editData)) as GeoJSONData
    if (newData.features && newData.features[featureIndex]?.properties) {
      delete newData.features[featureIndex].properties![key]
    }
    setEditData(newData)
    setEditJsonText(JSON.stringify(newData, null, 2))
  }

  const handleSaveAsNewVersion = async () => {
    if (!editingGeozone || !editData) return

    try {
      setSavingEdit(true)

      const blob = new Blob([JSON.stringify(editData)], { type: "application/json" })
      const file = new File([blob], `${editingGeozone.name}.geojson`, { type: "application/json" })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", editingGeozone.name)
      formData.append("description", editingGeozone.description || "")

      const response = await fetch("/api/geozones/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Save failed")
        return
      }

      toast.success("Uložené ako nová verzia úspešne")
      closeEdit()
      await fetchGeozones()
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Nepodarilo sa uložiť geozónu")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDiscardChanges = () => {
    if (hasUnsavedChanges) {
      setDiscardConfirm(true)
    } else {
      closeEdit()
    }
  }

  const closeEdit = () => {
    setEditingGeozone(null)
    setEditData(null)
    setOriginalEditData(null)
    setEditJsonText("")
    setJsonError(null)
    setHasUnsavedChanges(false)
    setSelectedFeatureIndex(null)
    setExpandedFeatures(new Set())
  }

  const confirmDiscard = () => {
    setDiscardConfirm(false)
    closeEdit()
  }

  const toggleFeatureExpanded = (index: number) => {
    const newExpanded = new Set(expandedFeatures)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedFeatures(newExpanded)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/20 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-blue-500/5">
        <CardHeader className="border-b border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">Nahrať novú geozónu</CardTitle>
              <CardDescription className="text-blue-200/50">
                Nahrajme súbor .geojson s obmedzenými zónami pre drony
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">Názov geozóny</label>
                <Input
                  type="text"
                  placeholder="napr. Bratislava_NoFly_Zone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-blue-500/20 text-white placeholder-slate-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100">GeoJSON</label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".geojson"
                    onChange={handleFileChange}
                    className="bg-slate-800/50 border-blue-500/20 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-blue-500 transition-all"
                    disabled={uploading}
                  />
                </div>
                {file && (
                  <p className="text-sm text-green-400 flex items-center gap-1">
                    <FileJson className="w-4 h-4" />
                    {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Popis (Voliteľné)</label>
              <Textarea
                placeholder="Pridajte popis pre túto geozónu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800/50 border-blue-500/20 text-white placeholder-slate-500 focus:border-blue-400 focus:ring-blue-400/20 min-h-[80px] transition-all"
                disabled={uploading}
              />
            </div>

            <Button
              type="submit"
              disabled={uploading || !file || !name.trim()}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Prebieha nahrávanie...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Nahrať Geozónu do apky
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {editingGeozone && editData && (
        <Card className="border-orange-500/20 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-orange-500/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="border-b border-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
                  <Edit3 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    Editing: {editingGeozone.name}
                    {hasUnsavedChanges && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        Unsaved
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-blue-200/50">
                    v{editingGeozone.version} - Upraviť zóny na mape, v JSON alebo vlastnosti
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDiscardChanges}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Tabs value={editMode} onValueChange={(v) => setEditMode(v as "map" | "json" | "properties")}>
              <TabsList className="bg-slate-800/50 border border-blue-500/20">
                <TabsTrigger
                  value="map"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
                >
                  <Map className="w-4 h-4" />
                  Editor mapy
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
                >
                  <Code className="w-4 h-4" />
                  Editor JSON
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Vlastnosti
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <GeozoneEditMap
                  geojsonData={editData}
                  onDataChange={handleMapEdit}
                  selectedFeatureIndex={selectedFeatureIndex}
                  onFeatureSelect={setSelectedFeatureIndex}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Kliknite na zóny pre výber. Potiahnite vrcholy pre preformovanie. Použite panel nástrojov na kreslenie nových tvarov alebo vymazanie vybraných.
                </p>
              </TabsContent>

              <TabsContent value="json" className="mt-4 space-y-3">
                <div className="relative">
                  <Textarea
                    value={editJsonText}
                    onChange={(e) => handleJsonTextChange(e.target.value)}
                    className="font-mono text-sm bg-slate-950 border-blue-500/20 text-green-300 min-h-[500px] focus:border-blue-400"
                    spellCheck={false}
                  />
                  {jsonError && (
                    <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                      JSON Error: {jsonError}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="properties" className="mt-4">
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {editData.features?.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedFeatureIndex === index
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-slate-800/30 border-blue-500/10 hover:border-blue-500/20"
                      }`}
                    >
                      <button
                        onClick={() => {
                          toggleFeatureExpanded(index)
                          setSelectedFeatureIndex(index)
                        }}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {(feature.properties?.name as string) || `Prvok ${index + 1}`}
                            </h4>
                            <p className="text-xs text-slate-400">{feature.geometry.type}</p>
                          </div>
                        </div>
                        {expandedFeatures.has(index) ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {expandedFeatures.has(index) && (
                        <div className="mt-4 space-y-3 pl-11">
                          {Object.entries(feature.properties || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <Input
                                value={key}
                                disabled
                                className="w-32 bg-slate-900/50 border-slate-600 text-slate-300 text-sm"
                              />
                              <Input
                                value={String(value || "")}
                                onChange={(e) => handlePropertyChange(index, key, e.target.value)}
                                className="flex-1 bg-slate-900/50 border-blue-500/20 text-white text-sm focus:border-blue-400"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteProperty(index, key)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddProperty(index)}
                            className="border-dashed border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                          >
                            + Pridať prvok
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!editData.features || editData.features.length === 0) && (
                    <div className="text-center py-8 text-slate-400">Žiadne prvky v tejto geozóne</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-4 border-t border-blue-500/10">
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {hasUnsavedChanges ? "Discard Changes" : "Close"}
              </Button>
              <Button
                onClick={handleSaveAsNewVersion}
                disabled={!hasUnsavedChanges || savingEdit || !!jsonError}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Ukladanie...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Uložiť ako novú verziu
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {previewGeozone && !editingGeozone && (
        <Card className="border-blue-500/20 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-blue-500/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="border-b border-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Náhľad: {previewGeozone.name}</CardTitle>
                  <CardDescription className="text-blue-200/50">
                    {previewGeozone.description || "Žiadny popis"} - v{previewGeozone.version}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreview}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingPreview ? (
              <div className="w-full h-[500px] rounded-xl bg-slate-800/50 border border-blue-500/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-200/60">Načítavanie údajov o geozóne...</p>
                </div>
              </div>
            ) : (
              <GeozoneMap geojsonData={previewData} geozoneName={previewGeozone.name} />
            )}

            {previewData && previewData.features && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-100 mb-2">Informácie o zóne</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Celkový počet prvkov</p>
                    <p className="text-white font-medium">{previewData.features.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Veľkosť súboru</p>
                    <p className="text-white font-medium">{formatFileSize(previewGeozone.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Verzia</p>
                    <p className="text-white font-medium">v{previewGeozone.version}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Nahrané</p>
                    <p className="text-white font-medium">{formatDate(previewGeozone.uploadedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-500/20 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-blue-500/5">
        <CardHeader className="border-b border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <FileJson className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">Zoznam geozón</CardTitle>
              <CardDescription className="text-blue-200/50">
                {loading ? "Načítavanie..." : `${geozones.length} geozón${geozones.length !== 1 ? "y" : ""} nahraných`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-blue-200/60">Načítavanie geozón...</p>
            </div>
          ) : geozones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-blue-500/20 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-2">Žiadne geozóny ešte neboli nahrané</p>
              <p className="text-sm text-slate-500">Nahrajte svoju prvú geozónu, aby ste mohli začať</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {geozones.map((geozone) => (
                <div
                  key={geozone.id}
                  className="group p-4 rounded-xl bg-slate-800/30 border border-blue-500/10 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{geozone.name}</h3>
                        <p className="text-sm text-slate-400 truncate max-w-md">
                          {geozone.description || "Žiadny popis"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-300">
                            v{geozone.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(geozone.fileSize)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(geozone.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(geozone)}
                        className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Náhľad
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(geozone)}
                        className="border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 hover:text-orange-100"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Upraviť
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(geozone)}
                        className="border-slate-600 hover:bg-slate-700 text-slate-300"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirm(geozone)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-900 border-red-500/30">
          <AlertDialogTitle className="text-white">Odstrániť geozónu</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Ste si istí, že chcete odstrániť <span className="font-semibold text-white">{deleteConfirm?.name}</span> v
            {deleteConfirm?.version}? Túto akciu nie je možné vrátiť späť.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Odstrániť
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={discardConfirm} onOpenChange={setDiscardConfirm}>
        <AlertDialogContent className="bg-slate-900 border-orange-500/30">
          <AlertDialogTitle className="text-white">Zahodiť zmeny?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Máte neuložené zmeny. Ste si istí, že ich chcete zahodiť? Túto akciu nie je možné vrátiť späť.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
              Pokračovať v úpravách
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} className="bg-orange-600 hover:bg-orange-500 text-white">
              Zahodiť zmeny
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
