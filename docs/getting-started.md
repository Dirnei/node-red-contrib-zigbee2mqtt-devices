# Getting started

I have ubuntu server 20.04 LTS.
Installed Docker host.

## Examplary Z2M and Node RED setup.



## Setup

- Plugin Zigbee USB Dongle. Suggested Dongle (TODO: CC1352P-2) Because reach is much better and supports way more devices.
https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html

- Find dongle `ls /dev | grep ACM` 
```
andreas@nuc:/dev$ ls /dev | grep ACM
ttyACM0
```
Write it into docker compose...


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






# at the end disable pairing mode (permit join false)