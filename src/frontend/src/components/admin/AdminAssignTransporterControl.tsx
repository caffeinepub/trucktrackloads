import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllTransportersWithIds, useAssignLoad } from '@/hooks/useQueries';
import { Load, ClientVerificationStatus } from '@/backend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type TransporterVerificationStatus = ClientVerificationStatus;
const TransporterVerificationStatus = ClientVerificationStatus;

interface AdminAssignTransporterControlProps {
  loadId: string;
  load: Load;
}

export default function AdminAssignTransporterControl({ loadId, load }: AdminAssignTransporterControlProps) {
  const { data: transportersWithIds = [], isLoading } = useGetAllTransportersWithIds();
  const assignLoad = useAssignLoad();

  const verifiedTransporters = transportersWithIds.filter(
    ([_, details]) => details.verificationStatus === TransporterVerificationStatus.verified
  );

  const handleAssign = async (value: string) => {
    try {
      if (value === 'unassigned') {
        await assignLoad.mutateAsync({ loadId, transporterId: null });
        toast.success('Transporter unassigned');
      } else {
        const [principal] = verifiedTransporters.find(([p]) => p.toString() === value) || [];
        if (principal) {
          await assignLoad.mutateAsync({ loadId, transporterId: principal });
          toast.success('Transporter assigned successfully');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign transporter');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading transporters...
      </div>
    );
  }

  const currentValue = load.assignedTransporter?.toString() || 'unassigned';

  return (
    <Select value={currentValue} onValueChange={handleAssign} disabled={assignLoad.isPending}>
      <SelectTrigger className="w-full">
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
  );
}
