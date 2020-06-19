<template>
  <div class="presenter-selection">
    <!--   TODO - if they choose something other than desktop we can allow them to keep all streams on their app and show which screen they are capturing    -->
    <video ref="desktopCaptureSource"></video>
    <label>Windows</label>
    <div class="capture-images">
      <template v-for="source in sources.windows">
        <div class="capture-image">
          <img :src="source.thumbnail.toDataURL()" @click="capture(source)" />
        </div>
      </template>
    </div>

    <label>Screens</label>
    <div class="capture-images">
      <template v-for="source in sources.screens">
        <div class="capture-image">
          <img :src="source.thumbnail.toDataURL()" @click="capture(source)" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import StreamOverlay from "@views/room/components/StreamOverlay";
export default {
  components: { StreamOverlay },
  $inject: [
    "RemoteControlService",
    "RoomStreamingService",
    "DesktopCaptureService",
  ],
  data() {
    return {
      sources: [],
      stream: null,
      desktopCaptureSource: null,
    };
  },
  created() {
    this.getSources();
  },
  mounted() {
    this.desktopCaptureSource = this.$refs["desktopCaptureSource"];
  },
  methods: {
    takeControl() {
      // TODO - take control of other machine, but needs a request form that viewer, once it goes into presetner view we will attach these events.
      // this.remoteControlService.registerListenerEvents(this.viewer);
    },
    async getSources() {
      this.sources = await this.desktopCaptureService.getSources();
      return this.sources;
    },
    capture(source) {
      this.desktopCaptureService
        .capture(this.desktopCaptureSource, source)
        .then((stream) => {
          this.stream = stream;
        });
    },
    confirm() {
      this.roomStreamingService.present(this.stream);
    },
  },
};
</script>
