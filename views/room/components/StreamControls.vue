<template>
  <div class="stream--controls" :class="{ 'stream--controls-host': isHost }">
    <div class="controls--group">
      <sound-meter :audio-track="audioTrack"></sound-meter>
    </div>
    <div class="controls--group" v-if="hideControls === false">
      <div
        v-if="videoTrack"
        class="controls--item controls--item-circle controls--item-large"
        @click="toggleVideo"
        :class="{
          'icon-video': !isVideoDisabled,
          'icon-video-off': isVideoDisabled,
        }"
      />
      <div
        v-if="audioTrack"
        class="controls--item controls--item-circle controls--item-large"
        @click="toggleMute"
        :class="{
          'icon-mic': !isMuted,
          'icon-mic-off': isMuted,
        }"
      ></div>
    </div>
    <div class="controls--group" v-if="hideControls === false">
      <div
        v-if="hasJoined"
        class="icon-share controls--item controls--item-circle controls--item-large"
        @click="showingPresenterView = true"
      >
        <presenter v-if="showingPresenterView"></presenter>
      </div>
      <div v-on-clickaway="closeSettings">
        <div
          @click="toggleSettings"
          style="position: relative;"
          class="controls--item icon-settings"
        ></div>
        <stream-settings
          v-show="showSettings"
          :stream="stream"
          :stream-controller="streamController"
        ></stream-settings>
      </div>
    </div>
  </div>
</template>

<script>
import SoundMeter from "./SoundMeter";
import StreamSettings from "./StreamSettings";
import { mixin as clickaway } from "vue-clickaway";
import Presenter from "@views/room/components/Presenter";
import streamSoundMeter from "@app/helpers/streamSoundMeter";

export default {
  components: {
    Presenter,
    SoundMeter,
    StreamSettings,
  },
  mixins: [clickaway],
  props: {
    stream: {
      required: true,
    },
    user: {
      required: false,
    },
    isHost: {
      default: false,
    },
    hasJoined: {
      default: false,
    },
    hideControls: {
      default: false,
    },
    streamController: {
      required: false,
    },
  },
  data() {
    return {
      muted: false,
      showSettings: false,
      isVideoDisabled: false,
      detectMutedMeter: null,
      showingPresenterView: false,
      detectTalkingTimeout: null,
      detectNotTalkingTimeout: null,
    };
  },
  watch: {
    audioTrack: {
      immediate: true,
      handler() {
        if (this.isHost) {
          this.muted = this.audioTrack?.enabled;
        }
      },
    },
  },
  methods: {
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    toggleVideo() {
      this.videoTrack.enabled = !this.videoTrack.enabled;
      this.isVideoDisabled = !this.videoTrack.enabled;
    },
    closeSettings() {
      this.showSettings = false;
    },
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
    disconnectMuteMeter() {
      this.detectMutedMeter?.disconnect();
    },
  },
  computed: {
    audioTrack() {
      return this.stream?.getAudioTracks()[0];
    },
    videoTrack() {
      return this.stream?.getVideoTracks()[0];
    },
    isMuted: {
      get() {
        return this.isHost ? !this.muted : this.user?.muted || false;
      },
      set() {
        this.muted = !this.muted;
        if (this.audioTrack) {
          this.audioTrack.enabled = this.muted;
          if (this.muted) {
            this.streamController.unmute();
          } else {
            this.streamController.mute();
          }
        }
      },
    },
  },
  created() {
    this.$watch(
      () => {
        return this.stream || this.hasJoined === true;
      },
      () => {
        if (this.audioTrack && this.isHost) {
          this.disconnectMuteMeter();
          let audioTrack = this.audioTrack.clone();
          audioTrack.enabled = true;
          this.detectMutedMeter = streamSoundMeter(audioTrack, (soundLevel) => {
            if (!this.isMuted) {
              this.detectTalkingTimeout = clearTimeout(
                this.detectTalkingTimeout,
              );
              this.detectNotTalkingTimeout = clearTimeout(
                this.detectNotTalkingTimeout,
              );
              return;
            }
            if (soundLevel >= 5) {
              this.detectNotTalkingTimeout = clearTimeout(
                this.detectNotTalkingTimeout,
              );
              if (!this.detectTalkingTimeout) {
                this.detectTalkingTimeout = setTimeout(() => {
                  console.info("Your muted, are you trying to talk?");
                }, 3000);
              }
            } else if (!this.detectNotTalkingTimeout) {
              this.detectNotTalkingTimeout = setTimeout(() => {
                this.detectTalkingTimeout = clearTimeout(
                  this.detectTalkingTimeout,
                );
              }, 2000);
            }
          });
        }
      },
    );
  },
  beforeDestroy() {
    this.disconnectMuteMeter();
  },
};
</script>

<style lang="scss" scoped>
.stream--controls {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  color: $color-text-inverse-primary;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 8px 15px 10px;
}

.meeting .stream--controls-host {
  position: initial;
  grid-column-start: 1;
  grid-column-end: -1;
  grid-row-end: -1;
}

.controls {
  &--group {
    flex: 1 0 1em;
    display: flex;
    justify-content: center;
    align-items: center;

    &:first-of-type {
      justify-content: flex-start;
    }
    &:last-of-type {
      justify-content: flex-end;
    }
  }

  &--item {
    padding: 10px;
    border-radius: 100em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0 5px;

    &:hover {
      transition: all 0.3s ease;
      background-color: rgba(255, 255, 255, 0.5);
    }

    &-circle {
      border: 1px solid $white;
    }

    &-large {
      font-size: 1.5rem;
    }
  }
}

.icon-video-off,
.icon-mic-off {
  color: $color-state-danger;
  border-color: $color-state-danger;
}
</style>
