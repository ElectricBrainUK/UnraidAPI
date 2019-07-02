<template>
  <v-dialog
    v-model="dialogue"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-chip
        style="overflow: hidden; max-width: 95%; min-width: 20px;"
        v-on="on"
      >
        {{ detail.name }}
        <div v-if="reattachable" text-xs-center>
          <v-btn
            color="primary"
            fab
            small
            dark
            style="height: 20px; width: 20px;"
            @click="reattach"
          >
            <v-icon>
              cached
            </v-icon>
          </v-btn>
        </div>
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
          label="VM"
        />
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
      "detail",
      "server",
      "ip",
      "pci",
      "checkForServerPassword",
      "reattachable"
    ],
    data() {
      return {
        vMSelector: false,
        dialogue: false
      };
    },
    methods: {
      async requestMove() {
        let auth = await this.checkForServerPassword(this.ip);
        if (!this.pci) {
          axios({
            method: "post",
            url: "api/usbAttach",
            data: {
              id: this.vMSelector,
              usbId: this.detail.id,
              server: this.ip,
              auth
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
              pciIds: [this.detail.id],
              server: this.ip,
              auth
            }
          }).then((response) => {
            this.dialogue = false;
            if (response) {
              console.log(response);
            }
          });
        }
      },
      async reattach() {
        let auth = await this.checkForServerPassword(this.ip);
        if (!this.pci) {
          axios({
            method: "post",
            url: "api/usbAttach",
            data: {
              id: this.vMSelector,
              usbId: this.detail.id,
              server: this.ip,
              auth,
              option: "reattach"
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
              pciIds: [this.detail.id],
              server: this.ip,
              auth,
              option: "reattach"
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