export class RWLock {
  private readers = 0;
  private writer = false;

  private waitingReaders: (() => void)[] = [];
  private waitingWriters: (() => void)[] = [];

  async acquireRead(): Promise<void> {
    if (!this.writer && this.waitingWriters.length === 0) {
      this.readers++;
      return;
    }

    await new Promise<void>((resolve) => {
      this.waitingReaders.push(resolve);
    });

    this.readers++;
  }

  releaseRead() {
    this.readers--;

    if (this.readers === 0 && this.waitingWriters.length > 0) {
      this.grantNextWriter();
    }
  }

  async acquireWrite(): Promise<void> {
    if (!this.writer && this.readers === 0) {
      this.writer = true;
      return;
    }

    await new Promise<void>((resolve) => {
      this.waitingWriters.push(resolve);
    });

    this.writer = true;
  }

  releaseWrite() {
    this.writer = false;

    if (this.waitingWriters.length > 0) {
      this.grantNextWriter();
      return;
    }

    this.grantWaitingReaders();
  }

  private grantNextWriter() {
    const resolve = this.waitingWriters.shift();

    if (resolve) {
      this.writer = true;
      resolve();
    }
  }

  private grantWaitingReaders() {
    const readers = this.waitingReaders.splice(0);

    this.readers += readers.length;

    for (const resolve of readers) {
      resolve();
    }
  }
}
