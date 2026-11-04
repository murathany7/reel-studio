# Reel Studio with everything it needs to render: Node, Chromium, ffmpeg and fonts.
#   docker run --rm -it -v "$PWD":/work ghcr.io/murathany7/reel-studio reel-studio init
#   docker run --rm -v "$PWD":/work ghcr.io/murathany7/reel-studio node core/render.mjs still examples/engines-demo/index.html out.png --t 4.6
# Renders on Linux use SwiftShader for WebGL, so frames match other Linux renders, not macOS ones.
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium chromium-headless-shell ffmpeg rsync ca-certificates \
      fonts-noto-core fonts-noto-color-emoji fonts-liberation fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*
ENV CHROME_PATH=/usr/bin/chromium

# The kit from this commit, installed exactly as npm ships it
COPY . /src
RUN cd /src && npm pack --pack-destination /tmp && npm install -g /tmp/reel-studio-*.tgz \
 && rm -rf /src /tmp/reel-studio-*.tgz

WORKDIR /work
CMD ["reel-studio", "--help"]
