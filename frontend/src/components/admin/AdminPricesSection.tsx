import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetAllPricesWithIds, useAddPrice, useUpdatePrice, useDeletePrice } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminPricesSection() {
  const { data: pricesWithIds = [], isLoading } = useGetAllPricesWithIds();
  const addPrice = useAddPrice();
  const updatePrice = useUpdatePrice();
  const deletePrice = useDeletePrice();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{ id: bigint; ratePerTonne: number; ratePerKm: number } | null>(null);

  const [newRatePerTonne, setNewRatePerTonne] = useState('');
  const [newRatePerKm, setNewRatePerKm] = useState('');

  const handleAddPrice = async () => {
    const ratePerTonne = parseFloat(newRatePerTonne);
    const ratePerKm = parseFloat(newRatePerKm);

    if (isNaN(ratePerTonne) || isNaN(ratePerKm) || ratePerTonne <= 0 || ratePerKm <= 0) {
      toast.error('Please enter valid positive numbers for both rates');
      return;
    }

    try {
      await addPrice.mutateAsync({ ratePerTonne, ratePerKm });
      toast.success('Price added successfully');
      setIsAddDialogOpen(false);
      setNewRatePerTonne('');
      setNewRatePerKm('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add price');
    }
  };

  const handleUpdatePrice = async () => {
    if (!editingPrice) return;

    const ratePerTonne = parseFloat(newRatePerTonne);
    const ratePerKm = parseFloat(newRatePerKm);

    if (isNaN(ratePerTonne) || isNaN(ratePerKm) || ratePerTonne <= 0 || ratePerKm <= 0) {
      toast.error('Please enter valid positive numbers for both rates');
      return;
    }

    try {
      await updatePrice.mutateAsync({ priceId: editingPrice.id, ratePerTonne, ratePerKm });
      toast.success('Price updated successfully');
      setIsEditDialogOpen(false);
      setEditingPrice(null);
      setNewRatePerTonne('');
      setNewRatePerKm('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update price');
    }
  };

  const handleDeletePrice = async (priceId: bigint) => {
    if (!confirm('Are you sure you want to delete this price?')) return;

    try {
      await deletePrice.mutateAsync(priceId);
      toast.success('Price deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete price');
    }
  };

  const openEditDialog = (id: bigint, ratePerTonne: number, ratePerKm: number) => {
    setEditingPrice({ id, ratePerTonne, ratePerKm });
    setNewRatePerTonne(ratePerTonne.toString());
    setNewRatePerKm(ratePerKm.toString());
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prices</CardTitle>
              <CardDescription>Manage pricing rates for loads</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Price
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading prices...</p>
          ) : pricesWithIds.length === 0 ? (
            <p className="text-muted-foreground">No prices configured</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price ID</TableHead>
                    <TableHead>Rate per Tonne</TableHead>
                    <TableHead>Rate per Km</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricesWithIds.map(([priceId, [ratePerTonne, ratePerKm]]) => (
                    <TableRow key={priceId.toString()}>
                      <TableCell className="font-medium">{priceId.toString()}</TableCell>
                      <TableCell>R {ratePerTonne.toFixed(2)}</TableCell>
                      <TableCell>R {ratePerKm.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openEditDialog(priceId, ratePerTonne, ratePerKm)}
                            size="sm"
                            variant="outline"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeletePrice(priceId)}
                            size="sm"
                            variant="outline"
                            disabled={deletePrice.isPending}
                          >
                            {deletePrice.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
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

      {/* Add Price Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Price</DialogTitle>
            <DialogDescription>Enter the pricing rates for loads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-rate-per-tonne">Rate per Tonne (R)</Label>
              <Input
                id="add-rate-per-tonne"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={newRatePerTonne}
                onChange={(e) => setNewRatePerTonne(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-rate-per-km">Rate per Km (R)</Label>
              <Input
                id="add-rate-per-km"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={newRatePerKm}
                onChange={(e) => setNewRatePerKm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrice} disabled={addPrice.isPending}>
              {addPrice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Price'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
            <DialogDescription>Update the pricing rates</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rate-per-tonne">Rate per Tonne (R)</Label>
              <Input
                id="edit-rate-per-tonne"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={newRatePerTonne}
                onChange={(e) => setNewRatePerTonne(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rate-per-km">Rate per Km (R)</Label>
              <Input
                id="edit-rate-per-km"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={newRatePerKm}
                onChange={(e) => setNewRatePerKm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrice} disabled={updatePrice.isPending}>
              {updatePrice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Price'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
