import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Milujemedrony Geozones</h1>
        <p className="text-xl text-slate-300 mb-8">Manage drone restricted zones for Slovakia</p>
        <Link href="/admin/geozones">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            Go to Admin Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
