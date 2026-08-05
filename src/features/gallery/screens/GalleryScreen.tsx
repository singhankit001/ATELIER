import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { ErrorBoundary } from '../../../core/error/ErrorBoundary';
import { ImageItem } from '../services/galleryService';
import { Typography } from '../../../design/components/Typography';
import { ArtworkViewer } from '../components/ArtworkViewer';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore';
import { GalleryItem } from '../components/GalleryItem';
import { SceneProvider } from '../../../experience/scene/SceneProvider';
import { useGalleryController, GalleryFilter } from '../controllers/useGalleryController';
import { FloatingSearch, FilterValue } from '../components/FloatingSearch';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const GalleryScreen = () => {
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
    handleRefresh,
    loadMore,
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
    <GalleryItem
      item={item}
      index={index}
      scrollY={scrollY}
      onPress={setSelectedImage}
    />
  ), [scrollY]);

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
          </View>

          {isError && !isLoading ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <Animated.FlatList
              ref={flatListRef}
              data={isLoading ? [] : images}
              keyExtractor={(item) => item.id}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={true}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              onEndReached={loadMore}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                isLoading ? (
                  <View style={{ marginTop: 32 }}>
                    <SkeletonCard />
                    <SkeletonCard />
                  </View>
                ) : isEmpty ? (
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
  listContent: {
    paddingTop: 12,
    paddingBottom: 150,
  },
});
