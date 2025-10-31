import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .order('featured_order', { ascending: true })
          .limit(4);

        if (error) {
          console.error(
            'Error fetching featured products:',
            JSON.stringify({
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            }, null, 2)
          );

          // Check if it's a "relation does not exist" error (table not created)
          if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('products')) {
            setError('Featured products table not initialized');
          } else {
            setError('Failed to load featured products');
          }
        } else {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        console.error(
          'Unexpected error fetching featured products:',
          JSON.stringify({
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
          }, null, 2)
        );
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy">Featured Products</h2>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    // Silently fail if there's an error - don't show the section
    console.warn('Featured Products Error:', error);
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-6 py-3 text-white bg-brand-orange border-0 shadow-lg font-semibold text-sm tracking-wide uppercase">
            Curated Selection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
            Featured <span className="text-brand-orange">Products</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular and recommended solutions for your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col">
              {/* Product Image */}
              {product.image_url && (
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <CardHeader className="flex-grow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-brand-navy">{product.name}</CardTitle>
                    {product.category && (
                      <CardDescription className="text-brand-orange font-semibold">
                        {product.category}
                      </CardDescription>
                    )}
                  </div>
                  <Package className="h-5 w-5 text-brand-orange flex-shrink-0" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                {product.price && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-orange">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
