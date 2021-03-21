import { getMqttConfig } from 'lib/config';
import { sanitise } from './sanitise';

let updated = {};

export function getVMDetails(
  client,
  vm,
  disabledDevices,
  vmId,
  serverTitleSanitised,
  ip,
  server,
) {
  if (disabledDevices.includes(`${ip}|${vmId}`)) {
    return;
  }
  const vmSanitisedName = sanitise(vm.edit ? vm.edit.domain_name : vm.name);

  const vmDetails = {
    id: vmId,
    status: vm.status,
    coreCount: vm.coreCount,
    ram: vm.ramAllocation,
    primaryGPU: vm.primaryGPU,
    name: vmSanitisedName,
    description: vm.edit ? vm.edit.description : 'Unknown',
    mac:
      vm.edit && vm.edit.nics && vm.edit.nics[0]
        ? vm.edit.nics[0].mac
        : undefined,
  };

  if (!updated[ip]) {
    updated[ip] = {};
  }

  if (!updated[ip].vms) {
    updated[ip].vms = {};
  }
  const { MQTTBaseTopic } = getMqttConfig();

  if (
    !updated[ip].vms[vmId] ||
    !updated[ip].vms[vmId].details ||
    updated[ip].vms[vmId].details !== JSON.stringify(vmDetails)
  ) {
    client.publish(
      `${MQTTBaseTopic}/switch/${serverTitleSanitised}/${vmSanitisedName}/config`,
      JSON.stringify({
        payload_on: 'started',
        payload_off: 'stopped',
        value_template: '{{ value_json.status }}',
        state_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}`,
        json_attributes_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}`,
        name: `${serverTitleSanitised}_VM_${vmSanitisedName}`,
        unique_id: `${serverTitleSanitised}_${vmId}`,
        device: {
          identifiers: [`${serverTitleSanitised}_${vmSanitisedName}`],
          name: `${serverTitleSanitised}_VM_${vmSanitisedName}`,
          manufacturer: server.serverDetails.motherboard,
          model: 'VM',
        },
        command_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/state`,
      }),
    );
    client.publish(
      `${MQTTBaseTopic}/sensor/${serverTitleSanitised}/${vmSanitisedName}/config`,
      JSON.stringify({
        value_template: '{{ value_json.status }}',
        state_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}`,
        json_attributes_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}`,
        name: `${serverTitleSanitised}_VM_${vmSanitisedName}_status`,
        unique_id: `${serverTitleSanitised}_${vmId}_status`,
        device: {
          identifiers: [`${serverTitleSanitised}_${vmSanitisedName}`],
          name: `${serverTitleSanitised}_VM_${vmSanitisedName}`,
          manufacturer: server.serverDetails.motherboard,
          model: 'VM',
        },
      }),
    );
    client.publish(
      `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}`,
      JSON.stringify(vmDetails),
    );
    client.subscribe(
      `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/state`,
    );
    if (!updated[ip].vms[vmId]) {
      updated[ip].vms[vmId] = {};
    }
    updated[ip].vms[vmId].details = JSON.stringify(vmDetails);
  }

  if (
    vm.edit &&
    vm.edit.usbs &&
    vm.edit.usbs.length > 0 &&
    !disabledDevices.includes(`${ip}|${vmId}|USBs`)
  ) {
    vm.edit.usbs.map((device) => {
      if (disabledDevices.includes(`${ip}|${vmId}|${device.id}`)) {
        return;
      }
      const sanitiseUSBName = sanitise(device.name);
      const sanitiseUSBId = sanitise(device.id);
      // todo determine type?
      let usbDetails = {
        id: device.id,
        name: sanitiseUSBName,
        attached: !!device.checked,
        connected: !!device.connected,
      };

      if (!updated[ip].vms[vmId].usbs) {
        updated[ip].vms[vmId].usbs = {};
      }

      if (
        updated[ip].vms[vmId].usbs[device.id] !== JSON.stringify(usbDetails)
      ) {
        client.publish(
          `${MQTTBaseTopic}/switch/${serverTitleSanitised}/${vmSanitisedName}_${sanitiseUSBId}/config`,
          JSON.stringify({
            payload_on: true,
            payload_off: false,
            value_template: '{{ value_json.attached }}',
            state_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}`,
            json_attributes_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}`,
            name: `${serverTitleSanitised}_VM_${vmSanitisedName}_USB_${sanitiseUSBName}`,
            unique_id: `${serverTitleSanitised}_${vmId}_${sanitiseUSBId}`,
            device: {
              identifiers: [
                `${serverTitleSanitised}_${vmSanitisedName}_${sanitiseUSBId}`,
              ],
              name: `${serverTitleSanitised}_VM_${vmSanitisedName}_USB_${sanitiseUSBId}`,
              manufacturer: sanitiseUSBName,
              model: 'USB Device',
            },
            command_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}/attach`,
          }),
        );
        client.publish(
          `${MQTTBaseTopic}/binary_sensor/${serverTitleSanitised}/${vmSanitisedName}_${sanitiseUSBId}/config`,
          JSON.stringify({
            payload_on: true,
            payload_off: false,
            value_template: '{{ value_json.connected }}',
            state_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}`,
            json_attributes_topic: `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}`,
            name: `${serverTitleSanitised}_VM_${vmSanitisedName}_USB_${sanitiseUSBName}_connected`,
            unique_id: `${serverTitleSanitised}_${vmId}_${sanitiseUSBId}_connected`,
            device: {
              identifiers: [
                `${serverTitleSanitised}_${vmSanitisedName}_${sanitiseUSBId}`,
              ],
              name: `${serverTitleSanitised}_VM_${vmSanitisedName}_USB_${sanitiseUSBId}`,
              manufacturer: sanitiseUSBName,
              model: 'USB Device',
            },
          }),
        );
        client.publish(
          `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}`,
          JSON.stringify(usbDetails),
        );
        client.subscribe(
          `${MQTTBaseTopic}/${serverTitleSanitised}/${vmSanitisedName}/${sanitiseUSBId}/attach`,
        );
        updated[ip].vms[vmId].usbs[device.id] = JSON.stringify(usbDetails);
      }
    });
  }
}
