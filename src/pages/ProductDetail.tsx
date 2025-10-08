import { useParams, Link } from "react-router-dom";
import { products } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              {product.category}
            </p>
            <h1 className="text-4xl font-bold mb-4 text-foreground">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-secondary text-secondary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <p className="text-5xl font-bold text-foreground mb-6">
              KSh {product.price.toLocaleString()}
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            <Button
              size="lg"
              onClick={() => addToCart(product)}
              className="w-full md:w-auto bg-primary hover:bg-primary-hover text-lg px-8"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {/* Additional Info */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Product Features</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    High-quality materials and construction
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    1-year manufacturer warranty
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Fast delivery across Kenya
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    Authentic product guarantee
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-foreground">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-foreground">
                        KSh {relatedProduct.price.toLocaleString()}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
