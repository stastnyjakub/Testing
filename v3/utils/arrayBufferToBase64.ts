export const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer) => {
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = i;
  }

  // Step 1: Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Step 2: Convert Buffer to Base64
  const base64String = buffer.toString('base64');
  return base64String;
};
