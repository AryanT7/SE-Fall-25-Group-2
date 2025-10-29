import { apiClient } from './client';
import { MenuItem, ItemCreateRequest } from './types';

// Items API Functions
export const itemsApi = {
    async listAll(): Promise<{ data?: MenuItem[]; error?: string }> {
        return apiClient.get<MenuItem[]>(`/items`, false); // Public endpoint
  },
  /**
   * Get all menu items from a specific cafe
   */
  async getCafeItems(cafeId: number, searchTerm?: string): Promise<{ data?: MenuItem[]; error?: string }> {
    const endpoint = searchTerm 
      ? `/items/${cafeId}?q=${encodeURIComponent(searchTerm)}` 
      : `/items/${cafeId}`;
    return apiClient.get<MenuItem[]>(endpoint, false); // Public endpoint
  },

  /**
   * Get a specific menu item by ID
   */
  async getItem(itemId: number): Promise<{ data?: MenuItem; error?: string }> {
    return apiClient.get<MenuItem>(`/items/item/${itemId}`, false); // Assuming this endpoint exists
  },

  /**
   * Add a new menu item to a cafe (Owner/Admin only)
   */
  async addMenuItem(cafeId: number, itemData: ItemCreateRequest): Promise<{ data?: MenuItem; error?: string }> {
    return apiClient.post<MenuItem>(`/items/${cafeId}`, itemData);
  },

  /**
   * Update a menu item (Owner/Admin only)
   */
  async updateItem(itemId: number, updates: Partial<ItemCreateRequest>): Promise<{ data?: MenuItem; error?: string }> {
    return apiClient.put<MenuItem>(`/items/item/${itemId}`, updates);
  },

  /**
   * Delete a menu item (Owner/Admin only)
   */
  async deleteItem(itemId: number): Promise<{ data?: { message: string }; error?: string }> {
    return apiClient.delete(`/items/item/${itemId}`);
  },

  /**
   * Toggle item active status (Owner/Admin only)
   */
  async toggleItemStatus(itemId: number, active: boolean): Promise<{ data?: MenuItem; error?: string }> {
    return apiClient.patch<MenuItem>(`/items/item/${itemId}/status`, { active });
  },
};

// Export individual functions for convenience
export const {
  listAll,
  getCafeItems,
  getItem,
  addMenuItem,      // was addItem
  updateItem,
  deleteItem,
  toggleItemStatus,
} = itemsApi;
