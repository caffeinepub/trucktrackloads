import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useGetCallerClientInfo, useGetTransporterLoadBoard, useCreateLoad, useGetClientLoads, useGetTruckTypeOptions } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Package, Send, Loader2, Weight, MapPin, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { TruckType, ExternalBlob } from '@/backend';
import LoadLocations from '@/components/loads/LoadLocations';

export default function LoadBoardPage() {
  const { isAuthenticated } = useAuth();
  const { identity } = useInternetIdentity();
  const { data: clientInfo } = useGetCallerClientInfo();
  const { data: loadBoard = [], isLoading: loadBoardLoading } = useGetTransporterLoadBoard();
  const { data: myLoads = [], isLoading: myLoadsLoading } = useGetClientLoads(identity?.getPrincipal() || null);
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const createLoad = useCreateLoad();

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [loadingLocation, setLoadingLocation] = useState('');
  const [offloadingLocation, setOffloadingLocation] = useState('');
  const [truckType, setTruckType] = useState<TruckType | ''>('');

  const isVerifiedClient = clientInfo?.verificationStatus === 'verified';

  const handlePostLoad = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to post a load');
      return;
    }

    if (!isVerifiedClient) {
      toast.error('Only verified clients can post loads');
      return;
    }

    if (!description.trim() || !price || !weight || !loadingLocation.trim() || !offloadingLocation.trim() || !truckType) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createLoad.mutateAsync({
        client: identity.getPrincipal(),
        description: description.trim(),
        price: parseFloat(price),
        weight: parseFloat(weight),
        loadingLocation: loadingLocation.trim(),
        offloadingLocation: offloadingLocation.trim(),
        truckType: truckType as TruckType,
        isApproved: false,
        status: '',
        confirmation: {
          orderId: '',
          confirmationFiles: [],
        },
      });
      toast.success('Load posted successfully! Awaiting admin approval.');
      setDescription('');
      setPrice('');
      setWeight('');
      setLoadingLocation('');
      setOffloadingLocation('');
      setTruckType('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post load');
    }
  };

  const getTruckTypeName = (type: TruckType): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === type);
    return option?.name || String(type);
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Load Board</CardTitle>
            <CardDescription>Please sign in to access the load board</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You need to be signed in to view or post loads.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Load Board</h1>
        <p className="text-muted-foreground">
          Post and browse available transportation loads
        </p>
      </div>

      <Tabs defaultValue={isVerifiedClient ? 'post' : 'browse'} className="space-y-6">
        <TabsList>
          {isVerifiedClient && (
            <TabsTrigger value="post">
              <Send className="h-4 w-4 mr-2" />
              Post Load
            </TabsTrigger>
          )}
          <TabsTrigger value="browse">
            <Package className="h-4 w-4 mr-2" />
            Browse Loads
          </TabsTrigger>
          {clientInfo && (
            <TabsTrigger value="my-loads">
              <Package className="h-4 w-4 mr-2" />
              My Loads
            </TabsTrigger>
          )}
        </TabsList>

        {isVerifiedClient && (
          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Load</CardTitle>
                <CardDescription>
                  Share load details with verified transporters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostLoad} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Load Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the load, cargo type, special requirements..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      <Weight className="inline h-4 w-4 mr-2" />
                      Weight (tons) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.0"
                      required
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
                    <Label htmlFor="loading-location">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Pick-up Location *
                    </Label>
                    <Input
                      id="loading-location"
                      value={loadingLocation}
                      onChange={(e) => setLoadingLocation(e.target.value)}
                      placeholder="Loading location"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offloading-location">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Drop-off Location *
                    </Label>
                    <Input
                      id="offloading-location"
                      value={offloadingLocation}
                      onChange={(e) => setOffloadingLocation(e.target.value)}
                      placeholder="Offloading location"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createLoad.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createLoad.isPending ? 'Posting...' : 'Post Load'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Available Loads</CardTitle>
              <CardDescription>
                Browse loads from verified clients (visible to verified transporters only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadBoardLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : loadBoard.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No loads available at the moment. Check back later.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {loadBoard.map((load, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{load.description}</CardTitle>
                            <CardDescription className="mt-1">
                              {getTruckTypeName(load.truckType)} • {load.weight} tons
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <LoadLocations
                          loadingLocation={load.loadingLocation}
                          offloadingLocation={load.offloadingLocation}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {clientInfo && (
          <TabsContent value="my-loads">
            <Card>
              <CardHeader>
                <CardTitle>My Posted Loads</CardTitle>
                <CardDescription>View all loads you have posted</CardDescription>
              </CardHeader>
              <CardContent>
                {myLoadsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myLoads.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You haven't posted any loads yet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {myLoads.map((load, index) => (
                      <Card key={index} className="border-l-4 border-l-accent">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{load.description}</CardTitle>
                              <CardDescription className="mt-1">
                                {getTruckTypeName(load.truckType)} • {load.weight} tons
                              </CardDescription>
                            </div>
                            {load.isApproved ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Public / Visible to transporters
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Approval
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <LoadLocations
                            loadingLocation={load.loadingLocation}
                            offloadingLocation={load.offloadingLocation}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
