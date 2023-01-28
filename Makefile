IMAGE=harbor.liebi.com/salp/kusama-subql:v1.6
DEPLOYMENT="salp1-kusama-subql salp2-kusama-subql salp3-kusama-subql salp4-kusama-subql salp5-kusama-subql"

build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy: build
	kubectl set image deploy -n salp salp1-kusama-subql salp1-kusama-subql=${IMAGE}
	kubectl set image deploy -n salp salp2-kusama-subql salp2-kusama-subql=${IMAGE}
	kubectl set image deploy -n salp salp3-kusama-subql salp3-kusama-subql=${IMAGE}
	kubectl set image deploy -n salp salp4-kusama-subql salp4-kusama-subql=${IMAGE}
	kubectl set image deploy -n salp salp5-kusama-subql salp5-kusama-subql=${IMAGE}

update: deploy
	kubectl rollout restart deploy -n salp salp1-kusama-subql salp2-kusama-subql salp3-kusama-subql salp4-kusama-subql salp5-kusama-subql