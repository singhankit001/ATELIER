/**
 * Layer 4 - Sharing Feature: Types
 * The contract between the UI (ArtworkViewer) and the sharing pipeline.
 * The viewer only ever needs to know these shapes — never file paths,
 * MIME types, or native share-sheet options.
 */

export interface ShareableArtwork {
  id: string;
  imageUrl: string;
  author: string;
  width?: number;
  height?: number;
}

export type SharingErrorCode = 'UNAVAILABLE' | 'PREPARE_FAILED' | 'SHARE_FAILED';

/**
 * Thrown only for genuine failures. A user dismissing the native share sheet
 * is NOT an error and must never surface as one — see sharingService.
 */
export class SharingError extends Error {
  constructor(message: string, public readonly code: SharingErrorCode) {
    super(message);
    this.name = 'SharingError';
  }
}

export type ShareStatus = 'idle' | 'preparing' | 'error';
