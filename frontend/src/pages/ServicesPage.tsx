import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Search, MapPin, Shield, Clock } from 'lucide-react';

const services = [
  {
    icon: Package,
    title: 'Freight Forwarding',
    description:
      'Comprehensive freight forwarding services across Southern Africa. We handle all aspects of cargo transportation, from documentation to delivery, ensuring your goods reach their destination safely and efficiently.',
  },
  {
    icon: Truck,
    title: 'Transportation Services',
    description:
      'Access to a verified network of professional transporters with various vehicle types and capacities. Whether you need flatbeds, refrigerated trucks, or specialized cargo vehicles, we connect you with the right transporter.',
  },
  {
    icon: Search,
    title: 'Load Matching',
    description:
      'Our intelligent load matching system connects clients with available transporters in real-time. Post your load requirements and receive responses from qualified transporters ready to handle your cargo.',
  },
  {
    icon: MapPin,
    title: 'Tracking & Logistics Management',
    description:
      'Real-time tracking and status updates throughout the shipping process. Monitor your cargo from pickup to delivery with our comprehensive tracking system, ensuring transparency and peace of mind.',
  },
  {
    icon: Shield,
    title: 'Secure & Verified Network',
    description:
      'All transporters undergo thorough verification including documentation checks, insurance validation, and compliance verification. Admin approval ensures only qualified transporters access the platform.',
  },
  {
    icon: Clock,
    title: 'Flexible Payment Terms',
    description:
      'Multiple payment options to suit your business needs: 50/50 split, 70/30 terms, Cash on Delivery (COD), or pay-on-arrival. Choose the payment structure that works best for your operations.',
  },
];

export default function ServicesPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive freight forwarding and logistics solutions tailored for Southern African businesses
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl font-bold mb-2">1</div>
              <h3 className="text-xl font-semibold mb-2">Post Your Load</h3>
              <p className="opacity-90">
                Clients post load requirements with details including origin, destination, weight, and delivery dates.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2</div>
              <h3 className="text-xl font-semibold mb-2">Match & Approve</h3>
              <p className="opacity-90">
                Our system matches loads with qualified transporters. Admin reviews and approves all postings for
                quality assurance.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <h3 className="text-xl font-semibold mb-2">Track & Deliver</h3>
              <p className="opacity-90">
                Transporters update status and location throughout the journey. Clients track their cargo in real-time
                until delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Coverage Areas</CardTitle>
            <CardDescription>We provide services across the following Southern African countries:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['South Africa', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Tanzania', 'Democratic Republic of Congo'].map((country) => (
                <div key={country} className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{country}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
