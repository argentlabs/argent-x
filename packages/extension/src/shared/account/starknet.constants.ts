export const C0_PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
] as const

// ClassHashes are a map of semver to class hash
export const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = {
  // CAIRO_0
  // NOTE: 0.2.4 is actually defined as 0.2.3.1 but it's not supported by semver
  "0.2.4": "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
  "0.2.3": "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  "0.2.2": "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
  "0.2.1": "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",

  // CAIRO_1
  "0.4.0": "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
  "0.3.1": "0x29927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b",
  "0.3.0": "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
} as const
