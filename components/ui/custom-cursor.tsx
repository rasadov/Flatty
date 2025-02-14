'use client';

import { MapPin } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';

const CursorContext = createContext<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
}>({
  visible: false,
  setVisible: () => {},
});

export const CursorProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <CursorContext.Provider value={{ visible, setVisible }}>
      {visible && (
        <div 
          className="fixed pointer-events-none z-[100] transition-all duration-150 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: position.x, 
            top: position.y,
            transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`
          }}
        >
          <div className="flex items-center gap-2 bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium whitespace-nowrap">View on map</span>
          </div>
        </div>
      )}
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const { setVisible } = useContext(CursorContext);

  return {
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false)
  };
}; 