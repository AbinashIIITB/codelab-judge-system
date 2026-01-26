FROM openjdk:17-slim

WORKDIR /app

# Create non-root user for security
RUN useradd -m -s /bin/bash runner
USER runner

CMD ["/bin/bash"]
