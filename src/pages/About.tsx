import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            About Simplifyd Home
          </h1>
          <p className="text-xl text-muted-foreground">
            Making everyday living simpler, one quality product at a time
          </p>
        </div>

        <div className="prose max-w-none mb-12 animate-fade-in">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Simplifyd Home was born from a simple idea: everyone deserves access to quality 
                kitchen appliances and electronics that make daily tasks easier and more enjoyable. 
                We understand that modern life can be complex, which is why we're committed to 
                simplifying the shopping experience while delivering products you can trust.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Since our founding, we've carefully curated a collection of kitchen essentials 
                and household electronics from trusted brands. Every product in our catalog has 
                been selected for its quality, durability, and value - because we believe that 
                simplifying life shouldn't mean compromising on excellence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we're proud to serve thousands of customers across Kenya, helping them 
                create better homes with products that work as hard as they do.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center animate-fade-in">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground text-sm">
                To provide quality products that simplify everyday living and bring comfort to every home.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center animate-fade-in">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Our Values</h3>
              <p className="text-muted-foreground text-sm">
                Quality, integrity, and customer satisfaction are at the heart of everything we do.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center animate-fade-in">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Our Promise</h3>
              <p className="text-muted-foreground text-sm">
                100% authentic products, reliable delivery, and exceptional customer support.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Why Choose Us?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3">✓</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Curated Selection:</strong> Every product is carefully chosen for quality and value
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3">✓</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Genuine Products:</strong> 100% authentic items with manufacturer warranties
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3">✓</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Fast Delivery:</strong> Quick and reliable shipping across Kenya
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3">✓</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Customer Support:</strong> Our team is always ready to help via WhatsApp and email
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary font-bold mr-3">✓</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Competitive Prices:</strong> Great value without compromising on quality
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
