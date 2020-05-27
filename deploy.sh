docker build -t rajneesh4736/multi-client:latest -t rajneesh4736/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t rajneesh4736/multi-server:latest -t rajneesh4736/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t rajneesh4736/multi-worker:latest -t rajneesh4736/multi-worker:$SHA -f ./worker/Dockerfile ./worker
docker push rajneesh4736/multi-client:latest
docker push rajneesh4736/multi-server:latest
docker push rajneesh4736/multi-worker:latest
docker push rajneesh4736/multi-client:$SHA
docker push rajneesh4736/multi-server:$SHA
docker push rajneesh4736/multi-worker:$SHA



kubectl apply -f k8s
kubectl set image deployments/server-deployment server=rajneesh4736/multi-server:$SHA
kubectl set image deployments/client-deployment client=rajneesh4736/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=rajneesh4736/multi-worker:$SHA