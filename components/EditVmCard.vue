<template>
  <v-dialog
    v-model="dialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        color="info"
        dark
        v-on="on"
      >
        Edit
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey"
        primary-title
      >
        {{ vm.name }}
      </v-card-title>

      <v-card-text>
        This will contain edit options.
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          flat
          @click="dialog = false"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: "EditVmCard",
    props: [
      "vm"
    ]
  };
</script>

<style scoped>

</style>