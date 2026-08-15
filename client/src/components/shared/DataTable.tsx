import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  hiddenOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export default function DataTable<T>({ columns, data, onRowClick, emptyMessage = 'No data found', emptyIcon }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 md:p-12 text-center flex flex-col items-center bg-white border border-slate-200 rounded-2xl shadow-sm animate-dashPopIn">
        {emptyIcon}
        <p className="text-slate-500 mt-2 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-[dashPopIn_0.6s_ease-out_both]">
      <div className="overflow-x-auto">
        <table className="dash-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, i) => (
                <th key={i} className={`dash-table-cell p-4 text-xs font-bold text-slate-600 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors group opacity-0 animate-dashFadeIn ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'}`}
                style={{ animationDelay: `${rowIdx * 0.05}s` }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`dash-table-cell p-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}>
                    {col.render ? col.render(row) : (col.accessor ? String(row[col.accessor]) : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
