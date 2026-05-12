FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Create non-root user and set permissions
RUN useradd -m -s /bin/bash runner && \
    chown -R runner:runner /app
USER runner

CMD ["/bin/bash"]
