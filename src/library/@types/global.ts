declare global {
  function setTimeout(callback: () => void, timeout: number): number;
}
