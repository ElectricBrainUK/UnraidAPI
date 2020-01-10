<template>
  <div>
    <v-expansion-panel v-if="servers">
      <template v-slot:header>
        Servers
      </template>
      <v-expansion-panel-content
        v-for="(server, ip) in servers"
        :key="ip"
      >
        <template v-slot:header>
          {{ip}}

          <v-spacer></v-spacer>
          <v-switch
            v-model="serversActive[ip]"
            label="Hide"
            color="blue"
          ></v-switch>
        </template>

        <v-expansion-panel v-if="server.vm">
          <v-expansion-panel-content>
            <template v-slot:header>
              VMs

              <v-spacer></v-spacer>
              <v-switch
                v-model="serverVMsActive[ip + '|VMs']"
                label="Hide"
                color="blue"
              ></v-switch>
            </template>


            <v-expansion-panel>
              <v-expansion-panel-content
                v-for="vm in server.vm.details"
                :key="vm.id">
                <template v-slot:header>
                  {{vm.name}}

                  <v-spacer></v-spacer>
                  <v-switch
                    v-model="vmsActive[ip + '|' + vm.id]"
                    label="Hide"
                    color="blue"
                  ></v-switch>
                </template>


                <v-expansion-panel v-if="vm.edit.usbs">
                  <v-expansion-panel-content>
                    <template v-slot:header>
                      USBs

                      <v-spacer></v-spacer>
                      <v-switch
                        v-model="vmUsbsActive[ip + '|' + vm.id + '|USBs']"
                        label="Hide"
                        color="blue"
                      ></v-switch>
                    </template>
                    <div
                      v-for="usb in vm.edit.usbs"
                      :key="usb.id">
                      {{usb.name}}
                      <v-switch
                        v-model="usbsActive[ip + '|' + vm.id + '|' + usb.id]"
                        label="Hide"
                        color="blue"
                      ></v-switch>
                    </div>


                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="server.docker">
          <v-expansion-panel-content>
            <template v-slot:header>
              Docker

              <v-spacer></v-spacer>
              <v-switch
                v-model="serversDockerActive[ip + '|Dockers']"
                label="Hide"
                color="blue"
              ></v-switch>
            </template>


            <v-expansion-panel>
              <v-expansion-panel-content v-for="docker in server.docker.details.containers" :key="docker.name">
                <template v-slot:header>
                  {{docker.name}}

                  <v-spacer></v-spacer>
                  <v-switch
                    v-model="dockerActive[ip + '|' + docker.name]"
                    label="Hide"
                    color="blue"
                  ></v-switch>
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <template v-slot:header>
          <v-btn @click="submit">Submit</v-btn>
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script>
  import axios from "axios";

  export default {
    name: "mqtt",

    mounted() {
      this.getServers();
    },
    data() {
      return {
        servers: [],
        serversActive: {},
        serverVMsActive: {},
        vmsActive: {},
        vmUsbsActive: {},
        usbsActive: {},
        serversDockerActive: {},
        dockerActive: {}
      };
    },
    methods: {
      getServers() {
        axios({
          method: "get",
          url: "api/getServers"
        }).then(async (response) => {
          this.servers = response.data.servers;
        });
        axios({
          method: "get",
          url: "api/mqttDevices"
        }).then(async (response) => {
          response.data.forEach(entry => {
            if (!entry.includes("|")) {
              this.serversActive[entry] = true;
            } else if (entry.includes("|VMs")) {
              this.serverVMsActive[entry] = true;
            } else if (entry.includes("|Dockers")) {
              this.serversDockerActive[entry] = true;
            } else if (entry.includes("|USBs")) {
              this.vmUsbsActive[entry] = true;
            } else if (entry.split("|").length > 2) {
              this.usbsActive[entry] = true;
            } else {
              this.dockerActive[entry] = true;
              this.vmsActive[entry] = true;
            }
          });
          this.$forceUpdate();
        });
      },
      submit() {
        let data = [];
        Object.keys(this.serversActive).forEach(key => {
          if (this.serversActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.serverVMsActive).forEach(key => {
          if (this.serverVMsActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.vmsActive).forEach(key => {
          if (this.vmsActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.vmUsbsActive).forEach(key => {
          if (this.vmUsbsActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.usbsActive).forEach(key => {
          if (this.usbsActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.serversDockerActive).forEach(key => {
          if (this.serversDockerActive[key]) {
            data.push(key);
          }
        });
        Object.keys(this.dockerActive).forEach(key => {
          if (this.dockerActive[key]) {
            data.push(key);
          }
        });
        axios({
          method: "post",
          url: "api/mqttDevices",
          data
        }).then((response) => {
          console.log(response);
        });
      }
    }
  };
</script>

<style scoped>

</style>
