<template>
  <v-container
    grid-list-md
    text-xs-center
  >
    <v-layout
      row
      wrap
      pa-3
      mb-2
    >
      <setup-card/>
      <server-card
        v-for="(server, ip) in servers"
        :key="ip"
        :server="server"
        :ip="ip"
      />
    </v-layout>
  </v-container>
</template>

<script>
  import SetupCard from "../components/SetupCard";
  import ServerCard from "../components/ServerCard";
  import axios from "axios";

  export default {
    components: {
      SetupCard,
      ServerCard
    },
    data() {
      return {
        servers: []
      };
    },
    mounted() {
      this.getServers();
    },
    methods: {
      getServers() {
        axios({
          method: "get",
          url: "api/getServers"
        }).then((response) => {
          this.servers = response.data.servers;
          setTimeout(() => this.getServers(), 30000);
        });
      }
    }
  };
</script>
