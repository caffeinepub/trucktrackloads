import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Users, Mail, CheckCircle, XCircle, FileText, Download, Settings, RotateCcw, Weight, Smartphone, ExternalLink, Truck, LogOut } from 'lucide-react';
import {
  useGetAllPendingLoadsWithIds,
  useGetAllApprovedLoads,
  useApproveLoad,
  useGetAllTransportersWithIds,
  useGetAllContactMessages,
  useGetAllClientsWithIds,
  useGetAndroidApkLink,
  useSetAndroidApkLink,
  useVerifyClient,
  useVerifyTransporter,
  useGetTruckTypeOptions,
} from '@/hooks/useQueries';
import { toast } from 'sonner';
import RequireAdmin from '@/components/auth/RequireAdmin';
import AdminRouteErrorBoundary from '@/components/auth/AdminRouteErrorBoundary';
import { Principal } from '@dfinity/principal';
import { getAdSettings, saveAdSettings, AD_CONFIG } from '@/config/ads';
import AdSnippetPreviewFrame from '@/components/ads/AdSnippetPreviewFrame';
import LoadLocations from '@/components/loads/LoadLocations';
import { downloadCSV } from '@/utils/csv';
import { ClientVerificationStatus } from '../backend';
import { clearAdminToken, hasPasswordAdminSession } from '@/utils/urlParams';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import TransporterLocationsTab from '@/components/admin/TransporterLocationsTab';

// TransporterVerificationStatus has the same shape as ClientVerificationStatus
type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

function AdminDashboardContent() {
  const { data: pendingLoadsWithIds = [], isLoading: pendingLoadsLoading } = useGetAllPendingLoadsWithIds();
  const { data: approvedLoads = [], isLoading: approvedLoadsLoading } = useGetAllApprovedLoads();
  const { data: transportersWithIds = [], isLoading: transportersLoading } = useGetAllTransportersWithIds();
  const { data: contacts = [], isLoading: contactsLoading } = useGetAllContactMessages();
  const { data: clientsWithIds = [], isLoading: clientsLoading } = useGetAllClientsWithIds();
  const { data: apkLink, isLoading: apkLinkLoading } = useGetAndroidApkLink();
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();

  const approveLoad = useApproveLoad();
  const setApkLink = useSetAndroidApkLink();
  const verifyClient = useVerifyClient();
  const verifyTransporter = useVerifyTransporter();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [adEnabled, setAdEnabled] = useState(getAdSettings().enabled);
  const [adSnippet, setAdSnippet] = useState(getAdSettings().snippet);
  const [apkLinkInput, setApkLinkInput] = useState('');

  const hasPasswordAdmin = hasPasswordAdminSession();

  const handlePasswordAdminSignOut = () => {
    clearAdminToken();
    queryClient.clear();
    toast.success('Signed out successfully');
    navigate({ to: '/admin/login' });
  };

  const handleApprove = async (loadId: string, isApproved: boolean) => {
    try {
      await approveLoad.mutateAsync({ loadId, isApproved });
      toast.success(isApproved ? 'Load approved successfully' : 'Load rejected');
    } catch (error) {
      toast.error('Failed to process load');
      console.error('Approve load error:', error);
    }
  };

  const handleVerifyClient = async (clientPrincipal: Principal, status: ClientVerificationStatus) => {
    try {
      await verifyClient.mutateAsync({ client: clientPrincipal, status });
      toast.success(`Client ${status === ClientVerificationStatus.verified ? 'verified' : status === ClientVerificationStatus.rejected ? 'rejected' : 'updated'} successfully`);
    } catch (error) {
      toast.error('Failed to update client verification status');
      console.error('Verify client error:', error);
    }
  };

  const handleVerifyTransporter = async (transporterPrincipal: Principal, status: TransporterVerificationStatus) => {
    try {
      await verifyTransporter.mutateAsync({ transporter: transporterPrincipal, status });
      toast.success(`Transporter ${status === TransporterVerificationStatus.verified ? 'verified' : status === TransporterVerificationStatus.rejected ? 'rejected' : 'updated'} successfully`);
    } catch (error) {
      toast.error('Failed to update transporter verification status');
      console.error('Verify transporter error:', error);
    }
  };

  const handleSaveAdSettings = () => {
    const settings = { enabled: adEnabled, snippet: adSnippet };
    saveAdSettings(settings);
    window.dispatchEvent(new Event('ad-settings-updated'));
    toast.success('Ad settings saved successfully');
  };

  const handleResetAdSnippet = () => {
    setAdSnippet(AD_CONFIG.defaultBottomAdSnippet);
    toast.info('Ad snippet reset to default');
  };

  const handleSaveApkLink = async () => {
    if (!apkLinkInput.trim()) {
      toast.error('Please enter a valid APK download link');
      return;
    }
    try {
      await setApkLink.mutateAsync(apkLinkInput.trim());
      toast.success('APK download link saved successfully');
      setApkLinkInput('');
    } catch (error) {
      toast.error('Failed to save APK link');
      console.error(error);
    }
  };

  const handleExportClients = () => {
    const csvData = clientsWithIds.map(([principal, client]) => ({
      Principal: principal.toString(),
      Company: client.company,
      'Contact Person': client.contactPerson,
      Email: client.email,
      Phone: client.phone,
      Address: client.address,
      'Contract Count': client.contracts.length,
      'Verification Status': client.verificationStatus,
    }));
    downloadCSV(csvData, `clients-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Clients exported to CSV');
  };

  const handleExportTransporters = () => {
    const csvData = transportersWithIds.map(([principal, transporter]) => ({
      Principal: principal.toString(),
      Company: transporter.company,
      'Contact Person': transporter.contactPerson,
      Email: transporter.email,
      Phone: transporter.phone,
      Address: transporter.address,
      'Documents Count': transporter.documents.length,
      'Contract Count': transporter.contracts.length,
      'Verification Status': transporter.verificationStatus,
    }));
    downloadCSV(csvData, `transporters-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Transporters exported to CSV');
  };

  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  const getVerificationBadge = (status: ClientVerificationStatus | TransporterVerificationStatus) => {
    switch (status) {
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Admin access is restricted to authorized accounts. Contact support at{' '}
            <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
              moleleholdings101@gmail.com
            </a>{' '}
            if you need access.
          </p>
        </div>
        {hasPasswordAdmin && (
          <Button onClick={handlePasswordAdminSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>

      <Tabs defaultValue="pending-loads" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="pending-loads">
            <Package className="h-4 w-4 mr-2" />
            Pending Loads
          </TabsTrigger>
          <TabsTrigger value="approved-loads">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved Loads
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="transporters">
            <Truck className="h-4 w-4 mr-2" />
            Transporters
          </TabsTrigger>
          <TabsTrigger value="transporter-locations">
            <Truck className="h-4 w-4 mr-2" />
            Transporter Locations
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Mail className="h-4 w-4 mr-2" />
            Contact Messages
          </TabsTrigger>
          <TabsTrigger value="apk-link">
            <Smartphone className="h-4 w-4 mr-2" />
            APK Link
          </TabsTrigger>
          <TabsTrigger value="ad-settings">
            <Settings className="h-4 w-4 mr-2" />
            Ad Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-loads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Load Approvals</CardTitle>
              <CardDescription>Review and approve or reject loads posted by clients</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoadsLoading ? (
                <p className="text-muted-foreground">Loading pending loads...</p>
              ) : pendingLoadsWithIds.length === 0 ? (
                <p className="text-muted-foreground">No pending loads</p>
              ) : (
                <div className="space-y-4">
                  {pendingLoadsWithIds.map(([loadId, load]) => (
                    <Card key={loadId} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Load {loadId}</CardTitle>
                        <CardDescription>{load.description}</CardDescription>
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

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(loadId, true)}
                            disabled={approveLoad.isPending}
                            size="sm"
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleApprove(loadId, false)}
                            disabled={approveLoad.isPending}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved-loads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Loads</CardTitle>
              <CardDescription>All approved loads visible to transporters</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedLoadsLoading ? (
                <p className="text-muted-foreground">Loading approved loads...</p>
              ) : approvedLoads.length === 0 ? (
                <p className="text-muted-foreground">No approved loads</p>
              ) : (
                <div className="space-y-4">
                  {approvedLoads.map((load, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Approved Load #{index + 1}</CardTitle>
                            <CardDescription>{load.description}</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Approved
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Verification</CardTitle>
                  <CardDescription>Manage client registrations and verification status</CardDescription>
                </div>
                <Button onClick={handleExportClients} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <p className="text-muted-foreground">Loading clients...</p>
              ) : clientsWithIds.length === 0 ? (
                <p className="text-muted-foreground">No clients registered</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientsWithIds.map(([principal, client]) => (
                        <TableRow key={principal.toString()}>
                          <TableCell className="font-medium">{client.company}</TableCell>
                          <TableCell>{client.contactPerson}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell>{getVerificationBadge(client.verificationStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {client.verificationStatus !== ClientVerificationStatus.verified && (
                                <Button
                                  onClick={() => handleVerifyClient(principal, ClientVerificationStatus.verified)}
                                  disabled={verifyClient.isPending}
                                  size="sm"
                                  variant="outline"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {client.verificationStatus !== ClientVerificationStatus.rejected && (
                                <Button
                                  onClick={() => handleVerifyClient(principal, ClientVerificationStatus.rejected)}
                                  disabled={verifyClient.isPending}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transporters" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transporter Verification</CardTitle>
                  <CardDescription>Manage transporter registrations and verification status</CardDescription>
                </div>
                <Button onClick={handleExportTransporters} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transportersLoading ? (
                <p className="text-muted-foreground">Loading transporters...</p>
              ) : transportersWithIds.length === 0 ? (
                <p className="text-muted-foreground">No transporters registered</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Truck Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transportersWithIds.map(([principal, transporter]) => (
                        <TableRow key={principal.toString()}>
                          <TableCell className="font-medium">{transporter.company}</TableCell>
                          <TableCell>{transporter.contactPerson}</TableCell>
                          <TableCell>{transporter.email}</TableCell>
                          <TableCell>{transporter.phone}</TableCell>
                          <TableCell>{getTruckTypeName(transporter.truckType)}</TableCell>
                          <TableCell>{getVerificationBadge(transporter.verificationStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {transporter.verificationStatus !== TransporterVerificationStatus.verified && (
                                <Button
                                  onClick={() => handleVerifyTransporter(principal, TransporterVerificationStatus.verified)}
                                  disabled={verifyTransporter.isPending}
                                  size="sm"
                                  variant="outline"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {transporter.verificationStatus !== TransporterVerificationStatus.rejected && (
                                <Button
                                  onClick={() => handleVerifyTransporter(principal, TransporterVerificationStatus.rejected)}
                                  disabled={verifyTransporter.isPending}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transporter-locations" className="space-y-4">
          <TransporterLocationsTab />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>Messages submitted through the contact form</CardDescription>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <p className="text-muted-foreground">Loading contact messages...</p>
              ) : contacts.length === 0 ? (
                <p className="text-muted-foreground">No contact messages</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map(([principal, contact], index) => (
                    <Card key={index} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <CardDescription>{contact.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apk-link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Android APK Download Link</CardTitle>
              <CardDescription>Manage the download link for the Android application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apkLinkLoading ? (
                <p className="text-muted-foreground">Loading APK link...</p>
              ) : (
                <>
                  {apkLink && (
                    <div className="p-4 bg-muted rounded-md">
                      <Label className="text-sm font-medium mb-2 block">Current APK Link:</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-background p-2 rounded border overflow-x-auto">
                          {apkLink}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(apkLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="apk-link-input">New APK Download Link</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apk-link-input"
                        type="url"
                        placeholder="https://example.com/app.apk"
                        value={apkLinkInput}
                        onChange={(e) => setApkLinkInput(e.target.value)}
                      />
                      <Button
                        onClick={handleSaveApkLink}
                        disabled={setApkLink.isPending || !apkLinkInput.trim()}
                      >
                        {setApkLink.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the full URL to the APK file. This link will be displayed to users for downloading the Android app.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Settings</CardTitle>
              <CardDescription>Configure bottom ad display and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ad-enabled">Enable Bottom Ad</Label>
                  <p className="text-sm text-muted-foreground">
                    Show advertisement banner at the bottom of pages
                  </p>
                </div>
                <Switch
                  id="ad-enabled"
                  checked={adEnabled}
                  onCheckedChange={setAdEnabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ad-snippet">Ad HTML Snippet</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAdSnippet}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  id="ad-snippet"
                  value={adSnippet}
                  onChange={(e) => setAdSnippet(e.target.value)}
                  placeholder="Enter your ad HTML snippet here..."
                  className="font-mono text-sm min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Paste your ad network's HTML snippet here (e.g., Google AdSense, AdMob)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md p-4 bg-muted/30">
                  <AdSnippetPreviewFrame snippet={adSnippet} />
                </div>
              </div>

              <Button onClick={handleSaveAdSettings} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Ad Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  return (
    <AdminRouteErrorBoundary queryClient={queryClient}>
      <RequireAdmin>
        <AdminDashboardContent />
      </RequireAdmin>
    </AdminRouteErrorBoundary>
  );
}
