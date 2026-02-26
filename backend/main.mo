import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import Float "mo:core/Float";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
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
    year : Nat;
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
    price : Float;
    weight : Float;
    loadingLocation : Text;
    offloadingLocation : Text;
    truckType : TruckType;
    assignedTransporter : ?Principal;
    status : Text;
    isApproved : Bool;
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

  let clients = Map.empty<Principal, ClientInfo>();
  let transporters = Map.empty<Principal, TransporterDetails>();
  let loads = Map.empty<Text, Load>();
  var loadCount = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let liveLocations = Map.empty<Principal, LiveLocation>();
  let locationEvidenceStore = Map.empty<Principal, [LocationEvidence]>();
  let transporterStatusMap = Map.empty<Principal, TransporterStatus>();
  var years = List.empty<Nat>();
  var androidApkLink : ?Text = null;
  let priceStore = Map.empty<Nat, (Float, Float)>();
  var nextPriceId = 0;
  var bottomAdEnabled : ?Bool = null;

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

  public shared ({ caller }) func deleteContactMessage(callerPrincipal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete contact messages");
    };
    contacts.remove(callerPrincipal);
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

  public shared ({ caller }) func updateTransporterDetails(details : TransporterDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update transporter details");
    };
    
    let existing = switch (transporters.get(caller)) {
      case (null) {
        Runtime.trap("No transporter details found for caller");
      };
      case (?transporter) {
        transporter;
      };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    if (not isAdmin and details.verificationStatus != existing.verificationStatus) {
      Runtime.trap("Unauthorized: Only admins can change verification status");
    };

    transporters.add(caller, details);
  };

  public shared ({ caller }) func updateCallerClientInfo(clientInfo : ClientInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update client info");
    };
    
    let existing = switch (clients.get(caller)) {
      case (null) {
        Runtime.trap("No client info found for caller");
      };
      case (?client) {
        client;
      };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    if (not isAdmin and clientInfo.verificationStatus != existing.verificationStatus) {
      Runtime.trap("Unauthorized: Only admins can change verification status");
    };

    clients.add(caller, clientInfo);
  };

  public shared ({ caller }) func deleteClient(client : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete clients");
    };
    if (clients.containsKey(client)) {
      clients.remove(client);
    } else {
      Runtime.trap("Client does not exist");
    };
  };

  public shared ({ caller }) func deleteTransporter(transporter : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete transporters");
    };
    if (transporters.containsKey(transporter)) {
      transporters.remove(transporter);
    } else {
      Runtime.trap("Transporter does not exist");
    };
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

  public query ({ caller }) func getAllClientsWithIds() : async [(Principal, ClientInfo)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all clients");
    };
    let iter = clients.entries();
    iter.toArray();
  };

  public query ({ caller }) func getTransporterLoadBoard() : async [Load] {
    if (not checkIsVerifiedTransporter(caller)) {
      Runtime.trap("Unauthorized: Only transporters can access this route");
    };
    let allLoads = loads.values().toArray();
    allLoads.filter(func(l) { l.isApproved });
  };

  func checkIsVerifiedTransporter(caller : Principal) : Bool {
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

  public query ({ caller }) func getAllTransportersWithIds() : async [(Principal, TransporterDetails)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all transporters");
    };
    let iter = transporters.entries();
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

  public query ({ caller }) func getAllPendingLoadsWithIds() : async [(Text, Load)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pending loads");
    };
    let entries = loads.entries().toArray();
    let pendingEntries = entries.filter(
      func((_, load)) {
        not load.isApproved;
      }
    );
    pendingEntries;
  };

  public query ({ caller }) func getAllApprovedLoadsWithIds() : async [(Text, Load)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all approved loads with IDs");
    };
    let entries = loads.entries().toArray();
    let approvedEntries = entries.filter(
      func((_, load)) {
        load.isApproved;
      }
    );
    approvedEntries;
  };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view contracts");
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
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwner = caller == client;
    let isVerifiedTransporter = checkIsVerifiedTransporter(caller);

    if (not (isAdmin or isOwner or isVerifiedTransporter)) {
      Runtime.trap("Unauthorized: Only the client, verified transporters, or admins can view client contracts");
    };

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

      if (load.price != existing.price) {
        Runtime.trap("Unauthorized: Only admins can update load price");
      };

      if (load.status != existing.status) {
        Runtime.trap("Unauthorized: Only admins can update load status");
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
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { l.isApproved });
  };

  public query ({ caller }) func getAllPendingLoads() : async [Load] {
    Runtime.trap("getAllPendingLoads is deprecated; use `getAllPendingLoadsWithIds` instead");
  };

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

  public query ({ caller }) func getAllTransportersWithLocations() : async [(Principal, TransporterDetails, ?LiveLocation)] {
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

  public shared ({ caller }) func addLocationEvidence(location : LiveLocation, screenshot : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only signed-in users can submit location evidence");
    };

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
    switch (locationEvidenceStore.get(transporterId)) {
      case (null) { [] };
      case (?evidenceArray) { evidenceArray };
    };
  };

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

  public query ({ caller }) func getTransporterStatus(transporterId : Principal) : async ?TransporterStatus {
    transporterStatusMap.get(transporterId);
  };

  public query ({ caller }) func getAllTransporterStatuses() : async [(Principal, TransporterStatus)] {
    let iter = transporterStatusMap.entries();
    iter.toArray();
  };

  public query ({ caller }) func getYears() : async [Nat] {
    years.toArray();
  };

  public shared ({ caller }) func addYear(year : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add years");
    };
    years.add(year);
  };

  public shared ({ caller }) func deleteYear(year : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete years");
    };
    years := years.filter(func(y) { y != year });
  };

  public shared ({ caller }) func addPrice(ratePerTonne : Float, ratePerKm : Float) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add prices");
    };
    let priceId = nextPriceId;
    priceStore.add(priceId, (ratePerTonne, ratePerKm));
    nextPriceId += 1;
    priceId;
  };

  public shared ({ caller }) func updatePrice(priceId : Nat, ratePerTonne : Float, ratePerKm : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update prices");
    };
    switch (priceStore.get(priceId)) {
      case (null) {
        Runtime.trap("No price found for priceId: " # priceId.toText());
      };
      case (?_) {
        priceStore.add(priceId, (ratePerTonne, ratePerKm));
      };
    };
  };

  public shared ({ caller }) func deletePrice(priceId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete prices");
    };
    if (priceStore.containsKey(priceId)) {
      priceStore.remove(priceId);
    } else {
      Runtime.trap("No price found for priceId: " # priceId.toText());
    };
  };

  public query ({ caller }) func getAllPrices() : async [(Float, Float)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all prices");
    };
    let iter = priceStore.values();
    iter.toArray();
  };

  public query ({ caller }) func getAllPricesWithIds() : async [(Nat, (Float, Float))] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all prices");
    };
    let iter = priceStore.entries();
    iter.toArray();
  };

  public query ({ caller }) func getPrice(priceId : Nat) : async ?(Float, Float) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view prices");
    };
    priceStore.get(priceId);
  };

  public query ({ caller }) func calculatePrice(weight : Float, distance : Float, truckType : Text) : async Float {
    let matchTruckType = func(t : Text) : Float {
      if (t == "triaxle") { 12000.0 } else if (t == "superlinkFlatdeck") { 18000.0 } else if (t == "sideTipper") {
        15000.0;
      } else {
        0.0;
      };
    };

    let baseWeight = matchTruckType(truckType);

    let baseRatePerTonne = 500.0;
    let baseRatePerKm = 100.0;

    let weightComponent = weight * baseRatePerTonne;
    let distanceComponent = distance * baseRatePerKm * (weight / baseWeight);

    weightComponent + distanceComponent;
  };
};
