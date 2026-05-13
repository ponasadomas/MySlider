import { useContext } from 'react';
import SliderContext from './SliderContext';

export function useSliderContext() {
  const context = useContext(SliderContext);

  if (context === undefined) {
    throw new Error('useSliderContext must be used within a SliderProvider');
  }

  return context;
}
