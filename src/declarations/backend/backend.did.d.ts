import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'getAuthToken' : ActorMethod<[string], [] | [string]>,
  'getFamilyMembers' : ActorMethod<[], Array<string>>,
  'getFamilyName' : ActorMethod<[], string>,
  'getMemberEvents' : ActorMethod<
    [string],
    Array<{ 'summary' : string, 'start' : string }>
  >,
  'setAuthToken' : ActorMethod<[string, string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
