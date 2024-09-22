docker image rm -f $(docker image ls  -aq)
docker container rm -f $(docker container ls -qa)
