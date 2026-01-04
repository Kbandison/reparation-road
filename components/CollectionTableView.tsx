"use client";

import React from 'react';
import Image from 'next/image';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { Eye, FileText } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

interface CollectionTableViewProps {
  data: any[];
  columns: TableColumn[];
  onRecordClick: (record: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const CollectionTableView: React.FC<CollectionTableViewProps> = ({
  data,
  columns,
  onRecordClick,
  loading = false,
  emptyMessage = 'No records found'
}) => {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-green text-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-brand-darkgreen' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((record, index) => (
              <tr
                key={record.id || index}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onRecordClick(record)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(record[column.key], record) : (
                      <span>{record[column.key] || '-'}</span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordClick(record);
                      }}
                      className="text-brand-green hover:text-brand-darkgreen"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                      <BookmarkButton pageId={record.id} size={18} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Thumbnail image renderer for use in table columns
export const ImageThumbnail: React.FC<{ src: string | null; alt: string; size?: number }> = ({
  src,
  alt,
  size = 48
}) => {
  if (!src) {
    return (
      <div
        className="bg-gray-200 rounded flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <FileText className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative rounded overflow-hidden" style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
};
