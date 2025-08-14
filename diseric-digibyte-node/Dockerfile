FROM debian:bookworm-slim AS builder

# Install dependencies for building
RUN apt-get update && \
    apt-get install -y \
        wget \
        ca-certificates \
        gnupg \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download and verify DigiByte Core
WORKDIR /tmp
ARG DIGIBYTE_VERSION=7.17.2
RUN wget -q https://github.com/digibyte-core/digibyte/releases/download/v${DIGIBYTE_VERSION}/digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz && \
    wget -q https://github.com/digibyte-core/digibyte/releases/download/v${DIGIBYTE_VERSION}/SHA256SUMS && \
    grep digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz SHA256SUMS | sha256sum -c - && \
    tar -xzf digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz

# Production image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y \
        gosu \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create digibyte user
RUN groupadd -r digibyte && \
    useradd -r -g digibyte -d /home/digibyte -m digibyte

# Copy DigiByte binaries from builder
COPY --from=builder /tmp/digibyte-*/bin/* /usr/local/bin/

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create data directory
RUN mkdir -p /root/.digibyte && \
    chown -R digibyte:digibyte /root/.digibyte

# Expose ports
EXPOSE 12024 14022

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD digibyte-cli getblockcount > /dev/null 2>&1 || exit 1

# Use entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["digibyted"]