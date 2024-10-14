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

  public func getMemberEvents(member : Text, viewType : Text) : async [{summary : Text; start : Text}] {
    switch (authTokens.get(member)) {
      case (null) { throw Error.reject("Member not authenticated with Google Calendar") };
      case (?token) {
        // Here you would use the token to fetch events from Google Calendar API
        // For now, we'll return mock data based on the viewType
        let now = Time.now();
        let day = 86400000000000; // nanoseconds in a day
        let week = 7 * day;
        let month = 30 * day;

        let (startTime, endTime) = switch (viewType) {
          case ("day") (now, now + day);
          case ("week") (now, now + week);
          case ("month") (now, now + month);
          case (_) (now, now + week); // default to week view
        };

        // Generate mock events within the time range
        var events : [{summary : Text; start : Text}] = [];
        var currentTime = startTime;
        while (currentTime < endTime) {
          events := Array.append(events, [{
            summary = "Event " # Int.toText(Array.size(events) + 1);
            start = Int.toText(currentTime);
          }]);
          currentTime += day;
        };

        events
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
