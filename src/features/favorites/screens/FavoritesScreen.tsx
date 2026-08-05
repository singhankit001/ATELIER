import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Typography } from '../../../design/components/Typography';
import { theme } from '../../../core/theme/theme';
import { SceneProvider } from '../../../experience/scene/SceneProvider';
import { useFavoritesController } from '../controllers/useFavoritesController';
import { FavoriteItem } from '../components/FavoriteItem';
import { FloatingSearch } from '../../gallery/components/FloatingSearch';
import { EmptyState } from '../../gallery/components/EmptyState';
import { ArtworkViewer } from '../../gallery/components/ArtworkViewer';
import { ImageItem } from '../../gallery/services/galleryService';
import { BookMarked } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const PADDING = theme.spacing.md;
const IMAGE_WIDTH = (width - PADDING * 3) / 2; // 2 columns with spacing

import { GlassCard } from '../../../design/components/GlassCard';
import { Sparkles } from 'lucide-react-native';

export const FavoritesScreen = () => {
  const {
    search,
    setSearch,
    filteredFavorites,
    hasFavorites,
    isHydrating,
    selectedImage,
    setSelectedImage,
    toggleFavorite,
  } = useFavoritesController();

  const renderItem = useCallback(({ item, index }: { item: ImageItem; index: number }) => (
    <FavoriteItem 
      item={item} 
      index={index} 
      width={IMAGE_WIDTH}
      onPress={setSelectedImage}
      onRemove={toggleFavorite}
    />
  ), [setSelectedImage, toggleFavorite]);

  if (isHydrating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SceneProvider showArch={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Typography variant="headingL" weight="bold" style={{ flexShrink: 1, marginRight: theme.spacing.xs }}>
              Private Collection
            </Typography>
            <View style={styles.statsBadge}>
              <Sparkles size={14} color={theme.colors.accent} />
              <Typography variant="caption" weight="bold" color={theme.colors.accent} style={{ marginLeft: 4 }}>
                {filteredFavorites.length} {filteredFavorites.length === 1 ? 'WORK' : 'WORKS'}
              </Typography>
            </View>
          </View>
          <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.xs }}>
            Personal salon of acquired masterworks.
          </Typography>
          
          {hasFavorites && (
            <FloatingSearch 
              value={search} 
              onChangeText={setSearch} 
              placeholder="Search your collection..."
            />
          )}
        </View>

        {!hasFavorites ? (
          <EmptyState 
            title="Curate Your Salon"
            message="You haven't saved any artworks to your private collection yet. Explore the exhibition and select masterworks to acquire."
            icon={<BookMarked size={48} color={theme.colors.accent} />}
          />
        ) : (
          <Animated.FlatList
            data={filteredFavorites}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <EmptyState 
                title="No Matches Found"
                message="We couldn't find any masterworks matching your search."
                resetLabel="Clear Search"
                onReset={() => setSearch('')}
              />
            }
          />
        )}

        <ArtworkViewer
          visible={!!selectedImage}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </View>
    </SceneProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.huge,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadii.full,
    backgroundColor: theme.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: theme.colors.borderGlass,
  },
  listContent: {
    padding: PADDING,
    paddingBottom: 150,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  }
});
