'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Download, Upload } from 'lucide-react';

interface Geozone {
  id: string;
  name: string;
  version: number;
  filePath: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
}

export function GeozonesManager() {
  const [geozones, setGeozones] = useState<Geozone[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Geozone | null>(null);

  useEffect(() => {
    fetchGeozones();
  }, []);

  const fetchGeozones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/geozones');
      const result = await response.json();
      setGeozones(result.data || []);
    } catch (error) {
      console.error('Failed to fetch geozones:', error);
      toast.error('Failed to fetch geozones');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.geojson')) {
        toast.error('Only .geojson files are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !name.trim()) {
      toast.error('Please select a file and enter a name');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/geozones/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
        return;
      }

      toast.success('Geozone uploaded successfully');
      setFile(null);
      setName('');
      setDescription('');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchGeozones();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload geozone');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (geozone: Geozone) => {
    try {
      const response = await fetch(
        `/api/geozones/${geozone.name}/${geozone.version}/delete`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Delete failed');
        return;
      }

      toast.success('Geozone deleted successfully');
      setDeleteConfirm(null);
      await fetchGeozones();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete geozone');
    }
  };

  const handleDownload = (geozone: Geozone) => {
    const url = `/api/geozones/download/${geozone.name}/${geozone.version}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${geozone.name}-v${geozone.version}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Upload New Geozone</CardTitle>
          <CardDescription>Upload a .geojson file with restricted drone zones</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Geozone Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Bratislava_NoFly_Zone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="Add a description for this geozone"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  GeoJSON File
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".geojson"
                    onChange={handleFileChange}
                    className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
                    disabled={uploading}
                  />
                  {file && <span className="text-sm text-green-400">{file.name}</span>}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={uploading || !file || !name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Geozone'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Geozones List</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${geozones.length} geozone${geozones.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading geozones...</div>
          ) : geozones.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No geozones uploaded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Version</TableHead>
                    <TableHead className="text-slate-300">Size</TableHead>
                    <TableHead className="text-slate-300">Uploaded</TableHead>
                    <TableHead className="text-slate-300">Description</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geozones.map((geozone) => (
                    <TableRow key={geozone.id} className="border-slate-700 hover:bg-slate-700">
                      <TableCell className="text-white font-medium">{geozone.name}</TableCell>
                      <TableCell className="text-slate-300">v{geozone.version}</TableCell>
                      <TableCell className="text-slate-300">
                        {formatFileSize(geozone.fileSize)}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {formatDate(geozone.uploadedAt)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm max-w-xs truncate">
                        {geozone.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
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
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogTitle className="text-white">Delete Geozone</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Are you sure you want to delete {deleteConfirm?.name} v{deleteConfirm?.version}? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
