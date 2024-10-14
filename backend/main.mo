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

  system func preupgrade() {
    authTokensEntries := Iter.toArray(authTokens.entries());
  };

  system func postupgrade() {
    authTokens := HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);
  };
}
