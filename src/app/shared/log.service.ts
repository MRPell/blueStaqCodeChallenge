import { Injectable } from '@angular/core';
@Injectable()

export class LogService {
  info(message: string, options?: object) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: Info: ${message}`, options);
  }

  warning(message: string, error?: object): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = JSON.stringify(message);
    console.warn(`${timestamp}: Warning: ${formattedMessage}`, error ?? '');
  }
}

