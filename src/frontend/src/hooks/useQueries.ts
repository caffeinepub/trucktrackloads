import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ContactInfo, ClientInfo, TransporterDetails, Load, TrackingUpdate } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

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

export function useSaveCallerClientInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientInfo: ClientInfo) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerClientInfo(clientInfo);
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
  const { identity } = useInternetIdentity();

  return useQuery<TransporterDetails | null>({
    queryKey: ['currentTransporterDetails'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const principal = identity.getPrincipal();
      return actor.getTransporter(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useSaveTransporterDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (details: TransporterDetails) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveTransporterDetails(details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
      queryClient.invalidateQueries({ queryKey: ['currentTransporterDetails'] });
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
