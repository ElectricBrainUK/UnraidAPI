<template>
    <v-flex
            xs6
    >
        <v-card>
            <v-card-title class="headline">
                Name
            </v-card-title>
            IP: {{ip}} <br>
            VMs: <br>
            <div v-for="vm in server.vm.details"
                 v-bind:key="vm">
                {{vm.parent.children[0].children[0].children[0].tags.id}}
                <img :src="'http://' + ip + vm.parent.children[0].children[0].children[0].children[0].tags.src"/>
                {{vm.parent.children[0].children[0].children[1].children[0].contents}}
            </div>
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