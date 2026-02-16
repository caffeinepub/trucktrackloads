import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Load {
    weight: number;
    client: Principal;
    isApproved: boolean;
    description: string;
    loadingLocation: string;
    tracking?: TrackingUpdate;
    assignedTransporter?: Principal;
    confirmation: LoadConfirmation;
    offloadingLocation: string;
}
export interface TransporterDetails {
    documents: Array<ExternalBlob>;
    contract: ContractDetails;
    contactPerson: string;
    email: string;
    company: string;
    address: string;
    phone: string;
}
export interface TrackingUpdate {
    status: string;
    timestamp: bigint;
    location: string;
}
export interface LoadConfirmation {
    orderId: string;
    confirmationFiles: Array<ExternalBlob>;
}
export interface ContractDetails {
    endDate: bigint;
    contractText: string;
    startDate: bigint;
}
export interface ClientInfo {
    contract: ContractDetails;
    contactPerson: string;
    email: string;
    company: string;
    address: string;
    phone: string;
}
export interface ContactInfo {
    name: string;
    email: string;
    message: string;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveLoad(loadId: string, isApproved: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignLoad(loadId: string, transporterId: Principal): Promise<void>;
    createLoad(load: Load): Promise<string>;
    deleteLoad(loadId: string): Promise<void>;
    getAllApprovedLoads(): Promise<Array<Load>>;
    getAllClients(): Promise<Array<ClientInfo>>;
    getAllContactMessages(): Promise<Array<[Principal, ContactInfo]>>;
    getAllTransporters(): Promise<Array<TransporterDetails>>;
    getAndroidApkLink(): Promise<string | null>;
    getCallerClientInfo(): Promise<ClientInfo | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientInfo(client: Principal): Promise<ClientInfo | null>;
    getClientLoads(client: Principal): Promise<Array<Load>>;
    getLoadTracking(loadId: string): Promise<TrackingUpdate | null>;
    getTransporter(transporter: Principal): Promise<TransporterDetails | null>;
    getTransporterLoads(transporter: Principal): Promise<Array<Load>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerClientInfo(clientInfo: ClientInfo): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveContactInfo(contact: ContactInfo): Promise<void>;
    saveTransporterDetails(details: TransporterDetails): Promise<void>;
    setAndroidApkLink(link: string): Promise<void>;
    updateLoad(loadId: string, load: Load): Promise<void>;
    updateLoadTracking(loadId: string, update: TrackingUpdate): Promise<void>;
    uploadTransporterDoc(blob: ExternalBlob): Promise<void>;
}
