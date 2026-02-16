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
import { Package, Users, Mail, CheckCircle, XCircle, FileText, Download, Settings, RotateCcw, Weight, Smartphone, ExternalLink } from 'lucide-react';
import {
  useGetClientLoads,
  useApproveLoad,
  useGetAllTransporters,
  useGetAllContactMessages,
  useGetAllClients,
  useGetAndroidApkLink,
  useSetAndroidApkLink,
} from '@/hooks/useQueries';
import { toast } from 'sonner';
import RequireAdmin from '@/components/auth/RequireAdmin';
import AdminRouteErrorBoundary from '@/components/auth/AdminRouteErrorBoundary';
import { Principal } from '@dfinity/principal';
import { getAdSettings, saveAdSettings, AD_CONFIG } from '@/config/ads';
import AdSnippetPreviewFrame from '@/components/ads/AdSnippetPreviewFrame';
import LoadLocations from '@/components/loads/LoadLocations';
import { downloadCSV } from '@/utils/csv';

function AdminDashboardContent() {
  const { data: allLoads = [], isLoading: loadsLoading } = useGetClientLoads(
    Principal.fromText('aaaaa-aa')
  );
  const { data: transporters = [], isLoading: transportersLoading } = useGetAllTransporters();
  const { data: contacts = [], isLoading: contactsLoading } = useGetAllContactMessages();
  const { data: clients = [], isLoading: clientsLoading } = useGetAllClients();
  const { data: apkLink, isLoading: apkLinkLoading } = useGetAndroidApkLink();

  const approveLoad = useApproveLoad();
  const setApkLink = useSetAndroidApkLink();

  const [adEnabled, setAdEnabled] = useState(getAdSettings().enabled);
  const [adSnippet, setAdSnippet] = useState(getAdSettings().snippet);
  const [apkLinkInput, setApkLinkInput] = useState('');

  const pendingLoads = allLoads.filter((load) => !load.isApproved);
  const approvedLoads = allLoads.filter((load) => load.isApproved);

  const handleApprove = async (loadId: string, isApproved: boolean) => {
    try {
      await approveLoad.mutateAsync({ loadId, isApproved });
      toast.success(isApproved ? 'Load approved successfully' : 'Load rejected');
    } catch (error) {
      toast.error('Failed to process load');
      console.error('Approve load error:', error);
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
    const csvData = clients.map((client) => ({
      Company: client.company,
      'Contact Person': client.contactPerson,
      Email: client.email,
      Phone: client.phone,
      Address: client.address,
      'Contract Details': client.contract?.contractText || 'N/A',
    }));
    downloadCSV(csvData, `clients-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Clients exported to CSV');
  };

  const handleExportTransporters = () => {
    const csvData = transporters.map((transporter) => ({
      Company: transporter.company,
      'Contact Person': transporter.contactPerson,
      Email: transporter.email,
      Phone: transporter.phone,
      Address: transporter.address,
      'Documents Count': transporter.documents.length,
      'Contract Details': transporter.contract?.contractText || 'N/A',
    }));
    downloadCSV(csvData, `transporters-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Transporters exported to CSV');
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Admin access is restricted to authorized accounts. Contact support at{' '}
          <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
            moleleholdings101@gmail.com
          </a>{' '}
          if you need access.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoads.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Transporters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transporters.length}</div>
            <p className="text-xs text-muted-foreground">Active transporters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loads">Load Management</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="transporters">Transporters</TabsTrigger>
          <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
          <TabsTrigger value="apk">APK Download</TabsTrigger>
          <TabsTrigger value="ads">Ad Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Loads ({pendingLoads.length})</h2>
            {loadsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading loads...</p>
              </div>
            ) : pendingLoads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending loads</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingLoads.map((load, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>Load #{index + 1}</CardTitle>
                          <CardDescription className="mt-2">{load.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Weight className="h-4 w-4" />
                            <span>{load.weight} tons</span>
                          </div>
                          {load.confirmation.orderId && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Order: {load.confirmation.orderId}</span>
                            </div>
                          )}
                          {load.confirmation.confirmationFiles.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              <span>{load.confirmation.confirmationFiles.length} document(s)</span>
                            </div>
                          )}
                        </div>
                        <LoadLocations
                          loadingLocation={load.loadingLocation}
                          offloadingLocation={load.offloadingLocation}
                        />
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(`L${index + 1}`, true)}
                            disabled={approveLoad.isPending}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprove(`L${index + 1}`, false)}
                            disabled={approveLoad.isPending}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Approved Loads ({approvedLoads.length})</h2>
            {approvedLoads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved loads</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {approvedLoads.map((load, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>Load #{index + 1}</CardTitle>
                          <CardDescription className="mt-2">{load.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Approved
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Weight className="h-4 w-4" />
                            <span>{load.weight} tons</span>
                          </div>
                          {load.confirmation.orderId && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Order: {load.confirmation.orderId}</span>
                            </div>
                          )}
                        </div>
                        <LoadLocations
                          loadingLocation={load.loadingLocation}
                          offloadingLocation={load.offloadingLocation}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registered Clients</CardTitle>
                  <CardDescription>View all registered clients with contract details</CardDescription>
                </div>
                <Button onClick={handleExportClients} disabled={clients.length === 0} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No clients registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Contract Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{client.company}</TableCell>
                          <TableCell>{client.contactPerson}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell className="max-w-xs truncate">{client.address || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {client.contract?.contractText || 'N/A'}
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

        <TabsContent value="transporters">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registered Transporters</CardTitle>
                  <CardDescription>View all registered transporters with contract details</CardDescription>
                </div>
                <Button onClick={handleExportTransporters} disabled={transporters.length === 0} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transportersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading transporters...</p>
                </div>
              ) : transporters.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transporters registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Contract Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transporters.map((transporter, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{transporter.company}</TableCell>
                          <TableCell>{transporter.contactPerson}</TableCell>
                          <TableCell>{transporter.email}</TableCell>
                          <TableCell>{transporter.phone}</TableCell>
                          <TableCell className="max-w-xs truncate">{transporter.address || 'N/A'}</TableCell>
                          <TableCell>{transporter.documents.length} file(s)</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transporter.contract?.contractText || 'N/A'}
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

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>Messages submitted through the contact form</CardDescription>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contact messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map(([principal, contact], index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <CardDescription>{contact.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Principal: {principal.toString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apk">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Android APK Download Link</CardTitle>
              </div>
              <CardDescription>
                Manage the download link for the Android app APK file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current APK Download Link</Label>
                {apkLinkLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading...</span>
                  </div>
                ) : apkLink ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <a
                      href={apkLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex-1 truncate"
                    >
                      {apkLink}
                    </a>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No APK link set</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apk-link">Set New APK Download Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="apk-link"
                    type="url"
                    placeholder="https://example.com/app.apk"
                    value={apkLinkInput}
                    onChange={(e) => setApkLinkInput(e.target.value)}
                  />
                  <Button onClick={handleSaveApkLink} disabled={setApkLink.isPending}>
                    {setApkLink.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the full URL to the APK file (e.g., from Google Drive, Dropbox, or your own server)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Ad Settings</CardTitle>
              </div>
              <CardDescription>Configure bottom ad display and snippet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ad-enabled">Enable Bottom Ad</Label>
                  <p className="text-sm text-muted-foreground">
                    Show ad banner at the bottom of pages
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
                  <Label htmlFor="ad-snippet">Ad Snippet (HTML)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAdSnippet}
                    className="h-8"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset to Default
                  </Button>
                </div>
                <Textarea
                  id="ad-snippet"
                  value={adSnippet}
                  onChange={(e) => setAdSnippet(e.target.value)}
                  placeholder="Paste your ad network HTML snippet here..."
                  className="font-mono text-xs min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Paste your ad network's HTML snippet (e.g., Google AdSense, AdMob)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <AdSnippetPreviewFrame snippet={adSnippet} />
                </div>
              </div>

              <Button onClick={handleSaveAdSettings} className="w-full">
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
  return (
    <AdminRouteErrorBoundary>
      <RequireAdmin>
        <AdminDashboardContent />
      </RequireAdmin>
    </AdminRouteErrorBoundary>
  );
}
