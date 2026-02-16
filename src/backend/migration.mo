import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";

module {
  type OldClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  type ContractDetails = {
    contractText : Text;
    startDate : Int;
    endDate : Int;
  };

  type NewClientInfo = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    contract : ContractDetails;
  };

  type OldTransporterDetails = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    documents : [Blob];
  };

  type NewTransporterDetails = {
    company : Text;
    contactPerson : Text;
    email : Text;
    phone : Text;
    address : Text;
    documents : [Blob];
    contract : ContractDetails;
  };

  type OldActor = {
    clients : Map.Map<Principal, OldClientInfo>;
    transporters : Map.Map<Principal, OldTransporterDetails>;
  };

  type NewActor = {
    clients : Map.Map<Principal, NewClientInfo>;
    transporters : Map.Map<Principal, NewTransporterDetails>;
  };

  public func run(old : OldActor) : NewActor {
    let migratedClients = old.clients.map<Principal, OldClientInfo, NewClientInfo>(
      func(_id, oldClient) {
        { oldClient with contract = {
          contractText = "N/A";
          startDate = 0;
          endDate = 0;
        } };
      }
    );

    let migratedTransporters = old.transporters.map<Principal, OldTransporterDetails, NewTransporterDetails>(
      func(_id, oldTransporter) {
        { oldTransporter with contract = {
          contractText = "N/A";
          startDate = 0;
          endDate = 0;
        } };
      }
    );

    { clients = migratedClients; transporters = migratedTransporters };
  };
};
