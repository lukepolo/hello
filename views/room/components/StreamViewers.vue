<template>
  <div class="viewers">
    <template v-for="(viewer, order) in viewers">
      <stream-overlay
        :order="order + 1"
        :hide-controls="true"
        :stream="viewer.stream"
        :user="users.find((user) => user.id === viewer.id)"
        :style="{
          'grid-row-start': getRow(order) || 'initial',
          'grid-column-start': getColumn(order) || 'initial',
        }"
      >
      </stream-overlay>
    </template>
  </div>
</template>

<script>
import StreamOverlay from "./StreamOverlay";
export default {
  components: {
    StreamOverlay,
  },
  props: {
    users: {
      required: true,
    },
    viewers: {
      required: true,
    },
  },
  methods: {
    getRow(order) {
      return Math.ceil(order / this.numberOfColumns);
    },
    getColumn(order) {
      let column = order % this.numberOfColumns;
      if (column === 0) {
        column = this.numberOfColumns;
      }
      return column;
    },
  },
  computed: {
    totalViewers() {
      return this.viewers.length;
    },
    numberOfColumns() {
      return Math.ceil(Math.sqrt(this.totalViewers));
    },
  },
};
</script>
