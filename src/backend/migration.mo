import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    clients : Map.Map<Principal, OldClientInfo>;
    transporters : Map.Map<Principal, OldTransporterDetails>;
    loads : Map.Map<Text, OldLoad>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    loadCount : Nat;
  };

  type OldTransporterDetails = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    documents : [Storage.ExternalBlob];
    contracts : [OldContract];
    verificationStatus : TransporterVerificationStatus;
    truckType : TruckType;
  };

  type TruckType = {
    #triaxle;
    #superlinkFlatdeck;
    #sideTipper;
  };

  type TransporterVerificationStatus = {
    #verified;
    #pending;
    #rejected;
  };

  type OldContract = {
    contractText : Text;
    startDate : Int;
    endDate : Int;
  };

  type OldUserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type OldClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    contracts : [OldContract];
    verificationStatus : ClientVerificationStatus;
  };

  type ClientVerificationStatus = {
    #verified;
    #pending;
    #rejected;
  };

  type OldLoad = {
    client : Principal;
    description : Text;
    weight : Float;
    loadingLocation : Text;
    offloadingLocation : Text;
    truckType : TruckType;
    isApproved : Bool;
    assignedTransporter : ?Principal;
    tracking : ?OldTrackingUpdate;
    confirmation : OldLoadConfirmation;
  };

  type OldTrackingUpdate = {
    location : Text;
    status : Text;
    timestamp : Int;
  };

  type OldLoadConfirmation = {
    orderId : Text;
    confirmationFiles : [Storage.ExternalBlob];
  };

  type NewActor = {
    clients : Map.Map<Principal, ClientInfo>;
    transporters : Map.Map<Principal, TransporterDetails>;
    loads : Map.Map<Text, Load>;
    userProfiles : Map.Map<Principal, UserProfile>;
    years : List.List<Nat>;
    loadCount : Nat;
  };

  type TransporterDetails = {
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

  type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type ClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    contracts : [Contract];
    verificationStatus : ClientVerificationStatus;
  };

  type Load = {
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

  type TrackingUpdate = {
    location : Text;
    status : Text;
    timestamp : Int;
  };

  type LoadConfirmation = {
    orderId : Text;
    confirmationFiles : [Storage.ExternalBlob];
  };

  type Contract = {
    contractText : Text;
    startDate : Int;
    endDate : Int;
    year : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newClients = old.clients.map<Principal, OldClientInfo, ClientInfo>(
      func(_key, oldClient) {
        {
          oldClient with
          contracts = oldClient.contracts.map<OldContract, Contract>(
            func(oldContract) {
              {
                oldContract with
                year = 0;
              };
            }
          );
        };
      }
    );

    let newTransporters = old.transporters.map<Principal, OldTransporterDetails, TransporterDetails>(
      func(_key, oldDetails) {
        {
          oldDetails with
          contracts = oldDetails.contracts.map<OldContract, Contract>(
            func(oldContract) {
              {
                oldContract with
                year = 0;
              };
            }
          );
        };
      }
    );

    let newLoads = old.loads.map<Text, OldLoad, Load>(
      func(_key, oldLoad) {
        {
          oldLoad with
          price = 0.0;
          status = "";
        };
      }
    );

    {
      old with
      clients = newClients;
      transporters = newTransporters;
      loads = newLoads;
      years = List.empty<Nat>();
    };
  };
};
