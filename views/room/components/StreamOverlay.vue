<template>
  <div class="stream--container">
    <div
      class="stream"
      :class="{
        'stream--host': isHost,
      }"
    >
      <video :muted="isHost" autoplay ref="stream"></video>
    </div>
    <div class="stream--overlay">
      <pre style="color : white" v-if="user">{{ user }}</pre>
      <stream-controls
        :user="user"
        :stream="stream"
        :is-host="isHost"
        :has-joined="hasJoined"
        :hide-controls="hideControls"
        :stream-controller="streamController"
      ></stream-controls>
    </div>
  </div>
</template>

<script>
import StreamControls from "./StreamControls";

export default {
  components: { StreamControls },
  props: {
    stream: {
      required: true,
    },
    isHost: {
      default: false,
    },
    user: {
      required: false,
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
  watch: {
    stream: {
      immediate: true,
      handler(stream) {
        this.$nextTick(() => {
          if (this.$refs["stream"] && stream) {
            this.$refs["stream"].srcObject = this.stream;
          }
        });
      },
    },
  },
};
</script>

<style lang="scss">
video {
  width: 100%;
  display: block;
}

.welcome {
  .stream {
    border: 4px solid $color-divider;
    border-radius: 10px;
    overflow: hidden;
  }
}

.stream {
  &--host {
    transform: rotateY(180deg);
  }

  &--container {
    position: relative;
  }

  &--overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
</style>
