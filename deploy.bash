sudo curl -s https://raw.githubusercontent.com/BinaryStudioAcademy/bsa-2020-whale/develop/docker/docker-compose.yml --output docker-compose.yml
sudo docker-compose pull client
sudo docker-compose pull whaleapi
sudo docker-compose pull meetingapi
sudo docker-compose pull hubs
sudo docker-compose up -d