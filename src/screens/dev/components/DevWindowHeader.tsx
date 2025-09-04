import React from 'react';
import './styles/DevWindowHeader.css';
import 'screens/desktop/components/styles/DesktopHeader.css';
import { SVGComponent } from 'screens/desktop/components/DesktopHeaderSVG';

const DevWindowHeader: React.FC = () => {
  const handleDrag = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.closest('.window-controls') || target.tagName === 'BUTTON' || target.closest('button'))) {
      return;
    }
    try {
      overwolf.windows.getCurrentWindow(result => {
        if (result?.success) {
          overwolf.windows.dragMove(result.window.id);
        }
      });
    } catch {}
  };

  const minimize = () => {
    overwolf.windows.getCurrentWindow(result => {
      if (result?.success) overwolf.windows.minimize(result.window.id);
    });
  };

  const close = () => {
    overwolf.windows.getCurrentWindow(result => {
      if (result?.success) overwolf.windows.close(result.window.id);
    });
  };

  return (
    <div className="dev-header" onMouseDown={handleDrag}>
      {/* SVG symbols used by window control icons */}
      <SVGComponent />
      <div className="title-area">
        <img src="/desktopIcon.png" alt="logo" className="app-logo" />
        <span className="title">Rivals Overlay — Dev Tools</span>
      </div>
      <div className="window-controls header__controls__group">
        <button
          className="header__icon header__control"
          onClick={minimize}
          title="Minimize"
        >
          <svg>
            <use xlinkHref="#window-control_minimize" />
          </svg>
        </button>
        <button
          className="header__icon header__control header__control__close"
          onClick={close}
          title="Close"
        >
          <svg>
            <use xlinkHref="#window-control_close" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DevWindowHeader;

