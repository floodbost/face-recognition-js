import * as faceapi from 'face-api.js';

//const maxDescriptorDistance = 0.5;

export async function loadModels() {
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
    return Promise.all([
      faceapi.loadSsdMobilenetv1Model(MODEL_URL),
      faceapi.loadTinyFaceDetectorModel(MODEL_URL),
      faceapi.loadFaceRecognitionModel(MODEL_URL),
      faceapi.loadFaceLandmarkTinyModel(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL)
    ]);
}

export async function detectAllFaceFromVideo(blob: any, inputSize = 512) {

  let fullDesc = await faceapi
    .detectAllFaces(blob)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return fullDesc;
}

export interface PhotoLabel {
  name: string,
  descriptors: Float32Array[]
}

export async function createMatcher() {
    const labels = ['veranda'];
    const labeledDescriptions = await Promise.all(labels.map(async(label) => {
      const descriptions = [];
      for(let i = 0; i < 2; i++) {
          const img = await faceapi.fetchImage(`/trainers/${label}/${i}.jpg`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          descriptions.push(detections?.descriptor || new Float32Array());
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    }));
  

  // Create face matcher (maximum descriptor distance is 0.5)
  let faceMatcher = new faceapi.FaceMatcher(
    labeledDescriptions,
    0.5
  );
  return faceMatcher;

}

