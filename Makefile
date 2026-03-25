BASE_RUNNER_IMAGE=us-central1-docker.pkg.dev/ofersanja/application-images/base-runner:latest

google-auth:
	@gcloud auth application-default login && \
	gcloud auth application-default set-quota-project ofersanja

# Rebuild and push the base runner image (node:20-alpine + Chromium).
# Only needed when system dependencies change (rare).
build-base:
	docker build -f Dockerfile.base -t $(BASE_RUNNER_IMAGE) .
	docker push $(BASE_RUNNER_IMAGE)