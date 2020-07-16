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

<style lang="scss">
.sound-meter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  min-height: 35px;

  &--mirror {
    transform: scale(1, -1);
  }

  &__dot {
    margin: 0 2px;
    min-height: 5px;
    height: 5px;
    width: 5px;
    background-color: $green;
    border-radius: 100em;
    display: inline-block;
    max-height: 10px;

    &--large {
      max-height: 15px;
    }
  }
}
</style>
