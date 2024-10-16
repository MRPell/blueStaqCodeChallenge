import { Injectable } from '@angular/core';
@Injectable()

export class LogService {
  info(message: string, options?: any) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: Info: ${message}`, options);
  }

  warning(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = JSON.stringify(message);
    console.warn(`${timestamp}: Warning: ${formattedMessage}`, error ?? '');
  }
}

