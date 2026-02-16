import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDeleteContactMessage } from '@/hooks/useQueries';
import { ContactInfo } from '@/backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { Trash2, Mail, User } from 'lucide-react';

interface AdminContactMessageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  principal: Principal;
  contact: ContactInfo;
}

export default function AdminContactMessageDetailsDialog({
  open,
  onOpenChange,
  principal,
  contact,
}: AdminContactMessageDetailsDialogProps) {
  const deleteMessage = useDeleteContactMessage();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact message?')) {
      return;
    }
    try {
      await deleteMessage.mutateAsync(principal);
      toast.success('Contact message deleted successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact message');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact Message Details</DialogTitle>
          <DialogDescription>
            View contact message information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Sender Principal ID</Label>
            <p className="text-sm font-mono break-all">{principal.toString()}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </Label>
            <p className="text-sm">{contact.name}</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <p className="text-sm">{contact.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMessage.isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMessage.isPending ? 'Deleting...' : 'Delete Message'}
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
