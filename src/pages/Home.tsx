import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Star, TruckIcon, ShieldCheck, Headphones } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const Home = () => {
  const { addToCart } = useCart();
  const [email, setEmail] = useState("");
  const featuredProducts = products.slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      comment: "Amazing quality and fast delivery! The air fryer changed my cooking routine.",
    },
    {
      name: "John K.",
      rating: 5,
      comment: "Excellent customer service. Found exactly what I needed for my kitchen.",
    },
    {
      name: "Mary W.",
      rating: 4,
      comment: "Great prices and authentic products. Highly recommend Simplifyd Home!",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
              Simplify Your <span className="text-primary">Everyday</span> Living
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover quality kitchen appliances and electronics that make life easier. 
              From cookware to smart devices, we have everything you need.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-lg px-8">
                <Link to="/shop">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TruckIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Quick and reliable delivery across Kenya
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Authentic Products</h3>
              <p className="text-muted-foreground text-sm">
                100% genuine products with warranty
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-muted-foreground text-sm">
                Always here to help via WhatsApp and email
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out our most popular items, handpicked for quality and value
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Special Offer: Up to 30% Off
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Limited time offer on selected kitchen appliances
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-secondary hover:bg-secondary-hover">
            <Link to="/shop">Shop Deals</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground">Trusted by thousands of happy customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-md border animate-fade-in"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-secondary text-secondary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <p className="font-semibold text-foreground">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for exclusive offers and new arrivals
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
