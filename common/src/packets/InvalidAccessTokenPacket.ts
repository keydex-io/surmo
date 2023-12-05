import { PacketType } from "../constants";
import { PACKET_TYPE_BITS, type SuroiBitStream } from "../utils/suroiBitStream";
import { Packet } from "./packet";

export class InvalidAccessTokenPacket extends Packet {
    override readonly allocBytes = PACKET_TYPE_BITS;
    override readonly type = PacketType.InvalidAccessToken;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override deserialize(stream: SuroiBitStream): void { }
}
