/**
 * LinkConverterService
 * 
 * Dieses Service wandelt verschiedene Cloud-Storage-Links in direkte Download-Links um.
 * Derzeit unterstützt es OneDrive-Sharing-Links.
 */

export class LinkConverterService {
  /**
   * Konvertiert einen OneDrive-Sharing-Link in einen direkten Download-Link
   * 
   * @param oneDriveLink Der OneDrive-Link (z.B. https://1drv.ms/... oder https://onedrive.live.com/...)
   * @returns Einen direkten Download-Link oder den Original-Link, wenn die Umwandlung nicht möglich ist
   */
  static convertOneDriveLink(oneDriveLink: string): string {
    // Prüfen, ob es sich um einen OneDrive-Link handelt
    const isOneDriveLink = 
      oneDriveLink.includes('1drv.ms') || 
      oneDriveLink.includes('onedrive.live.com') ||
      oneDriveLink.includes('sharepoint.com');
    
    if (!isOneDriveLink) {
      // Kein OneDrive-Link, Original zurückgeben
      return oneDriveLink;
    }
    
    try {
      // 1drv.ms Shortlink-Format
      if (oneDriveLink.includes('1drv.ms')) {
        // Für diese Links müssten wir einen API-Aufruf machen, um die Umleitung zu verfolgen
        // Da wir keine HTTP-Anfragen im Service machen wollen, geben wir einen Hinweis zurück
        return `${oneDriveLink}?download=1`;
      }
      
      // Reguläres OneDrive-Link-Format
      if (oneDriveLink.includes('onedrive.live.com')) {
        // Entferne alle Parameter und füge download=1 hinzu
        const baseUrl = oneDriveLink.split('?')[0];
        return `${baseUrl}?download=1`;
      }
      
      // SharePoint-Link-Format
      if (oneDriveLink.includes('sharepoint.com')) {
        // Für SharePoint-Links fügen wir ebenfalls download=1 hinzu
        const baseUrl = oneDriveLink.split('?')[0];
        return `${baseUrl}?download=1`;
      }
      
      // Fallback: Originalen Link zurückgeben
      return oneDriveLink;
    } catch (error) {
      console.error('Fehler bei der Konvertierung des OneDrive-Links:', error);
      return oneDriveLink;
    }
  }
  
  /**
   * Erkennt automatisch den Link-Typ und konvertiert ihn in einen direkten Download-Link
   * 
   * @param url Der zu konvertierende Link
   * @returns Einen direkten Download-Link oder den Original-Link, wenn keine Umwandlung möglich ist
   */
  static convertToDirectDownloadLink(url: string): string {
    // Erkennen des Link-Typs und Anwenden der entsprechenden Konvertierung
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com') || url.includes('sharepoint.com')) {
      return this.convertOneDriveLink(url);
    }
    
    // Weitere Cloud-Dienste könnten hier hinzugefügt werden
    // z.B. Google Drive, Dropbox usw.
    
    // Wenn kein unterstützter Link-Typ erkannt wurde, Original zurückgeben
    return url;
  }
}