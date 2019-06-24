<template>
  <v-dialog
    v-model="dialogue"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        color="info"
        dark
        v-on="on"
      >
        GPU Swap
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey"
        primary-title
      >
        Swap Primary GPUs
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="vMSelector1"
          :items="Object.keys(server.vm.details).map(id => server.vm.details[id])"
          item-text="name"
          item-value="id"
          label="VM 1"></v-select>
        <v-select
          v-if="server.pciDetails"
          v-model="pciSelector"
          :items="server.pciDetails"
          item-text="name"
          item-value="id"
          label="PCI Device"></v-select>
        <v-select
          v-model="vMSelector2"
          :items="Object.keys(server.vm.details).map(id => server.vm.details[id])"
          item-text="name"
          item-value="id"
          label="VM 2"></v-select>
      </v-card-text>

      <v-divider/>

      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="swapGPUs"
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
    name: "GpuSwap",
    props: [
      'server',
      'ip',
    ],
    data() {
      return {
        vMSelector1: false,
        vMSelector2: false,
        pciSelector: false,
        dialogue: false
      };
    },
    methods: {
      swapGPUs() {
        axios({
          method: "post",
          url: "api/gpuSwap",
          data: {
            id1: this.vMSelector1,
            id2: this.vMSelector2,
            pciIds: [this.pciSelector],
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
  };
</script>

<style scoped>

</style>