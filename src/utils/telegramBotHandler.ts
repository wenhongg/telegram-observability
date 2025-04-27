import axios from 'axios';
import { TelegramConsoleConfig, LogMessage } from '../types';

export class TelegramBotHandler {
  private config: TelegramConsoleConfig;

  constructor(config: TelegramConsoleConfig) {
    this.config = config;
  }

  async sendLog(log: LogMessage): Promise<void> {
    try {
      const formattedMessage = this.formatLogMessage(log);
      await axios.post(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
        chat_id: this.config.chatId,
        text: formattedMessage,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Failed to send log to Telegram:', error);
    }
  }

  private formatLogMessage(log: LogMessage): string {
    const timestamp = new Date(log.timestamp).toISOString();
    const metadata = log.metadata ? `\nMetadata: ${JSON.stringify(log.metadata, null, 2)}` : '';
    
    return `
<b>${log.level.toUpperCase()}</b>
Time: ${timestamp}
Message: ${log.message}${metadata}
    `.trim();
  }
} 