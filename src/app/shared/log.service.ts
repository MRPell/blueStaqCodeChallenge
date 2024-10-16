import { Injectable } from '@angular/core';
@Injectable()

export class LogService {
        info(message: string, options?: object) {
            console.log(`${new Date()}: ${message} ${JSON.stringify(options)}`);
        }

        warning(message: unknown, error?: unknown): void {
            const timestamp = new Date().toISOString();
            const formattedMessage = JSON.stringify(message);
            console.warn(`${timestamp}: ${formattedMessage}`, error ?? '');
        }
}

