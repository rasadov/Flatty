import React from 'react';
import Button from './button';

interface MapButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const MapButton: React.FC<MapButtonProps> = (props) => {
  return (
    <Button variant="secondary" {...props}>
      Показать на карте
    </Button>
  );
};

export default MapButton; 