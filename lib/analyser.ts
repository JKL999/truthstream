/**
 * Audio visualizer for live audio level monitoring
 */

export class Analyser {
  private analyserNode: AnalyserNode;
  public data: Uint8Array;

  constructor(gainNode: GainNode) {
    this.analyserNode = gainNode.context.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.data = new Uint8Array(this.analyserNode.frequencyBinCount);

    gainNode.connect(this.analyserNode);
  }

  update() {
    this.analyserNode.getByteFrequencyData(this.data as Uint8Array<ArrayBuffer>);
  }
}
