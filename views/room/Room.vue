<template>
  <div
    :class="{
      meeting: hasJoined,
      welcome: !hasJoined,
    }"
  >
    <div class="host">
      <room-chat
        v-if="hasJoined"
        :users="users"
        :room-code="roomCode"
      ></room-chat>
      <stream-overlay
        :is-host="true"
        :stream="stream"
        :has-joined="hasJoined"
        :hide-controls="hasJoined"
        :stream-controller="streamController"
      ></stream-overlay>
    </div>

    <presenter v-if="showingPresenterView"></presenter>

    <template v-if="hasJoined">
      <stream-controls
        :is-host="true"
        :stream="stream"
        :has-joined="hasJoined"
        :stream-controller="streamController"
      ></stream-controls>
    </template>
    <template v-else>
      <div class="welcome--content">
        <h2>joining...</h2>
        <h1 class="welcome--heading">{{ roomCode }}</h1>

        <div v-if="users.length">
          <h5>Currently in the room:</h5>
          <template v-for="user in users">
            <div class="welcome--user">{{ user.name }}</div>
          </template>
        </div>

        <div class="form--buttons">
          <button class="btn btn-primary" @click="joinRoom">Join Now</button>
          <button class="btn" @click="showPresenterView">Present</button>
        </div>
      </div>
    </template>
    <stream-viewers :users="users" :viewers="viewers"></stream-viewers>
  </div>
</template>

<script>
import RoomChat from "./components/RoomChat";
import Presenter from "./components/Presenter";
import StreamViewers from "./components/StreamViewers";
import StreamOverlay from "./components/StreamOverlay";
import StreamControls from "./components/StreamControls";
import { DeviceTypes } from "@app/constants/DeviceTypes";

export default {
  $inject: [
    "DeviceService",
    "DummyCaptureService",
    "CameraCaptureService",
    "RoomStreamingService",
    "MicrophoneCaptureService",
  ],
  components: {
    RoomChat,
    Presenter,
    StreamViewers,
    StreamOverlay,
    StreamControls,
  },
  props: {
    roomCode: {
      required: true,
    },
  },
  data() {
    return {
      users: [],
      viewers: [],
      stream: null,
      hasJoined: false,
      streamController: null,
      showingPresenterView: false,
    };
  },
  created() {
    this.$store
      .dispatch("room/get", {
        roomCode: this.roomCode,
        password: "connectme",
      })
      .catch(() => {
        this.$router.push("/");
      });
  },
  mounted() {
    this.roomStreamingService
      .setup(this.roomCode, {
        muted: false,
        name: localStorage.getItem("name"),
      })
      .then(({ room, streamController }) => {
        this.streamController = streamController;

        streamController.on("stream", (stream) => {
          this.stream = null;
          this.$nextTick(() => {
            this.stream = stream;
          });
        });

        room.on("here", (users) => {
          this.users = Object.assign([], users);
        });

        room.on("joining", (user) => {
          this.users.push(user);
        });

        room.on("mute", this.updateUser);
        room.on("unmute", this.updateUser);
        room.on("newViewer", this.addViewer);
        room.on("viewerLeft", this.removeViewer);

        this.autoDetectCapture();
      });
  },
  methods: {
    autoDetectCapture() {
      this.streamController.changeCamera(this.dummyCaptureService.capture());

      this.deviceService.getDevices().then((devices) => {
        if (devices[DeviceTypes.Camera].length > 0) {
          this.cameraCaptureService.capture().then((cameraStream) => {
            this.streamController.changeCamera(cameraStream);
          });
        } else if (devices[DeviceTypes.Microphone].length > 0) {
          this.microphoneCaptureService.capture().then((stream) => {
            this.streamController.changeMicrophone(stream);
          });
        }
      });
    },
    joinRoom() {
      this.roomStreamingService.join().then(() => {
        this.hasJoined = true;
      });
    },
    addViewer({ id, type, stream }) {
      if (
        !this.viewers.find((viewer) => {
          return viewer.stream.id === stream.id;
        })
      ) {
        this.viewers.push({
          id,
          type,
          stream,
        });
      }
    },
    removeViewer(id) {
      this.users.splice(
        this.users.findIndex((user) => {
          return user.id === id;
        }),
        1,
      );

      this.viewers.splice(
        this.viewers.findIndex((viewerStreamObject) => {
          viewerStreamObject.id = id;
        }),
        1,
      );
    },
    updateUser(user) {
      let key = this.users.findIndex((tempUser) => {
        return tempUser.id === user.id;
      });
      if (this.users[key]) {
        this.users[key] = Object.assign(this.users[key], user);
      }
    },
    showPresenterView() {
      this.showingPresenterView = true;
    },
  },
  beforeDestroy() {
    this.roomStreamingService.leaveRoom();
  },
};
</script>

<style lang="scss">
.meeting .host {
  width: 300px;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba($white, 0.1);
  margin: 10px;
  z-index: 100;
}

.viewers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: min-content;
  grid-gap: 10px;
  margin-top: auto;
  margin-bottom: auto;
  padding: 10px;

  .stream--container {
    background-color: $color-background-inverse-contrast;
    border-radius: 10px;
    box-shadow: -4px -4px 7px rgba($color-text-inverse-primary, 0.07),
      4px 4px 7px rgba($color-text-primary, 1);
    overflow: hidden;
  }
}
</style>
