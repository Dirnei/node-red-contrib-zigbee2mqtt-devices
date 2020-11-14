# Getting started guide

This getting started guide shows you how to exemplary create to explains how to create a simple Zigbee2MQTT and Node-RED setup.
And then demonstrates how to use the "Zigbee2MQTT Nodes for Node-RED" to create a basic home automation system. With a few devices.

// ToDo: Add graphic of infrastructure.
// ToDo: Add graphic of the final lamp installation.

// Todo: test setup on raspberry pi 2
// Todo: test setup on raspberry pi 3




# Examplary Zigbee2MQTT and Node-RED setup

In this section, we will demonstrate a exemplary setup for [Zigbee2MQTT](https://www.zigbee2mqtt.io/), [Node-RED](https://nodered.org/docs/getting-started/) and [Mosquitto](https://mosquitto.org/man/mosquitto-8.html) using Docker. For a more detailed documentation on how to setup these components, we recommend the linked documentation.

> **Note**: If you already have a working Zigbee2MQTT, MQTT-Broker and Node-RED installation, you can skip this section.


## Prequisites
You have a Linux machine with Docker installed.
We tested this on:
- An Intel NUC running Ubuntu Server 20.04 LTS
- A Raspberry PI 2,3,4 running Raspian / Raspberry Pi OS.

And you have a supported Zigbee adapter for Zigbee2MQTT.
See [Zigbee2MQTT Docs: What do I need?](https://www.zigbee2mqtt.io/getting_started/what_do_i_need.html). If you have a bit of money to spend, we suggest the [Texas Instruments LAUNCHXL-CC1352P-2 Zigbee adapter](https://www.zigbee2mqtt.io/information/supported_adapters.html#texas-instruments-launchxl-cc1352p-2), because the range is better and supports way more devices.

## Setup

1. **Verify that Docker and Docker Compose is installed.**
    ``` console
    andreas@nuc:~$ docker --version
    Docker version 19.03.13, build 4484c46d9d

    andreas@nuc:~$ docker-compose --version
    docker-compose version 1.27.4, build 40524192
    ```

2. **Plugin the Zigbee Adapter into your device.**
    
    It should apper as a device in `/dev`, most of the time the location is `/dev/ttyACM0`. See [Zigbee2MQTT docs](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html#1-determine-location-of-cc2531-usb-sniffer-and-checking-user-permissions).

    You can find the adapter using: `ls /dev | grep ACM` 
    ```
    andreas@nuc:/dev$ ls /dev | grep ACM
    ttyACM0
    ```
    // ToDo: try this using `ls -d` to get the full path.

    If it is any different from `/dev/ttyACM0`, you have to update the device in the `docker-compose.yml` file, to grant Zigbee2MQTT access to the adapter. We will create the `docker-compose.yml` in the next step.
    ``` yml
    services:
      zigbee2mqtt:
        devices:
          - device=/dev/ttyACM0
    ```

3. **Configuring the docker containers**
    In this step we will create three Docker container using Docker compose.
    For simplicity we will map the volumes to the users home directory.

    We will create three containers.
    - Mosquitto MQTT Broker
    - Zigbee2MQTT (Connects to Mosquitto)
    - Node-RED (Connects to Mosquitto)

    Node-RED does not directly connect to Zigbee2MQTT. Only via the Mosquitto Broker as a middleware.

- Start docker
Create docker script.

andreas@nuc:~$ mkdir ~/smarthome
andreas@nuc:~$ cd ~/smarthome/
andreas@nuc:~/smarthome$ nano docker-compose.yml
.....
                         mkdrir nodered
andreas@nuc:~/smarthome$ mkdir mosquitto
andreas@nuc:~/smarthome$ mkdir mosquitto/config
andreas@nuc:~/smarthome$ nano mosquitto/config/mosquitto.conf
```
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
```



andreas@nuc:~/smarthome$ docker-compose up


Stop containers

andreas@nuc:~/smarthome$ sudo nano z2m/configuration.yaml
```
# Home Assistant integration (MQTT discovery)
homeassistant: false

# allow new devices to join
permit_join: true

# MQTT settings
mqtt:
  # MQTT base topic for zigbee2mqtt MQTT messages
  base_topic: zigbee2mqtt
  # MQTT server URL
  server: 'mqtt://localhost'
  # MQTT server authentication, uncomment if required:
  # user: my_user
  # password: my_password

# Serial settings
serial:
  # Location of CC2531 USB sniffer
  port: /dev/ttyACM0
```

add advanced section at the end.
Best practise - otherwise you have to repair if a neigbour descides to use the same pan id.
Different then default.

```
#Home Assistant integration (MQTT discovery)
homeassistant: false

# allow new devices to join
permit_join: true

# MQTT settings
mqtt:
  # MQTT base topic for zigbee2mqtt MQTT messages
  base_topic: zigbee2mqtt
  # MQTT server URL
  server: 'mqtt://localhost'
  # MQTT server authentication, uncomment if required:
  # user: my_user
  # password: my_password

# Serial settings
serial:
  # Location of CC2531 USB sniffer
  port: /dev/ttyACM0
advanced:
  pan_id: 777
  channel: 15
```

docker-compose up


## Verify that everything is working

After setup.
For authentication etc.
Disable Pariing mode
We recommend to check the corresponding projects documentation.
As it is not the goal of this tutorial.


# Dashboard.



# at the end disable pairing mode (permit join false)