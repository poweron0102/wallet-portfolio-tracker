import * as Cardano from "@emurgo/cardano-serialization-lib-browser";

export function hexToBech32(hex: string): string {
    const bytes = Uint8Array.from(
        hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const addr = Cardano.Address.from_bytes(bytes);
    return addr.to_bech32();
}

