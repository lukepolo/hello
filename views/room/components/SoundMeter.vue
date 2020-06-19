<template>
  <div class="sound-meter" v-if="soundMeter">
    <div
      class="sound-meter__dot"
      :style="{
        height: `${soundLevel}px`,
      }"
    ></div>
    <div
      class="sound-meter__dot sound-meter__dot--large"
      :style="{
        height: `${soundLevel}px`,
      }"
    ></div>
    <div
      class="sound-meter__dot"
      :style="{
        height: `${soundLevel}px`,
      }"
    ></div>
  </div>
</template>

<script>
import streamSoundMeter from "@app/helpers/streamSoundMeter";

export default {
  props: {
    audioTrack: {
      required: true,
    },
  },
  data() {
    return {
      soundMeter: null,
      soundLevel: 0,
    };
  },
  watch: {
    audioTrack: {
      immediate: true,
      handler(audioTrack) {
        this.disconnectSoundMeter();
        if (audioTrack) {
          this.soundMeter = streamSoundMeter(this.audioTrack, (soundLevel) => {
            this.soundLevel = soundLevel;
          });
        }
      },
    },
  },
  methods: {
    disconnectSoundMeter() {
      this.soundMeter?.disconnect();
    },
  },
  beforeDestroy() {
    this.disconnectSoundMeter();
  },
};
</script>
