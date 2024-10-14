export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getAuthToken' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getFamilyMembers' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'getFamilyName' : IDL.Func([], [IDL.Text], []),
    'getMemberEvents' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Record({ 'summary' : IDL.Text, 'start' : IDL.Text }))],
        [],
      ),
    'setAuthToken' : IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
