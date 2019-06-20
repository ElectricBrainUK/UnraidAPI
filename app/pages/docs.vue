<template>
  <v-container
    fluid
    grid-list-md
    text-xs-center
  >
    <v-layout
      row
      wrap
      pa-3
      mb-3
      align-content-space-around justify-space-around fill-height>
      <v-flex text-xs-left shrink>
        <v-card>
          <v-card-title>
            API Documentation
          </v-card-title>
          <v-card-text>
            For now this is not necessary but soon all requests (not just connect) will require the auth header
            <v-text-field
              value="Auth: Basic Base64(User:Password)"
              solo
              readonly
              light
              auto-grow
              rows="1"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left
              grow
      >
        <v-card>
          <v-card-title>
            Connect a server
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="POST: api/login"
              solo
              readonly
              light
            ></v-text-field>
            Data
            <v-textarea
              value="{ ip: Server Ip Address, authToken: Auth: Basic Base64(User:Password) }"
              solo
              readonly
              light
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left
              grow
      >
        <v-card>
          <v-card-title>
            Get Server Details
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="GET: api/getServers"
              solo
              readonly
              light
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left>
        <v-card>
          <v-card-title>
            VM Controls
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="POST: api/vmStatus"
              solo
              readonly
              light
            ></v-text-field>
            Data
            <v-textarea
              value="{ id: Virtual Machine ID, action: action (see bellow), server: Server IP Address }"
              solo
              readonly
              light
              auto-grow
              rows="1"
            ></v-textarea>
            Actions
            <v-container
              fluid
              grid-list-md
              text-xs-center
            >
              <v-layout
                row
                wrap
                pa-3
                mb-3
                align-content-space-around justify-space-around fill-height
              >
                <v-flex>
                  <v-card>
                    Start
                    <v-text-field
                      value="domain-start"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card>
                    Stop
                    <v-text-field
                      value="domain-stop"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card>
                    Pause
                    <v-text-field
                      value="domain-pause"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card>
                    UnPause
                    <v-text-field
                      value="domain-resume"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card>
                    Force Stop
                    <v-text-field
                      value="domain-destroy"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
                <v-flex>
                  <v-card>
                    Restart
                    <v-text-field
                      value="Coming soon"
                      solo
                      readonly
                      light
                    ></v-text-field>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left
              grow
      >
        <v-card>
          <v-card-title>
            USB Controls
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="POST: api/usbAttach"
              solo
              readonly
              light
            ></v-text-field>
            Data
            <v-textarea
              value="{ id: Virtual Machine ID, usbId: USB Identifier (address), server: Server IP Address }"
              solo
              readonly
              light
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left
              grow
      >
        <v-card>
          <v-card-title>
            PCI Controls
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="POST: api/pciAttach"
              solo
              readonly
              light
            ></v-text-field>
            Data
            <v-textarea
              value="{ id: Virtual Machine ID, pciId: PCI Identifier (address), server: Server IP Address }"
              solo
              readonly
              light
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex text-xs-left
              grow
      >
        <v-card>
          <v-card-title>
            GPU Swap
          </v-card-title>
          <v-card-text>
            Request
            <v-text-field
              value="POST: api/gpuSwap"
              solo
              readonly
              light
            ></v-text-field>
            Data
            <v-textarea
              value="{ id1: Virtual Machine 1 ID, id2: Virtual Machine 2 ID, server: Server IP Address }"
              solo
              readonly
              light
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
