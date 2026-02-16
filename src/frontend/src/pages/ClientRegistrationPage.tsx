import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useGetCallerClientInfo, useSaveCallerClientInfo } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';

export default function ClientRegistrationPage() {
  const { isAuthenticated, showProfileSetup } = useAuth();
  const { data: existingInfo, isLoading: loadingInfo } = useGetCallerClientInfo();
  const saveClientInfo = useSaveCallerClientInfo();

  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contractDetails, setContractDetails] = useState('');

  useEffect(() => {
    if (existingInfo) {
      setCompany(existingInfo.company);
      setContactPerson(existingInfo.contactPerson);
      setEmail(existingInfo.email);
      setPhone(existingInfo.phone);
      setAddress(existingInfo.address);
      setContractDetails(existingInfo.contract?.contractText || '');
    }
  }, [existingInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to register');
      return;
    }

    if (!company.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await saveClientInfo.mutateAsync({
        company: company.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        contract: {
          contractText: contractDetails.trim(),
          startDate: BigInt(0),
          endDate: BigInt(0),
        },
      });
      toast.success(existingInfo ? 'Profile updated successfully!' : 'Registration successful!');
    } catch (error) {
      toast.error('Failed to save information. Please try again.');
      console.error(error);
    }
  };

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Client Registration</h1>
            <p className="text-muted-foreground">
              {existingInfo ? 'Update your client profile' : 'Register as a client to post loads'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{existingInfo ? 'Update Profile' : 'Client Information'}</CardTitle>
              <CardDescription>
                {existingInfo
                  ? 'Update your company details and contact information'
                  : 'Provide your company details to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please log in to register as a client</p>
                </div>
              ) : loadingInfo ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="company@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter business address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractDetails">Contract Details</Label>
                    <Textarea
                      id="contractDetails"
                      value={contractDetails}
                      onChange={(e) => setContractDetails(e.target.value)}
                      placeholder="Enter contract details, terms, or notes"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={saveClientInfo.isPending}>
                    {saveClientInfo.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : existingInfo ? (
                      'Update Profile'
                    ) : (
                      'Register'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
