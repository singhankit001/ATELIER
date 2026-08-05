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

export const galleryService = {
  fetchImages: async (): Promise<ImageItem[]> => {
    try {
      const response = await apiClient.get<ImageItem[]>(
        'https://picsum.photos/v2/list?page=1&limit=30'
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
