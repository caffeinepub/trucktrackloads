import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Users, Mail, CheckCircle, Truck, Eye, Calendar, UserCheck, FileText, DollarSign } from 'lucide-react';
import {
  useGetAllPendingLoadsWithIds,
  useGetAllApprovedLoadsWithIds,
  useGetAllTransportersWithIds,
  useGetAllContactMessages,
  useGetAllClientsWithIds,
  useGetTruckTypeOptions,
} from '@/hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { ClientVerificationStatus } from '../../backend';
import AdminClientDetailsDialog from './AdminClientDetailsDialog';
import AdminTransporterDetailsDialog from './AdminTransporterDetailsDialog';
import AdminLoadDetailsDialog from './AdminLoadDetailsDialog';
import AdminContactMessageDetailsDialog from './AdminContactMessageDetailsDialog';
import AdminYearsManagementSection from './AdminYearsManagementSection';
import AdminAssignTransportersSection from './AdminAssignTransportersSection';
import AdminContractsSection from './AdminContractsSection';
import AdminPricesSection from './AdminPricesSection';

type TransporterVerificationStatus = ClientVerificationStatus;

export default function AdminOperationsTabs() {
  const { data: pendingLoadsWithIds = [], isLoading: pendingLoadsLoading } = useGetAllPendingLoadsWithIds();
  const { data: approvedLoadsWithIds = [], isLoading: approvedLoadsLoading } = useGetAllApprovedLoadsWithIds();
  const { data: transportersWithIds = [], isLoading: transportersLoading } = useGetAllTransportersWithIds();
  const { data: contacts = [], isLoading: contactsLoading } = useGetAllContactMessages();
  const { data: clientsWithIds = [], isLoading: clientsLoading } = useGetAllClientsWithIds();
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();

  const [selectedClient, setSelectedClient] = useState<{ principal: Principal; info: any } | null>(null);
  const [selectedTransporter, setSelectedTransporter] = useState<{ principal: Principal; details: any } | null>(null);
  const [selectedPendingLoad, setSelectedPendingLoad] = useState<{ loadId: string; load: any } | null>(null);
  const [selectedApprovedLoad, setSelectedApprovedLoad] = useState<{ loadId: string; load: any } | null>(null);
  const [selectedContact, setSelectedContact] = useState<{ principal: Principal; contact: any } | null>(null);

  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  const getVerificationBadge = (status: ClientVerificationStatus | TransporterVerificationStatus) => {
    switch (status) {
      case 'verified':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="bg-muted flex-wrap h-auto">
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="transporters">
            <Truck className="h-4 w-4 mr-2" />
            Transporters
          </TabsTrigger>
          <TabsTrigger value="pending-loads">
            <Package className="h-4 w-4 mr-2" />
            Pending Loads
          </TabsTrigger>
          <TabsTrigger value="approved-loads">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved Loads
          </TabsTrigger>
          <TabsTrigger value="assign-transporters">
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Transporters
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="prices">
            <DollarSign className="h-4 w-4 mr-2" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Mail className="h-4 w-4 mr-2" />
            Contact Messages
          </TabsTrigger>
          <TabsTrigger value="years">
            <Calendar className="h-4 w-4 mr-2" />
            Years
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
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
                        <Button
                          onClick={() => setSelectedClient({ principal, info: client })}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transporters" className="space-y-4">
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
                        <Button
                          onClick={() => setSelectedTransporter({ principal, details: transporter })}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending-loads" className="space-y-4">
          {pendingLoadsLoading ? (
            <p className="text-muted-foreground">Loading pending loads...</p>
          ) : pendingLoadsWithIds.length === 0 ? (
            <p className="text-muted-foreground">No pending loads</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Truck Type</TableHead>
                    <TableHead>Pick-up</TableHead>
                    <TableHead>Drop-off</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLoadsWithIds.map(([loadId, load]) => (
                    <TableRow key={loadId}>
                      <TableCell className="font-medium">{loadId}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.description}</TableCell>
                      <TableCell>{load.weight} tons</TableCell>
                      <TableCell>{getTruckTypeName(load.truckType)}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.loadingLocation}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.offloadingLocation}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedPendingLoad({ loadId, load })}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved-loads" className="space-y-4">
          {approvedLoadsLoading ? (
            <p className="text-muted-foreground">Loading approved loads...</p>
          ) : approvedLoadsWithIds.length === 0 ? (
            <p className="text-muted-foreground">No approved loads</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Truck Type</TableHead>
                    <TableHead>Pick-up</TableHead>
                    <TableHead>Drop-off</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedLoadsWithIds.map(([loadId, load]) => (
                    <TableRow key={loadId}>
                      <TableCell className="font-medium">{loadId}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.description}</TableCell>
                      <TableCell>{load.weight} tons</TableCell>
                      <TableCell>{getTruckTypeName(load.truckType)}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.loadingLocation}</TableCell>
                      <TableCell className="max-w-xs truncate">{load.offloadingLocation}</TableCell>
                      <TableCell>
                        {load.assignedTransporter ? (
                          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-300">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedApprovedLoad({ loadId, load })}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assign-transporters" className="space-y-4">
          <AdminAssignTransportersSection />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <AdminContractsSection />
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <AdminPricesSection />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          {contactsLoading ? (
            <p className="text-muted-foreground">Loading contact messages...</p>
          ) : contacts.length === 0 ? (
            <p className="text-muted-foreground">No contact messages</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map(([principal, contact]) => (
                    <TableRow key={principal.toString()}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell className="max-w-md truncate">{contact.message}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedContact({ principal, contact })}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="years" className="space-y-4">
          <AdminYearsManagementSection />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedClient && (
        <AdminClientDetailsDialog
          clientPrincipal={selectedClient.principal}
          clientInfo={selectedClient.info}
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
        />
      )}

      {selectedTransporter && (
        <AdminTransporterDetailsDialog
          transporterPrincipal={selectedTransporter.principal}
          transporterDetails={selectedTransporter.details}
          open={!!selectedTransporter}
          onOpenChange={(open) => !open && setSelectedTransporter(null)}
        />
      )}

      {selectedPendingLoad && (
        <AdminLoadDetailsDialog
          loadId={selectedPendingLoad.loadId}
          load={selectedPendingLoad.load}
          open={!!selectedPendingLoad}
          onOpenChange={(open) => !open && setSelectedPendingLoad(null)}
        />
      )}

      {selectedApprovedLoad && (
        <AdminLoadDetailsDialog
          loadId={selectedApprovedLoad.loadId}
          load={selectedApprovedLoad.load}
          open={!!selectedApprovedLoad}
          onOpenChange={(open) => !open && setSelectedApprovedLoad(null)}
        />
      )}

      {selectedContact && (
        <AdminContactMessageDetailsDialog
          principal={selectedContact.principal}
          contact={selectedContact.contact}
          open={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContact(null)}
        />
      )}
    </>
  );
}
