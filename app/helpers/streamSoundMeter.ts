export default function streamSoundMeter(
  audioTrack: MediaStreamTrack,
  callback: (percentage) => void,
): ScriptProcessorNode {
  let audioContext = new AudioContext();
  let analyser = audioContext.createAnalyser();

  let mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(
    new MediaStream([audioTrack]),
  );
  let scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1);

  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 1024;

  mediaStreamAudioSourceNode.connect(analyser);
  analyser.connect(scriptProcessorNode);
  scriptProcessorNode.connect(audioContext.destination);

  scriptProcessorNode.onaudioprocess = function(event) {
    const input = event.inputBuffer.getChannelData(0);
    let sum = 0.0;
    for (let i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
    }
    callback((Math.round(100 * Math.sqrt(sum / input.length)) / 100) * 100);
  };

  return scriptProcessorNode;
}
