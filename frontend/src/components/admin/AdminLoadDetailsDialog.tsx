import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateLoad, useDeleteLoad, useApproveLoad, useGetTruckTypeOptions, useGetAllClientsWithIds, useGetAllTransportersWithIds } from '@/hooks/useQueries';
import { Load, ClientVerificationStatus } from '@/backend';
import { toast } from 'sonner';
import { Trash2, Save, CheckCircle, XCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import LoadLocations from '../loads/LoadLocations';

type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

interface AdminLoadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadId: string;
  load: Load;
}

export default function AdminLoadDetailsDialog({
  open,
  onOpenChange,
  loadId,
  load,
}: AdminLoadDetailsDialogProps) {
  const [price, setPrice] = useState(load.price.toString());
  const [selectedClient, setSelectedClient] = useState(load.client.toString());
  const [selectedTransporter, setSelectedTransporter] = useState(load.assignedTransporter?.toString() || 'unassigned');
  const [status, setStatus] = useState(load.status);

  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const { data: clientsWithIds = [] } = useGetAllClientsWithIds();
  const { data: transportersWithIds = [] } = useGetAllTransportersWithIds();
  const updateLoad = useUpdateLoad();
  const deleteLoad = useDeleteLoad();
  const approveLoad = useApproveLoad();

  const verifiedClients = clientsWithIds.filter(
    ([_, details]) => details.verificationStatus === ClientVerificationStatus.verified
  );

  const verifiedTransporters = transportersWithIds.filter(
    ([_, details]) => details.verificationStatus === TransporterVerificationStatus.verified
  );

  const handleUpdate = async () => {
    try {
      const clientPrincipal = Principal.fromText(selectedClient);
      const transporterPrincipal = selectedTransporter === 'unassigned' ? undefined : Principal.fromText(selectedTransporter);

      const updatedLoad: Load = {
        ...load,
        price: parseFloat(price),
        client: clientPrincipal,
        assignedTransporter: transporterPrincipal,
        status,
      };
      await updateLoad.mutateAsync({ loadId, load: updatedLoad });
      toast.success('Load updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update load');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this load? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteLoad.mutateAsync(loadId);
      toast.success('Load deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete load');
    }
  };

  const handleApprove = async () => {
    try {
      await approveLoad.mutateAsync({ loadId, isApproved: true });
      toast.success('Load approved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve load');
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this load? It will be removed.')) {
      return;
    }
    try {
      await approveLoad.mutateAsync({ loadId, isApproved: false });
      toast.success('Load rejected');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject load');
    }
  };

  const handleUnapprove = async () => {
    if (!confirm('Move this load back to pending status?')) {
      return;
    }
    try {
      const unapprovedLoad: Load = { ...load, isApproved: false };
      await updateLoad.mutateAsync({ loadId, load: unapprovedLoad });
      toast.success('Load moved to pending');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unapprove load');
    }
  };

  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Details - {loadId}</DialogTitle>
          <DialogDescription>
            Edit price, client, transporter, and status for this load
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Approval Status:</Label>
            {load.isApproved ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                Pending
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Editable)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client (Editable)</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {verifiedClients.map(([principal, details]) => (
                    <SelectItem key={principal.toString()} value={principal.toString()}>
                      {details.company} - {details.contactPerson}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transporter">Assigned Transporter (Editable)</Label>
              <Select value={selectedTransporter} onValueChange={setSelectedTransporter}>
                <SelectTrigger id="transporter">
                  <SelectValue placeholder="Select transporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {verifiedTransporters.map(([principal, details]) => (
                    <SelectItem key={principal.toString()} value={principal.toString()}>
                      {details.company} - {details.contactPerson}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status (Editable)</Label>
              <Input
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g., In Transit, Delivered, etc."
              />
            </div>

            <Separator />

            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
              <Label className="text-muted-foreground">Description (View Only)</Label>
              <p className="text-sm">{load.description || 'No description'}</p>
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
              <Label className="text-muted-foreground">Weight (View Only)</Label>
              <p className="text-sm">{load.weight} tons</p>
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
              <Label className="text-muted-foreground">Truck Type (View Only)</Label>
              <p className="text-sm">{getTruckTypeName(load.truckType)}</p>
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
              <Label className="text-muted-foreground">Locations (View Only)</Label>
              <LoadLocations
                loadingLocation={load.loadingLocation}
                offloadingLocation={load.offloadingLocation}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {!load.isApproved && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={approveLoad.isPending}
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={approveLoad.isPending}
                  size="sm"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {load.isApproved && (
              <Button
                onClick={handleUnapprove}
                disabled={updateLoad.isPending}
                size="sm"
                variant="outline"
              >
                Move to Pending
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLoad.isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteLoad.isPending ? 'Deleting...' : 'Delete Load'}
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
            disabled={updateLoad.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateLoad.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
