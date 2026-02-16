import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useGetCallerTransporterDetails, useRegisterTransporter, useGetTruckTypeOptions } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, FileCheck, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import LiveLocationToggleCard from '@/components/transporter/LiveLocationToggleCard';
import TransporterStatusCard from '@/components/transporter/TransporterStatusCard';
import { ExternalBlob, ClientVerificationStatus, TruckType } from '../backend';

// TransporterVerificationStatus has the same shape as ClientVerificationStatus
type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

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
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const registerTransporter = useRegisterTransporter();

  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contractDetails, setContractDetails] = useState('');
  const [selectedTruckType, setSelectedTruckType] = useState<TruckType | ''>('');
  const [documents, setDocuments] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const isVerified = existingDetails?.verificationStatus === TransporterVerificationStatus.verified;

  useEffect(() => {
    if (existingDetails) {
      setCompany(existingDetails.company);
      setContactPerson(existingDetails.contactPerson);
      setEmail(existingDetails.email);
      setPhone(existingDetails.phone);
      setAddress(existingDetails.address);
      setContractDetails(existingDetails.contract?.contractText || '');
      setSelectedTruckType(existingDetails.truckType || '');
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

    if (!company.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !selectedTruckType) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (documents.length < REQUIRED_DOCUMENTS.length) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      await registerTransporter.mutateAsync({
        company: company.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        truckType: selectedTruckType as TruckType,
        documents,
        contract: {
          contractText: contractDetails.trim(),
          startDate: BigInt(0),
          endDate: BigInt(0),
        },
        verificationStatus: TransporterVerificationStatus.pending,
      });
      toast.success(existingDetails ? 'Profile updated successfully!' : 'Registration submitted! Awaiting admin approval.');
    } catch (error) {
      toast.error('Failed to save information. Please try again.');
      console.error(error);
    }
  };

  const getVerificationStatusBadge = (status: TransporterVerificationStatus) => {
    switch (status) {
      case TransporterVerificationStatus.verified:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case TransporterVerificationStatus.pending:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case TransporterVerificationStatus.rejected:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const getVerificationAlert = (status: TransporterVerificationStatus) => {
    switch (status) {
      case TransporterVerificationStatus.verified:
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-700">
              Your transporter profile has been verified. You can now access and bid on loads.
            </AlertDescription>
          </Alert>
        );
      case TransporterVerificationStatus.pending:
        return (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-700" />
            <AlertDescription className="text-yellow-700">
              Your registration is pending admin approval. You will be able to access loads once your profile is verified.
            </AlertDescription>
          </Alert>
        );
      case TransporterVerificationStatus.rejected:
        return (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-700" />
            <AlertDescription className="text-red-700">
              Your registration has been rejected. Please contact support for more information.
            </AlertDescription>
          </Alert>
        );
    }
  };

  if (showProfileSetup) {
    return <ProfileSetupModal open={showProfileSetup} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to register as a transporter.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadingDetails) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Transporter Registration</h1>
          {existingDetails && getVerificationStatusBadge(existingDetails.verificationStatus)}
        </div>
        <p className="text-muted-foreground">
          {existingDetails ? 'Update your transporter profile' : 'Register as a transporter to access loads'}
        </p>
      </div>

      {existingDetails && getVerificationAlert(existingDetails.verificationStatus)}

      {isAuthenticated && isVerified && (
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <LiveLocationToggleCard />
          <TransporterStatusCard />
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Provide your company details and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ABC Transport Ltd"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@abctransport.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 12 345 6789"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, Johannesburg, South Africa"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="truckType">Truck Type *</Label>
              <Select value={selectedTruckType} onValueChange={(value) => setSelectedTruckType(value as TruckType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck type" />
                </SelectTrigger>
                <SelectContent>
                  {truckTypeOptions.map((option) => (
                    <SelectItem key={option.id.toString()} value={option.truckType}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractDetails">Contract Details</Label>
              <Textarea
                id="contractDetails"
                value={contractDetails}
                onChange={(e) => setContractDetails(e.target.value)}
                placeholder="Enter any contract details or special terms..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Required Documents *</Label>
                <Badge variant="outline">
                  {documents.length} / {REQUIRED_DOCUMENTS.length} uploaded
                </Badge>
              </div>

              <div className="space-y-3">
                {REQUIRED_DOCUMENTS.map((docName, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`doc-${index}`} className="text-sm">
                        {docName}
                      </Label>
                      {documents[index] && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                    </div>
                    <Input
                      id={`doc-${index}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(index, file);
                      }}
                    />
                    {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                      <Progress value={uploadProgress[index]} className="h-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={registerTransporter.isPending}
            >
              {registerTransporter.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : existingDetails ? (
                'Update Profile'
              ) : (
                'Submit Registration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
