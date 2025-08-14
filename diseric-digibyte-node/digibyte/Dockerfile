FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV DIGIBYTE_VERSION=7.17.2
ENV DIGIBYTE_USER=digibyte
ENV DIGIBYTE_UID=1000
ENV DIGIBYTE_GID=1000

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        wget \
        curl \
        ca-certificates \
        gnupg \
        gosu \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create digibyte user
RUN groupadd -r -g ${DIGIBYTE_GID} ${DIGIBYTE_USER} && \
    useradd -r -g ${DIGIBYTE_USER} -u ${DIGIBYTE_UID} -d /home/${DIGIBYTE_USER} -m ${DIGIBYTE_USER}

# Download and install DigiByte Core
WORKDIR /tmp
RUN wget -q https://github.com/digibyte-core/digibyte/releases/download/v${DIGIBYTE_VERSION}/digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz && \
    wget -q https://github.com/digibyte-core/digibyte/releases/download/v${DIGIBYTE_VERSION}/SHA256SUMS && \
    grep digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz SHA256SUMS | sha256sum -c - && \
    tar -xzf digibyte-${DIGIBYTE_VERSION}-x86_64-linux-gnu.tar.gz && \
    install -m 0755 -o root -g root -t /usr/local/bin digibyte-${DIGIBYTE_VERSION}/bin/* && \
    rm -rf /tmp/*

# Create data directory
RUN mkdir -p /home/${DIGIBYTE_USER}/.digibyte && \
    chown -R ${DIGIBYTE_USER}:${DIGIBYTE_USER} /home/${DIGIBYTE_USER}

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose ports
EXPOSE 12024 14022

# Set working directory
WORKDIR /home/${DIGIBYTE_USER}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD digibyte-cli getblockcount || exit 1

# Use entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["digibyted"]