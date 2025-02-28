// PerformanceDataManager.js
// This utility class manages the storage and retrieval of performance data using cookies

export class PerformanceDataManager {
  static STORAGE_KEY = 'morseTrainerPerformanceData';
  static MAX_RECORDS = 1000;

  static save(performanceData) {
    try {
      // Limit to the most recent MAX_RECORDS entries
      const dataToSave = performanceData.slice(-this.MAX_RECORDS);
      
      // Set expiration to 1 year from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Convert data to JSON and store in cookie
      const jsonData = JSON.stringify(dataToSave);
      document.cookie = `${this.STORAGE_KEY}=${encodeURIComponent(jsonData)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
      
      return true;
    } catch (error) {
      console.error('Failed to save performance data to cookie:', error);
      return false;
    }
  }

  static load() {
    try {
      // Find our specific cookie
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${this.STORAGE_KEY}=`));
      
      if (!cookieValue) {
        return [];
      }
      
      // Extract and parse the cookie value
      const encodedData = cookieValue.split('=')[1];
      const jsonData = decodeURIComponent(encodedData);
      const parsedData = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!Array.isArray(parsedData)) {
        console.warn('Stored performance data is not an array');
        return [];
      }
      
      // Return validated entries only
      return parsedData.filter(entry => 
        entry && 
        typeof entry.timestamp === 'number' &&
        typeof entry.attempt === 'number' &&
        typeof entry.isCorrect === 'boolean' &&
        typeof entry.rollingAccuracy === 'number' &&
        typeof entry.level === 'number'
      );
    } catch (error) {
      console.error('Failed to load performance data from cookie:', error);
      return [];
    }
  }
  
  static clear() {
    try {
      // Set cookie with empty value and past expiration date to remove it
      document.cookie = `${this.STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
      return true;
    } catch (error) {
      console.error('Failed to clear performance data cookie:', error);
      return false;
    }
  }
}
