import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Truck, Users, MapPin, Shield, Star } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import { useAuth } from '@/hooks/useAuth';

const testimonials = [
  {
    name: 'John Mokoena',
    role: 'Logistics Manager',
    company: 'SA Freight Solutions',
    content:
      'TruckTrackAfrica has revolutionized how we manage our freight operations. The platform is intuitive and connects us with reliable transporters across the region.',
    rating: 5,
  },
  {
    name: 'Sarah Ndlovu',
    role: 'Fleet Owner',
    company: 'Ndlovu Transport',
    content:
      'As a transporter, this platform has opened up new opportunities. We now have consistent loads and the tracking system keeps our clients informed.',
    rating: 5,
  },
  {
    name: 'David Chikwanda',
    role: 'Operations Director',
    company: 'Cross-Border Logistics',
    content:
      'The admin approval process ensures quality and security. We trust TruckTrackAfrica for all our Southern African routes.',
    rating: 5,
  },
];

export default function HomePage() {
  const { showProfileSetup } = useAuth();

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/generated/trucktrack-hero.dim_1600x600.png"
            alt="TruckTrackAfrica - Freight Forwarding"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="container relative py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="mb-6">
              <img
                src="/assets/generated/trucktrack-africa-logo.dim_512x512.png"
                alt="TruckTrackAfrica Logo"
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Connecting Africa's Freight Network
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional freight forwarding and logistics solutions across Southern Africa. Connect clients with
              trusted transporters for efficient, reliable cargo delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg">
                <Link to="/client-registration">Post a Load</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link to="/transporter-registration">Register as Transporter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Molele & Co PTY LTD</h2>
            <p className="text-lg text-muted-foreground">
              With years of experience in logistics and transportation, we specialize in connecting businesses with
              reliable freight solutions across Southern Africa. Our platform ensures secure, efficient, and transparent
              cargo movement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Truck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Reliable Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Vetted transporters with verified documentation and insurance coverage
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Wide Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Operating across South Africa, Zimbabwe, Zambia, Botswana, Namibia, and Tanzania
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Admin-approved loads and verified user profiles for your peace of mind</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Dedicated team to assist with your freight forwarding needs</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-lg text-muted-foreground">Trusted by businesses across Southern Africa</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>
                    {testimonial.role} at {testimonial.company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">Join our network of clients and transporters today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/load-board">View Load Board</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
