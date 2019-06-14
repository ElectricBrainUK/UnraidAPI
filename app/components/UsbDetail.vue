<template>
  <v-dialog
    v-model="dialogue"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-chip
        v-on="on"
        style="overflow: hidden; max-width: 95%; min-width: 20px;"
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
          v-model="vMSelector"
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
          @click="requestMove"
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
        vMSelector: false,
        dialogue: false,
        pci: false
      };
    },
    methods: {
      requestMove() {
        if (!this.pci) {
          axios({
            method: "post",
            url: "api/usbAttach",
            data: {
              id: this.vMSelector,
              usbId: this.detail.id,
              server: this.ip
            }
          }).then((response) => {
            this.dialogue = false;
            if (response) {
              console.log(response);
            }
          });
        } else {
          axios({
            method: "post",
            url: "api/pciAttach",
            data: {
              id: this.vMSelector,
              pciId: this.detail.id,
              server: this.ip
            }
          }).then((response) => {
            this.dialogue = false;
            if (response) {
              console.log(response);
            }
          });
        }
      }
    }
  };
</script>

<style scoped>

</style>