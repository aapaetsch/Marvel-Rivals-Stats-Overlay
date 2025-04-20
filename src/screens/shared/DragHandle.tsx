import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DragOutlined } from '@ant-design/icons';
import { RootReducer } from 'app/shared/rootReducer';
import './DragHandle.css';

interface DragHandleProps {
  windowName: string;
}

const DragHandle: React.FC<DragHandleProps> = ({ windowName }) => {
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<number | null>(null);
  
  // Get positioning mode from Redux store
  const positioningModeWindows = useSelector(
    (state: RootReducer) => state.appSettingsReducer.settings.positioningModeWindows || {}
  );
  
  // Check if this window is in positioning mode
  const isDragModeActive = positioningModeWindows[windowName] || false;

  // Monitor the window position
  useEffect(() => {
    // Update position when needed
    const updatePosition = () => {
      overwolf.windows.getCurrentWindow(result => {
        if (result.success) {
          const newPos = {
            x: result.window.left,
            y: result.window.top
          };
          
          if (newPos.x !== positionRef.current.x || newPos.y !== positionRef.current.y) {
            positionRef.current = newPos;
            setWindowPosition(newPos);
          }
        }
      });
    };

    // Initial position check
    updatePosition();

    // Set up a periodic check for position updates if in drag mode
    if (isDragModeActive) {
      const checkInterval = setInterval(() => {
        updatePosition();
      }, 100);
      
      // Store interval ID for cleanup
      intervalRef.current = checkInterval as unknown as number;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDragModeActive]);

  // Enable dragging when the handle is clicked
  const handleDragStart = () => {
    overwolf.windows.getCurrentWindow(result => {
      if (result.success) {
        overwolf.windows.dragMove(result.window.id);
      }
    });
  };

  return (
    <div className={`drag-handle-container ${isDragModeActive ? 'visible' : ''}`}>
      <div className="drag-handle" onMouseDown={handleDragStart}>
        <DragOutlined className="drag-handle-icon" />
        <div>
          <div>Position: {windowPosition.x}, {windowPosition.y}</div>
          <div className="drag-hint">Click and drag to move</div>
          <div className="debug-info">Window: {windowName}</div>
        </div>
      </div>
    </div>
  );
};

export default DragHandle;
