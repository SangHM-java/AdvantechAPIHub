docker build -t hominhsangadvantech/back-end-k8s:v1 .
docker run -d -p  8080:8080 hominhsangadvantech/back-end-k8s:v1

# test api
docker-compose up -d