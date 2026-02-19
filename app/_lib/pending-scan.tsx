let pendingBarcode: string | null = null;

export function setPendingBarcode(code: string) {
  pendingBarcode = code;
}

export function takePendingBarcode() {
  const code = pendingBarcode;
  pendingBarcode = null;
  return code;
}
