import Hash "mo:base/Hash";

import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

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

  // This function would typically call out to Google Calendar API
  // For demonstration, we're returning mock data
  public func getMemberEvents(member : Text) : async [{summary : Text; start : Text}] {
    let now = Time.now();
    let day = 86400000000000; // nanoseconds in a day
    [
      {summary = "Meeting"; start = Int.toText(now)},
      {summary = "Lunch"; start = Int.toText(now + day)},
      {summary = "Gym"; start = Int.toText(now + 2 * day)},
      {summary = "Movie Night"; start = Int.toText(now + 3 * day)},
      {summary = "Doctor Appointment"; start = Int.toText(now + 4 * day)}
    ]
  };

  system func preupgrade() {
    authTokensEntries := Iter.toArray(authTokens.entries());
  };

  system func postupgrade() {
    authTokens := HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);
  };
}
