export function createLoginSubmissionLock() {
  let locked = false;

  return {
    tryAcquire(): boolean {
      if (locked) return false;
      locked = true;
      return true;
    },
    release(): void {
      locked = false;
    },
  };
}
