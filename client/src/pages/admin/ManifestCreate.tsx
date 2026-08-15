import AdminNavbar from '../../components/admin/AdminNavbar';
import OrderForm from '../../components/client/OrderForm'; // Reusing the robust manifest creator

export default function ManifestCreate() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <AdminNavbar active="create-manifest" />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Manifest</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Admin override: manually route and schedule a new shipment.</p>
        </header>

        {/* We reuse the robust OrderForm, which scales perfectly on mobile and desktop */}
        <div className="w-full">
          <OrderForm />
        </div>
      </main>
    </div>
  );
}
