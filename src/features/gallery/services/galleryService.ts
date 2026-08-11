import { apiClient } from '../../../core/api/apiClient';

export interface ImageItem {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
  thumbnailUrl: string;
}

export const PAGE_SIZE = 50;

export const galleryService = {
  /**
   * Fetches one page of the real Picsum feed — no fake/synthetic data.
   * Powers infinite pagination: the gallery controller calls this with
   * page=1,2,3... as the user scrolls, exclusively against
   * https://picsum.photos/v2/list.
   */
  fetchImages: async (page: number = 1, limit: number = PAGE_SIZE): Promise<ImageItem[]> => {
    try {
      const response = await apiClient.get<ImageItem[]>(
        `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
      );

      return response.data.map((item) => ({
        id: item.id,
        author: item.author,
        width: item.width,
        height: item.height,
        url: item.url,
        download_url: item.download_url,
        thumbnailUrl: `https://picsum.photos/id/${item.id}/600/900`,
      }));
    } catch (error) {
      console.error('Gallery Fetch Error:', error);
      throw error;
    }
  },
};
