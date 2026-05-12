FROM debian:12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user and set permissions
RUN useradd -m -s /bin/bash runner && \
    chown -R runner:runner /app
USER runner

CMD ["/bin/bash"]
