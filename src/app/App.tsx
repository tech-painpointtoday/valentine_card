import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import BackgroundMusic from './components/BackgroundMusic';
import { AudioProvider } from './contexts/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
      <BackgroundMusic />
    </AudioProvider>
  );
}