import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ValentineCard } from '../types';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3a715eba`;

class ApiClient {
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Upload an image file to Supabase Storage
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.path;
  }

  /**
   * Create a new Valentine card
   */
  async createCard(cardData: {
    cardId: string;
    senderImage: string;
    message: string;
    gifts: Array<{ id: string; name: string; image: string }>;
  }): Promise<{ success: boolean; cardId: string }> {
    return this.request('/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });
  }

  /**
   * Get a Valentine card by ID
   */
  async getCard(cardId: string): Promise<ValentineCard> {
    return this.request(`/cards/${cardId}`);
  }

  /**
   * Update the receiver's gift choice
   */
  async updateChoice(
    cardId: string,
    receiverChoice: string
  ): Promise<{ success: boolean }> {
    return this.request(`/cards/${cardId}/choice`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiverChoice }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const api = new ApiClient();
