import Hash "mo:base/Hash";

import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

actor {
  stable var familyNameStable : Text = "Smith Family";
  stable var familyMembersStable : [Text] = ["John", "Jane", "Jimmy", "Jenny"];
  stable var authTokensEntries : [(Text, Text)] = [];
  stable var avatarUrlsEntries : [(Text, Text)] = [];

  var authTokens = HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);
  var avatarUrls = HashMap.fromIter<Text, Text>(avatarUrlsEntries.vals(), 10, Text.equal, Text.hash);

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

  public func setMemberAvatar(member : Text, url : Text) : async () {
    avatarUrls.put(member, url);
  };

  public query func getMemberAvatar(member : Text) : async Text {
    switch (avatarUrls.get(member)) {
      case (null) { "https://example.com/default-avatar.png" };
      case (?url) { url };
    }
  };

  // This function would typically call out to Google Calendar API
  // For demonstration, we're returning mock data
  public func getMemberEvents(member : Text) : async [{summary : Text; start : Text}] {
    switch (authTokens.get(member)) {
      case (null) { throw Error.reject("Member not authenticated with Google Calendar") };
      case (?token) {
        // Here you would use the token to fetch events from Google Calendar API
        // For now, we'll return mock data
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
    }
  };

  system func preupgrade() {
    authTokensEntries := Iter.toArray(authTokens.entries());
    avatarUrlsEntries := Iter.toArray(avatarUrls.entries());
  };

  system func postupgrade() {
    authTokens := HashMap.fromIter<Text, Text>(authTokensEntries.vals(), 10, Text.equal, Text.hash);
    avatarUrls := HashMap.fromIter<Text, Text>(avatarUrlsEntries.vals(), 10, Text.equal, Text.hash);
  };
}
