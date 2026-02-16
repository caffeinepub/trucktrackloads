import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";

// Apply migration on upgrade
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // ------------- Admin login password system -----------------
  var adminCredentials : (Text, Text) = ("Gushna", "Gushgesh#9");
  let hiddenAdminToken = "XXI%pccQ2024^aCFEiNE";

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    let (existingUsername, existingPassword) = adminCredentials;
    if (existingUsername == username and existingPassword == password) {
      hiddenAdminToken;
    } else {
      Runtime.trap("Incorrect username or password. Usage is restricted to admin account only!");
    };
  };

  public shared ({ caller }) func updateCredentials(username : Text, password : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update credentials");
    };
    adminCredentials := (username, password);
  };

  // Trucking system
  public type TruckType = {
    #triaxle;
    #superlinkFlatdeck;
    #sideTipper;
  };

  public type TruckTypeOption = {
    id : Nat;
    name : Text;
    truckType : TruckType;
  };

  type ContactInfo = {
    name : Text;
    email : Text;
    message : Text;
  };

  public type Contract = {
    contractText : Text;
    startDate : Int;
    endDate : Int;
  };

  public type ClientVerificationStatus = {
    #verified;
    #pending;
    #rejected;
  };

  public type ClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    contracts : [Contract];
    verificationStatus : ClientVerificationStatus;
  };

  type LoadConfirmation = {
    orderId : Text;
    confirmationFiles : [Storage.ExternalBlob];
  };

  public type TransporterVerificationStatus = {
    #verified;
    #pending;
    #rejected;
  };

  public type TransporterDetails = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    documents : [Storage.ExternalBlob];
    contracts : [Contract];
    verificationStatus : TransporterVerificationStatus;
    truckType : TruckType;
  };

  public type Load = {
    client : Principal;
    description : Text;
    weight : Float;
    loadingLocation : Text;
    offloadingLocation : Text;
    truckType : TruckType;
    isApproved : Bool;
    assignedTransporter : ?Principal;
    tracking : ?TrackingUpdate;
    confirmation : LoadConfirmation;
  };

  public type TrackingUpdate = {
    location : Text;
    status : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type LiveLocation = {
    latitude : Float;
    longitude : Float;
    locationName : Text;
    timestamp : Int;
  };

  public type TransporterLocationUpdate = {
    transporterId : Principal;
    location : LiveLocation;
    truckType : TruckType;
    timestamp : Int;
  };

  public type LocationEvidence = {
    transporterId : Principal;
    location : LiveLocation;
    screenshot : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  public type TransporterStatus = {
    statusText : Text;
    timestamp : Int;
  };

  // Data Stores
  let clients = Map.empty<Principal, ClientInfo>();
  let transporters = Map.empty<Principal, TransporterDetails>();
  let loads = Map.empty<Text, Load>();
  var loadCount = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let liveLocations = Map.empty<Principal, LiveLocation>();
  let locationEvidenceStore = Map.empty<Principal, [LocationEvidence]>();
  let transporterStatusMap = Map.empty<Principal, TransporterStatus>();

  var androidApkLink : ?Text = null;

  // New Approval Methods
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // App Methods
  public query ({ caller }) func getAndroidApkLink() : async ?Text {
    androidApkLink;
  };

  public shared ({ caller }) func setAndroidApkLink(link : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set APK download link");
    };
    androidApkLink := ?link;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Contact mechanism
  let contacts = Map.empty<Principal, ContactInfo>();

  public shared ({ caller }) func saveContactInfo(contact : ContactInfo) : async () {
    contacts.add(caller, contact);
  };

  public query ({ caller }) func getAllContactMessages() : async [(Principal, ContactInfo)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    let iter = contacts.entries();
    iter.toArray();
  };

  public shared ({ caller }) func registerClient(clientInfo : ClientInfo) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can register as clients");
    };

    let clientWithPendingStatus = { clientInfo with verificationStatus = #pending };

    clients.add(caller, clientWithPendingStatus);
  };

  public shared ({ caller }) func verifyClient(client : Principal, status : ClientVerificationStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify clients");
    };

    let existing = switch (clients.get(client)) {
      case (null) {
        Runtime.trap("No client found for provided principal");
      };
      case (?clientInfo) {
        clientInfo;
      };
    };

    let updatedClient = { existing with verificationStatus = status };
    clients.add(client, updatedClient);
  };

  public shared ({ caller }) func registerTransporter(details : TransporterDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as transporters");
    };

    let detailsWithPendingStatus = {
      details with
      verificationStatus = #pending;
    };
    transporters.add(caller, detailsWithPendingStatus);
  };

  public shared ({ caller }) func verifyTransporter(transporter : Principal, status : TransporterVerificationStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify transporters");
    };

    let existing = switch (transporters.get(transporter)) {
      case (null) {
        Runtime.trap("No transporter found for provided principal");
      };
      case (?transporterInfo) {
        transporterInfo;
      };
    };

    let updatedTransporter = { existing with verificationStatus = status };
    transporters.add(transporter, updatedTransporter);
  };

  public shared ({ caller }) func uploadTransporterDoc(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload transporter docs");
    };
    let existing = switch (transporters.get(caller)) {
      case (null) {
        Runtime.trap("No transporter details found for caller");
      };
      case (?transporter) {
        transporter;
      };
    };
    let updatedDocs = existing.documents.concat([blob]);
    let updated = { existing with documents = updatedDocs };
    transporters.add(caller, updated);
  };

  public query ({ caller }) func getCallerClientInfo() : async ?ClientInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    clients.get(caller);
  };

  public query ({ caller }) func getClientInfo(client : Principal) : async ?ClientInfo {
    if (caller != client and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view any");
    };
    clients.get(client);
  };

  public query ({ caller }) func getAllClients() : async [ClientInfo] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all clients");
    };
    let iter = clients.values();
    iter.toArray();
  };

  // Transporter loadboard
  public query ({ caller }) func getTransporterLoadBoard() : async [Load] {
    if (not isVerifiedTransporter(caller)) {
      Runtime.trap("Unauthorized: Only transporters can access this route");
    };
    let allLoads = loads.values().toArray();
    allLoads.filter(func(l) { l.isApproved });
  };

  // Helper function to check if caller is verified transporter
  func isVerifiedTransporter(caller : Principal) : Bool {
    switch (transporters.get(caller)) {
      case (null) {
        false;
      };
      case (?details) {
        details.verificationStatus == #verified;
      };
    };
  };

  public query ({ caller }) func getCallerTransporterDetails() : async ?TransporterDetails {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    transporters.get(caller);
  };

  public query ({ caller }) func getTransporter(transporter : Principal) : async ?TransporterDetails {
    if (caller != transporter and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view any");
    };
    transporters.get(transporter);
  };

  public query ({ caller }) func getAllTransporters() : async [TransporterDetails] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all transporters");
    };
    let iter = transporters.values();
    iter.toArray();
  };

  public shared ({ caller }) func createLoad(load : Load) : async Text {
    let clientInfo = switch (clients.get(caller)) {
      case (null) {
        Runtime.trap("Client not found for provided principal");
      };
      case (?clientInfo) { clientInfo };
    };

    if (clientInfo.verificationStatus != #verified) {
      Runtime.trap("Unauthorized: Only verified clients can create loads");
    };

    if (load.client != caller) {
      Runtime.trap("Unauthorized: Cannot create loads for other users");
    };

    if (load.isApproved) {
      Runtime.trap("Unauthorized: Cannot create pre-approved loads");
    };

    if (load.assignedTransporter != null) {
      Runtime.trap("Unauthorized: Cannot create loads with pre-assigned transporters");
    };

    loadCount += 1;
    let loadId = "L" # loadCount.toText();

    switch (load.truckType) {
      case (#triaxle or #superlinkFlatdeck or #sideTipper) {
        loads.add(loadId, { load with truckType = load.truckType });
      };
    };
    loadId;
  };

  public shared ({ caller }) func approveLoad(loadId : Text, isApproved : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve loads");
    };
    let load = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };
    if (isApproved) {
      let approved : Load = {
        load with isApproved = true;
      };
      loads.add(loadId, approved);
    } else {
      loads.remove(loadId);
    };
  };

  // Contracts
  public shared ({ caller }) func postContract(contract : Contract) : async () {
    switch (clients.get(caller)) {
      case (null) {
        Runtime.trap("Client not found");
      };
      case (?clientInfo) {
        if (clientInfo.verificationStatus != #verified) {
          Runtime.trap("Unauthorized: Only verified clients can post contracts");
        };
        let updatedContracts = clientInfo.contracts.concat([contract]);
        let updatedInfo = { clientInfo with contracts = updatedContracts };
        clients.add(caller, updatedInfo);
      };
    };
  };

  public query ({ caller }) func getContracts() : async [Contract] {
    if (not isVerifiedTransporter(caller)) {
      Runtime.trap("Unauthorized: Only transporters can view contracts");
    };
    getAllVerifiedContracts();
  };

  func getAllVerifiedContracts() : [Contract] {
    let allClients = clients.values().toArray();
    let verifiedClients = allClients.filter(func(c) { c.verificationStatus == #verified });
    verifiedClients.map(
        func(client) {
          client.contracts;
        }
      ).flatten<Contract>();
  };

  public query ({ caller }) func getClientContracts(client : Principal) : async [Contract] {
    switch (clients.get(client)) {
      case (null) {
        Runtime.trap("Client not found");
      };
      case (?clientInfo) { clientInfo.contracts };
    };
  };

  public shared ({ caller }) func assignLoad(loadId : Text, transporterId : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign transporters");
    };
    let existing = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };
    let load : Load = {
      existing with assignedTransporter = ?transporterId;
    };
    loads.add(loadId, load);
  };

  public shared ({ caller }) func updateLoad(loadId : Text, load : Load) : async () {
    let existing = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwner = existing.client == caller;

    if (not isAdmin and not isOwner) {
      Runtime.trap("Unauthorized: Only admins or the load owner can update a load");
    };

    // Non-admin owners can only update certain fields
    if (not isAdmin and isOwner) {
      if (load.client != existing.client) {
        Runtime.trap("Unauthorized: Cannot change load owner");
      };

      if (load.isApproved != existing.isApproved) {
        Runtime.trap("Unauthorized: Only admins can change approval status");
      };

      if (load.assignedTransporter != existing.assignedTransporter) {
        Runtime.trap("Unauthorized: Only admins can change assigned transporter");
      };
    };

    loads.add(loadId, load);
  };

  public shared ({ caller }) func deleteLoad(loadId : Text) : async () {
    let existing = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and existing.client != caller) {
      Runtime.trap("Unauthorized: Only admins or the load owner can delete a load");
    };
    loads.remove(loadId);
  };

  public query ({ caller }) func getClientLoads(client : Principal) : async [Load] {
    if (caller != client and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own loads or admin can view any");
    };
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { l.client == client });
  };

  public query ({ caller }) func getTransporterLoads(transporter : Principal) : async [Load] {
    if (caller != transporter and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own assigned loads or admin can view any");
    };
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { l.assignedTransporter == ?transporter });
  };

  public query ({ caller }) func getAllApprovedLoads() : async [Load] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view the load board");
    };
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { l.isApproved });
  };

  public query ({ caller }) func getAllPendingLoads() : async [Load] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pending loads");
    };
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { not l.isApproved });
  };

  // Tracking
  public query ({ caller }) func getLoadTracking(loadId : Text) : async ?TrackingUpdate {
    let load = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };
    let isClient = load.client == caller;
    let isAssignedTransporter = load.assignedTransporter == ?caller;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not (isClient or isAssignedTransporter or isAdmin)) {
      Runtime.trap("Unauthorized: Only the client, assigned transporter, or admin can view tracking");
    };

    load.tracking;
  };

  public shared ({ caller }) func updateLoadTracking(loadId : Text, update : TrackingUpdate) : async () {
    let load = switch (loads.get(loadId)) {
      case (null) {
        Runtime.trap("No load with id " # loadId # " exists");
      };
      case (?profile) { profile };
    };
    if (load.assignedTransporter != ?caller) {
      Runtime.trap("Unauthorized: Only the assigned transporter can update tracking for this load");
    };
    let updated = {
      load with tracking = ?update;
    };
    loads.add(loadId, updated);
  };

  // Truck Type Options
  public query ({ caller }) func getTruckTypeOptions() : async [TruckTypeOption] {
    Array.tabulate<TruckTypeOption>(
      3,
      func(i) {
        switch (i) {
          case (0) { { id = 0; name = "Triaxle"; truckType = #triaxle } };
          case (1) { { id = 1; name = "Superlink Flatdeck"; truckType = #superlinkFlatdeck } };
          case (2) { { id = 2; name = "Side Tipper"; truckType = #sideTipper } };
          case (_) { { id = 0; name = "Triaxle"; truckType = #triaxle } };
        };
      },
    );
  };

  // --- NEW STORAGE API FUNCTIONS ----

  // Transporter Live Location Tracking
  public shared ({ caller }) func updateTransporterLocation(location : LiveLocation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only signed-in transporters can submit location updates");
    };

    let transporterDetails = switch (transporters.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only registered transporters can submit location updates") };
      case (?details) { details };
    };

    let locationWithTimestamp : LiveLocation = {
      location with timestamp = Time.now();
    };

    liveLocations.add(caller, locationWithTimestamp);
  };

  // Admin-only function to get all transporter locations and details
  public query ({ caller }) func getAllTransportersWithLocations() : async [(Principal, TransporterDetails, ?LiveLocation)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view transporter locations");
    };

    let transportersArray = transporters.toArray();
    let result = Array.tabulate(
      transportersArray.size(),
      func(i) {
        let (transporterId, details) = transportersArray[i];
        let location = liveLocations.get(transporterId);
        (transporterId, details, location);
      },
    );
    result;
  };

  // New function to handle location screenshots
  public shared ({ caller }) func addLocationEvidence(location : LiveLocation, screenshot : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only signed-in users can submit location evidence");
    };

    // Verify caller is a registered transporter
    let transporterDetails = switch (transporters.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Only registered transporters can submit location evidence") };
      case (?details) { details };
    };

    let evidence : LocationEvidence = {
      transporterId = caller;
      location;
      screenshot;
      uploadedAt = Time.now();
    };

    let existingEvidence = switch (locationEvidenceStore.get(caller)) {
      case (null) { [evidence] };
      case (?evidenceArray) { evidenceArray.concat([evidence]) };
    };

    locationEvidenceStore.add(caller, existingEvidence);
  };

  public query ({ caller }) func getLocationEvidence(transporterId : Principal) : async [LocationEvidence] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view location evidence");
    };
    switch (locationEvidenceStore.get(transporterId)) {
      case (null) { [] };
      case (?evidenceArray) { evidenceArray };
    };
  };

  // Set transporter status
  public shared ({ caller }) func setTransporterStatus(statusText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only signed-in transporters can submit statuses");
    };
    switch (transporters.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Only registered transporters can submit statuses");
      };
      case (_details) { () };
    };
    let status : TransporterStatus = {
      statusText;
      timestamp = Time.now();
    };
    transporterStatusMap.add(caller, status);
  };

  // Get individual transporter status (publicly accessible so admin can call for any transporter
  public query ({ caller }) func getTransporterStatus(transporterId : Principal) : async ?TransporterStatus {
    transporterStatusMap.get(transporterId);
  };

  // Get all transporter statuses (admin-only)
  public query ({ caller }) func getAllTransporterStatuses() : async [(Principal, TransporterStatus)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all transporter statuses");
    };
    let iter = transporterStatusMap.entries();
    iter.toArray();
  };
};
