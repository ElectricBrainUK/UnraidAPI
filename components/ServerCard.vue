<template>
    <v-flex
            xs6
    >
        <v-card>
            <v-card-title class="headline">
                Name
            </v-card-title>
            IP: {{ip}} <br>
            <v-expansion-panel v-if="server.vm">
                VMs: <br>
                <v-expansion-panel-content v-for="vm in server.vm.details"
                     v-bind:key="vm.id"
                     style="display: inline-block;">
                    <template v-slot:header>
                        <div style="width: 50%;">{{vm.name}}</div>
                        <v-chip v-bind:class="{success: vm.status === 'started', error: vm.status === 'stopped', warning: vm.status === 'paused'}" style="width: 20px;" right>{{vm.status}}</v-chip>
                    </template>
                    <img class="left"
                    :src="'http://' + ip + vm.icon"/>
                    <v-chip>{{vm.id}}</v-chip>
                    <v-chip>Cores: {{vm.coreCount}}</v-chip>
                    <v-chip>RAM: {{vm.ramAllocation}}</v-chip>
                    <v-chip>HDD: {{vm.hddAllocation.total}}</v-chip>
                    <v-chip>Primary GPU: {{vm.primaryGPU}}</v-chip>
                    <v-expansion-panel>Disks:
                        <v-expansion-panel-content v-for="(row, rowIndex) in vm.hddAllocation.all" v-bind:key="rowIndex">
                            <template v-slot:header>
                                <div>{{rowIndex}}</div>
                            </template>
                            <v-chip v-for="(detail, name) in row" v-bind:key="name">{{name}}: {{detail}}</v-chip>
                            <br>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-card>
    </v-flex>
</template>

<script>
  export default {
    name: "ServerCard.vue",
    props: [
      "server",
      "ip"
    ]
  };
</script>

<style scoped>

</style>