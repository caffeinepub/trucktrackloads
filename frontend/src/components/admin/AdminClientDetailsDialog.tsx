import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUpdateClient, useDeleteClient, useVerifyClient } from '@/hooks/useQueries';
import { ClientInfo, ClientVerificationStatus } from '@/backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Trash2, Save, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientPrincipal: Principal;
  clientInfo: ClientInfo;
}

export default function AdminClientDetailsDialog({
  open,
  onOpenChange,
  clientPrincipal,
  clientInfo,
}: AdminClientDetailsDialogProps) {
  const [company, setCompany] = useState(clientInfo.company);
  const [contactPerson, setContactPerson] = useState(clientInfo.contactPerson);
  const [email, setEmail] = useState(clientInfo.email);
  const [phone, setPhone] = useState(clientInfo.phone);
  const [address, setAddress] = useState(clientInfo.address);

  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const verifyClient = useVerifyClient();

  const handleUpdate = async () => {
    try {
      const updatedInfo: ClientInfo = {
        ...clientInfo,
        company,
        contactPerson,
        email,
        phone,
        address,
      };
      await updateClient.mutateAsync({ clientInfo: updatedInfo });
      toast.success('Client updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update client');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteClient.mutateAsync(clientPrincipal);
      toast.success('Client deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete client');
    }
  };

  const handleVerificationChange = async (status: ClientVerificationStatus) => {
    try {
      await verifyClient.mutateAsync({ client: clientPrincipal, status });
      toast.success(`Client ${status === ClientVerificationStatus.verified ? 'verified' : status === ClientVerificationStatus.rejected ? 'rejected' : 'set to pending'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status');
    }
  };

  const getVerificationBadge = (status: ClientVerificationStatus) => {
    switch (status) {
      case ClientVerificationStatus.verified:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case ClientVerificationStatus.pending:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case ClientVerificationStatus.rejected:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>
            View and manage client information and verification status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Principal ID</Label>
            <p className="text-sm font-mono break-all">{clientPrincipal.toString()}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Business address"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Verification Status</Label>
            <div className="flex items-center gap-2">
              {getVerificationBadge(clientInfo.verificationStatus)}
              <Select
                value={clientInfo.verificationStatus}
                onValueChange={(value) => handleVerificationChange(value as ClientVerificationStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ClientVerificationStatus.verified}>Verified</SelectItem>
                  <SelectItem value={ClientVerificationStatus.pending}>Pending</SelectItem>
                  <SelectItem value={ClientVerificationStatus.rejected}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Contracts</Label>
            <p className="text-sm text-muted-foreground">
              {clientInfo.contracts.length} contract{clientInfo.contracts.length !== 1 ? 's' : ''} on file
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClient.isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteClient.isPending ? 'Deleting...' : 'Delete Client'}
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateClient.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateClient.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
