import { useRef } from 'react';

export default function useCamera() {
  const cameraRef    = useRef(null);
  const isCapturing  = useRef(false);

  const capturePhoto = async (tapRecord) => {
    if (!cameraRef.current || isCapturing.current) return null;
    isCapturing.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality:         0.3,
        base64:          false,
        skipProcessing:  true,
        shutterSound:    false,
        mute:            true,
      });
      return photo.uri;
    } catch (e) {
      console.error('📸 Capture failed:', e);
      return null;
    } finally {
      isCapturing.current = false;
    }
  };

  return { cameraRef, capturePhoto };
}