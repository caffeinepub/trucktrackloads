import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useGetCallerClientInfo, useGetCallerTransporterDetails, usePostContract, useGetContracts } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, FileText, AlertCircle, Calendar, FileSignature } from 'lucide-react';
import ProfileSetupModal from '@/components/auth/ProfileSetupModal';
import { ClientVerificationStatus, Contract } from '../backend';
import { Link } from '@tanstack/react-router';

export default function ContractsPage() {
  const { isAuthenticated, showProfileSetup } = useAuth();
  const { data: clientInfo, isLoading: clientInfoLoading } = useGetCallerClientInfo();
  const { data: transporterDetails, isLoading: transporterLoading } = useGetCallerTransporterDetails();
  const { data: contracts = [], isLoading: contractsLoading } = useGetContracts();
  const postContract = usePostContract();

  const [contractText, setContractText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isVerifiedClient = clientInfo?.verificationStatus === ClientVerificationStatus.verified;
  const isVerifiedTransporter = transporterDetails?.verificationStatus === ClientVerificationStatus.verified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to post a contract');
      return;
    }

    if (!contractText.trim() || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startTimestamp = new Date(startDate).getTime() * 1000000; // Convert to nanoseconds
    const endTimestamp = new Date(endDate).getTime() * 1000000;

    if (endTimestamp <= startTimestamp) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await postContract.mutateAsync({
        contractText: contractText.trim(),
        startDate: BigInt(startTimestamp),
        endDate: BigInt(endTimestamp),
      });
      toast.success('Contract posted successfully!');
      setContractText('');
      setStartDate('');
      setEndDate('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to post contract';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />

      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">Contracts</h1>
          <p className="text-muted-foreground">Post and browse contract opportunities</p>
        </div>

        {!isAuthenticated ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please <Link to="/" className="text-primary hover:underline">log in</Link> to access contracts.
              If you don't have an account, register as a{' '}
              <Link to="/register/client" className="underline font-medium">client</Link> or{' '}
              <Link to="/register/transporter" className="underline font-medium">transporter</Link>.
            </AlertDescription>
          </Alert>
        ) : clientInfoLoading || transporterLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Client: Post Contract Form */}
            {isVerifiedClient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    Post a Contract
                  </CardTitle>
                  <CardDescription>Create a new contract opportunity for transporters</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract-text">Contract Details *</Label>
                      <Textarea
                        id="contract-text"
                        placeholder="Describe the contract terms, requirements, deliverables..."
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        rows={5}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date *</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date *</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={postContract.isPending} className="w-full">
                      {postContract.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting Contract...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Post Contract
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Transporter: Browse Contracts */}
            {isVerifiedTransporter && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Available Contracts
                    </CardTitle>
                    <CardDescription>Browse contract opportunities from verified clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contractsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : contracts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No contracts available at the moment</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contracts.map((contract, index) => (
                          <Card key={index} className="border-2">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">Contract #{index + 1}</CardTitle>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Available
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm whitespace-pre-wrap">{contract.contractText}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Start: {formatDate(contract.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>End: {formatDate(contract.endDate)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Access Messages */}
            {!isVerifiedClient && !isVerifiedTransporter && (
              <Card className="lg:col-span-2">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verification Required</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to be a verified client or transporter to access contracts.
                  </p>
                  {!clientInfo && !transporterDetails ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Register as:</p>
                      <div className="flex gap-4 justify-center">
                        <Button asChild variant="outline">
                          <Link to="/register/client">Client</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link to="/register/transporter">Transporter</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert className="max-w-md mx-auto">
                      <AlertDescription>
                        Your account is pending verification. You'll be able to access contracts once an admin approves your account.
                        {clientInfo && (
                          <div className="mt-2">
                            Current status: <Badge variant="outline" className="ml-2">{clientInfo.verificationStatus}</Badge>
                          </div>
                        )}
                        {transporterDetails && (
                          <div className="mt-2">
                            Current status: <Badge variant="outline" className="ml-2">{transporterDetails.verificationStatus}</Badge>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
