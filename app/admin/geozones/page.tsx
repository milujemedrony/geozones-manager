import { GeozonesManager } from '@/components/geozones-manager';

export default function AdminGeozonesPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Geozone Manager</h1>
          <p className="text-slate-300">Manage drone restricted zones for Slovakia</p>
        </div>
        <GeozonesManager />
      </div>
    </div>
  );
}
