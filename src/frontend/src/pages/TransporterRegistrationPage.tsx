import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterTransporter, useGetCallerTransporterDetails, useGetTruckTypeOptions } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, MapPin, FileText, Truck, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import { ClientVerificationStatus, TruckType, ExternalBlob } from '../backend';
import { Link } from '@tanstack/react-router';
import LiveLocationToggleCard from '@/components/transporter/LiveLocationToggleCard';
import TransporterStatusCard from '@/components/transporter/TransporterStatusCard';

// TransporterVerificationStatus has the same shape as ClientVerificationStatus
type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

export default function TransporterRegistrationPage() {
  const { isAuthenticated, showProfileSetup } = useAuth();
  const { data: existingDetails, isLoading: detailsLoading } = useGetCallerTransporterDetails();
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const registerTransporter = useRegisterTransporter();

  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [truckType, setTruckType] = useState<TruckType | ''>('');
  const [contractDetails, setContractDetails] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [documents, setDocuments] = useState<ExternalBlob[]>([]);

  useEffect(() => {
    if (existingDetails) {
      setCompany(existingDetails.company);
      setContactPerson(existingDetails.contactPerson);
      setEmail(existingDetails.email);
      setPhone(existingDetails.phone);
      setAddress(existingDetails.address);
      setTruckType(existingDetails.truckType);
      setDocuments(existingDetails.documents);
      // Load first contract if exists
      if (existingDetails.contracts.length > 0) {
        setContractDetails(existingDetails.contracts[0].contractText || '');
      }
    }
  }, [existingDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to register as a transporter');
      return;
    }

    if (!company.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !address.trim() || !truckType) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startTimestamp = contractStartDate ? new Date(contractStartDate).getTime() * 1000000 : BigInt(0);
    const endTimestamp = contractEndDate ? new Date(contractEndDate).getTime() * 1000000 : BigInt(0);

    try {
      await registerTransporter.mutateAsync({
        company: company.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        truckType: truckType as TruckType,
        documents: documents,
        contracts: contractDetails.trim() ? [{
          contractText: contractDetails.trim(),
          startDate: BigInt(startTimestamp),
          endDate: BigInt(endTimestamp),
          year: BigInt(0), // Default year for legacy contracts
        }] : [],
        verificationStatus: TransporterVerificationStatus.pending,
      });
      toast.success('Transporter registration submitted successfully! Awaiting admin verification.');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to register transporter';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newDocuments: ExternalBlob[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newDocuments.push(blob);
      }
      setDocuments([...documents, ...newDocuments]);
      toast.success(`${newDocuments.length} document(s) added`);
    } catch (error: any) {
      toast.error('Failed to upload documents');
      console.error(error);
    }
  };

  const isVerified = existingDetails?.verificationStatus === TransporterVerificationStatus.verified;
  const isPending = existingDetails?.verificationStatus === TransporterVerificationStatus.pending;
  const isRejected = existingDetails?.verificationStatus === TransporterVerificationStatus.rejected;

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold mb-3">Transporter Registration</h1>
            <p className="text-muted-foreground">Register your transport company to access loads and contracts</p>
          </div>

          {!isAuthenticated ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please <Link to="/" className="text-primary hover:underline">log in</Link> to register as a transporter.
              </AlertDescription>
            </Alert>
          ) : detailsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : existingDetails ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Registration Status</CardTitle>
                      <CardDescription>Your transporter registration details</CardDescription>
                    </div>
                    {isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending Verification
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Rejected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isVerified && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-700" />
                      <AlertDescription className="text-green-700">
                        Your transporter account has been verified! You can now access the{' '}
                        <Link to="/load-board" className="underline font-medium">Load Board</Link> and{' '}
                        <Link to="/contracts" className="underline font-medium">Contracts</Link>.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isPending && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your registration is pending admin verification. You'll be notified once your account is approved.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isRejected && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your registration was rejected. Please contact support at{' '}
                        <a href="mailto:moleleholdings101@gmail.com" className="underline font-medium">
                          moleleholdings101@gmail.com
                        </a>{' '}
                        for more information.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 pt-4">
                    <div>
                      <Label className="text-muted-foreground">Company</Label>
                      <p className="font-medium">{existingDetails.company}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">{existingDetails.contactPerson}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{existingDetails.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{existingDetails.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{existingDetails.address}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Truck Type</Label>
                      <p className="font-medium">
                        {truckTypeOptions.find(opt => opt.truckType === existingDetails.truckType)?.name || String(existingDetails.truckType)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isVerified && (
                <>
                  <LiveLocationToggleCard />
                  <TransporterStatusCard />
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Register as Transporter</CardTitle>
                <CardDescription>Fill in your company details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      <Building2 className="inline h-4 w-4 mr-2" />
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      placeholder="e.g., XYZ Transport Ltd"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-person">
                      <User className="inline h-4 w-4 mr-2" />
                      Contact Person *
                    </Label>
                    <Input
                      id="contact-person"
                      placeholder="Full name of primary contact"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Business Address *
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Full business address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="truck-type">
                      <Truck className="inline h-4 w-4 mr-2" />
                      Truck Type *
                    </Label>
                    <Select value={truckType} onValueChange={(value) => setTruckType(value as TruckType)}>
                      <SelectTrigger id="truck-type">
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
                    <Label htmlFor="documents">
                      <Upload className="inline h-4 w-4 mr-2" />
                      Upload Documents (Optional)
                    </Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    {documents.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {documents.length} document(s) uploaded
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-details">
                      <FileText className="inline h-4 w-4 mr-2" />
                      Contract Details (Optional)
                    </Label>
                    <Textarea
                      id="contract-details"
                      placeholder="Enter any existing contract details or requirements"
                      value={contractDetails}
                      onChange={(e) => setContractDetails(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {contractDetails.trim() && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contract-start">Contract Start Date</Label>
                        <Input
                          id="contract-start"
                          type="date"
                          value={contractStartDate}
                          onChange={(e) => setContractStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contract-end">Contract End Date</Label>
                        <Input
                          id="contract-end"
                          type="date"
                          value={contractEndDate}
                          onChange={(e) => setContractEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={registerTransporter.isPending}
                    className="w-full"
                  >
                    {registerTransporter.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
