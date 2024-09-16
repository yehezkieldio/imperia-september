FROM imbios/bun-node:latest-22.6.0-slim AS base

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update && \
  apt-get install -yq openssl git ca-certificates tzdata && \
  ln -fs /usr/share/zoneinfo/Asia/Makassar /etc/localtime && \
  dpkg-reconfigure -f noninteractive tzdata

# ---------------------------------------------------------------------------- #

FROM base AS builder

WORKDIR /app

# Install Turbo globally
RUN yarn global add turbo@^2

# Copy all files to the working directory
COPY . .

# This is a workaround for a functional prune on a Bun workspace
# Since Turborepo doesn't support Bun for pruning (yet?), we need to convert the workspace to Yarn
# and install the dependencies with Bun to generate the Yarn lockfile, so Turbo can use it for pruning
# This is a temporary solution until Turborepo supports Bun for pruning

# Convert Bun workspace to Yarn (skip installing for now)
RUN bunx @turbo/workspaces@latest convert ./ yarn --skip-install

# Install dependencies with Bun and generate Yarn lockfile to be used by Turbo
RUN bun install --yarn

# Move the installed node_modules to a temporary location
RUN mv node_modules /tmp/node_modules

# Prune unnecessary files using Turbo to get the needed files only
RUN turbo prune @imperia/discord-bot --docker

# ---------------------------------------------------------------------------- #

FROM base AS installer

WORKDIR /app

# Reuse the pruned package.json and lock files
COPY --from=builder /app/out/json/ .

# Move the previously saved node_modules back to the project directory
COPY --from=builder /tmp/node_modules ./node_modules

# Copy the pruned project files to the working directory
COPY --from=builder /app/out/full/ .

# Run the build using Turbo
RUN yarn turbo run build --filter @imperia/discord-bot

# ---------------------------------------------------------------------------- #

FROM base AS runner
WORKDIR /app

USER bun

COPY --from=installer --chown=bun:bun /app/apps/discord-bot/dist ./dist

CMD ["bun", "dist/main.js"]