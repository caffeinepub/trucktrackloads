import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useGetCallerTransporterDetails, useSaveTransporterDetails } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Upload, FileCheck } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import { ExternalBlob } from '../backend';

const REQUIRED_DOCUMENTS = [
  'Company Registration Certificate',
  'Tax Clearance Certificate',
  'Insurance Certificate',
  'Vehicle Registration',
  'Driver License',
  'Operating License',
  'Safety Certificate',
  'Proof of Address',
];

export default function TransporterRegistrationPage() {
  const { isAuthenticated, showProfileSetup } = useAuth();
  const { data: existingDetails, isLoading: loadingDetails } = useGetCallerTransporterDetails();
  const saveTransporterDetails = useSaveTransporterDetails();

  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contractDetails, setContractDetails] = useState('');
  const [documents, setDocuments] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (existingDetails) {
      setCompany(existingDetails.company);
      setContactPerson(existingDetails.contactPerson);
      setEmail(existingDetails.email);
      setPhone(existingDetails.phone);
      setAddress(existingDetails.address);
      setContractDetails(existingDetails.contract?.contractText || '');
      setDocuments(existingDetails.documents || []);
    }
  }, [existingDetails]);

  const handleFileUpload = async (index: number, file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, [index]: percentage }));
      });

      const newDocuments = [...documents];
      newDocuments[index] = blob;
      setDocuments(newDocuments);
      
      toast.success(`${REQUIRED_DOCUMENTS[index]} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${REQUIRED_DOCUMENTS[index]}`);
      console.error(error);
    }
  };

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

    if (documents.length < REQUIRED_DOCUMENTS.length) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      await saveTransporterDetails.mutateAsync({
        company: company.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        documents,
        contract: {
          contractText: contractDetails.trim(),
          startDate: BigInt(0),
          endDate: BigInt(0),
        },
      });
      toast.success(existingDetails ? 'Profile updated successfully!' : 'Registration successful!');
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
            <h1 className="text-4xl font-bold mb-2">Transporter Registration</h1>
            <p className="text-muted-foreground">
              {existingDetails ? 'Update your transporter profile' : 'Register as a transporter to access loads'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{existingDetails ? 'Update Profile' : 'Transporter Information'}</CardTitle>
              <CardDescription>
                {existingDetails
                  ? 'Update your company details and documents'
                  : 'Provide your company details and upload required documents'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please log in to register as a transporter</p>
                </div>
              ) : loadingDetails ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
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
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Required Documents *</h3>
                    <p className="text-sm text-muted-foreground">
                      Please upload all {REQUIRED_DOCUMENTS.length} required documents
                    </p>
                    <div className="space-y-3">
                      {REQUIRED_DOCUMENTS.map((docName, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`doc-${index}`}>{docName}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`doc-${index}`}
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(index, file);
                              }}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="flex-1"
                            />
                            {documents[index] && (
                              <FileCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[index]}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={saveTransporterDetails.isPending}>
                    {saveTransporterDetails.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : existingDetails ? (
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
