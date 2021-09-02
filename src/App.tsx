import React, { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels, detectAllFaceFromVideo, createMatcher } from './api/face';
import './App.css';

const inputSize = 160;
const videoWidth = 640;
const videoHeight = 480;

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [cameraRequest, setCameraRequest] = useState<boolean>(false);
  const [loop, setLoop] = useState<NodeJS.Timeout>();
  const [initialize, setInitialize] = useState<boolean>(false);


  useEffect(() => {
      const startVideo = async () => {
        if (videoRef.current && !cameraRequest) {
          console.log('start video');
          const mediaStream: MediaStreamConstraints = {video: {}};
          let videoStream: MediaStream = await navigator.mediaDevices.getUserMedia(mediaStream)
                videoRef.current.srcObject = videoStream;
                setCameraRequest(true);
        }
      };
      startVideo();
      return () => {
        loop && clearInterval(loop)
      }
  }, [cameraRequest, loop]);

  const matcher = async () => {
    const matchers = await createMatcher();
   return matchers;
 }

  const startDetectionVideo = (facematcher: faceapi.FaceMatcher) => {
    const interval = setInterval(async () => {
        
      const detections = await detectAllFaceFromVideo(videoRef.current, inputSize);
      if (videoRef.current && canvasRef.current) {
        
        faceapi.matchDimensions(canvasRef.current, videoRef.current);
        detections.forEach((detection) => {
          const match = facematcher?.findBestMatch(detection.descriptor);
          const drawOptions = {
            label: match.toString(),
            lineWidth: 2
          }
          const box = {
            width: detection.alignedRect.box.width,
            height: detection.alignedRect.box.height,
            x: (canvasRef.current?.width || videoWidth) - detection.alignedRect.box.x - detection.alignedRect.box.width,
            y: detection.alignedRect.box.y,
          };

          const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
          if (canvasRef.current) {
            drawBox.draw(canvasRef.current);
          }
          
        });
        
      }
    }, 500);;
    
    setLoop(interval);
  }

  const onPlayVideo = () => {
    const run = async() => {
      await loadModels();
      const getDefinedMatcher = await matcher();
      startDetectionVideo(getDefinedMatcher);
      setInitialize(true);
    };
    run();
  }

  return (
    <div className="App">
     <div className="video-wrap" style={{width: String(videoWidth).concat('px'), height: String(videoHeight).concat('px')}}>
        <video 
        ref={videoRef}
        muted
        autoPlay
        height={videoHeight} 
        width={videoWidth}
        onPlay={onPlayVideo}
        />
        <canvas ref={canvasRef} />
     </div>
     <h5>
       {(!initialize && cameraRequest) && 'Loading Data Model Please Wait...'}
     </h5>
    </div>
  );
}

export default App;
