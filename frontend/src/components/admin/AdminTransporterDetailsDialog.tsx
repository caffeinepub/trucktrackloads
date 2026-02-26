import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUpdateTransporter, useDeleteTransporter, useVerifyTransporter, useGetTruckTypeOptions } from '@/hooks/useQueries';
import { TransporterDetails, ClientVerificationStatus } from '@/backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Trash2, Save, CheckCircle, XCircle, Clock, FileText, ExternalLink } from 'lucide-react';

type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

interface AdminTransporterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transporterPrincipal: Principal;
  transporterDetails: TransporterDetails;
}

export default function AdminTransporterDetailsDialog({
  open,
  onOpenChange,
  transporterPrincipal,
  transporterDetails,
}: AdminTransporterDetailsDialogProps) {
  const [company, setCompany] = useState(transporterDetails.company);
  const [contactPerson, setContactPerson] = useState(transporterDetails.contactPerson);
  const [email, setEmail] = useState(transporterDetails.email);
  const [phone, setPhone] = useState(transporterDetails.phone);
  const [address, setAddress] = useState(transporterDetails.address);

  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const updateTransporter = useUpdateTransporter();
  const deleteTransporter = useDeleteTransporter();
  const verifyTransporter = useVerifyTransporter();

  const handleUpdate = async () => {
    try {
      const updatedDetails: TransporterDetails = {
        ...transporterDetails,
        company,
        contactPerson,
        email,
        phone,
        address,
      };
      await updateTransporter.mutateAsync({ details: updatedDetails });
      toast.success('Transporter updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update transporter');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transporter? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteTransporter.mutateAsync(transporterPrincipal);
      toast.success('Transporter deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transporter');
    }
  };

  const handleVerificationChange = async (status: TransporterVerificationStatus) => {
    try {
      await verifyTransporter.mutateAsync({ transporter: transporterPrincipal, status });
      toast.success(`Transporter ${status === TransporterVerificationStatus.verified ? 'verified' : status === TransporterVerificationStatus.rejected ? 'rejected' : 'set to pending'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status');
    }
  };

  const getVerificationBadge = (status: TransporterVerificationStatus) => {
    switch (status) {
      case TransporterVerificationStatus.verified:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case TransporterVerificationStatus.pending:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case TransporterVerificationStatus.rejected:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
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
          <DialogTitle>Transporter Details</DialogTitle>
          <DialogDescription>
            View and manage transporter information and verification status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Principal ID</Label>
            <p className="text-sm font-mono break-all">{transporterPrincipal.toString()}</p>
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

            <div className="space-y-2">
              <Label>Truck Type</Label>
              <p className="text-sm">{getTruckTypeName(transporterDetails.truckType)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Verification Status</Label>
            <div className="flex items-center gap-2">
              {getVerificationBadge(transporterDetails.verificationStatus)}
              <Select
                value={transporterDetails.verificationStatus}
                onValueChange={(value) => handleVerificationChange(value as TransporterVerificationStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransporterVerificationStatus.verified}>Verified</SelectItem>
                  <SelectItem value={TransporterVerificationStatus.pending}>Pending</SelectItem>
                  <SelectItem value={TransporterVerificationStatus.rejected}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Documents</Label>
            {transporterDetails.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded</p>
            ) : (
              <div className="space-y-2 mt-2">
                {transporterDetails.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">Document {index + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.getDirectURL(), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Contracts</Label>
            <p className="text-sm text-muted-foreground">
              {transporterDetails.contracts.length} contract{transporterDetails.contracts.length !== 1 ? 's' : ''} on file
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTransporter.isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteTransporter.isPending ? 'Deleting...' : 'Delete Transporter'}
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
            disabled={updateTransporter.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateTransporter.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
