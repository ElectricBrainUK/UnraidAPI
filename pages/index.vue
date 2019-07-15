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
        :check-for-server-password="checkForServerPassword"
      />
    </v-layout>

    <v-layout row justify-center>
      <v-dialog v-model="userPasswordPrompt" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Please Enter Your Password For: {{checkIp}}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field v-model="user" label="User" placeholder="User"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="password" label="Password*" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="dialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="submit">Confirm</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
  import SetupCard from "../components/SetupCard";
  import ServerCard from "../components/ServerCard";
  import axios from "axios";
  import { Base64 } from "js-base64";

  export default {
    components: {
      SetupCard,
      ServerCard
    },
    data() {
      return {
        servers: [],
        userPasswordPrompt: false,
        authentication: {},
        user: '',
        password: '',
        resolve: false,
        reject: false,
        checkIp: ''
      };
    },
    mounted() {
      this.getServers();
    },
    methods: {
      getServers() {
        axios({
          method: "get",
          url: "api/getServers",
          headers: {
            "Authorization": JSON.stringify(this.authentication)
          }
        }).then(async (response) => {
          if (Object.keys(response.data.servers).length > Object.keys(this.authentication).length) {
            let returnedServers = Object.keys(response.data.servers);
            for (let i = 0; i< returnedServers.length; i++){
              let serverIp = returnedServers[i];
              if (!this.authentication[serverIp]) {
                await this.checkForServerPassword(serverIp);
              }
            }
            this.getServers();
          } else {
            this.servers = response.data.servers;
            setTimeout(() => this.getServers(), 5000);
          }
        }).catch(e => {
          setTimeout(() => this.getServers(), 10000);
        });
      },
      checkForServerPassword(ip) {
        if (this.authentication[ip]) {
          return this.authentication[ip];
        }
        this.userPasswordPrompt = true;
        this.checkIp = ip;

        return new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        }).then(data => {
          this.authentication[ip] = data;
          return data;
        });
      },
      submit() {
        this.userPasswordPrompt = false;
        this.user = this.user ? this.user : 'root';
        this.resolve(Base64.encode(this.user.concat(":", this.password)));
      }
    }
  };
</script>
