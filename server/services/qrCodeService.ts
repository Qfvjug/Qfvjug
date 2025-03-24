import QRCode from 'qrcode';

export class QRCodeService {
  /**
   * Generate a QR code for a URL
   * @param url URL to encode in the QR code
   * @returns Base64 encoded image
   */
  static async generateQRCode(url: string): Promise<string> {
    try {
      const qrcode = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return qrcode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Generate a QR code for a YouTube channel
   * @param channelId YouTube channel ID
   * @returns Base64 encoded image
   */
  static async generateChannelQRCode(channelId: string): Promise<string> {
    const url = `https://www.youtube.com/channel/${channelId}`;
    return this.generateQRCode(url);
  }
  
  /**
   * Generate a QR code for a YouTube video
   * @param videoId YouTube video ID
   * @returns Base64 encoded image
   */
  static async generateVideoQRCode(videoId: string): Promise<string> {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return this.generateQRCode(url);
  }
}