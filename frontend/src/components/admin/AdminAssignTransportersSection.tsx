import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllPendingLoadsWithIds, useGetAllApprovedLoadsWithIds, useGetTruckTypeOptions } from '@/hooks/useQueries';
import AdminAssignTransporterControl from './AdminAssignTransporterControl';

export default function AdminAssignTransportersSection() {
  const { data: pendingLoadsWithIds = [], isLoading: pendingLoading } = useGetAllPendingLoadsWithIds();
  const { data: approvedLoadsWithIds = [], isLoading: approvedLoading } = useGetAllApprovedLoadsWithIds();
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();

  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Transporters</CardTitle>
        <CardDescription>Assign or unassign transporters to loads</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Loads</TabsTrigger>
            <TabsTrigger value="approved">Approved Loads</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingLoading ? (
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
                      <TableHead>Assigned Transporter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLoadsWithIds.map(([loadId, load]) => (
                      <TableRow key={loadId}>
                        <TableCell className="font-medium">{loadId}</TableCell>
                        <TableCell className="max-w-xs truncate">{load.description}</TableCell>
                        <TableCell>{load.weight} tons</TableCell>
                        <TableCell>{getTruckTypeName(load.truckType)}</TableCell>
                        <TableCell className="min-w-[250px]">
                          <AdminAssignTransporterControl loadId={loadId} load={load} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedLoading ? (
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
                      <TableHead>Assigned Transporter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedLoadsWithIds.map(([loadId, load]) => (
                      <TableRow key={loadId}>
                        <TableCell className="font-medium">{loadId}</TableCell>
                        <TableCell className="max-w-xs truncate">{load.description}</TableCell>
                        <TableCell>{load.weight} tons</TableCell>
                        <TableCell>{getTruckTypeName(load.truckType)}</TableCell>
                        <TableCell className="min-w-[250px]">
                          <AdminAssignTransporterControl loadId={loadId} load={load} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
