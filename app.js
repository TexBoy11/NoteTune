// Accordeur simple : microphone -> autocorrelation -> note musicale.
const $ = (id) => document.getElementById(id);
const notes = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const FFT_SIZE = 2048;

let audio;
let analyser;
let microphone;
let oscillator;
let animation;
let lastNote;
let stableFrames = 0;

$("startButton").onclick = () => microphone ? stop() : startMicrophone();
$("testButton").onclick = () => oscillator ? stop() : startTest();
$("clearHistory").onclick = () => {
  $("history").className = "history-empty";
  $("history").textContent = "Aucune note stable détectée pour le moment.";
};

function createAnalyser() {
  audio = audio || new AudioContext();
  analyser = audio.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = 0.7;
  $("sampleRate").textContent = `${audio.sampleRate} Hz`;
}

async function startMicrophone() {
  try {
    microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    createAnalyser();
    audio.createMediaStreamSource(microphone).connect(analyser);
    $("startButton").textContent = "Arrêter le microphone";
    status("Microphone actif", true);
    analyse();
  } catch (error) {
    status(error.name === "NotAllowedError" ? "Autorisation refusée" : "Microphone indisponible", false);
  }
}

function startTest() {
  stop();
  createAnalyser();
  oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.frequency.value = 440;
  volume.gain.value = 0.18;
  oscillator.connect(volume).connect(analyser);
  oscillator.start();
  $("testButton").textContent = "Arrêter le test";
  status("Test La4 actif : 440 Hz", true);
  analyse();
}

function stop() {
  cancelAnimationFrame(animation);
  if (microphone) microphone.getTracks().forEach((track) => track.stop());
  if (oscillator) oscillator.stop();
  microphone = null;
  oscillator = null;
  $("startButton").textContent = "Démarrer le microphone";
  $("testButton").textContent = "Tester La4 (440 Hz)";
  status("Analyse arrêtée", false);
  showFrequency(null);
  lastNote = null;
  stableFrames = 0;
}

function analyse() {
  const signal = new Float32Array(FFT_SIZE);
  const spectrum = new Uint8Array(analyser.frequencyBinCount);
  analyser.getFloatTimeDomainData(signal);
  analyser.getByteFrequencyData(spectrum);
  draw("waveform", signal, true);
  draw("spectrum", spectrum, false);
  showFrequency(findFrequency(signal));
  animation = requestAnimationFrame(analyse);
}

function findFrequency(signal) {
  const volume = Math.sqrt(signal.reduce((sum, value) => sum + value ** 2, 0) / signal.length);
  if (volume < 0.01) return null;

  let bestLag = 0;
  let bestScore = 0;
  for (let lag = Math.floor(audio.sampleRate / 1200); lag < Math.floor(audio.sampleRate / 55); lag++) {
    let score = 0;
    let energy = 0;
    for (let i = 0; i < signal.length - lag; i++) score += signal[i] * signal[i + lag];
    for (let i = 0; i < signal.length - lag; i++) energy += signal[i] ** 2;
    score /= energy || 1;
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  return bestLag ? audio.sampleRate / bestLag : null;
}

function showFrequency(frequency) {
  if (!frequency) {
    $("note").textContent = "—";
    $("octave").textContent = "Jouez une note";
    $("frequency").textContent = "— Hz";
    $("cents").textContent = "— cents";
    $("target").textContent = "—";
    $("needle").style.left = "50%";
    return;
  }
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const target = 440 * 2 ** ((midi - 69) / 12);
  const cents = 1200 * Math.log2(frequency / target);
  const note = notes[(midi + 120) % 12];
  const noteWithOctave = `${note}${Math.floor(midi / 12) - 1}`;
  $("note").textContent = note;
  $("octave").textContent = `Octave ${Math.floor(midi / 12) - 1}`;
  $("frequency").textContent = `${frequency.toFixed(1)} Hz`;
  $("cents").textContent = `${cents >= 0 ? "+" : ""}${cents.toFixed(1)} cents`;
  $("target").textContent = `${target.toFixed(1)} Hz`;
  $("needle").style.left = `${Math.max(3, Math.min(97, 50 + cents))}%`;
  stableFrames = noteWithOctave === lastNote ? stableFrames + 1 : 0;
  lastNote = noteWithOctave;
  if (stableFrames === 8) addHistory(noteWithOctave, frequency);
}

function draw(id, values, waveform) {
  const canvas = $(id);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = waveform ? "#4de4e4" : "#8d7aff";
  context.beginPath();
  values.forEach((value, index) => {
    const x = index / values.length * canvas.width;
    const y = waveform ? canvas.height / 2 - value * canvas.height * 0.4 : canvas.height - value / 255 * canvas.height;
    index ? context.lineTo(x, y) : context.moveTo(x, y);
  });
  context.stroke();
}

function status(message, active) {
  $("status").textContent = message;
  $("status").classList.toggle("active", active);
}

function addHistory(note, frequency) {
  const item = document.createElement("span");
  item.className = "history-item";
  item.innerHTML = `<strong>${note}</strong><small>${frequency.toFixed(1)} Hz</small>`;
  $("history").className = "history-list";
  $("history").prepend(item);
}
