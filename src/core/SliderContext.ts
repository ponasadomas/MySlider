import { createContext } from 'react';
import type { SliderContextType } from '../types';

const SliderContext = createContext<SliderContextType | undefined>(undefined);

export default SliderContext;
