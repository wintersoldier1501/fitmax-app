import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing barcode" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`, {
      headers: {
        "User-Agent": "FitmaxApp - Android - Version 1.0 - fitmax.com"
      }
    });

    if (!response.ok) {
      throw new Error(`OpenFoodFacts returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return NextResponse.json({ error: "Producto no encontrado en la base de datos." }, { status: 404 });
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const productData = {
      id: code,
      name: p.product_name || p.product_name_es || "Producto Desconocido",
      brand: p.brands ? p.brands.split(',')[0] : "Genérico",
      image: p.image_front_url || p.image_url || null,
      macros: {
        protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
        carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
        fats: Math.round(nutriments.fat_100g || nutriments.fat || 0),
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0)
      }
    };

    return NextResponse.json({ results: productData });
  } catch (error: any) {
    console.error("Barcode API Error:", error);
    return NextResponse.json({ error: "Error al buscar el producto" }, { status: 500 });
  }
}
