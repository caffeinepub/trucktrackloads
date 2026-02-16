import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLoad, useGetAllApprovedLoads, useGetClientLoads } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Package, Weight, FileText, Upload } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import { ExternalBlob } from '../backend';
import LoadLocations from '@/components/loads/LoadLocations';

export default function LoadBoardPage() {
  const { isAuthenticated, showProfileSetup, identity } = useAuth();
  const { data: approvedLoads = [], isLoading: loadsLoading } = useGetAllApprovedLoads();
  const { data: myLoads = [], isLoading: myLoadsLoading } = useGetClientLoads(
    identity?.getPrincipal() || null
  );
  const createLoad = useCreateLoad();

  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [loadingLocation, setLoadingLocation] = useState('');
  const [offloadingLocation, setOffloadingLocation] = useState('');
  const [orderId, setOrderId] = useState('');
  const [confirmationFiles, setConfirmationFiles] = useState<ExternalBlob[]>([]);

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

    if (!description.trim() || !weight.trim() || !loadingLocation.trim() || !offloadingLocation.trim()) {
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
    } catch (error) {
      toast.error('Failed to post load. Please try again.');
      console.error(error);
    }
  };

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Load Board</h1>
          <p className="text-muted-foreground">Browse available loads or post your own</p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Loads</TabsTrigger>
            <TabsTrigger value="post">Post a Load</TabsTrigger>
            <TabsTrigger value="my-loads">My Loads</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Available Loads</CardTitle>
                <CardDescription>Browse approved loads ready for transport</CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Please log in to view available loads</p>
                  </div>
                ) : loadsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : approvedLoads.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No loads available at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedLoads.map((load, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">Load #{index + 1}</CardTitle>
                              <CardDescription className="mt-2">{load.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Available
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Weight className="h-4 w-4" />
                              <span>{load.weight} tons</span>
                            </div>
                            <LoadLocations
                              loadingLocation={load.loadingLocation}
                              offloadingLocation={load.offloadingLocation}
                            />
                            {load.confirmation.orderId && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>Order ID: {load.confirmation.orderId}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Load</CardTitle>
                <CardDescription>Submit your load details for admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Please log in to post a load</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Load Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the load (type, quantity, special requirements)"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (tons) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Enter weight in tons"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loadingLocation">Pick-up Location *</Label>
                      <Input
                        id="loadingLocation"
                        value={loadingLocation}
                        onChange={(e) => setLoadingLocation(e.target.value)}
                        placeholder="Enter pick-up location"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offloadingLocation">Drop-off Location *</Label>
                      <Input
                        id="offloadingLocation"
                        value={offloadingLocation}
                        onChange={(e) => setOffloadingLocation(e.target.value)}
                        placeholder="Enter drop-off location"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderId">Order ID (Optional)</Label>
                      <Input
                        id="orderId"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter order or reference ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmationFiles">Confirmation Documents (Optional)</Label>
                      <Input
                        id="confirmationFiles"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {confirmationFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {confirmationFiles.length} file(s) uploaded
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={createLoad.isPending}>
                      {createLoad.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Load'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-loads">
            <Card>
              <CardHeader>
                <CardTitle>My Loads</CardTitle>
                <CardDescription>View all your posted loads</CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Please log in to view your loads</p>
                  </div>
                ) : myLoadsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myLoads.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">You haven't posted any loads yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myLoads.map((load, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">Load #{index + 1}</CardTitle>
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
                              {load.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Weight className="h-4 w-4" />
                              <span>{load.weight} tons</span>
                            </div>
                            <LoadLocations
                              loadingLocation={load.loadingLocation}
                              offloadingLocation={load.offloadingLocation}
                            />
                            {load.confirmation.orderId && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>Order ID: {load.confirmation.orderId}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
