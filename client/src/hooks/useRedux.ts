import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

// Typed versions of dispatch and selector for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
