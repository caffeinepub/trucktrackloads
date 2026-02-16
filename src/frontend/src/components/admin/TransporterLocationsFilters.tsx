import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { TruckTypeOption, TruckType } from '../../backend';

interface TransporterLocationsFiltersProps {
  hideWithoutLocation: boolean;
  onHideWithoutLocationChange: (value: boolean) => void;
  selectedTruckType: string;
  onTruckTypeChange: (value: string) => void;
  truckTypeOptions: TruckTypeOption[];
}

export default function TransporterLocationsFilters({
  hideWithoutLocation,
  onHideWithoutLocationChange,
  selectedTruckType,
  onTruckTypeChange,
  truckTypeOptions,
}: TransporterLocationsFiltersProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-no-location"
              checked={hideWithoutLocation}
              onCheckedChange={onHideWithoutLocationChange}
            />
            <Label htmlFor="hide-no-location" className="cursor-pointer">
              Hide transporters without location
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="truck-type-filter">Truck Type:</Label>
            <Select value={selectedTruckType} onValueChange={onTruckTypeChange}>
              <SelectTrigger id="truck-type-filter" className="w-[200px]">
                <SelectValue placeholder="All truck types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All truck types</SelectItem>
                {truckTypeOptions.map((option) => (
                  <SelectItem key={option.id.toString()} value={option.truckType}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
