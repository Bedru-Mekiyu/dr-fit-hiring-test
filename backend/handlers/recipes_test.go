package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"dr-fit-hiring-test/backend/models"

	"github.com/gofiber/fiber/v2"
)

func createTempRecipeFile(t *testing.T) string {
	t.Helper()
	sampleRecipes := []models.Recipe{
		{
			ID:          1,
			Title:       "Test Recipe 1",
			Image:       nil,
			PrepTime:    15,
			Ingredients: []string{"Ingredient 1", "Ingredient 2"},
		},
		{
			ID:          2,
			Title:       "Test Recipe 2",
			Image:       nil,
			PrepTime:    20,
			Ingredients: "Ingredient A, Ingredient B",
		},
	}

	data, err := json.Marshal(sampleRecipes)
	if err != nil {
		t.Fatalf("failed to marshal sample recipes: %v", err)
	}

	dir := t.TempDir()
	filePath := filepath.Join(dir, "recipes.json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		t.Fatalf("failed to write temp recipes file: %v", err)
	}

	return filePath
}

func TestLoadRecipesAndEndpoints(t *testing.T) {
	tempFile := createTempRecipeFile(t)

	if err := LoadRecipes(tempFile); err != nil {
		t.Fatalf("LoadRecipes failed: %v", err)
	}

	app := fiber.New()
	app.Get("/recipes", ListRecipes)
	app.Get("/recipes/:id", GetRecipe)

	t.Run("ListRecipes returns all recipes", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/recipes", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed test request: %v", err)
		}
		if resp.StatusCode != 200 {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var result []models.Recipe
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if len(result) != 2 {
			t.Errorf("expected 2 recipes, got %d", len(result))
		}
	})

	t.Run("GetRecipe returns single recipe when exists", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/recipes/1", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed test request: %v", err)
		}
		if resp.StatusCode != 200 {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var recipe models.Recipe
		if err := json.NewDecoder(resp.Body).Decode(&recipe); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if recipe.ID != 1 || recipe.Title != "Test Recipe 1" {
			t.Errorf("unexpected recipe returned: %+v", recipe)
		}
	})

	t.Run("GetRecipe returns 404 for non-existing ID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/recipes/999", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed test request: %v", err)
		}
		if resp.StatusCode != 404 {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})

	t.Run("GetRecipe returns 400 for invalid ID", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/recipes/abc", nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("failed test request: %v", err)
		}
		if resp.StatusCode != 400 {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}
