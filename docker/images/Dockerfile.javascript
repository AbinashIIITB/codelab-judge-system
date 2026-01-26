FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN adduser -D runner
USER runner

CMD ["node"]
