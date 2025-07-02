// src/components/ui/MobileActionMenu.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Loader2 } from 'lucide-react';

export interface MobileAction {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  show?: boolean | string;
  variant?: 'default' | 'destructive' | 'primary';
  animationDelay?: string;
}

export interface MobileActionMenuProps {
  // Core functionality
  actions: MobileAction[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  
  // Positioning & behavior
  isMaximized?: boolean;
  triggerPosition?: 'relative' | 'fixed';
  
  // Theming
  theme?: 'mint' | 'sand' | 'auto';
  
  // Customization
  triggerIcon?: React.ComponentType<any>;
  triggerLabel?: string;
  className?: string;
}

const THEME_COLORS = {
  mint: {
    trigger: '#B8D4C7',
    triggerHover: '#A5C6B8',
    triggerText: '#4A5D54',
    action: '#B8D4C7',
    actionText: '#4A5D54',
    actionDestructive: '#8B3A3A'
  },
  sand: {
    trigger: '#D2B48C',
    triggerHover: '#C19A6B', 
    triggerText: '#8B4513',
    action: '#D2B48C',
    actionText: '#8B4513',
    actionDestructive: '#8B4513'
  }
};

export const MobileActionMenu: React.FC<MobileActionMenuProps> = ({
  actions,
  isOpen,
  onToggle,
  onClose,
  isMaximized = false,
  triggerPosition = 'relative',
  theme = 'auto',
  triggerIcon: TriggerIcon = Settings,
  triggerLabel = 'Tools',
  className = ''
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Auto-theme based on maximized state
  const activeTheme = theme === 'auto' ? (isMaximized ? 'sand' : 'mint') : theme;
  const colors = THEME_COLORS[activeTheme];
  
  // Auto-hide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleActionClick = (action: MobileAction) => {
    if (!action.disabled && !action.loading) {
      action.onClick();
      onClose();
    }
  };

  const handleTouchEvent = (e: React.TouchEvent | React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  const getActionButtonStyle = (action: MobileAction) => {
    let backgroundColor = colors.action;
    let textColor = colors.actionText;
    
    if (action.variant === 'destructive') {
      textColor = colors.actionDestructive;
    } else if (action.variant === 'primary') {
      backgroundColor = activeTheme === 'sand' ? '#D2B48C' : '#10B981';
      textColor = activeTheme === 'sand' ? '#8B4513' : '#FFFFFF';
    }
    
    if (action.loading || action.disabled) {
      backgroundColor = '#F3F4F6';
      textColor = '#9CA3AF';
    }

    return {
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      backgroundColor,
      color: textColor,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto' as const,
      touchAction: 'manipulation' as const,
      cursor: 'pointer',
      opacity: (action.loading || action.disabled) ? 0.5 : 1
    };
  };

  const TriggerButton = () => (
    <button
      onClick={onToggle}
      className={`px-2.5 py-2 rounded-md transition-all duration-300 shadow-md flex items-center justify-center hover:scale-105 ${className}`}
      style={{
        backgroundColor: colors.trigger,
        color: colors.triggerText
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.triggerHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.trigger;
      }}
      title={triggerLabel}
    >
      <TriggerIcon className="w-3 h-3" />
    </button>
  );

  const ActionButtons = () => {
    const visibleActions = actions.filter(action => action.show !== false);
    
    return (
      <div className="flex flex-col gap-2" style={{ gap: '1.5vh' }}>
        {visibleActions.map((action) => (
          <button
            key={action.id}
            onTouchStart={(e) => handleTouchEvent(e, () => handleActionClick(action))}
            onMouseDown={(e) => handleTouchEvent(e, () => handleActionClick(action))}
            style={getActionButtonStyle(action)}
            title={action.label}
            disabled={action.disabled || action.loading}
          >
            {action.loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <action.icon size={14} />
            )}
          </button>
        ))}
      </div>
    );
  };

  // Maximized mode - fixed positioning with portal
  if (isMaximized && triggerPosition === 'fixed') {
    return (
      <>
        {/* Trigger button */}
        <div className="lg:hidden relative z-[90]" ref={menuRef}>
          <TriggerButton />
        </div>
        
        {/* Action buttons via portal */}
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div
            style={{
              position: 'fixed',
              top: '8vh',
              right: '4vw',
              transform: 'translateZ(0)',
              zIndex: 99999999,
              pointerEvents: 'auto',
              willChange: 'transform'
            }}
          >
            <ActionButtons />
          </div>,
          document.body
        )}
      </>
    );
  }

  // Standard mode - relative positioning
  return (
    <div className="lg:hidden relative z-[60]" ref={menuRef}>
      <TriggerButton />
      
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 flex flex-col gap-2"
          style={{ 
            padding: '8px', 
            marginRight: '-12px' 
          }}
        >
          {actions.filter(action => action.show !== false).map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || action.loading}
              className="px-3 py-2 rounded-full transition-all duration-200 transform animate-[slideDown_0.2s_ease-out] disabled:opacity-50"
              style={{
                animationDelay: action.animationDelay || `${index * 50}ms`,
                backgroundColor: action.loading || action.disabled ? '#F3F4F6' : colors.action,
                color: action.loading || action.disabled ? '#9CA3AF' : 
                       action.variant === 'destructive' ? colors.actionDestructive : colors.actionText
              }}
              title={action.label}
            >
              {action.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <action.icon className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};