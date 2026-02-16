import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

// Explicit migration using the with clause

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type ContactInfo = {
    name : Text;
    email : Text;
    message : Text;
  };

  type ContractDetails = {
    contractText : Text;
    startDate : Int;
    endDate : Int;
  };

  type ClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    contract : ContractDetails;
  };

  type LoadConfirmation = {
    orderId : Text;
    confirmationFiles : [Storage.ExternalBlob];
  };

  type TransporterDetails = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    documents : [Storage.ExternalBlob];
    contract : ContractDetails;
  };

  public type Load = {
    client : Principal;
    description : Text;
    weight : Float;
    loadingLocation : Text;
    offloadingLocation : Text;
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

  // Data Stores
  let clients = Map.empty<Principal, ClientInfo>();
  let transporters = Map.empty<Principal, TransporterDetails>();
  let loads = Map.empty<Text, Load>();
  var loadCount = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();

  var androidApkLink : ?Text = null;

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

  // Contact mechanism - allows guests to submit contact forms
  let contacts = Map.empty<Principal, ContactInfo>();

  public shared ({ caller }) func saveContactInfo(contact : ContactInfo) : async () {
    // No authorization check - allows guests to submit contact forms
    contacts.add(caller, contact);
  };

  public query ({ caller }) func getAllContactMessages() : async [(Principal, ContactInfo)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    let iter = contacts.entries();
    iter.toArray();
  };

  // Clients
  public query ({ caller }) func getCallerClientInfo() : async ?ClientInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    clients.get(caller);
  };

  public query ({ caller }) func getClientInfo(client : Principal) : async ?ClientInfo {
    if (caller != client and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
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

  public shared ({ caller }) func saveCallerClientInfo(clientInfo : ClientInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    clients.add(caller, clientInfo);
  };

  // Transporters
  public shared ({ caller }) func saveTransporterDetails(details : TransporterDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register as transporters");
    };
    transporters.add(caller, details);
  };

  public query ({ caller }) func getTransporter(transporter : Principal) : async ?TransporterDetails {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view transporter details");
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

  // Loads
  public shared ({ caller }) func createLoad(load : Load) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only clients can create loads");
    };

    // Verify the caller is the client in the load
    if (load.client != caller) {
      Runtime.trap("Unauthorized: Cannot create loads for other users");
    };

    // Ensure new loads are not pre-approved or pre-assigned
    if (load.isApproved) {
      Runtime.trap("Unauthorized: Cannot create pre-approved loads");
    };

    if (load.assignedTransporter != null) {
      Runtime.trap("Unauthorized: Cannot create loads with pre-assigned transporters");
    };

    loadCount += 1;
    let loadId = "L" # loadCount.toText();
    loads.add(loadId, load);
    loadId;
  };

  public shared ({ caller }) func approveLoad(loadId : Text, isApproved : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve loads");
    };
    let load = switch (loads.get(loadId)) {
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
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

  public shared ({ caller }) func assignLoad(loadId : Text, transporterId : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign transporters");
    };
    let existing = switch (loads.get(loadId)) {
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
      case (?profile) { profile };
    };
    let load : Load = {
      existing with assignedTransporter = ?transporterId;
    };
    loads.add(loadId, load);
  };

  public shared ({ caller }) func updateLoad(loadId : Text, load : Load) : async () {
    let existing = switch (loads.get(loadId)) {
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
      case (?profile) { profile };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwner = existing.client == caller;

    if (not isAdmin and not isOwner) {
      Runtime.trap("Unauthorized: Only admins or the load owner can update a load");
    };

    // Non-admin owners can only update certain fields
    if (not isAdmin and isOwner) {
      // Verify client hasn't changed
      if (load.client != existing.client) {
        Runtime.trap("Unauthorized: Cannot change load owner");
      };

      // Verify approval status hasn't changed
      if (load.isApproved != existing.isApproved) {
        Runtime.trap("Unauthorized: Only admins can change approval status");
      };

      // Verify assigned transporter hasn't changed
      if (load.assignedTransporter != existing.assignedTransporter) {
        Runtime.trap("Unauthorized: Only admins can change assigned transporter");
      };
    };

    loads.add(loadId, load);
  };

  public shared ({ caller }) func deleteLoad(loadId : Text) : async () {
    let existing = switch (loads.get(loadId)) {
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
      case (?profile) { profile };
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and existing.client != caller) {
      Runtime.trap("Unauthorized: Only admins or the load owner can delete a load");
    };
    loads.remove(loadId);
  };

  public query ({ caller }) func getClientLoads(client : Principal) : async [Load] {
    if (caller != client and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own loads");
    };
    let iter = loads.values();
    let allLoads = iter.toArray();
    allLoads.filter(func(l) { l.client == client });
  };

  public query ({ caller }) func getTransporterLoads(transporter : Principal) : async [Load] {
    if (caller != transporter and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own assigned loads");
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

  // Tracking
  public query ({ caller }) func getLoadTracking(loadId : Text) : async ?TrackingUpdate {
    let load = switch (loads.get(loadId)) {
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
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
      case (null) { Runtime.trap("No load with id " # loadId # " exists") };
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
};
