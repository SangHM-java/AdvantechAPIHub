docker build -t hominhsangadvantech/back-end:v1 .
docker run -d -p  3000:80 hominhsangadvantech/front-end:v4
docker run -d -it -p 4200:80/tcp --name frontend test/front-end:latest
