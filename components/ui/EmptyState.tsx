import React from 'react';
import { Search, FileX, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  type?: 'no-results' | 'no-data' | 'error';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-results',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = ""
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Search className="w-16 h-16 text-gray-400" />,
          title: title || 'No Results Found',
          description: description || 'Try adjusting your search or filter criteria to find what you\'re looking for.',
          actionLabel: actionLabel || 'Clear Filters'
        };
      case 'no-data':
        return {
          icon: <FileX className="w-16 h-16 text-gray-400" />,
          title: title || 'No Records Available',
          description: description || 'This collection is currently being digitized and will be available soon.',
          actionLabel: actionLabel || null
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: title || 'Something Went Wrong',
          description: description || 'There was an error loading the records. Please try again later.',
          actionLabel: actionLabel || 'Try Again'
        };
      default:
        return {
          icon: <Search className="w-16 h-16 text-gray-400" />,
          title: title || 'No Results',
          description: description || 'No records found.',
          actionLabel: actionLabel || null
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          {icon || content.icon}
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          {title || content.title}
        </h3>
        <p className="text-gray-600 mb-6">
          {description || content.description}
        </p>
        {(actionLabel || content.actionLabel) && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="mt-4"
          >
            {actionLabel || content.actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
