<template>
  <div class="room-chat">
    <pre>{{ users }}</pre>

    <form v-form="form" @submit.prevent="sendMessage">
      <input name="message" type="text" v-model="form.message" validate />
      <button type="submit" :disabled="!form.isValid()">Send</button>
    </form>

    <template v-for="message in messages">
      <pre>Message: {{ message.content }}</pre>
      <pre>User: {{ message.author }}</pre>
    </template>
  </div>
</template>

<script>
export default {
  $inject: ["ChatService"],
  props: {
    roomCode: {
      required: true,
    },
    users: {
      required: true,
    },
  },
  data() {
    return {
      messages: null,
      form: this.createForm({
        message: null,
      }).validation({
        rules: {
          message: "required",
        },
      }),
    };
  },
  created() {
    this.chatService.join(this.roomCode).then((messages) => {
      this.messages = messages;
    });
  },
  methods: {
    sendMessage() {
      this.chatService.send(this.form.data()).then(() => {
        this.form.reset();
      });
    },
  },
};
</script>

<style lang="scss">
.room-chat {
  color: white;
}
</style>
