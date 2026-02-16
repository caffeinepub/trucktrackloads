import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLoad, useGetTransporterLoadBoard, useGetClientLoads, useGetCallerClientInfo, useGetTruckTypeOptions, useGetCallerTransporterDetails } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Package, Weight, FileText, AlertCircle, Truck, Heart, CheckCircle } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import LoadInterestEvidenceDialog from '@/components/loads/LoadInterestEvidenceDialog';
import { ExternalBlob, ClientVerificationStatus, TruckType } from '../backend';
import LoadLocations from '@/components/loads/LoadLocations';
import { Link } from '@tanstack/react-router';

export default function LoadBoardPage() {
  const { isAuthenticated, showProfileSetup, identity } = useAuth();
  const { data: transporterLoadBoard = [], isLoading: transporterLoadBoardLoading } = useGetTransporterLoadBoard();
  const { data: myLoads = [], isLoading: myLoadsLoading } = useGetClientLoads(
    identity?.getPrincipal() || null
  );
  const { data: clientInfo, isLoading: clientInfoLoading } = useGetCallerClientInfo();
  const { data: transporterDetails } = useGetCallerTransporterDetails();
  const { data: truckTypeOptions = [], isLoading: truckTypesLoading } = useGetTruckTypeOptions();
  const createLoad = useCreateLoad();

  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [loadingLocation, setLoadingLocation] = useState('');
  const [offloadingLocation, setOffloadingLocation] = useState('');
  const [orderId, setOrderId] = useState('');
  const [confirmationFiles, setConfirmationFiles] = useState<ExternalBlob[]>([]);
  const [selectedTruckType, setSelectedTruckType] = useState<TruckType | ''>('');
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedLoadForInterest, setSelectedLoadForInterest] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);
      setConfirmationFiles((prev) => [...prev, blob]);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !identity) {
      toast.error('Please log in to post a load');
      return;
    }

    if (!description.trim() || !weight.trim() || !loadingLocation.trim() || !offloadingLocation.trim() || !selectedTruckType) {
      toast.error('Please fill in all required fields');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    try {
      await createLoad.mutateAsync({
        client: identity.getPrincipal(),
        description: description.trim(),
        weight: weightNum,
        loadingLocation: loadingLocation.trim(),
        offloadingLocation: offloadingLocation.trim(),
        truckType: selectedTruckType as TruckType,
        isApproved: false,
        confirmation: {
          orderId: orderId.trim(),
          confirmationFiles,
        },
      });
      toast.success('Load posted successfully! Awaiting admin approval.');
      setDescription('');
      setWeight('');
      setLoadingLocation('');
      setOffloadingLocation('');
      setOrderId('');
      setConfirmationFiles([]);
      setSelectedTruckType('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to post load';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const getTruckTypeName = (truckType: TruckType): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || truckType;
  };

  const handleExpressInterest = (loadDescription: string) => {
    setSelectedLoadForInterest(loadDescription);
    setEvidenceDialogOpen(true);
  };

  const isVerifiedClient = clientInfo?.verificationStatus === ClientVerificationStatus.verified;
  const canPostLoad = isAuthenticated && isVerifiedClient;
  // TransporterVerificationStatus has the same enum values as ClientVerificationStatus
  const isVerifiedTransporter = transporterDetails?.verificationStatus === ClientVerificationStatus.verified;

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <LoadInterestEvidenceDialog
        open={evidenceDialogOpen}
        onOpenChange={setEvidenceDialogOpen}
        loadDescription={selectedLoadForInterest}
      />

      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">Load Board</h1>
          <p className="text-muted-foreground">Browse available loads or post your own</p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="browse">Browse Loads</TabsTrigger>
            <TabsTrigger value="post">Post a Load</TabsTrigger>
            <TabsTrigger value="my-loads">My Loads</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {!isAuthenticated ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please <Link to="/" className="text-primary hover:underline">log in</Link> to view available loads.
                </AlertDescription>
              </Alert>
            ) : !isVerifiedTransporter ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Only verified transporters can browse available loads.
                  {!transporterDetails ? (
                    <>
                      {' '}Please{' '}
                      <Link to="/register/transporter" className="underline font-medium">
                        register as a transporter
                      </Link>{' '}
                      to access the load board.
                    </>
                  ) : (
                    <>
                      {' '}Your transporter account is pending verification.
                      Current status: <Badge variant="outline" className="ml-2">{transporterDetails.verificationStatus}</Badge>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : transporterLoadBoardLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transporterLoadBoard.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No loads available at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {transporterLoadBoard.map((load, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>Load #{index + 1}</CardTitle>
                          <CardDescription className="mt-2">{load.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{load.weight} tons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Truck Type:</span>
                          <span className="font-medium">{getTruckTypeName(load.truckType)}</span>
                        </div>
                      </div>

                      <LoadLocations
                        loadingLocation={load.loadingLocation}
                        offloadingLocation={load.offloadingLocation}
                      />

                      <Button
                        onClick={() => handleExpressInterest(load.description)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Express Interest
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="post" className="space-y-4">
            {!isAuthenticated ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please log in to post a load. If you don't have an account,{' '}
                  <Link to="/register/client" className="underline font-medium">
                    register as a client
                  </Link>{' '}
                  first.
                </AlertDescription>
              </Alert>
            ) : clientInfoLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !clientInfo ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to register as a client before posting loads.{' '}
                  <Link to="/register/client" className="underline font-medium">
                    Register here
                  </Link>
                </AlertDescription>
              </Alert>
            ) : !isVerifiedClient ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your client account is pending verification. You'll be able to post loads once an admin approves your account.
                  Current status: <Badge variant="outline" className="ml-2">{clientInfo.verificationStatus}</Badge>
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Post a New Load</CardTitle>
                  <CardDescription>Fill in the details below to post a load for transporters</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Load Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the load, cargo type, special requirements..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (tons) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 25.5"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="truck-type">Truck Type *</Label>
                        <Select value={selectedTruckType} onValueChange={(value) => setSelectedTruckType(value as TruckType)}>
                          <SelectTrigger id="truck-type">
                            <SelectValue placeholder="Select truck type" />
                          </SelectTrigger>
                          <SelectContent>
                            {truckTypesLoading ? (
                              <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : (
                              truckTypeOptions.map((option) => (
                                <SelectItem key={option.id.toString()} value={option.truckType}>
                                  {option.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loading-location">Loading Location *</Label>
                      <Input
                        id="loading-location"
                        placeholder="e.g., Johannesburg, South Africa"
                        value={loadingLocation}
                        onChange={(e) => setLoadingLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="offloading-location">Offloading Location *</Label>
                      <Input
                        id="offloading-location"
                        placeholder="e.g., Harare, Zimbabwe"
                        value={offloadingLocation}
                        onChange={(e) => setOffloadingLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="order-id">Order ID (optional)</Label>
                      <Input
                        id="order-id"
                        placeholder="Your internal order reference"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmation-files">Confirmation Files (optional)</Label>
                      <Input
                        id="confirmation-files"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      {confirmationFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {confirmationFiles.length} file(s) uploaded
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={createLoad.isPending} className="w-full">
                      {createLoad.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting Load...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Post Load
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-loads" className="space-y-4">
            {!isAuthenticated ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please log in to view your loads.
                </AlertDescription>
              </Alert>
            ) : myLoadsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myLoads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't posted any loads yet</p>
                  {canPostLoad && (
                    <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="post"]')?.click()}>
                      Post Your First Load
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myLoads.map((load, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>Load #{index + 1}</CardTitle>
                          <CardDescription className="mt-2">{load.description}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            load.isApproved
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }
                        >
                          {load.isApproved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {load.isApproved && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-700" />
                          <AlertDescription className="text-green-700">
                            <strong>Public / Visible to transporters</strong> - This load is now visible on the load board and transporters can express interest.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{load.weight} tons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Truck Type:</span>
                          <span className="font-medium">{getTruckTypeName(load.truckType)}</span>
                        </div>
                      </div>

                      <LoadLocations
                        loadingLocation={load.loadingLocation}
                        offloadingLocation={load.offloadingLocation}
                      />

                      {load.confirmation.orderId && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Order ID:</span>{' '}
                          <span className="font-medium">{load.confirmation.orderId}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
