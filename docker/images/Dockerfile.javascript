FROM node:20-alpine

WORKDIR /app

# Create non-root user and set permissions
RUN adduser -D runner && \
    chown -R runner:runner /app
USER runner

CMD ["node"]
