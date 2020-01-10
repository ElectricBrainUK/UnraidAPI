[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9EC6MMLG7KLNA&source=url)
# Home Assistant Integration
Use the env variable section to set up the MQTT client and connect to your MQTT broker. If auto discovery is enabled in home assistant the following will be created:
- An entity for each of your servers 
    - (sensor) Monitor server status
    - (switch) On/Off switch allows you to start stop array
- An entity for each of your VMs
    - (switch) On/Off toggle VM state
    - (switch) A seperate entity with a switch to attach / detach any usbs to that vm
    - (sensor) Whether or not a particular usb device is connected to the machine (can be used to automate hotplugging e.g. when connected toggle the usb switch off and on again)
- An entity for each of your dockers
    - (switch) On/Off toggle Docker state

Manual Config Example:
The server and VM names are as they are in MQTT (spaces are underscores and all lower case)
The payload options are started, stopped, paused, restart, kill

```
- platform: mqtt

  command_topic: "homeassistant/servername/vmname/state"
  
  payload_on: "started"
 
  payload_off: "stopped"
```

When connecting the unraid api to an mqtt broker config details for all the various api functions is posted under the various homeassistant entity types. For example under homeassistant/switch/server/vm/config.

# Support
For support please go to our discord channel: https://discord.gg/Qa3Bjr9

For missing features please raise an issue (or a PR if you feel like giving it a go!)
# unraidapi

> A new UI and API for controlling multiple unraid instances and connecting them to the Home Assistant

## Install

Add the following template url to your list in the Docker tab on unraid: 
https://github.com/ElectricBrainUK/docker-templates
Then when you go to add container it should be listed.

## Env variables
If you want to enable MQTT:

```
MQTTBroker Youre broker address or domain e.g. hassio 
MQTTPort e.g. 1883 
MQTTUser e.g. mqtt 
MQTTPass e.g. password
MQTTBaseTopic the base topic for all MQTT publishes e.g. homeassistant

For MQTT Over SSL:
MQTTSecure true
If using self signed:
MQTTSelfSigned true
MQTTRefreshRate time in seconds to poll for updates (default 20)
MQTTCacheTime time in minutes after which all entities will be updated in mqtt (default 1 hour)

``` 
Where to store the secure keys. If left blank the keys are kept in memory and will be destroyed each time the container is updated.
Set to config to have the data persisted
```
KeyStorage config
```

Check out the HA docs on how to set up discovery for MQTT here:
https://www.home-assistant.io/docs/mqtt/discovery/

## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start
```

We develop all of our apps in our spare time so if you feel like supporting us please donate:
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9EC6MMLG7KLNA&source=url)
