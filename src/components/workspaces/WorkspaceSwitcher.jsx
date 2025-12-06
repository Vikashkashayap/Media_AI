import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    refreshWorkspaces,
    isLoading,
    error,
    createWorkspace,
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ vertical: 'bottom', horizontal: 'right' });
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(312);
  const [fixedPosition, setFixedPosition] = useState({ left: 0, top: 0 });
  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);

  // Don't auto-refresh when dropdown opens - workspaces are already loaded from context
  // This prevents unnecessary conversation reloads. Only refresh when:
  // 1. User explicitly clicks Refresh button
  // 2. User actually switches to a different workspace

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function calculateAndAdjustPosition() {
      if (!dropdownRef.current) return;
      
      // Early return if dropdown menu doesn't exist yet - it will be checked in verification
      
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64 = 16rem = 256px
      const idealDropdownHeight = 312; // Header (~48px) + Scrollable area (216px) + Footer (~48px)
      const margin = 8; // Margin spacing
      const viewportPadding = 12; // Extra padding from viewport edges
      
      // Calculate available space with strict boundaries
      const spaceBelow = window.innerHeight - buttonRect.bottom - margin - viewportPadding;
      const spaceAbove = buttonRect.top - margin - viewportPadding;
      const spaceRight = window.innerWidth - buttonRect.right - viewportPadding;
      const spaceLeft = buttonRect.left - viewportPadding;
      
      // Determine vertical position - prefer bottom, switch to top if needed
      let vertical = 'bottom';
      if (spaceBelow < idealDropdownHeight) {
        if (spaceAbove > spaceBelow) {
          vertical = 'top';
        } else if (spaceAbove < idealDropdownHeight) {
          // Neither has enough space, use the one with more space
          vertical = spaceAbove > spaceBelow ? 'top' : 'bottom';
        }
      }
      
      // Determine horizontal position - prefer right, switch to left if needed
      let horizontal = 'right';
      const wouldOverflowRight = buttonRect.right + idealDropdownWidth > window.innerWidth - viewportPadding;
      const wouldOverflowLeft = buttonRect.left - idealDropdownWidth < viewportPadding;
      
      if (wouldOverflowRight && !wouldOverflowLeft) {
        horizontal = 'left';
      } else if (!wouldOverflowRight) {
        horizontal = 'right';
      } else {
        // Both would overflow, check which has more space
        if (spaceLeft > spaceRight) {
          horizontal = 'left';
        } else {
          horizontal = 'right';
        }
      }
      
      // Calculate maximum height that fits in viewport - be very strict
      const availableSpace = vertical === 'top' ? spaceAbove : spaceBelow;
      const maxHeight = Math.min(idealDropdownHeight, Math.max(200, availableSpace));
      setDropdownMaxHeight(maxHeight);
      
      setDropdownPosition({ vertical, horizontal });
      
      // Calculate fixed position for dropdown
      let left = buttonRect.right - idealDropdownWidth;
      if (horizontal === 'left') {
        left = buttonRect.left;
      }
      
      let top = buttonRect.bottom + margin;
      if (vertical === 'top') {
        top = buttonRect.top - (maxHeight + margin);
      }
      
      // Ensure position stays within viewport
      const finalLeft = Math.max(viewportPadding, Math.min(left, window.innerWidth - idealDropdownWidth - viewportPadding));
      const finalTop = Math.max(viewportPadding, Math.min(top, window.innerHeight - maxHeight - viewportPadding));
      
      setFixedPosition({ left: finalLeft, top: finalTop });
      
      // Multiple verification passes to ensure it stays within bounds
      const verifyAndAdjust = () => {
        if (!dropdownMenuRef.current) return;
        
        const dropdownRect = dropdownMenuRef.current.getBoundingClientRect();
        let adjustments = { x: 0, y: 0 };
        let needsAdjustment = false;
        
        // Check and fix vertical boundaries - prioritize based on which is more violated
        const topViolation = dropdownRect.top < viewportPadding ? viewportPadding - dropdownRect.top : 0;
        const bottomViolation = dropdownRect.bottom > window.innerHeight - viewportPadding 
          ? dropdownRect.bottom - (window.innerHeight - viewportPadding) 
          : 0;
        
        if (topViolation > 0 || bottomViolation > 0) {
          // If both are violated, adjust to the one that needs more correction
          // or move to center if both are equally problematic
          if (topViolation > 0 && bottomViolation > 0) {
            // Both violated - move to fit within viewport (prioritize bottom)
            adjustments.y = window.innerHeight - viewportPadding - dropdownRect.bottom;
          } else if (topViolation > 0) {
            adjustments.y = topViolation;
          } else {
            adjustments.y = -bottomViolation;
          }
          needsAdjustment = true;
        }
        
        // Check and fix left boundary
        if (dropdownRect.left < viewportPadding) {
          adjustments.x = viewportPadding - dropdownRect.left;
          needsAdjustment = true;
        }
        
        // Check and fix right boundary
        if (dropdownRect.right > window.innerWidth - viewportPadding) {
          adjustments.x = window.innerWidth - viewportPadding - dropdownRect.right;
          needsAdjustment = true;
        }
        
        // If adjustments needed, apply them
        if (needsAdjustment) {
          dropdownMenuRef.current.style.transform = `translate(${adjustments.x}px, ${adjustments.y}px)`;
          
          // Force max-height to ensure it doesn't exceed viewport
          const currentHeight = dropdownRect.height;
          const maxAllowedHeight = window.innerHeight - Math.max(dropdownRect.top, viewportPadding) - viewportPadding;
          if (currentHeight > maxAllowedHeight) {
            dropdownMenuRef.current.style.maxHeight = `${Math.max(200, maxAllowedHeight)}px`;
          }
        } else {
          dropdownMenuRef.current.style.transform = '';
        }
      };
      
      // Run verification multiple times to catch any edge cases
      requestAnimationFrame(() => {
        verifyAndAdjust();
        requestAnimationFrame(() => {
          verifyAndAdjust();
          // One more pass after a slight delay to catch any late DOM updates
          setTimeout(() => {
            verifyAndAdjust();
          }, 10);
        });
      });
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Calculate dropdown position - use setTimeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            calculateAndAdjustPosition();
          });
        });
      }, 0);
      
      // Also recalculate on window resize and scroll
      window.addEventListener('resize', calculateAndAdjustPosition);
      window.addEventListener('scroll', calculateAndAdjustPosition, true);
      
      // Continuous monitoring to catch any edge cases - check every 100ms while open
      const monitorInterval = setInterval(() => {
        if (dropdownMenuRef.current && dropdownRef.current) {
          const dropdownRect = dropdownMenuRef.current.getBoundingClientRect();
          const viewportPadding = 12;
          
          // Quick check if overflow occurred
          const hasOverflow = 
            dropdownRect.top < viewportPadding ||
            dropdownRect.bottom > window.innerHeight - viewportPadding ||
            dropdownRect.left < viewportPadding ||
            dropdownRect.right > window.innerWidth - viewportPadding;
          
          if (hasOverflow) {
            calculateAndAdjustPosition();
          }
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(monitorInterval);
        window.removeEventListener('resize', calculateAndAdjustPosition);
        window.removeEventListener('scroll', calculateAndAdjustPosition, true);
      };
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Reset transform when closing
      if (dropdownMenuRef.current) {
        dropdownMenuRef.current.style.transform = '';
      }
    };
  }, [isOpen]);

  const buttonLabel = useMemo(() => {
    if (activeWorkspace?.name) return activeWorkspace.name;
    if (isLoading) return 'Loading...';
    if (error) return 'Workspaces unavailable';
    return 'Select Workspace';
  }, [activeWorkspace, isLoading, error]);

  const openWorkspace = (workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    setIsOpen(false);
  };

  const handleSelect = (workspaceId) => {
    // Only change workspace if switching to a different one
    // The workspace change effect in ChatInterface will handle refreshing conversations
    if (workspaceId !== activeWorkspace?.id) {
      setActiveWorkspaceId(workspaceId);
    }
    setIsOpen(false);
  };

  const handleCreate = async (name) => {
    setIsCreating(true);
    try {
      const workspace = await createWorkspace(name);
      handleSelect(workspace.id);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetupClick = (event, workspaceId) => {
    event.stopPropagation();
    setIsOpen(false);
    navigate(`/workspaces/${workspaceId}/setup`);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => {
        setIsOpen(true); setDropdownActive(true);
      }}
      onMouseLeave={() => {
        setDropdownActive(false); setTimeout(() => { if (!dropdownActive) setIsOpen(false); }, 120);
      }}
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => { if (!dropdownRef.current.contains(e.relatedTarget)) setIsOpen(false); }}
      tabIndex={0}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-semibold text-gray-700"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold">
          {activeWorkspace?.name ? activeWorkspace.name.charAt(0).toUpperCase() : 'W'}
        </span>
        <span className="max-w-[140px] truncate">{buttonLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={dropdownMenuRef}
          className="fixed w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          style={{ 
            left: `${fixedPosition.left}px`,
            top: `${fixedPosition.top}px`,
            maxHeight: typeof window !== 'undefined' ? `${Math.min(dropdownMaxHeight, window.innerHeight - 24)}px` : `${dropdownMaxHeight}px`,
            maxWidth: typeof window !== 'undefined' ? `${Math.min(256, window.innerWidth - 24)}px` : '256px'
          }}
          tabIndex={-1}
          onMouseEnter={() => setDropdownActive(true)}
          onMouseLeave={() => setDropdownActive(false)}
        >
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">Workspaces</p>
              <button
                className="text-xs text-purple-600 hover:text-purple-700"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from closing
                  refreshWorkspaces(true); // true = preserve active workspace, only refresh the list
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          <div 
            className="overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-visible"
            style={{ height: `${Math.min(216, dropdownMaxHeight - 96)}px` }}
            onScroll={(e) => {
              // Prevent scroll event from bubbling - only scroll the inner content
              e.stopPropagation();
            }}
          >
            {isLoading && (
              <div className="p-4 text-sm text-gray-500">Loading workspaces...</div>
            )}
            {error && !isLoading && (
              <div className="p-4">
                <div className="text-sm text-red-600 font-semibold mb-2">{error}</div>
                <p className="text-xs text-gray-500">Workspaces may still be available below if previously loaded.</p>
              </div>
            )}
            {!isLoading && !error && workspaces.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No workspaces yet</div>
            )}
            {!isLoading && workspaces.length > 0 && workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => handleSelect(workspace.id)}
                className={`w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-2 cursor-pointer ${
                  activeWorkspace?.id === workspace.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                <span className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {workspace.name}
                    {workspace.websiteCount === 0 && (
                      <span className="ml-2 text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
                        Setup
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {workspace.websiteCount > 0 ? `${workspace.websiteCount} site${workspace.websiteCount > 1 ? 's' : ''}` : 'Connect a website'}
                  </p>
                </div>
                <button
                  onClick={(event) => handleSetupClick(event, workspace.id)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 border border-purple-100 rounded-full px-3 py-1 bg-white"
                >
                  Setup
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-purple-600 hover:bg-purple-50 border-t border-gray-100 flex-shrink-0"
          >
            + Create New Workspace
          </button>
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
}
