import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // We use OpenFoodFacts API. 
    // Setting search_simple=1, json=1, page_size=10
    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`;
    
    const res = await fetch(offUrl, {
      headers: {
        // OpenFoodFacts asks for a User-Agent identifying the app
        'User-Agent': 'FitmaxApp - Android - Version 1.0 - fitmax.com'
      }
    });

    if (!res.ok) {
      throw new Error(`OpenFoodFacts returned ${res.status}`);
    }

    const data = await res.json();
    
    // Map the products to a cleaner format for our frontend
    const results = (data.products || []).map((p: any) => {
      // Validate that it has minimum macro data
      const nutriments = p.nutriments || {};
      
      return {
        id: p._id || p.code || Math.random().toString(),
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
    }).filter((p: any) => p.name !== "Producto Desconocido" && (p.macros.calories > 0 || p.macros.protein > 0)); // Filter out junk data

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Food API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch food data' }, { status: 500 });
  }
}
