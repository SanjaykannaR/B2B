import { Download, FileText } from 'lucide-react';
import DataTable from '../shared/DataTable';
import StatusBadge from '../shared/StatusBadge';

const mockInvoices = [
  { id: 'INV-2026-0045', date: 'Jul 28, 2026', amount: '$4,200.00', status: 'Pending' },
  { id: 'INV-2026-0044', date: 'Jul 24, 2026', amount: '$1,250.00', status: 'Paid' },
  { id: 'INV-2026-0043', date: 'Jul 15, 2026', amount: '$8,900.00', status: 'Overdue' },
  { id: 'INV-2026-0042', date: 'Jul 01, 2026', amount: '$3,450.00', status: 'Paid' }
];

export default function InvoiceList() {
  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-[dashPopIn_0.4s_ease-out_both]">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Billing & Invoices</h2>
          <p className="text-slate-600">Manage your payments and download past invoices.</p>
        </div>
        <div className="bg-white shadow-sm border border-slate-200 px-6 py-3 rounded-xl flex items-center space-x-4">
          <div>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Unpaid Balance</p>
            <p className="kpi-value text-accent">$13,100.00</p>
          </div>
        </div>
      </div>

      <DataTable 
        columns={[
          {
            header: 'Invoice ID',
            render: (invoice) => (
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-accent" />
                <span className="font-mono font-bold text-slate-900">{invoice.id}</span>
              </div>
            )
          },
          {
            header: 'Date',
            render: (invoice) => <span className="text-sm text-slate-600 font-medium">{invoice.date}</span>
          },
          {
            header: 'Amount',
            align: 'right',
            render: (invoice) => <span className="tabular-nums font-bold text-slate-900">{invoice.amount}</span>
          },
          {
            header: 'Status',
            align: 'center',
            render: (invoice) => <StatusBadge status={invoice.status} />
          },
          {
            header: 'Action',
            align: 'right',
            render: (invoice) => (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const content = `INVOICE RECEIPT\n------------------\nInvoice ID: ${invoice.id}\nDate: ${invoice.date}\nStatus: ${invoice.status}\n\nTOTAL AMOUNT: ${invoice.amount}\n`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${invoice.id}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-accent transition-colors border border-slate-200"
                title="Download Invoice"
              >
                <Download className="w-4 h-4" />
              </button>
            )
          }
        ]}
        data={mockInvoices}
        emptyMessage="No invoices found."
      />
    </div>
  );
}
