package handlers

import (
	"encoding/json"
	"os"
	"strconv"

	"dr-fit-hiring-test/backend/models"

	"github.com/gofiber/fiber/v2"
)

var recipes []models.Recipe

func LoadRecipes(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &recipes)
}

func ListRecipes(c *fiber.Ctx) error {
	return c.JSON(recipes)
}

func GetRecipe(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	for i := range recipes {
		if recipes[i].ID == id {
			return c.JSON(recipes[i])
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "recipe not found"})
}
