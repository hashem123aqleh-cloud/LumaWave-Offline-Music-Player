import * as FileSystem from 'expo-file-system/legacy';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64(value: string) {
  const cleanValue = value.replace(/[^A-Za-z0-9+/=]/g, '');
  const output = new Uint8Array(Math.floor((cleanValue.length * 3) / 4));
  let outputIndex = 0;
  let accumulator = 0;
  let bits = 0;

  for (const character of cleanValue) {
    if (character === '=') break;
    const digit = BASE64_CHARS.indexOf(character);
    if (digit < 0) continue;
    accumulator = (accumulator << 6) | digit;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[outputIndex] = (accumulator >> bits) & 0xff;
      outputIndex += 1;
    }
  }

  return output.subarray(0, outputIndex);
}

function readSyncSafe(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] & 0x7f) << 21) | ((bytes[offset + 1] & 0x7f) << 14) | ((bytes[offset + 2] & 0x7f) << 7) | (bytes[offset + 3] & 0x7f);
}

function readUint32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  let value = '';
  for (let index = start; index < end; index += 1) {
    value += String.fromCharCode(bytes[index]);
  }
  return value;
}

function findEmbeddedImage(bytes: Uint8Array) {
  if (bytes.length < 10 || readAscii(bytes, 0, 3) !== 'ID3') return null;
  const version = bytes[3];
  if (version < 3 || version > 4) return null;

  const tagSize = readSyncSafe(bytes, 6);
  const tagEnd = Math.min(bytes.length, 10 + tagSize);
  let frameOffset = 10;

  if ((bytes[5] & 0x40) !== 0 && frameOffset + 4 <= tagEnd) {
    const extendedSize = version === 4 ? readSyncSafe(bytes, frameOffset) : readUint32(bytes, frameOffset);
    frameOffset += 4 + extendedSize;
  }

  while (frameOffset + 10 <= tagEnd) {
    const frameId = readAscii(bytes, frameOffset, frameOffset + 4);
    if (!/^[A-Z0-9]{4}$/.test(frameId) || frameId === '\u0000\u0000\u0000\u0000') break;
    const frameSize = version === 4 ? readSyncSafe(bytes, frameOffset + 4) : readUint32(bytes, frameOffset + 4);
    const contentStart = frameOffset + 10;
    const contentEnd = Math.min(tagEnd, contentStart + frameSize);
    if (contentEnd <= contentStart) break;

    if (frameId === 'APIC') {
      const content = bytes.subarray(contentStart, contentEnd);
      const encoding = content[0];
      let cursor = 1;
      const mimeStart = cursor;
      while (cursor < content.length && content[cursor] !== 0) cursor += 1;
      const mime = readAscii(content, mimeStart, cursor) || 'image/jpeg';
      cursor += 1;
      cursor += 1;

      if (encoding === 0 || encoding === 3) {
        while (cursor < content.length && content[cursor] !== 0) cursor += 1;
        cursor += 1;
      } else {
        while (cursor + 1 < content.length && (content[cursor] !== 0 || content[cursor + 1] !== 0)) cursor += 2;
        cursor += 2;
      }

      if (cursor < content.length) {
        return { mime: mime.startsWith('image/') ? mime : 'image/jpeg', bytes: content.subarray(cursor) };
      }
    }

    frameOffset = contentEnd;
  }

  return null;
}

function encodeBase64(bytes: Uint8Array) {
  let value = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    value += BASE64_CHARS[first >> 2];
    value += BASE64_CHARS[((first & 3) << 4) | (second === undefined ? 0 : second >> 4)];
    value += second === undefined ? '=' : BASE64_CHARS[((second & 15) << 2) | (third === undefined ? 0 : third >> 6)];
    value += third === undefined ? '=' : BASE64_CHARS[third & 63];
  }
  return value;
}

export async function extractEmbeddedArtwork(uri: string, trackId: string) {
  if (!FileSystem.documentDirectory) return undefined;

  try {
    const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const embeddedImage = findEmbeddedImage(decodeBase64(base64Audio));
    if (!embeddedImage || embeddedImage.bytes.length === 0) return undefined;

    const extension = embeddedImage.mime.includes('png') ? 'png' : 'jpg';
    const artworkUri = `${FileSystem.documentDirectory}music/artwork-${trackId}.${extension}`;
    await FileSystem.writeAsStringAsync(artworkUri, encodeBase64(embeddedImage.bytes), { encoding: FileSystem.EncodingType.Base64 });
    return artworkUri;
  } catch {
    return undefined;
  }
}