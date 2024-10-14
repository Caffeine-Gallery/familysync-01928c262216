import Hash "mo:base/Hash";

import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor {
  stable var familyNameStable : Text = "Smith Family";
  stable var familyMembersStable : [Text] = ["John", "Jane", "Jimmy", "Jenny"];
  stable var authTokensEntries : [(Text, Text)] = [];

  var authTokens = HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);

  public func getFamilyName() : async Text {
    familyNameStable
  };

  public func getFamilyMembers() : async [Text] {
    familyMembersStable
  };

  public func setAuthToken(member : Text, token : Text) : async () {
    authTokens.put(member, token);
  };

  public query func getAuthToken(member : Text) : async ?Text {
    authTokens.get(member)
  };

  // Placeholder function for fetching member events
  public func getMemberEvents(member : Text) : async [{summary : Text; start : Text}] {
    // This is a mock implementation. In a real scenario, you would fetch actual events.
    [{summary = "Mock Event 1"; start = "2023-06-01T09:00:00"}, {summary = "Mock Event 2"; start = "2023-06-01T14:00:00"}]
  };

  system func preupgrade() {
    authTokensEntries := Iter.toArray(authTokens.entries());
  };

  system func postupgrade() {
    authTokens := HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);
  };
}
