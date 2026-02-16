import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useAdminToken } from './useAdminToken';
import type { ContactInfo, ClientInfo, TransporterDetails, Load, TrackingUpdate, ClientVerificationStatus, TruckTypeOption, LiveLocation, LocationEvidence, TransporterStatus } from '../backend';
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
  const { identity } = useInternetIdentity();
  const adminToken = useAdminToken();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', adminToken],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    // Enable if actor is ready and either:
    // - User is authenticated with II, OR
    // - Password admin session exists
    enabled: !!actor && !actorFetching && (!!identity || !!adminToken),
    retry: false,
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
    refetchInterval: 30000, // Refetch every 30 seconds for updates
  });
}

// APK Download Link
export function useGetAndroidApkLink() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['androidApkLink'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoads'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
    },
  });
}

export function useGetClientLoads(client: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['clientLoads', client?.toString()],
    queryFn: async () => {
      if (!actor || !client) throw new Error('Actor or client not available');
      return actor.getClientLoads(client);
    },
    enabled: !!actor && !actorFetching && !!client,
  });
}

export function useGetAllApprovedLoads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
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

  return useQuery({
    queryKey: ['pendingLoads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingLoads();
    },
    enabled: !!actor && !actorFetching,
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
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLoads'] });
      queryClient.invalidateQueries({ queryKey: ['pendingLoads'] });
      queryClient.invalidateQueries({ queryKey: ['clientLoads'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });
}
