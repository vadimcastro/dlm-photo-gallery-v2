// src/components/ui/DesktopActionMenu.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export interface DesktopAction {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  show?: boolean | string;
  variant?: 'default' | 'destructive' | 'primary' | 'secondary';
  dropdown?: DesktopDropdownItem[];
}

export interface DesktopDropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export interface DesktopActionMenuProps {
  // Core functionality
  actions: DesktopAction[];
  
  // Theming
  theme?: 'mint' | 'sand' | 'auto';
  isMaximized?: boolean;
  
  // Layout
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'tight' | 'normal' | 'loose';
  
  // Dropdown state (controlled externally)
  openDropdownId?: string;
  onDropdownToggle?: (actionId: string) => void;
  onDropdownClose?: () => void;
  
  // Customization
  className?: string;
}

const THEME_COLORS = {
  mint: {
    default: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
    primary: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200',
    secondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200',
    destructive: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    disabled: 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
  },
  sand: {
    default: 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300',
    primary: 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300',
    secondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300',
    destructive: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
    disabled: 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
  }
};

const SIZE_CLASSES = {
  sm: {
    button: 'p-1.5',
    icon: 'w-3 h-3'
  },
  md: {
    button: 'p-2',
    icon: 'w-3.5 h-3.5'
  },
  lg: {
    button: 'p-2.5',
    icon: 'w-4 h-4'
  }
};

const SPACING_CLASSES = {
  tight: 'gap-1',
  normal: 'gap-3', 
  loose: 'gap-5'
};

export const DesktopActionMenu: React.FC<DesktopActionMenuProps> = ({
  actions,
  theme = 'auto',
  isMaximized = false,
  size = 'md',
  spacing = 'normal',
  openDropdownId,
  onDropdownToggle,
  onDropdownClose,
  className = ''
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Auto-theme based on maximized state
  const activeTheme = theme === 'auto' ? (isMaximized ? 'sand' : 'mint') : theme;
  const colors = THEME_COLORS[activeTheme];
  const sizeClasses = SIZE_CLASSES[size];
  const spacingClass = SPACING_CLASSES[spacing];
  
  // Auto-hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onDropdownClose?.();
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, onDropdownClose]);

  const getButtonClasses = (action: DesktopAction) => {
    let baseClasses = `${sizeClasses.button} rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 hover:scale-105 shadow-sm hover:shadow-md`;
    
    if (action.loading || action.disabled) {
      baseClasses += ` ${colors.disabled}`;
    } else {
      baseClasses += ` ${colors[action.variant || 'default']}`;
    }
    
    return baseClasses;
  };

  const handleActionClick = (action: DesktopAction) => {
    if (action.dropdown && onDropdownToggle) {
      onDropdownToggle(action.id);
    } else if (!action.disabled && !action.loading) {
      action.onClick();
    }
  };

  const handleDropdownItemClick = (item: DesktopDropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      onDropdownClose?.();
    }
  };

  // Filter visible actions
  const visibleActions = actions.filter(action => action.show !== false);

  return (
    <div className={`hidden lg:flex items-center ${spacingClass} ${className}`} ref={dropdownRef}>
      {visibleActions.map((action) => (
        <div key={action.id} className="relative">
          <button
            onClick={() => handleActionClick(action)}
            disabled={action.disabled || action.loading}
            className={getButtonClasses(action)}
            title={action.label}
          >
            <div className="relative flex items-center justify-center">
              {action.loading ? (
                <Loader2 className={`${sizeClasses.icon} animate-spin`} />
              ) : (
                <action.icon className={sizeClasses.icon} />
              )}
              {action.dropdown && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  {openDropdownId === action.id ? (
                    <ChevronUp className="w-2 h-2 opacity-60" />
                  ) : (
                    <ChevronDown className="w-2 h-2 opacity-60" />
                  )}
                </div>
              )}
            </div>
          </button>
          
          {/* Dropdown menu */}
          {action.dropdown && openDropdownId === action.id && (
            isMaximized && typeof window !== 'undefined' ? 
              createPortal(
                <div className="fixed top-16 right-4 bg-white/95 backdrop-blur-sm border border-amber-200 rounded-xl shadow-xl max-h-64 overflow-y-auto w-[280px]" style={{ zIndex: 999999999 }}>
                  <div className="p-1">
                    {action.dropdown.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm block disabled:opacity-50 disabled:cursor-not-allowed ${
                          item.selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium whitespace-normal break-words leading-tight">
                          {item.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>,
                document.body
              ) :
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border rounded-xl shadow-xl z-[99999999] max-h-64 overflow-y-auto w-[280px] border-gray-200`}>
                <div className="p-1">
                  {action.dropdown.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleDropdownItemClick(item)}
                      disabled={item.disabled}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm block disabled:opacity-50 disabled:cursor-not-allowed ${
                        item.selected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium whitespace-normal break-words leading-tight">
                        {item.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
          )}
        </div>
      ))}
    </div>
  );
};