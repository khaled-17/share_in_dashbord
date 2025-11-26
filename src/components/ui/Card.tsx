import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  footer,
  hover = false,
}) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
