import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useAdminToken } from './useAdminToken';
import type { ContactInfo, ClientInfo, TransporterDetails, Load, TrackingUpdate, ClientVerificationStatus, TruckTypeOption, LiveLocation, LocationEvidence, TransporterStatus, Contract } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// TransporterVerificationStatus has the same shape as ClientVerificationStatus
type TransporterVerificationStatus = ClientVerificationStatus;

// Contact Messages
export function useSaveContactInfo() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (contact: ContactInfo) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveContactInfo(contact);
    },
  });
}

export function useGetAllContactMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['contactMessages'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllContactMessages();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin verification
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const adminToken = useAdminToken();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', adminToken],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Ensure actor is initialized with admin token before verification
      if (adminToken) {
        await actor._initializeAccessControlWithSecret(adminToken);
      }
      
      return actor.isCallerAdmin();
    },
    // Only enable if actor is ready AND password admin session exists
    enabled: !!actor && !actorFetching && !!adminToken,
    retry: 1,
    staleTime: 0, // Always refetch to ensure fresh verification
  });
}

// Client Info
export function useGetCallerClientInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ClientInfo | null>({
    queryKey: ['currentClientInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerClientInfo();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRegisterClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientInfo: ClientInfo) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerClient(clientInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentClientInfo'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      queryClient.invalidateQueries({ queryKey: ['allClientsWithIds'] });
    },
  });
}

export function useVerifyClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ client, status }: { client: Principal; status: ClientVerificationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyClient(client, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentClientInfo'] });
      queryClient.invalidateQueries({ queryKey: ['allClients'] });
      queryClient.invalidateQueries({ queryKey: ['allClientsWithIds'] });
    },
  });
}

export function useGetAllClients() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allClients'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllClients();
    },
    enabled: !!actor && !actorFetching,
  });
}

// NEW: Get all clients with their Principal IDs
export function useGetAllClientsWithIds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, ClientInfo]>>({
    queryKey: ['allClientsWithIds'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllClientsWithIds();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Transporter
export function useGetCallerTransporterDetails() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TransporterDetails | null>({
    queryKey: ['currentTransporterDetails'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerTransporterDetails();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useRegisterTransporter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: TransporterDetails) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerTransporter(details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
      queryClient.invalidateQueries({ queryKey: ['currentTransporterDetails'] });
      queryClient.invalidateQueries({ queryKey: ['allTransportersWithIds'] });
    },
  });
}

export function useVerifyTransporter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transporter, status }: { transporter: Principal; status: TransporterVerificationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyTransporter(transporter, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentTransporterDetails'] });
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
      queryClient.invalidateQueries({ queryKey: ['transportersWithLocations'] });
      queryClient.invalidateQueries({ queryKey: ['allTransportersWithIds'] });
    },
  });
}

export function useGetAllTransporters() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['transporters'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransporters();
    },
    enabled: !!actor && !actorFetching,
  });
}

// NEW: Get all transporters with their Principal IDs
export function useGetAllTransportersWithIds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, TransporterDetails]>>({
    queryKey: ['allTransportersWithIds'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransportersWithIds();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Transporter Live Location
export function useUpdateTransporterLocation() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (location: LiveLocation) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTransporterLocation(location);
    },
  });
}

export function useGetAllTransportersWithLocations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, TransporterDetails, LiveLocation | null]>>({
    queryKey: ['transportersWithLocations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransportersWithLocations();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
}

// Location Evidence
export function useAddLocationEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ location, screenshot }: { location: LiveLocation; screenshot: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLocationEvidence(location, screenshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locationEvidence'] });
    },
  });
}

export function useGetLocationEvidence(transporterId: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LocationEvidence[]>({
    queryKey: ['locationEvidence', transporterId?.toString()],
    queryFn: async () => {
      if (!actor || !transporterId) throw new Error('Actor or transporter ID not available');
      return actor.getLocationEvidence(transporterId);
    },
    enabled: !!actor && !actorFetching && !!transporterId,
  });
}

// Transporter Status
export function useGetCallerTransporterStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<TransporterStatus | null>({
    queryKey: ['callerTransporterStatus'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getTransporterStatus(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useSetTransporterStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusText: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setTransporterStatus(statusText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerTransporterStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allTransporterStatuses'] });
    },
  });
}

export function useGetAllTransporterStatuses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, TransporterStatus]>>({
    queryKey: ['allTransporterStatuses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransporterStatuses();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Loads
export function useCreateLoad() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (load: Load) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLoad(load);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoadsWithIds'] });
    },
  });
}

export function useApproveLoad() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId, isApproved }: { loadId: string; isApproved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveLoad(loadId, isApproved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoadsWithIds'] });
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
      queryClient.invalidateQueries({ queryKey: ['transporterLoadBoard'] });
    },
  });
}

export function useAssignLoad() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId, transporterId }: { loadId: string; transporterId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignLoad(loadId, transporterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['transporterLoads'] });
    },
  });
}

export function useUpdateLoad() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId, load }: { loadId: string; load: Load }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLoad(loadId, load);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
      queryClient.invalidateQueries({ queryKey: ['transporterLoads'] });
      queryClient.invalidateQueries({ queryKey: ['transporterLoadBoard'] });
    },
  });
}

export function useDeleteLoad() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loadId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLoad(loadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoadsWithIds'] });
      queryClient.invalidateQueries({ queryKey: ['transporterLoadBoard'] });
    },
  });
}

export function useGetClientLoads(client: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Load[]>({
    queryKey: ['clientLoads', client?.toString()],
    queryFn: async () => {
      if (!actor || !client) return [];
      return actor.getClientLoads(client);
    },
    enabled: !!actor && !actorFetching && !!client,
  });
}

export function useGetTransporterLoads(transporter: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Load[]>({
    queryKey: ['transporterLoads', transporter?.toString()],
    queryFn: async () => {
      if (!actor || !transporter) return [];
      return actor.getTransporterLoads(transporter);
    },
    enabled: !!actor && !actorFetching && !!transporter,
  });
}

// Transporter-only load board
export function useGetTransporterLoadBoard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Load[]>({
    queryKey: ['transporterLoadBoard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTransporterLoadBoard();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllApprovedLoads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Load[]>({
    queryKey: ['approvedLoads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllApprovedLoads();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllPendingLoads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Load[]>({
    queryKey: ['pendingLoads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingLoads();
    },
    enabled: !!actor && !actorFetching,
  });
}

// NEW: Get pending loads with their IDs
export function useGetAllPendingLoadsWithIds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, Load]>>({
    queryKey: ['pendingLoadsWithIds'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingLoadsWithIds();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Tracking
export function useGetLoadTracking(loadId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrackingUpdate | null>({
    queryKey: ['loadTracking', loadId],
    queryFn: async () => {
      if (!actor || !loadId) return null;
      return actor.getLoadTracking(loadId);
    },
    enabled: !!actor && !actorFetching && !!loadId,
  });
}

export function useUpdateLoadTracking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId, update }: { loadId: string; update: TrackingUpdate }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLoadTracking(loadId, update);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loadTracking', variables.loadId] });
    },
  });
}

// Truck Types
export function useGetTruckTypeOptions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TruckTypeOption[]>({
    queryKey: ['truckTypeOptions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTruckTypeOptions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Contracts
export function usePostContract() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: Contract) => {
      if (!actor) throw new Error('Actor not available');
      return actor.postContract(contract);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentClientInfo'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useGetContracts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getContracts();
    },
    enabled: !!actor && !actorFetching,
  });
}

// APK Link
export function useGetAndroidApkLink() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['androidApkLink'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAndroidApkLink();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetAndroidApkLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAndroidApkLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['androidApkLink'] });
    },
  });
}
