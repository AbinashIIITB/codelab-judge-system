FROM gcc:12

# Create the unprivileged user first, then hand it the working directory.
# WORKDIR on its own creates a root-owned /app, which left `runner` unable to
# write the submission source — every run failed with "Permission denied".
RUN useradd -m -s /bin/bash runner \
    && mkdir -p /app \
    && chown runner:runner /app

WORKDIR /app
USER runner

CMD ["/bin/bash"]
