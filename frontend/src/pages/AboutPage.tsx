import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Globe, TrendingUp, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Molele & Co PTY LTD</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Leading freight forwarding and logistics solutions provider across Southern Africa
        </p>

        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-6">
            Founded with a vision to revolutionize freight forwarding across Southern Africa, Molele & Co PTY LTD has
            grown into a trusted name in logistics and transportation services.
          </p>
          <p className="text-muted-foreground mb-6">
            Our journey began with a simple mission: to connect reliable transporters with businesses in need of
            efficient logistics solutions. Today, we serve clients across seven countries, facilitating thousands of
            successful shipments every year.
          </p>
          <p className="text-muted-foreground mb-6">
            Built on principles of reliability, transparency, and innovation, TruckTrackAfrica leverages technology to
            make freight forwarding accessible, trackable, and trustworthy.
          </p>

          <h2 className="text-3xl font-bold mb-4 mt-8">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            To provide seamless, reliable, and technology-driven freight forwarding solutions that empower businesses
            across Southern Africa to grow and thrive in the global marketplace.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Award className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Committed to delivering outstanding service at every touchpoint
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Partnership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Building long-term relationships with clients and transporters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leveraging technology to simplify complex logistics
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Regional Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We operate across seven Southern African countries:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• South Africa</li>
                <li>• Zimbabwe</li>
                <li>• Zambia</li>
                <li>• Botswana</li>
                <li>• Namibia</li>
                <li>• Tanzania</li>
                <li>• Democratic Republic of Congo</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Email:</strong>
                  <br />
                  <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
                    moleleholdings101@gmail.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Phone:</strong>
                  <br />
                  <a href="tel:+27712671212" className="text-primary hover:underline">
                    +27 71 267 1212
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
