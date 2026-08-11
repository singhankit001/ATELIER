import { Platform } from 'react-native';
import { artworkRepository, ArtworkError } from './artworkRepository';

/**
 * This test exists specifically because a real download bug shipped
 * silently through every prior automated check: `expo-media-library`'s
 * SDK57 rewrite turned `createAssetAsync`/`createAlbumAsync` into
 * guaranteed-throw stubs (see legacyWarnings.ts in the installed
 * package), but they kept the exact same TypeScript signatures as the
 * real, working `Asset.create`/`Album.*` API — so `tsc --noEmit` stayed
 * clean and nothing caught it short of an actual device tap. This test
 * mocks the native modules and asserts the *specific* methods called are
 * the real (non-legacy) ones, so a regression back to the deprecated
 * names fails a `npm test` run instead of only a physical download.
 */

const mockAssetCreate = jest.fn();
const mockAlbumGet = jest.fn();
const mockAlbumCreate = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockDownloadFileAsync = jest.fn();

// The File class must be written inline inside the factory, not assigned
// from an outer `const`/`var` — jest.mock() factories run at the very top
// of the compiled file (import-hoisting always runs before any other
// top-level statement, regardless of const/let/var), so `File: SomeOuterRef`
// reads that binding before it's ever initialized and silently gets
// `undefined`, producing "File is not a constructor" in every test. Method
// *bodies* are fine to reference outer `mock`-prefixed jest.fn()s, since
// those aren't evaluated until the method is actually called (well after
// the whole file, including plain `const` declarations, has run).
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'mock-cache-dir' },
  File: class {
    uri: string;
    exists = true;
    constructor(..._parts: unknown[]) {
      this.uri = 'file:///mock-cache-dir/mock-file.jpg';
    }
    delete = jest.fn();
    static downloadFileAsync(...args: unknown[]): Promise<unknown> {
      return mockDownloadFileAsync(...args);
    }
  },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  Asset: {
    create: (...args: unknown[]) => mockAssetCreate(...args),
  },
  Album: {
    get: (...args: unknown[]) => mockAlbumGet(...args),
    create: (...args: unknown[]) => mockAlbumCreate(...args),
  },
}));

describe('artworkRepository.downloadAndSaveImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockDownloadFileAsync.mockResolvedValue({ uri: 'file:///mock-cache-dir/mock-file.jpg', exists: true, delete: jest.fn() });
    mockAssetCreate.mockResolvedValue({ id: 'mock-asset-id' });
  });

  it('uses Asset.create — never the deprecated createAssetAsync stub', async () => {
    Platform.OS = 'ios';
    mockAlbumGet.mockResolvedValue(null);

    await artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1');

    expect(mockAssetCreate).toHaveBeenCalledWith('file:///mock-cache-dir/mock-file.jpg');
  });

  it('on Android, adds to an existing "Gallery App" album via album.add() rather than recreating it', async () => {
    Platform.OS = 'android';
    const mockAdd = jest.fn().mockResolvedValue(undefined);
    mockAlbumGet.mockResolvedValue({ add: mockAdd });

    await artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1');

    expect(mockAlbumGet).toHaveBeenCalledWith('Gallery App');
    expect(mockAdd).toHaveBeenCalledWith({ id: 'mock-asset-id' });
    expect(mockAlbumCreate).not.toHaveBeenCalled();
  });

  it('on Android, creates the album via Album.create() — never the deprecated createAlbumAsync stub — when it does not exist yet', async () => {
    Platform.OS = 'android';
    mockAlbumGet.mockResolvedValue(null);
    mockAlbumCreate.mockResolvedValue({ id: 'mock-album-id' });

    await artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1');

    expect(mockAlbumCreate).toHaveBeenCalledWith('Gallery App', [{ id: 'mock-asset-id' }]);
  });

  it('on iOS, never touches Album.get/Album.create — the OS file save is enough', async () => {
    Platform.OS = 'ios';

    await artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1');

    expect(mockAlbumGet).not.toHaveBeenCalled();
    expect(mockAlbumCreate).not.toHaveBeenCalled();
  });

  it('throws a PERMISSION_DENIED ArtworkError when the permission is refused, without attempting a download', async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    await expect(artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1')).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
    expect(mockDownloadFileAsync).not.toHaveBeenCalled();
  });

  it('throws a DOWNLOAD_FAILED ArtworkError when the network download itself fails', async () => {
    mockDownloadFileAsync.mockRejectedValue(new Error('network error'));

    await expect(artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1')).rejects.toMatchObject({
      code: 'DOWNLOAD_FAILED',
    });
  });

  it('throws a SAVE_FAILED ArtworkError when writing to the media library fails', async () => {
    Platform.OS = 'ios';
    mockAssetCreate.mockRejectedValue(new Error('media library error'));

    await expect(artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1')).rejects.toMatchObject({
      code: 'SAVE_FAILED',
    });
  });

  it('reports download progress via the onProgress callback', async () => {
    Platform.OS = 'ios';
    mockDownloadFileAsync.mockImplementation(async (_url, _dest, options) => {
      options.onProgress({ bytesWritten: 50, totalBytes: 100 });
      return { uri: 'file:///mock-cache-dir/mock-file.jpg', exists: true, delete: jest.fn() };
    });
    const onProgress = jest.fn();

    await artworkRepository.downloadAndSaveImage('https://example.com/image.jpg', 'img-1', onProgress);

    expect(onProgress).toHaveBeenCalledWith(0.5);
  });
});
