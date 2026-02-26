import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { ContactInfo } from '@/backend';

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
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      return;
    }
    // Backend doesn't have deleteContactMessage yet
    alert('Delete functionality not yet implemented in backend');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact Message Details</DialogTitle>
          <DialogDescription>
            View contact form submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{contact.name}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium">{contact.email}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-muted-foreground">Message</Label>
            <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-muted-foreground">Principal ID</Label>
            <p className="text-xs font-mono break-all">{principal.toString()}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Message
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
