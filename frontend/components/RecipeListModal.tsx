import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { fetchRecipes, Recipe } from '../api/recipes';
import { RecipeBadge } from './RecipeBadge';

export function RecipeListModal() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFetchingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const loadRecipes = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'initial') setError(null);
    setRefreshError(null);

    try {
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to load recipes right now.';
      if (mode === 'refresh' && recipes.length > 0) {
        setRefreshError('Could not refresh. Showing latest available recipes.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [recipes.length]);

  useEffect(() => {
    void loadRecipes('initial');
  }, [loadRecipes]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Could not load recipes</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => void loadRecipes('initial')}
        >
          <Text style={styles.retryButtonText}>{loading ? 'Retrying...' : 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (selectedRecipe) {
    return (
      <View style={styles.container}>
        <View style={styles.detailHeaderRow}>
          <TouchableOpacity onPress={() => setSelectedRecipe(null)} activeOpacity={0.7}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailHeader}>Recipe details</Text>
          <View />
        </View>

        <ScrollView style={styles.detailContent} contentContainerStyle={styles.detailContentInner}>
          {selectedRecipe.image ? (
            <Image source={{ uri: selectedRecipe.image }} style={styles.detailImage} />
          ) : (
            <View style={styles.badgeFallbackWrap}>
              <RecipeBadge imageUrl={selectedRecipe.image} size={72} />
            </View>
          )}
          <Text style={styles.title}>{selectedRecipe.title}</Text>
          <Text style={styles.prepTime}>Prep: {selectedRecipe.prep_time} min</Text>
          <Text style={styles.ingredientsHeader}>Ingredients:</Text>
          {selectedRecipe.ingredients.length > 0 ? (
            selectedRecipe.ingredients.map((ingredient, idx) => (
              <Text key={idx} style={styles.ingredientLine}>
                - {ingredient}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyIngredients}>No ingredients available.</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recipes</Text>
      {refreshError ? <Text style={styles.refreshErrorText}>{refreshError}</Text> : null}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search recipes by name"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FlatList
        data={filteredRecipes}
        keyExtractor={(recipe) => String(recipe.id)}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => void loadRecipes('refresh')}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => setSelectedRecipe(item)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <View style={styles.imageFallback}>
                <RecipeBadge imageUrl={item.image} size={54} />
                <Text style={styles.fallbackText}>No image</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.prepTime}>Prep: {item.prep_time} min</Text>
              <View style={styles.ingredientsBlock}>
                <Text style={styles.ingredientsHeader}>Ingredients:</Text>
                {item.ingredients.length > 0 ? (
                  item.ingredients.slice(0, 3).map((ingredient, idx) => (
                    <Text key={idx} style={styles.ingredientLine}>
                      - {ingredient}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.emptyIngredients}>No ingredients listed.</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {query.trim()
                ? `No recipes match "${query.trim()}".`
                : 'No recipes available yet. Pull down to refresh.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  detailHeader: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  detailContent: {
    flex: 1,
  },
  detailContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#cc0000',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  retryButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshErrorText: {
    color: '#b45309',
    marginHorizontal: 16,
    marginBottom: 6,
    fontSize: 13,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 18,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  imageFallback: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fallbackText: {
    color: '#666',
    fontSize: 12,
  },
  badgeFallbackWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  cardBody: {
    padding: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  prepTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  ingredientsBlock: {
    marginTop: 4,
  },
  ingredientsHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  ingredientLine: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  emptyIngredients: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});
