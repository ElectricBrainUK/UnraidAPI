<template>
  <v-dialog
    v-model="usbDialogue"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-chip
        v-on="on"
      >
        {{ detail.name }}
      </v-chip>
    </template>

    <v-card>
      <v-card-title
        class="headline grey"
        primary-title
      >
        {{ detail.name }}
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="usbVMSelector"
          :items="Object.keys(server.vm.details).map(id => server.vm.details[id])"
          item-text="name"
          item-value="id"
          label="VM"></v-select>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="requestUSBMove"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import axios from "axios";

  export default {
    name: "UsbDetail",
    props: [
      'detail',
      'server',
      'ip'
    ],
    data() {
      return {
        usbVMSelector: false,
        usbDialogue: false
      };
    },
    methods: {
      requestUSBMove() {
        axios({
          method: "post",
          url: "api/usbAttach",
          data: {
            id: this.usbVMSelector,
            usbId: this.detail.id,
            server: this.ip
          }
        }).then((response) => {
          this.usbDialogue = false;
          if (response) {
            console.log(response);
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>