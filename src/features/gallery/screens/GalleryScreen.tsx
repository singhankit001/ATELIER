import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { ErrorBoundary } from '../../../core/error/ErrorBoundary';
import { ImageItem } from '../services/galleryService';
import { Typography } from '../../../design/components/Typography';
import { ArtworkViewer } from '../components/ArtworkViewer';
import { GalleryItem } from '../components/GalleryItem';
import { SceneProvider } from '../../../experience/scene/SceneProvider';
import { useGalleryController, GalleryFilter } from '../controllers/useGalleryController';
import { FloatingSearch, FilterValue } from '../components/FloatingSearch';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { SkeletonGrid } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useAppTheme } from '../../../core/theme/ThemeProvider';

export const GalleryScreen = () => {
  const { theme } = useAppTheme();
  const {
    images,
    search,
    setSearch,
    filter,
    setFilter,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    isEmpty,
    loadMore,
    isLoadingMore,
    hasMore,
  } = useGalleryController();

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const flatListRef = useRef<Animated.FlatList<ImageItem>>(null);

  const handleScrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const renderItem = useCallback(({ item, index }: { item: ImageItem; index: number }) => (
    <GalleryItem item={item} index={index} onPress={setSelectedImage} />
  ), []);

  return (
    <ErrorBoundary name="GalleryScreen">
      <SceneProvider showArch={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Typography variant="headingXL" weight="bold">Exhibition</Typography>

            {/* Unified slim search + filter bar */}
            <FloatingSearch
              value={search}
              onChangeText={setSearch}
              filter={filter as FilterValue}
              onFilterChange={(val) => setFilter(val as GalleryFilter)}
            />

            {!isLoading && !isError && (
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.countLabel}>
                {images.length}{hasMore ? '+' : ''} {images.length === 1 ? 'image' : 'images'}
              </Typography>
            )}
          </View>

          {isError && !isLoading ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading ? (
            <View style={styles.loadingContent}>
              <SkeletonGrid />
            </View>
          ) : (
            <Animated.FlatList
              ref={flatListRef}
              data={images}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              initialNumToRender={8}
              maxToRenderPerBatch={6}
              windowSize={7}
              removeClippedSubviews
              contentContainerStyle={styles.listContent}
              renderItem={renderItem}
              refreshing={isRefetching}
              onRefresh={refetch}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color={theme.colors.accent} />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                isEmpty ? (
                  <EmptyState
                    title="No Artworks Found"
                    message="We couldn't find any artworks matching your search criteria."
                    resetLabel="Clear Search"
                    onReset={() => setSearch('')}
                  />
                ) : null
              }
            />
          )}

          <FloatingActionButton scrollY={scrollY} onPress={handleScrollToTop} />

          <ArtworkViewer
            visible={!!selectedImage}
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        </View>
      </SceneProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  countLabel: {
    marginTop: 8,
  },
  loadingContent: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 150,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoading: {
    paddingVertical: 24,
  },
});
