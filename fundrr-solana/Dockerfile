FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  build-essential \
  pkg-config \
  git \
  && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install specific version of Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install 0.28.0
RUN avm use 0.28.0

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build and deploy commands
CMD ["sh", "-c", "anchor build && anchor deploy"] 