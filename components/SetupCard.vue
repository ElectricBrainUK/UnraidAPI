<template>
  <v-flex
    xs12
    sm6
    md4
  >
    <v-card>
      <v-card-title class="headline">
        Setup Server
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="ip"
            prepend-icon="settings_ethernet"
            name="ipaddress"
            label="Server IP"
            type="text"
          />
          <v-text-field
            v-model="user"
            prepend-icon="person"
            name="login"
            label="Login"
            type="text"
          />
          <v-text-field
            id="password"
            v-model="password"
            prepend-icon="lock"
            name="password"
            label="Password"
            type="password"
          />
        </v-form>
        {{ loginMessage }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="connect"
        >
          Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  import axios from "axios";
  import { Base64 } from "js-base64";

  export default {
    name: "SetupCard",
    data() {
      return {
        loginMessage: "",
        user: "",
        password: "",
        ip: ""
      };
    },
    methods: {
      connect() {
        axios({
          method: "post",
          data: {
            ip: this.ip,
            authToken: Base64.encode(this.user.concat(":", this.password))
          },
          url: "/api/login"
        }).then((response) => {
          this.loginMessage = response.data.message;
        });
      }
    }
  };
</script>

<style scoped>

</style>
