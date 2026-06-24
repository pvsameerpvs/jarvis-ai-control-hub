import { logger } from '@/lib/utils/logger'

export class CameraServer {
  async openCamera(): Promise<Record<string, unknown>> {
    logger.vision('CameraServer.openCamera')
    return { action: 'open_camera', instruction: 'Frontend should activate the camera stream.' }
  }

  async captureFrame(): Promise<Record<string, unknown>> {
    logger.vision('CameraServer.captureFrame')
    return { action: 'capture_frame', instruction: 'Frontend should capture a single frame and return base64.' }
  }

  async analyzeImage(imageBase64: string, question: string): Promise<Record<string, unknown>> {
    logger.vision('CameraServer.analyzeImage', { question: question.substring(0, 100) })
    return {
      action: 'analyze_image',
      instruction: 'Pass image to Gemini for analysis. Placeholder - real analysis requires Gemini client.',
      imageSize: imageBase64.length,
      question,
    }
  }

  async explainObject(imageBase64: string): Promise<Record<string, unknown>> {
    logger.vision('CameraServer.explainObject')
    return {
      action: 'explain_object',
      instruction: 'Pass image to Gemini for object recognition. Placeholder.',
      imageSize: imageBase64.length,
    }
  }

  async readDocument(imageBase64: string): Promise<Record<string, unknown>> {
    logger.vision('CameraServer.readDocument')
    return {
      action: 'read_document',
      instruction: 'Pass image to Gemini for OCR. Placeholder.',
      imageSize: imageBase64.length,
    }
  }
}

export const cameraServer = new CameraServer()
