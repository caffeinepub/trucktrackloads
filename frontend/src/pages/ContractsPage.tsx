import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerClientInfo, useGetCallerTransporterDetails, usePostContract, useGetContracts, useGetYears } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import { FileText, Send, Calendar, AlertCircle } from 'lucide-react';
import { Contract } from '@/backend';

export default function ContractsPage() {
  const { identity } = useInternetIdentity();
  const { data: clientInfo } = useGetCallerClientInfo();
  const { data: transporterDetails } = useGetCallerTransporterDetails();
  const { data: contracts = [], isLoading: contractsLoading } = useGetContracts();
  const { data: years = [], isLoading: yearsLoading } = useGetYears();
  const postContract = usePostContract();

  const [contractText, setContractText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const isVerifiedClient = clientInfo?.verificationStatus === 'verified';
  const isVerifiedTransporter = transporterDetails?.verificationStatus === 'verified';

  const handlePostContract = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedYear) {
      toast.error('Please select a year for the contract');
      return;
    }

    if (!contractText.trim() || !startDate || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (end <= start) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const contract: Contract = {
        contractText: contractText.trim(),
        startDate: BigInt(start * 1_000_000),
        endDate: BigInt(end * 1_000_000),
        year: BigInt(selectedYear),
      };

      await postContract.mutateAsync(contract);
      toast.success('Contract posted successfully');
      setContractText('');
      setStartDate('');
      setEndDate('');
      setSelectedYear('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post contract');
    }
  };

  const sortedYears = [...years].sort((a, b) => Number(b) - Number(a));

  const filteredContracts = yearFilter === 'all'
    ? contracts
    : contracts.filter(c => c.year.toString() === yearFilter);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString();
  };

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Contracts</CardTitle>
            <CardDescription>Please sign in to access contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You need to be signed in to view or post contracts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contracts</h1>
        <p className="text-muted-foreground">
          Post and browse transportation contracts
        </p>
      </div>

      <Tabs defaultValue={isVerifiedClient ? 'post' : 'browse'} className="space-y-6">
        <TabsList>
          {isVerifiedClient && (
            <TabsTrigger value="post">
              <Send className="h-4 w-4 mr-2" />
              Post Contract
            </TabsTrigger>
          )}
          <TabsTrigger value="browse">
            <FileText className="h-4 w-4 mr-2" />
            Browse Contracts
          </TabsTrigger>
        </TabsList>

        {isVerifiedClient && (
          <TabsContent value="post">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Contract</CardTitle>
                <CardDescription>
                  Share contract details with verified transporters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {years.length === 0 && !yearsLoading ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No years are currently available for contract posting. Please contact an administrator to add years before posting contracts.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handlePostContract} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Contract Year *</Label>
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                        disabled={yearsLoading || years.length === 0}
                      >
                        <SelectTrigger id="year">
                          <SelectValue placeholder={yearsLoading ? 'Loading years...' : 'Select year'} />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedYears.map((year) => (
                            <SelectItem key={year.toString()} value={year.toString()}>
                              {year.toString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contractText">Contract Details *</Label>
                      <Textarea
                        id="contractText"
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        placeholder="Enter contract terms, requirements, and details..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={postContract.isPending || years.length === 0}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {postContract.isPending ? 'Posting...' : 'Post Contract'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Available Contracts</CardTitle>
                  <CardDescription>
                    {isVerifiedTransporter
                      ? 'Browse contracts from verified clients'
                      : 'Only verified transporters can view contracts'}
                  </CardDescription>
                </div>
                {isVerifiedTransporter && contracts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="yearFilter" className="text-sm">Filter by year:</Label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger id="yearFilter" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {Array.from(new Set(contracts.map(c => c.year.toString()))).sort((a, b) => Number(b) - Number(a)).map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isVerifiedTransporter ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must be a verified transporter to view contracts. Please complete your registration and wait for verification.
                  </AlertDescription>
                </Alert>
              ) : contractsLoading ? (
                <p className="text-muted-foreground">Loading contracts...</p>
              ) : filteredContracts.length === 0 ? (
                <p className="text-muted-foreground">
                  {yearFilter === 'all' ? 'No contracts available' : `No contracts available for year ${yearFilter}`}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredContracts.map((contract, index) => (
                    <Card key={index} className="border-l-4 border-l-accent">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-accent" />
                            <CardTitle className="text-lg">Contract {index + 1}</CardTitle>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {contract.year.toString()}
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{contract.contractText}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
