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
