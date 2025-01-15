import { Observable } from '@nativescript/core';
import { Camera, requestPermissions } from '@nativescript/camera';
import { MLKitTextRecognition } from '@nativescript/mlkit-text-recognition';

export class HelloWorldModel extends Observable {
  private _numbers: string = 'Tap button to scan ticket';
  private camera: Camera;
  private textRecognizer: MLKitTextRecognition;

  constructor() {
    super();
    this.camera = new Camera();
    this.textRecognizer = new MLKitTextRecognition();
  }

  get numbers(): string {
    return this._numbers;
  }

  set numbers(value: string) {
    if (this._numbers !== value) {
      this._numbers = value;
      this.notifyPropertyChange('numbers', value);
    }
  }

  async scanTicket() {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        this.numbers = 'Camera permission needed';
        return;
      }

      const image = await this.camera.takePicture();
      const result = await this.textRecognizer.recognizeTextFromImage(image);
      
      // Find all numbers in the text
      const matches = result.text.match(/\b\d{1,2}\b/g) || [];
      const validNumbers = matches
        .map(n => parseInt(n))
        .filter(n => n >= 1 && n <= 99)
        .sort((a, b) => a - b);

      this.numbers = validNumbers.length > 0 
        ? `Numbers found: ${validNumbers.join(', ')}` 
        : 'No valid numbers found';
        
    } catch (error) {
      this.numbers = 'Error scanning ticket';
      console.error(error);
    }
  }
}