import { useState, useEffect, useCallback, useMemo } from 'react';
import { Truck, Search, Activity, Wrench, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/admin/AdminNavbar';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import { listVehicles, getVehicleStats, Vehicle, VehicleStats } from '../../services/vehicleApi';
import { getErrorMessage } from '../../services/errorMessage';

const VehicleStatusBadge = ({ status }: { status: string }) => {
  if (status === 'Available') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1.5" /> Available</span>;
  if (status === 'In-Transit') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center w-max"><Activity className="w-3 h-3 mr-1.5" /> In-Transit</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center w-max"><Wrench className="w-3 h-3 mr-1.5" /> Maintenance</span>;
};

export default function FleetMonitor() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehiclesRes, statsRes] = await Promise.all([
        listVehicles({ limit: 100 }),
        getVehicleStats(),
      ]);
      setVehicles(vehiclesRes.items);
      setStats(statsRes);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load fleet data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.make.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <AdminNavbar active="fleet" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Fleet Monitor</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage vehicles, track statuses, and assign maintenance.</p>
        </header>

        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Total Fleet" value={stats?.total || 0} icon={Truck} colorTheme="blue" />
          <StatCard title="Available" value={stats?.available || 0} icon={CheckCircle2} colorTheme="emerald" />
          <StatCard title="In-Transit" value={stats?.inTransit || 0} icon={Activity} colorTheme="orange" />
          <StatCard title="Maintenance" value={stats?.maintenance || 0} icon={Wrench} colorTheme="red" />
        </div>

        {/* ── Fleet List ── */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-500" /> Active Roster
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search REG or Make..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full h-10 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-full h-10 px-4 pr-10 appearance-none text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:0.7rem]"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <DataTable 
            columns={[
              {
                header: 'Registration',
                render: (v: Vehicle) => <span className="font-bold text-slate-900 font-mono tracking-wider">{v.registrationNumber}</span>
              },
              {
                header: 'Vehicle',
                render: (v: Vehicle) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm">{v.make} {v.model}</span>
                    <span className="text-xs text-slate-500">{v.year} Model</span>
                  </div>
                )
              },
              {
                header: 'Capacity',
                render: (v: Vehicle) => <span className="font-medium text-slate-600 text-sm">{v.maxWeightKg} kg / {v.maxVolumeCubicMeters} m³</span>
              },
              {
                header: 'Status',
                render: (v: Vehicle) => <VehicleStatusBadge status={v.status} />
              },
              {
                header: 'Driver',
                render: (v: Vehicle) => <span className="font-medium text-slate-600 text-sm">{v.currentDriver ? v.currentDriver.firstName : '—'}</span>
              }
            ]}
            data={filteredVehicles}
            emptyMessage="No vehicles match your criteria."
            emptyIcon={<Truck className="w-10 h-10 text-slate-300 mx-auto" />}
          />
        </div>
      </main>
    </div>
  );
}
