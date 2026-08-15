import ClientNavbar from '../../components/client/ClientNavbar';
import OrderForm from '../../components/client/OrderForm';

export default function PlaceOrder() {
  return (
    <div className="min-h-screen w-full bg-[#f5f6f8] text-slate-900 font-sans flex flex-col relative">

      {/* ── Global Navbar ── */}
      <ClientNavbar active="place-order" />

      {/* ── Main Content ── */}
      <div className="flex-1 w-full flex flex-col items-center justify-start p-5 md:p-4">
        <div className="w-full max-w-5xl mx-auto">
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
