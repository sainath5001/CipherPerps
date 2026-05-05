// Zama Relayer SDK integration.
//
// IMPORTANT:
// - Real Zama FHEVM flows encrypt values into "external ciphertext handles" + an input proof.
// - Those handles are typically passed to Solidity functions expecting `externalEuint*` + `bytes proof`,
//   then imported onchain with `FHE.fromExternal(handle, proof)`.
//
// Your current CipherPerps MVP contracts accept `uint256` placeholders for euint256.
// This module is structured correctly for Zama, but to use it end-to-end you must
// update Solidity to accept external ciphertext handles + proof.

import type { Address } from "viem";

let cached: {
  instance: any;
} | null = null;

export type EncryptedInput = {
  handles: readonly `0x${string}`[];
  inputProof: `0x${string}`;
};

export async function getZamaInstance() {
  if (cached) return cached.instance;

  const { initSDK, createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/bundle");
  await initSDK();
  const config = { ...SepoliaConfig, network: window.ethereum };
  const instance = await createInstance(config);
  cached = { instance };
  return instance;
}

export async function encryptValues(params: {
  contractAddress: Address;
  userAddress: Address;
  values: bigint[];
}) {
  const instance = await getZamaInstance();
  const buffer = instance.createEncryptedInput(params.contractAddress, params.userAddress);
  for (const v of params.values) {
    buffer.add256(v);
  }
  const ciphertexts = (await buffer.encrypt()) as { handles: string[]; inputProof: string };
  return {
    handles: ciphertexts.handles as readonly `0x${string}`[],
    inputProof: ciphertexts.inputProof as `0x${string}`
  } satisfies EncryptedInput;
}

// Decryption is typically done via "user decryption" flows through the relayer.
// We keep a placeholder signature here; actual usage depends on how you expose ciphertexts
// from contracts and what access rules you set.
export async function decryptValue(_ciphertextHandle: `0x${string}`): Promise<bigint> {
  throw new Error("Decrypt flow not wired: requires FHEVM ciphertext outputs + relayer user-decryption.");
}

