<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-flex
    xs6
  >
    <v-card>
      <v-card-title class="headline">
        Name
      </v-card-title>
      IP: {{ ip }} <br>
      <v-expansion-panel v-if="server.vm">
        VMs: <br>
        <v-expansion-panel-content
          v-for="vm in server.vm.details"
          :key="vm.id"
          style="display: inline-block;"
        >
          <template v-slot:header>
            <div style="width: 50%;">
              {{ vm.name }}
              <div>
                <v-btn
                  v-if="vm.status !== 'started'"
                  color="success"
                  fab
                  small
                  dark
                >
                  <v-icon style="font-size: 28px;">
                    play_circle_outline
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="vm.status === 'started'"
                  color="warning"
                  fab
                  small
                  dark
                >
                  <v-icon style="font-size: 28px;">
                    pause_circle_outline
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="vm.status !== 'stopped'"
                  color="error"
                  fab
                  small
                  dark
                >
                  <v-icon style="font-size: 28px;">
                    stop
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <v-chip
              :class="{success: vm.status === 'started', error: vm.status === 'stopped', warning: vm.status === 'paused'}"
              style="width: 20px;"
              right
            >
              {{ vm.status }}
            </v-chip>
          </template>
          <img
            class="left"
            :src="'http://' + ip + vm.icon"
          >
          <edit-vm-card :vm="vm" />
          <v-chip>{{ vm.id }}</v-chip>
          <v-chip>Cores: {{ vm.coreCount }}</v-chip>
          <v-chip>RAM: {{ vm.ramAllocation }}</v-chip>
          <v-chip>HDD: {{ vm.hddAllocation.total }}</v-chip>
          <v-chip>Primary GPU: {{ vm.primaryGPU }}</v-chip>
          <v-expansion-panel>
            Disks:
            <v-expansion-panel-content
              v-for="(row, rowIndex) in vm.hddAllocation.all"
              :key="rowIndex"
            >
              <template v-slot:header>
                <div>{{ rowIndex }}</div>
              </template>
              <v-chip
                v-for="(detail, name) in row"
                :key="name"
              >
                {{ name }}: {{ detail }}
              </v-chip>
              <br>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card>
  </v-flex>
</template>

<script>
  import EditVmCard from "./EditVmCard";

  export default {
    name: "ServerCardVue",
    components: {
      EditVmCard
    },
    props: [
      "server",
      "ip"
    ]
  };
</script>

<style scoped>

</style>