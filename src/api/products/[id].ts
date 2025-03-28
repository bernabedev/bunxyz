// In-memory store for demonstration purposes
// IMPORTANT: In a real app, this would interact with a database.

import { products } from ".";
import type { BunxyzRequest } from "../../request";
import { BunxyzResponse } from "../../response";

/**
 * Handles GET requests to /api/products/:id
 * Retrieves a single product by its ID.
 */
export const GET = (req: BunxyzRequest): Response => {
  // Get the 'id' parameter extracted by the framework's router
  const { id } = req.params;

  // Find the product in our "database"
  const product = products.find((p) => p.id === id);

  if (product) {
    // Product found, return it as JSON with a 200 OK status
    return BunxyzResponse.json(product);
  } else {
    // Product not found, return a 404 error response
    return BunxyzResponse.json({ error: "Product not found" }, { status: 404 });
  }
};

/**
 * Handles PUT requests to /api/products/:id
 * Updates an existing product by its ID.
 * Expects product data (e.g., { "name": "New Name", "price": 150 }) in the JSON body.
 */
export const PUT = async (req: BunxyzRequest): Promise<Response> => {
  // Get the 'id' parameter
  const { id } = req.params;

  // Find the index of the product to update
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    // Product not found, return a 404 error
    return BunxyzResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    // Parse the JSON body from the request to get update data
    const updateData = await req.json<{ name?: string; price?: number }>(); // Type assertion for expected body structure

    // Basic validation: Check if at least some data was provided
    if (
      !updateData ||
      (updateData.name === undefined && updateData.price === undefined)
    ) {
      return BunxyzResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    // Get the original product
    const originalProduct = products[productIndex];

    // Create the updated product object
    // Merges existing data with new data. Only updates fields present in updateData.
    const updatedProduct = {
      ...originalProduct, // Spread existing properties
      ...(updateData.name !== undefined && { name: updateData.name }), // Conditionally include name if provided
      ...(updateData.price !== undefined && { price: updateData.price }), // Conditionally include price if provided
    };

    // Update the product in the array
    products[productIndex] = updatedProduct;

    // Return the updated product with a 200 OK status
    return BunxyzResponse.json(updatedProduct);
  } catch (error) {
    // Handle potential errors during JSON parsing (e.g., invalid JSON)
    if (error instanceof SyntaxError) {
      return BunxyzResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }
    // Handle other potential errors
    console.error("Error updating product:", error);
    return BunxyzResponse.json(
      { error: "Internal server error during update" },
      { status: 500 }
    );
  }
};

/**
 * Handles DELETE requests to /api/products/:id
 * Deletes a product by its ID.
 */
export const DELETE = (req: BunxyzRequest): Response => {
  // Get the 'id' parameter
  const { id } = req.params;

  // Find the index of the product to delete
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    // Product not found, return a 404 error
    return BunxyzResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Remove the product from the array using splice
  // splice(startIndex, numberOfElementsToRemove)
  products.splice(productIndex, 1);

  // Standard practice is to return 204 No Content on successful DELETE
  // Alternatively, you could return 200 OK with a confirmation message:
  // return BunxyzResponse.json({ message: `Product with id ${id} deleted successfully.` });
  return new Response(null, { status: 204 });
};
