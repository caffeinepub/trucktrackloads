import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetYears, useAddYear, useDeleteYear } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminYearsManagementSection() {
  const { data: years = [], isLoading } = useGetYears();
  const addYear = useAddYear();
  const deleteYear = useDeleteYear();

  const [newYear, setNewYear] = useState('');
  const [yearToDelete, setYearToDelete] = useState<bigint | null>(null);

  const handleAddYear = async () => {
    const yearNum = parseInt(newYear, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2200) {
      toast.error('Please enter a valid year between 1900 and 2200');
      return;
    }

    const yearBigInt = BigInt(yearNum);
    if (years.some(y => y === yearBigInt)) {
      toast.error('This year already exists');
      return;
    }

    try {
      await addYear.mutateAsync(yearBigInt);
      toast.success(`Year ${yearNum} added successfully`);
      setNewYear('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add year');
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete) return;

    try {
      await deleteYear.mutateAsync(yearToDelete);
      toast.success(`Year ${yearToDelete.toString()} removed successfully`);
      setYearToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove year');
      setYearToDelete(null);
    }
  };

  const sortedYears = [...years].sort((a, b) => Number(b) - Number(a));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Years Management
          </CardTitle>
          <CardDescription>
            Manage the list of years available for contract selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter year (e.g., 2024)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddYear();
                }
              }}
              min="1900"
              max="2200"
              className="flex-1"
            />
            <Button
              onClick={handleAddYear}
              disabled={addYear.isPending || !newYear}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addYear.isPending ? 'Adding...' : 'Add Year'}
            </Button>
          </div>

          <div>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading years...</p>
            ) : sortedYears.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No years configured yet</p>
                <p className="text-xs mt-1">Add years above to enable contract posting</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Available Years ({sortedYears.length})</p>
                <div className="flex flex-wrap gap-2">
                  {sortedYears.map((year) => (
                    <Badge
                      key={year.toString()}
                      variant="outline"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      {year.toString()}
                      <button
                        onClick={() => setYearToDelete(year)}
                        disabled={deleteYear.isPending}
                        className="ml-1 hover:text-destructive transition-colors"
                        aria-label={`Delete year ${year.toString()}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!yearToDelete} onOpenChange={(open) => !open && setYearToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Year</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove year {yearToDelete?.toString()}? This action cannot be undone.
              Existing contracts with this year will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteYear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Year
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
