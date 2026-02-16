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
    status: string;
    client: Principal;
    isApproved: boolean;
    description: string;
    truckType: TruckType;
    loadingLocation: string;
    tracking?: TrackingUpdate;
    assignedTransporter?: Principal;
    confirmation: LoadConfirmation;
    price: number;
    offloadingLocation: string;
}
export interface LiveLocation {
    latitude: number;
    longitude: number;
    timestamp: bigint;
    locationName: string;
}
export interface ClientInfo {
    contactPerson: string;
    email: string;
    company: string;
    contracts: Array<Contract>;
    address: string;
    phone: string;
    verificationStatus: ClientVerificationStatus;
}
export interface TruckTypeOption {
    id: bigint;
    name: string;
    truckType: TruckType;
}
export interface TransporterStatus {
    timestamp: bigint;
    statusText: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface TransporterDetails {
    documents: Array<ExternalBlob>;
    contactPerson: string;
    email: string;
    truckType: TruckType;
    company: string;
    contracts: Array<Contract>;
    address: string;
    phone: string;
    verificationStatus: TransporterVerificationStatus;
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
export interface Contract {
    endDate: bigint;
    year: bigint;
    contractText: string;
    startDate: bigint;
}
export interface LocationEvidence {
    transporterId: Principal;
    screenshot: ExternalBlob;
    location: LiveLocation;
    uploadedAt: bigint;
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
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ClientVerificationStatus {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export enum TruckType {
    triaxle = "triaxle",
    superlinkFlatdeck = "superlinkFlatdeck",
    sideTipper = "sideTipper"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLocationEvidence(location: LiveLocation, screenshot: ExternalBlob): Promise<void>;
    addYear(year: bigint): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    approveLoad(loadId: string, isApproved: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignLoad(loadId: string, transporterId: Principal): Promise<void>;
    createLoad(load: Load): Promise<string>;
    deleteLoad(loadId: string): Promise<void>;
    deleteYear(year: bigint): Promise<void>;
    getAllApprovedLoads(): Promise<Array<Load>>;
    getAllApprovedLoadsWithIds(): Promise<Array<[string, Load]>>;
    getAllClients(): Promise<Array<ClientInfo>>;
    getAllClientsWithIds(): Promise<Array<[Principal, ClientInfo]>>;
    getAllContactMessages(): Promise<Array<[Principal, ContactInfo]>>;
    getAllPendingLoads(): Promise<Array<Load>>;
    getAllPendingLoadsWithIds(): Promise<Array<[string, Load]>>;
    getAllTransporterStatuses(): Promise<Array<[Principal, TransporterStatus]>>;
    getAllTransporters(): Promise<Array<TransporterDetails>>;
    getAllTransportersWithIds(): Promise<Array<[Principal, TransporterDetails]>>;
    getAllTransportersWithLocations(): Promise<Array<[Principal, TransporterDetails, LiveLocation | null]>>;
    getAndroidApkLink(): Promise<string | null>;
    getCallerClientInfo(): Promise<ClientInfo | null>;
    getCallerTransporterDetails(): Promise<TransporterDetails | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientContracts(client: Principal): Promise<Array<Contract>>;
    getClientInfo(client: Principal): Promise<ClientInfo | null>;
    getClientLoads(client: Principal): Promise<Array<Load>>;
    getContracts(): Promise<Array<Contract>>;
    getLoadTracking(loadId: string): Promise<TrackingUpdate | null>;
    getLocationEvidence(transporterId: Principal): Promise<Array<LocationEvidence>>;
    getTransporter(transporter: Principal): Promise<TransporterDetails | null>;
    getTransporterLoadBoard(): Promise<Array<Load>>;
    getTransporterLoads(transporter: Principal): Promise<Array<Load>>;
    getTransporterStatus(transporterId: Principal): Promise<TransporterStatus | null>;
    getTruckTypeOptions(): Promise<Array<TruckTypeOption>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getYears(): Promise<Array<bigint>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    postContract(contract: Contract): Promise<void>;
    registerClient(clientInfo: ClientInfo): Promise<void>;
    registerTransporter(details: TransporterDetails): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveContactInfo(contact: ContactInfo): Promise<void>;
    setAndroidApkLink(link: string): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setTransporterStatus(statusText: string): Promise<void>;
    updateCredentials(username: string, password: string): Promise<void>;
    updateLoad(loadId: string, load: Load): Promise<void>;
    updateLoadTracking(loadId: string, update: TrackingUpdate): Promise<void>;
    updateTransporterLocation(location: LiveLocation): Promise<void>;
    uploadTransporterDoc(blob: ExternalBlob): Promise<void>;
    verifyClient(client: Principal, status: ClientVerificationStatus): Promise<void>;
    verifyTransporter(transporter: Principal, status: TransporterVerificationStatus): Promise<void>;
}
