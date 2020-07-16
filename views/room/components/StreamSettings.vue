<template>
  <div class="stream-settings-container">
    <div>
      Audio
      <label>
        microphone
      </label>
      <select v-model="selectedMicrophone">
        <option v-for="microphone in microphones" :value="microphone.deviceId">
          {{ microphone.label }}
        </option>
      </select>

      <label>
        speakers
      </label>
      <select v-model="selectedSpeaker">
        <option v-for="speaker in speakers" :value="speaker.deviceId">
          {{ speaker.label }}
        </option>
      </select>
    </div>
    <div>
      Video
      <label>
        camera
      </label>
      <select v-model="selectedCamera">
        <option v-for="camera in cameras" :value="camera.deviceId">
          {{ camera.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { DeviceTypes } from "@app/constants/DeviceTypes";
import MicrophoneCaptureService from "@app/services/MicrophoneCaptureService";

export default {
  $inject: [
    "DeviceService",
    "CameraCaptureService",
    "MicrophoneCaptureService",
  ],
  props: {
    stream: {
      required: true,
    },
    streamController: {
      required: false,
    },
  },
  data() {
    return {
      devices: null,
      selectedCamera: null,
      selectedSpeaker: null,
      selectedMicrophone: null,
    };
  },
  created() {
    this.getDevices();
  },
  watch: {
    selectedCamera() {
      this.changeCamera();
    },
    selectedSpeaker() {
      this.changeSpeaker();
    },
    selectedMicrophone() {
      this.changeMicrophone();
    },
  },
  methods: {
    getDevices() {
      return this.deviceService.getDevices().then((devices) => {
        this.devices = devices;
      });
    },
    // TODO - on selected we should set this in local storage for a default?
    changeSpeaker() {
      document.getElementsByTagName("video").forEach((element) => {
        element.setSinkId(this.selectedSpeaker);
      });
    },
    changeMicrophone() {
      this.microphoneCaptureService
        .capture(this.selectedMicrophone)
        .then((stream) => {
          this.streamController.changeMicrophone(stream);
        });
    },
    changeCamera() {
      this.cameraCaptureService.capture().then((stream) => {
        this.streamController.changeCamera(stream);
      });
    },
  },
  computed: {
    cameras() {
      return this.devices?.[DeviceTypes.Camera];
    },
    speakers() {
      return this.devices?.[DeviceTypes.Speaker];
    },
    microphones() {
      return this.devices?.[DeviceTypes.Microphone];
    },
  },
};
</script>

<style lang="scss">
.stream-settings-container {
  color: $black;
  position: absolute;
  bottom: 60px;
  right: 25px;
  max-width: 300px;
  padding: 10px;
  border-radius: 5px;
  background-color: $white;
}
</style>
