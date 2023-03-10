BUILD_VERSION   := $(shell git log -1 --pretty='%h')
IMAGE=harbor.liebi.com/salp-polkadot/polkadot-subql:${BUILD_VERSION}


build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy: build
	kubectl set image deploy -n salp-polkadot salp1-polkadot-polkadot-subql salp1-polkadot-polkadot-subql=${IMAGE}
	kubectl set image deploy -n salp-polkadot salp2-polkadot-polkadot-subql salp2-polkadot-polkadot-subql=${IMAGE}
	kubectl set image deploy -n salp-polkadot salp3-polkadot-polkadot-subql salp3-polkadot-polkadot-subql=${IMAGE}
	kubectl set image deploy -n salp-polkadot salp4-polkadot-polkadot-subql salp4-polkadot-polkadot-subql=${IMAGE}
	kubectl set image deploy -n salp-polkadot salp5-polkadot-polkadot-subql salp5-polkadot-polkadot-subql=${IMAGE}

update: deploy
	kubectl rollout restart  deploy -n salp-polkadot salp1-polkadot-polkadot-subql salp2-polkadot-polkadot-subql salp3-polkadot-polkadot-subql salp4-polkadot-polkadot-subql salp5-polkadot-polkadot-subql